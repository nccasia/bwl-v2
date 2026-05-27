import { SecurityOptions } from '@constants';
import { User } from '@modules/user/entities';
import { UserRoles } from '@modules/user/enums';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { plainToInstance } from 'class-transformer';
import randomstring from 'randomstring';
import { Repository } from 'typeorm';
import { MezonWebViewDto } from '../dto/mezon-webview.dto';
import { ResponseToken } from '../types';
import { AuthService } from './auth.service';

interface MezonInitDataUser {
  id: number | string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
}

interface MezonWebViewPayload {
  mezonUserId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  email?: string;
}

@Injectable()
export class MezonWebViewAuthService {
  private readonly logger = new Logger(MezonWebViewAuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithWebViewData(dto: MezonWebViewDto): Promise<ResponseToken> {
    const payload = this.parseAndValidate(dto.hashData);
    const { mezonUserId, username, displayName, avatar, email } = payload;

    this.logger.debug(`WebView login: mezonUserId=${mezonUserId} username=${username}`);

    try {
      // ── 1. Look up user by Mezon ID ───────────────────────────────────────
      let user = await this.usersRepository.findOne({ where: { mezonUserId } });
      this.logger.debug(`User by mezonUserId: ${user ? `found id=${user.id}` : 'not found'}`);

      if (!user) {
        const randomPassword = randomstring.generate();
        const hashedPassword = await bcrypt.hash(
          randomPassword,
          SecurityOptions.PASSWORD_SALT_ROUNDS,
        );

        let finalUserName = username;
        const existingByName = await this.usersRepository.findOne({ where: { userName: username } });
        if (existingByName && existingByName.mezonUserId !== mezonUserId) {
          finalUserName = `${username}_${mezonUserId.slice(-6)}`;
          this.logger.debug(`userName conflict — using suffix: ${finalUserName}`);
        }

        this.logger.debug(`Creating user: userName=${finalUserName} email=${email ?? 'null'}`);

        const newUser = this.usersRepository.create({
          mezonUserId,
          userName: finalUserName,
          displayName: displayName ?? finalUserName,
          email: email ?? null,
          avatar: avatar ?? null,
          role: UserRoles.ORGANIZATION,
          hashedPassword,
          isFirstLogin: true,
        });

        user = await this.usersRepository.save(newUser);
        this.logger.log(`Registered new WebView user: ${mezonUserId} (${finalUserName})`);
      } else {
        this.logger.debug(`Updating existing user id=${user.id}`);
        await this.usersRepository.update(user.id, {
          displayName: displayName ?? username,
          ...(email ? { email } : {}),
          ...(avatar ? { avatar } : {}),
        });
      }

      this.logger.debug(`Building JWT for user id=${user.id}`);
      const tokenPayload = await this.authService.buildTokenForUser(user);

      return plainToInstance(
        ResponseToken,
        {
          ...tokenPayload,
          userId: user.id,
          userName: user.userName,
          role: user.role,
          email: user.email,
        },
        { excludeExtraneousValues: true },
      );
    } catch (err: unknown) {
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`WebView login failed (mezonUserId=${mezonUserId}): ${msg}`, err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException({
        message: `WebView auth error: ${msg}`,
        code: 'MEZON_WEBVIEW_INTERNAL_ERROR',
      });
    }
  }

  private parseAndValidate(hashData: string): MezonWebViewPayload {
    const secret =
      this.configService.get<string>('MEZON_APP_SECRET') ||
      this.configService.get<string>('MEZON_BOT_TOKEN');

    if (!secret) {
      this.logger.error('Neither MEZON_APP_SECRET nor MEZON_BOT_TOKEN is configured');
      throw new UnauthorizedException({
        message: 'WebView authentication is not configured on the server',
        code: 'MEZON_WEBVIEW_NOT_CONFIGURED',
      });
    }

    let rawHashData: string;
    try {
      rawHashData = Buffer.from(hashData, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException({
        message: 'Invalid hashData encoding — expected Base64',
        code: 'MEZON_WEBVIEW_INVALID_ENCODING',
      });
    }

    let params: URLSearchParams;
    try {
      params = new URLSearchParams(rawHashData);
    } catch {
      throw new BadRequestException({
        message: 'Invalid initData format',
        code: 'MEZON_WEBVIEW_INVALID_FORMAT',
      });
    }

    const hash = params.get('hash');
    if (!hash) {
      throw new BadRequestException({
        message: 'Missing hash in WebView initData',
        code: 'MEZON_WEBVIEW_MISSING_HASH',
      });
    }

    const hashParamsString = rawHashData.split('&hash=')[0];
    const hashedBotToken = crypto
      .createHash('md5')
      .update(secret)
      .digest('hex');

    const secretKey = crypto
      .createHmac('sha256', hashedBotToken)
      .update('WebAppData')
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(hashParamsString)
      .digest('hex');

    if (computedHash !== hash) {
      this.logger.warn(
        `WebView HMAC mismatch. computed=${computedHash} got=${hash} ` +
        `hashParamsString="${hashParamsString.substring(0, 80)}..."`,
      );
      throw new UnauthorizedException({
        message: 'Invalid WebView initData signature',
        code: 'MEZON_WEBVIEW_INVALID_SIGNATURE',
      });
    }

    const userRaw = params.get('user');
    if (!userRaw) {
      throw new BadRequestException({
        message: 'Missing user in WebView initData',
        code: 'MEZON_WEBVIEW_MISSING_USER',
      });
    }

    let mezonUser: MezonInitDataUser;
    try {
      mezonUser = JSON.parse(userRaw) as MezonInitDataUser;
    } catch {
      throw new BadRequestException({
        message: 'Invalid user JSON in WebView initData',
        code: 'MEZON_WEBVIEW_INVALID_USER',
      });
    }

    const rawIdMatch = userRaw.match(/"id"\s*:\s*(\d+)/);
    const mezonUserId = rawIdMatch ? rawIdMatch[1] : String(mezonUser.id ?? '');

    if (!mezonUserId) {
      throw new BadRequestException({
        message: 'Missing user.id in WebView initData',
        code: 'MEZON_WEBVIEW_MISSING_USER_ID',
      });
    }

    return {
      mezonUserId,
      username: mezonUser.username ?? mezonUserId,
      displayName: mezonUser.display_name,
      avatar: mezonUser.avatar_url,
      email: mezonUser.email,
    };
  }
}
