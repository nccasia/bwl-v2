import { SecurityOptions } from '@constants';
import { User } from '@modules/user/entities';
import { UserRoles } from '@modules/user/enums';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { randomBytes } from 'crypto';
import randomstring from 'randomstring';
import { Repository } from 'typeorm';
import { MezonLoginDto } from '../dto';
import { ResponseToken } from '../types';
import { AuthService } from './auth.service';

@Injectable()
export class MezonAuthService {
  private readonly logger = new Logger(MezonAuthService.name);

  private readonly authUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.authUrl = this.configService.get<string>('MEZON_AUTH_URL');
    this.clientId = this.configService.get<string>('MEZON_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('MEZON_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('REDIRECT_URI');
  }

  /**
   * Get the Mezon OAuth2 login redirect URL
   */
  getMezonAuthUrl(): string {
    const state = randomBytes(8).toString('hex');
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid offline',
      state,
    });
    return `${this.authUrl}/oauth2/auth?${params.toString()}`;
  }

  /**
   * Handle the code exchange from the redirect callback
   */
  async mezonLoginAsync(dto: MezonLoginDto): Promise<ResponseToken> {
    const { code } = dto;
    if (!code) {
      throw new BadRequestException({
        message: 'Invalid request: missing authorization code',
        code: 'MEZON_MISSING_CODE',
      });
    }

    const tokens = await this.exchangeCodeForTokens(code);
    const userInfo = await this.getUserInfo(tokens);
    this.logger.log('userInfo', userInfo);
    const mezonUserId = (userInfo.user_id) as string;
    const wallet = userInfo.mezon_id as string;

    if (!mezonUserId) {
      throw new BadRequestException({
        message: 'Invalid Mezon profile: missing user identity',
        code: 'MEZON_INVALID_PROFILE',
      });
    }

    const displayName: string = userInfo.display_name as string;
    const avatar: string | undefined = (userInfo.avatar) as string | undefined;
    const username: string = userInfo.username as string;
    const email: string = userInfo.email as string;

    let user = await this.usersRepository.findOne({
      where: { mezonUserId },
    });

    if (!user) {
      this.logger.log(`Auto-registering new user from Mezon: ${mezonUserId}`);
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
        email: email,
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

  /**
   * Private: Exchange authorization code for token pairs (access_token, id_token)
   */
  private async exchangeCodeForTokens(
    code: string,
  ): Promise<{ access_token: string; id_token?: string }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(`${this.authUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`[AUTH] Token exchange failed: ${response.status} ${errText}`);
      throw new BadRequestException({
        message: `Token exchange failed: ${errText}`,
        code: 'MEZON_TOKEN_EXCHANGE_ERROR',
      });
    }

    const data = (await response.json()) as {
      access_token: string;
      id_token?: string;
    };
    return data;
  }

  /**
   * Private: Get User Info either by decoding id_token or calling /userinfo
   */
  private async getUserInfo(
    tokens: { access_token: string; id_token?: string },
  ): Promise<Record<string, unknown>> {
    if (tokens.id_token) {
      try {
        const payload = tokens.id_token.split('.')[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf-8');
        const claims = JSON.parse(decoded) as Record<string, unknown>;
        return claims;
      } catch {
        this.logger.warn('[AUTH] Failed to decode id_token, falling back to /userinfo endpoint');
      }
    }

    const userinfoUrl = `${this.authUrl}/oauth2/userinfo`;
    const res = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      return data;
    }

    const errText = await res.text();
    throw new BadRequestException({
      message: `Could not retrieve user info (${res.status}): ${errText}`,
      code: 'MEZON_USERINFO_ERROR',
    });
  }
}
