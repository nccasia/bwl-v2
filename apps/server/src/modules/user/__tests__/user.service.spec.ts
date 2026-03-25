import { CursorQueryOptionsDto, QueryOptionsDto } from '@base/dtos/query-options.dto';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { User } from '../entities';
import { UserRoles } from '../enums/roles.enum';
import { BaseUserService } from '../services/base-user.service';
import { UserService } from '../services/user.service';

describe('UserService', () => {
  let service: UserService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let baseUserService: jest.Mocked<BaseUserService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    userName: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null as string | null,
    role: UserRoles.ADMIN,
    hashedPassword: '$2a$10$hashedpassword',
    isLocked: false,
    isFirstLogin: true,
    loginFailedTimes: 0,
    phone: null as string | null,
    address: null as string | null,
    dob: null as Date | null,
    gender: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exists: jest.fn(),
            softRemove: jest.fn(),
            restore: jest.fn(),
          },
        },
        {
          provide: BaseUserService,
          useValue: {
            findUserByIdAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    baseUserService = module.get(BaseUserService);
  });

  describe('getUsersAsync', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser as unknown as User, { ...mockUser, id: 'user-uuid-2' } as User];
      usersRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const queryOptions = new QueryOptionsDto();
      queryOptions.page = 1;
      queryOptions.limit = 10;
      queryOptions.sort = {};
      queryOptions.filters = {};

      const result = await service.getUsersAsync(queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data.length).toBe(2);
    });
  });

  describe('getUsersWithCursorAsync', () => {
    it('should return users with cursor pagination (first page)', async () => {
      const mockUsers = [
        { ...mockUser, id: 'user-uuid-1', createdAt: new Date('2024-01-15T10:00:00.000Z') },
        { ...mockUser, id: 'user-uuid-2', createdAt: new Date('2024-01-14T10:00:00.000Z') },
      ] as User[];
      usersRepository.find.mockResolvedValue(mockUsers);

      const cursorOptions = new CursorQueryOptionsDto();
      cursorOptions.limit = 10;
      cursorOptions.filters = {};

      const result = await service.getUsersWithCursorAsync(cursorOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data.length).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.nextCursor).toBeUndefined();
      expect(usersRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11,
          order: { createdAt: 'DESC' },
        }),
      );
    });

    it('should return users with hasNextPage true when more items exist', async () => {
      const mockUsers = Array.from({ length: 11 }, (_, i) => ({
        ...mockUser,
        id: `user-uuid-${i}`,
        createdAt: new Date(`2024-01-${10 + i}T10:00:00.000Z`),
      })) as User[];
      usersRepository.find.mockResolvedValue(mockUsers);

      const cursorOptions = new CursorQueryOptionsDto();
      cursorOptions.limit = 10;
      cursorOptions.filters = {};

      const result = await service.getUsersWithCursorAsync(cursorOptions);

      expect(result.data.length).toBe(10);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.nextCursor).toBeDefined();
    });

    it('should apply filters correctly', async () => {
      const mockUsers = [{ ...mockUser, id: 'user-uuid-1' }] as User[];
      usersRepository.find.mockResolvedValue(mockUsers);

      const cursorOptions = new CursorQueryOptionsDto();
      cursorOptions.limit = 10;
      cursorOptions.filters = { email: { eq: 'test@example.com' } } as any;

      await service.getUsersWithCursorAsync(cursorOptions);

      expect(usersRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: 'test@example.com',
          }),
          order: { createdAt: 'DESC' },
        }),
      );
    });

    it('should use cursor to get next page', async () => {
      const cursorValue = '2024-01-15T10:00:00.000Z';
      const cursorObject = { value: cursorValue };
      const encodedCursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');

      const mockUsers = [{ ...mockUser, id: 'user-uuid-9', createdAt: new Date('2024-01-14T10:00:00.000Z') }] as User[];
      usersRepository.find.mockResolvedValue(mockUsers);

      const cursorOptions = new CursorQueryOptionsDto();
      cursorOptions.limit = 10;
      cursorOptions.nextCursor = encodedCursor;
      cursorOptions.filters = {};

      await service.getUsersWithCursorAsync(cursorOptions);

      expect(usersRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.anything(),
          }),
          order: { createdAt: 'DESC' },
        }),
      );
    });
  });

  describe('getDeletedUsersAsync', () => {
    it('should return deleted users', async () => {
      const mockUsers = [{ ...mockUser, deletedAt: new Date() } as User];
      usersRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getDeletedUsersAsync();

      expect(result).toBeInstanceOf(Array);
      expect(usersRepository.find).toHaveBeenCalledWith({
        withDeleted: true,
        where: { deletedAt: expect.anything() },
        order: { deletedAt: 'DESC' },
      });
    });
  });

  describe('createUserAsync', () => {
    it('should create a new user', async () => {
      const createUserDto = new CreateUserDto();
      createUserDto.email = 'newuser@example.com';
      createUserDto.role = UserRoles.ADMIN;
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue({ ...createUserDto, id: 'new-uuid' } as User);
      usersRepository.save.mockResolvedValue({ ...mockUser, id: 'new-uuid' } as User);

      const result = await service.createUserAsync(createUserDto);

      expect(result).toHaveProperty('id');
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createUserDto = new CreateUserDto();
      createUserDto.email = 'newuser@example.com';
      createUserDto.role = UserRoles.ADMIN;
      usersRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.createUserAsync(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateUserAsync', () => {
    const updateUserDto = new UpdateUserDto();
    updateUserDto.firstName = 'Jane';

    it('should update user', async () => {
      baseUserService.findUserByIdAsync.mockResolvedValue(mockUser as User);
      usersRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto } as User);
      await service.updateUserAsync('user-uuid-1', updateUserDto);
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already in use', async () => {
      usersRepository.exists.mockResolvedValue(true);

      const updateDtoWithEmail = new UpdateUserDto();
      updateDtoWithEmail.email = 'other@example.com';

      await expect(
        service.updateUserAsync('user-uuid-1', updateDtoWithEmail),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUserAsync', () => {
    it('should soft delete user', async () => {
      baseUserService.findUserByIdAsync.mockResolvedValue(mockUser as User);
      usersRepository.softRemove.mockResolvedValue(mockUser as User);

      const result = await service.deleteUserAsync('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(usersRepository.softRemove).toHaveBeenCalled();
    });
  });

  describe('restoreUserAsync', () => {
    it('should restore deleted user', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser as User);
      const updateResult: UpdateResult = {
        affected: 1,
        generatedMaps: [],
        raw: [],
      };
      usersRepository.restore.mockResolvedValue(updateResult);

      const result = await service.restoreUserAsync('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(usersRepository.restore).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw BadRequestException when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.restoreUserAsync('nonexistent-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPasswordAsync', () => {
    it('should reset user password', async () => {
      baseUserService.findUserByIdAsync.mockResolvedValue(mockUser as User);
      usersRepository.save.mockResolvedValue(mockUser as User);

      const result = await service.resetPasswordAsync('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserByIdAsync', () => {
    it('should return user by id', async () => {
      baseUserService.findUserByIdAsync.mockResolvedValue(mockUser as User);

      const result = await service.getUserByIdAsync('user-uuid-1');

      expect(result).toHaveProperty('id');
      expect(baseUserService.findUserByIdAsync).toHaveBeenCalledWith('user-uuid-1');
    });
  });
});
