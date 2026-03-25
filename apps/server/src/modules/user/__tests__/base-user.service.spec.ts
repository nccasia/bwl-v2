import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseUserService } from '../services/base-user.service';
import { User } from '../entities';
import { UserRoles } from '../enums/roles.enum';

describe('BaseUserService', () => {
  let service: BaseUserService;
  let usersRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    userName: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRoles.ADMIN,
    hashedPassword: '$2a$10$hashedpassword',
    isLocked: false,
    isFirstLogin: true,
    loginFailedTimes: 0,
    phone: null,
    address: null,
    dob: null,
    gender: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseUserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BaseUserService>(BaseUserService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  describe('findUserByIdAsync', () => {
    it('should return user when found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findUserByIdAsync('user-uuid-1');

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserByIdAsync('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByEmailAsync', () => {
    it('should return user when found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findUserByEmailAsync('test@example.com');

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findUserByEmailAsync('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserByWalletAddressAsync', () => {
    it('should return user when found', async () => {
      const userWithWallet = { ...mockUser, walletAddress: '0x1234567890' };
      usersRepository.findOne.mockResolvedValue(userWithWallet as User);

      const result = await service.findUserByWalletAddressAsync('0x1234567890');

      expect(result).toEqual(userWithWallet);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { walletAddress: '0x1234567890' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findUserByWalletAddressAsync('0x9999999999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUsersByListIdsAsync', () => {
    it('should return users by list of ids', async () => {
      const users = [mockUser as User, { ...mockUser, id: 'user-uuid-2' } as User];
      usersRepository.find.mockResolvedValue(users);

      const result = await service.findUsersByListIdsAsync(['user-uuid-1', 'user-uuid-2']);

      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
      });
    });
  });
});
