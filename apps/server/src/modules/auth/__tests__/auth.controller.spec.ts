import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { MezonAuthService } from '../services/mezon-auth.service';
import { CredentialLoginDto, ForgetPasswordDto } from '../dto';
import { AuthorizedContext } from '../types';
import { AuthCacheService } from '../services/auth-cache.service';
import { JwtService } from '@nestjs/jwt';
import { LogoutGuard } from '@base/guards/logout.guard';

jest.mock('jwks-rsa', () => jest.fn().mockImplementation(() => ({
  getSigningKey: jest.fn(),
})));

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            credentialLoginAsync: jest.fn(),
            forgetPasswordAsync: jest.fn(),
            logoutAsync: jest.fn(),
          },
        },
        {
          provide: AuthCacheService,
          useValue: {
            addTokenToBlacklist: jest.fn(),
            isTokenBlacklisted: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: MezonAuthService,
          useValue: {
            mezonLoginAsync: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(LogoutGuard as any)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('credentialLoginAsync', () => {
    it('should call authService.credentialLoginAsync with correct dto', async () => {
      const loginDto: CredentialLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        accessToken: 'mock-token',
        expiresAt: new Date(),
        userId: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
        role: 'user',
      };
      service.credentialLoginAsync.mockResolvedValue(expectedResult);

      const result = await controller.credentialLoginAsync(loginDto);

      expect(result).toEqual(expectedResult);
      expect(service.credentialLoginAsync).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('forgetPasswordAsync', () => {
    it('should call authService.forgetPasswordAsync with correct dto', async () => {
      const forgetDto: ForgetPasswordDto = {
        email: 'test@example.com',
      };
      const expectedResult = { userId: 'user-uuid-1' };
      service.forgetPasswordAsync.mockResolvedValue(expectedResult);

      const result = await controller.forgetPasswordAsync(forgetDto);

      expect(result).toEqual(expectedResult);
      expect(service.forgetPasswordAsync).toHaveBeenCalledWith(forgetDto);
    });
  });

  describe('logoutAsync', () => {
    it('should call authService.logoutAsync with context', async () => {
      const context: AuthorizedContext = {
        userId: 'user-uuid-1',
        userName: 'testuser',
        role: 'user',
        jti: 'jti-uuid',
      };
      const expectedResult = {
        userId: 'user-uuid-1',
        message: 'Logout successfully',
      };
      service.logoutAsync.mockResolvedValue(expectedResult);

      const result = await controller.logoutAsync(context);

      expect(result).toEqual(expectedResult);
      expect(service.logoutAsync).toHaveBeenCalledWith(context);
    });
  });


  describe('mezonLoginAsync', () => {
    it('should call mezonAuthService.mezonLoginAsync', async () => {
      const mezonAuthService = (controller as any).mezonAuthService;
      const expectedResult: any = { accessToken: 'token', userId: '1' };
      mezonAuthService.mezonLoginAsync.mockResolvedValue(expectedResult);
      const dto: any = { id_token: 'valid.id.token' };
      const result = await controller.mezonLoginAsync(dto);
      expect(result).toEqual(expectedResult);
      expect(mezonAuthService.mezonLoginAsync).toHaveBeenCalledWith(dto);
    });
  });
});
