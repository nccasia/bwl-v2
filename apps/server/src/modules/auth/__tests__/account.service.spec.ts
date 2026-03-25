import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AccountService } from '../services/account.service';
import { User } from '@modules/user/entities';
import { ChangePasswordDto, UpdateInfoDto } from '../dto';
import { UserRoles } from '@modules/user/enums/roles.enum';

describe('AccountService', () => {
  let service: AccountService;
  let usersRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    userName: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    role: UserRoles.ADMIN,
    hashedPassword: '$2a$10$hashedpassword',
    isFirstLogin: true,
    phone: null,
    address: null,
    dob: null,
    gender: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  describe('getCurrentUserAsync', () => {
    it('should return current user info', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.getCurrentUserAsync('user-uuid-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCurrentUserAsync('nonexistent-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfileAsync', () => {
    it('should update user profile', async () => {
      const updateData = new UpdateInfoDto();
      updateData.firstName = 'Jane';
      updateData.lastName = 'Smith';
      const updatedUser = { ...mockUser, ...updateData } as User;
      usersRepository.findOne.mockResolvedValue(mockUser as User);
      usersRepository.save.mockResolvedValue(updatedUser);

      await service.updateProfileAsync('user-uuid-1', updateData);

      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const emptyDto = new UpdateInfoDto();
      await expect(
        service.updateProfileAsync('nonexistent-id', emptyDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePasswordAsync', () => {
    it('should change password successfully', async () => {
      const hashedPassword = await bcrypt.hash('oldpassword', 10);
      const changePasswordDto = new ChangePasswordDto();
      changePasswordDto.oldPassword = 'oldpassword';
      changePasswordDto.newPassword = 'newpassword123';
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        hashedPassword,
      } as User);
      usersRepository.update.mockResolvedValue({ affected: 1 } as never);

      const result = await service.changePasswordAsync(
        'user-uuid-1',
        changePasswordDto,
      );

      expect(result).toEqual({
        isSuccess: true,
        message: 'Password changed successfully',
      });
      expect(usersRepository.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const changePasswordDto = new ChangePasswordDto();
      changePasswordDto.oldPassword = 'old';
      changePasswordDto.newPassword = 'new';

      await expect(
        service.changePasswordAsync('nonexistent-id', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when old password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        hashedPassword,
      } as User);

      const changePasswordDto = new ChangePasswordDto();
      changePasswordDto.oldPassword = 'wrongpassword';
      changePasswordDto.newPassword = 'newpassword';

      await expect(
        service.changePasswordAsync('user-uuid-1', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
