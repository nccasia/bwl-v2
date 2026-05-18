import { LogoutGuard } from '@base/guards/logout.guard';
import { OTPGuard } from '@base/guards/otp.guard';
import { JwtStrategy } from '@base/passports/jwt.strategy';
import { SharedModule } from '@modules/shared/shared.module';
import { User } from '@modules/user/entities';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController, AuthController } from './controllers';
import { AccountService, AuthCacheService, AuthService, MezonAuthService } from './services';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    TypeOrmModule.forFeature([User]),
    SharedModule,
    UserModule,
  ],
  controllers: [AuthController, AccountController],
  providers: [
    JwtStrategy,
    OTPGuard,
    LogoutGuard,
    AuthService,
    AuthCacheService,
    AccountService,
    MezonAuthService,
  ],
  exports: [AuthService, AccountService, MezonAuthService],
})
export class AuthModule { }
