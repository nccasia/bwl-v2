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
import { MezonLoginDto, MezonUrlResponseDto } from '../dto';
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
  getMezonAuthUrl(): MezonUrlResponseDto {
    const state = randomBytes(8).toString('hex');
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid offline',
      state,
    });
    return plainToInstance(
      MezonUrlResponseDto,
      { url: `${this.authUrl}/oauth2/auth?${params.toString()}` },
      { excludeExtraneousValues: true },
    );
  }

  /**
   * Handle the code exchange from the redirect callback
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
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new BadRequestException({
        message: `Invalid id_token format`,
        code: 'MEZON_INVALID_TOKEN',
      });
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const claims = JSON.parse(decoded) as Record<string, unknown>;

    return claims;
  }
}
