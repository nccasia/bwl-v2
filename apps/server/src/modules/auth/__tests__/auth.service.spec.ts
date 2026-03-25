import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { User } from '@modules/user/entities';
import { CredentialLoginDto, ResetPasswordDto } from '../dto';
import { UserRoles } from '@modules/user/enums/roles.enum';
import { AuthorizedContext } from '../types';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    userName: 'testuser',
    avatar: null,
    role: UserRoles.ADMIN,
    hashedPassword: '$2a$10$hashedpassword',
    isLocked: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-access-token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('credentialLoginAsync', () => {
    const loginDto: CredentialLoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return tokens on successful login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        hashedPassword,
      } as User);

      const result = await service.credentialLoginAsync(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresAt');
      expect(result.email).toBe(mockUser.email);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'hashedPassword', 'userName', 'avatar', 'role'],
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.credentialLoginAsync(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when account is locked', async () => {
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        isLocked: true,
      } as User);

      await expect(service.credentialLoginAsync(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('differentpassword', 10);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        hashedPassword,
      } as User);

      await expect(service.credentialLoginAsync(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logoutAsync', () => {
    it('should return userId and success message', async () => {
      const context: AuthorizedContext = {
        jti: 'jti-1',
        userId: 'user-uuid-1',
        userName: 'testuser',
        role: 'admin',
      };

      const result = await service.logoutAsync(context);

      expect(result).toEqual({
        userId: 'user-uuid-1',
        message: 'Logout successfully',
      });
    });

    it('should return null userId when context is undefined', async () => {
      const result = await service.logoutAsync(undefined as unknown as AuthorizedContext);

      expect(result).toEqual({
        userId: null,
        message: 'Logout successfully',
      });
    });
  });

  describe('forgetPasswordAsync', () => {
    it('should return userId when user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
      } as User);

      const result = await service.forgetPasswordAsync({
        email: 'test@example.com',
      });

      expect(result).toEqual({ userId: 'user-uuid-1' });
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.forgetPasswordAsync({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPasswordAsync', () => {
    it('should reset password and return tokens', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
        hashedPassword: '$2a$10$oldhash',
      } as User);
      usersRepository.save.mockResolvedValue(mockUser as User);

      const resetDto = new ResetPasswordDto();
      resetDto.newPassword = 'newpassword123';

      const result = await service.resetPasswordAsync('user-uuid-1', resetDto);

      expect(result).toHaveProperty('accessToken');
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const resetDto = new ResetPasswordDto();
      resetDto.newPassword = 'newpassword123';

      await expect(
        service.resetPasswordAsync('nonexistent-id', resetDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('buildTokenForUser', () => {
    it('should build token for user', async () => {
      const user = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
        avatar: null,
        role: UserRoles.ADMIN,
        hashedPassword: '$2a$10$hashedpassword',
        isLocked: false,
        isFirstLogin: true,
        loginFailedTimes: 0,
        phone: null,
        address: null,
        dob: null,
        gender: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      const result = await service.buildTokenForUser(user);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresAt');
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });
});
