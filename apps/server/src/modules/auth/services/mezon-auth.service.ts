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
import { MezonLoginDto } from '../dto';
import { ResponseToken } from '../types';
import { AuthService } from './auth.service';

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
   * Private: Decode / Verify User Info from id_token
   */
  private async getUserInfo(idToken: string): Promise<Record<string, unknown>> {
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
          resolve(decoded as Record<string, unknown>);
        },
      );
    });
  }
}
