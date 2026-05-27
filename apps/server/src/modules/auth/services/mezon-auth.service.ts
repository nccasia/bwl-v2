import { SecurityOptions } from '@constants';
import { User } from '@modules/user/entities';
import { UserRoles } from '@modules/user/enums';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import randomstring from 'randomstring';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { MezonLoginDto, MezonWebViewLoginDto } from '../dto';
import { ResponseToken } from '../types';
import { AuthService } from './auth.service';

interface MezonJwtPayload {
  user_id: string;
  mezon_id: string;
  display_name: string;
  username: string;
  email: string;
  avatar?: string;
}

@Injectable()
export class MezonAuthService {
  private readonly logger = new Logger(MezonAuthService.name);

  private readonly jwksClient = jwksClient({
    jwksUri: 'https://oauth2.mezon.ai/.well-known/jwks.json',
    cache: true,
    rateLimit: true,
  });

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  /**
   * Handle Mezon login and registration using the provided id_token
   */
  async mezonLoginAsync(dto: MezonLoginDto): Promise<ResponseToken> {
    const { id_token } = dto;
    if (!id_token) {
      throw new BadRequestException({
        message: 'Invalid request: missing id_token',
        code: 'MEZON_MISSING_ID_TOKEN',
      });
    }

    const userInfo = await this.getUserInfo(id_token);
    const {
      user_id: mezonUserId,
      mezon_id: wallet,
      display_name: displayName,
      avatar,
      username,
      email,
    } = userInfo;

    if (!mezonUserId) {
      throw new BadRequestException({
        message: 'Invalid Mezon profile: missing user identity',
        code: 'MEZON_INVALID_PROFILE',
      });
    }

    let user = await this.usersRepository.findOne({
      where: { mezonUserId },
    });

    if (!user) {
      const randomPassword = randomstring.generate();
      const hashedPassword = await bcrypt.hash(randomPassword, SecurityOptions.PASSWORD_SALT_ROUNDS);
      const newUser = this.usersRepository.create({
        mezonUserId,
        email: email,
        userName: username,
        walletAddress: wallet,
        displayName: displayName,
        avatar: avatar ?? null,
        role: UserRoles.ORGANIZATION,
        hashedPassword,
        isFirstLogin: true,
      });
      user = await this.usersRepository.save(newUser);
    } else {
      await this.usersRepository.update(user.id, {
        userName: username,
        displayName: displayName,
        walletAddress: wallet,
        ...(avatar ? { avatar } : {}),
      });
    }

    const tokenPayload = await this.authService.buildTokenForUser(user);

    return plainToInstance(
      ResponseToken,
      { ...tokenPayload, userId: user.id, userName: user.userName, role: user.role, email: user.email },
      { excludeExtraneousValues: true },
    );
  }

  async mezonWebViewLoginAsync(dto: MezonWebViewLoginDto): Promise<ResponseToken> {
    const { hashData } = dto;

    let rawData: string;
    try {
      rawData = Buffer.from(hashData, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException({ message: 'Invalid hashData: not valid base64', code: 'MEZON_WEBVIEW_INVALID_HASH' });
    }


    let mezonUserId: string | undefined;
    let username: string | undefined;
    let displayName: string | undefined;
    let avatar: string | undefined;
    let email: string | undefined;
    let walletAddress: string | undefined;

    const asUrlParams = new URLSearchParams(rawData);

    const userJson = asUrlParams.get('user');
    if (userJson) {
      const match = userJson.match(/"(?:id|user_id)"\s*:\s*(\d+)/);
      if (match && match[1]) {
        mezonUserId = match[1];
      }
      try {
        const userObj = JSON.parse(userJson) as Record<string, unknown>;
        if (!mezonUserId) {
          mezonUserId = String(userObj['id'] ?? userObj['user_id'] ?? '');
        }
        username = userObj['username'] as string | undefined;
        displayName = (userObj['display_name'] ?? userObj['displayName'] ?? userObj['first_name']) as string | undefined;
        avatar = (userObj['avatar'] ?? userObj['photo_url']) as string | undefined;
        email = userObj['email'] as string | undefined;
        walletAddress = (userObj['mezon_id'] ?? userObj['wallet']) as string | undefined;
      } catch (parseErr) {
        this.logger.warn(`[WebView] Failed to parse 'user' JSON: ${parseErr}`);
      }
    }

    if (!mezonUserId && (asUrlParams.has('user_id') || asUrlParams.has('id'))) {
      mezonUserId = asUrlParams.get('user_id') ?? asUrlParams.get('id') ?? undefined;
      username = asUrlParams.get('username') ?? undefined;
      displayName = asUrlParams.get('display_name') ?? asUrlParams.get('displayName') ?? undefined;
      avatar = asUrlParams.get('avatar') ?? undefined;
      email = asUrlParams.get('email') ?? undefined;
      walletAddress = asUrlParams.get('mezon_id') ?? asUrlParams.get('wallet') ?? undefined;
    }

    if (!mezonUserId) {
      const match = rawData.match(/"(?:id|user_id)"\s*:\s*(\d+)/);
      if (match && match[1]) {
        mezonUserId = match[1];
      }
      try {
        const parsed = JSON.parse(rawData) as Record<string, unknown>;
        if (!mezonUserId) {
          mezonUserId = String(parsed['user_id'] ?? parsed['id'] ?? '');
        }
        username = parsed['username'] as string | undefined;
        displayName = (parsed['display_name'] ?? parsed['displayName']) as string | undefined;
        avatar = parsed['avatar'] as string | undefined;
        email = parsed['email'] as string | undefined;
        walletAddress = (parsed['mezon_id'] ?? parsed['wallet']) as string | undefined;
      } catch {
      }
    }

    if (!mezonUserId) {
      this.logger.error(`[WebView] Could not extract user_id from init data. Raw (first 300 chars): ${rawData.substring(0, 300)}`);
      throw new BadRequestException({ message: 'Cannot parse WebView init data — no user identity found', code: 'MEZON_WEBVIEW_PARSE_ERROR' });
    }

    let user = await this.usersRepository.findOne({ where: { mezonUserId } });

    if (!user) {
      let baseUsername = username ?? mezonUserId;
      let finalUsername = baseUsername;
      let suffix = 1;
      while (await this.usersRepository.findOne({ where: { userName: finalUsername } })) {
        finalUsername = `${baseUsername}_${suffix}`;
        suffix++;
      }

      let finalEmail = email ?? null;
      if (finalEmail) {
        const emailExists = await this.usersRepository.findOne({ where: { email: finalEmail } });
        if (emailExists) {
          finalEmail = null;
        }
      }

      const randomPassword = randomstring.generate();
      const hashedPassword = await bcrypt.hash(randomPassword, SecurityOptions.PASSWORD_SALT_ROUNDS);
      const newUser = this.usersRepository.create({
        mezonUserId,
        email: finalEmail,
        userName: finalUsername,
        walletAddress: walletAddress ?? null,
        displayName: displayName ?? username ?? mezonUserId,
        avatar: avatar ?? null,
        role: UserRoles.ORGANIZATION,
        hashedPassword,
        isFirstLogin: true,
      });
      user = await this.usersRepository.save(newUser);
    } else {
      const updateData: any = {};
      if (username && username !== user.userName) {
        const usernameExists = await this.usersRepository.findOne({ where: { userName: username } });
        if (!usernameExists) {
          updateData.userName = username;
        }
      }
      if (displayName) updateData.displayName = displayName;
      
      if (email && email !== user.email) {
        const emailExists = await this.usersRepository.findOne({ where: { email } });
        if (!emailExists) {
          updateData.email = email;
        }
      }
      if (walletAddress) updateData.walletAddress = walletAddress;
      if (avatar) updateData.avatar = avatar;

      if (Object.keys(updateData).length > 0) {
        await this.usersRepository.update(user.id, updateData);
      }
      user = await this.usersRepository.findOne({ where: { id: user.id } }) || user;
    }

    const tokenPayload = await this.authService.buildTokenForUser(user);

    const tokenResponse = plainToInstance(
      ResponseToken,
      { ...tokenPayload, userId: user.id, userName: user.userName, role: user.role, email: user.email },
      { excludeExtraneousValues: true },
    );

    return {
      ...tokenResponse,
      displayName: user.displayName,
      avatar: user.avatar,
    } as ResponseToken & { displayName: string | null; avatar: string | null };
  }

  /**
   * Private: Decode / Verify User Info from id_token
   */
  private async getUserInfo(idToken: string): Promise<MezonJwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        (header, callback) => {
          if (!header.kid) {
            return callback(new Error('Missing kid in JWT header'));
          }
          this.jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) {
              return callback(err);
            }
            callback(null, key?.getPublicKey());
          });
        },
        { algorithms: ['RS256'] },
        (err, decoded) => {
          if (err) {
            return reject(
              new BadRequestException({
                message: `Invalid id_token: ${err.message}`,
                code: 'MEZON_INVALID_TOKEN',
              }),
            );
          }
          resolve(decoded as MezonJwtPayload);
        },
      );
    });
  }
}
