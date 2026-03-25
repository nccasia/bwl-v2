import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { RBACGuard } from '@base/guards/rbac.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { BaseUserDto, CreateUserDto, UpdateUserDto } from '../dto';
import { UserRoles } from '../enums/roles.enum';
import { UserService } from '../services/user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    userName: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRoles.ADMIN,
    avatar: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    dob: null as Date | null,
    gender: null,
    isLocked: false,
    createdAt: new Date(),
    deletedAt: null as Date | null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsersAsync: jest.fn(),
            getDeletedUsersAsync: jest.fn(),
            createUserAsync: jest.fn(),
            updateUserAsync: jest.fn(),
            deleteUserAsync: jest.fn(),
            restoreUserAsync: jest.fn(),
            resetPasswordAsync: jest.fn(),
            getUserByIdAsync: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RBACGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const expectedResult = {
        data: [mockUser],
        pagination: { page: 1, pageSize: 10, total: 1 },
      };
      service.getUsersAsync.mockResolvedValue(expectedResult as never);

      const queryOptions = new QueryOptionsDto();
      queryOptions.page = 1;
      queryOptions.limit = 10;
      queryOptions.sort = {};
      queryOptions.filters = {};

      const result = await controller.getAllUsers(queryOptions);

      expect(result).toEqual(expectedResult);
      expect(service.getUsersAsync).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const baseUserDto = new BaseUserDto();
      Object.assign(baseUserDto, mockUser);
      service.getUserByIdAsync.mockResolvedValue(baseUserDto);

      const result = await controller.getUserById('user-uuid-1');

      expect(result).toEqual(baseUserDto);
      expect(service.getUserByIdAsync).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('getDeletedUsers', () => {
    it('should return deleted users', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      const deletedUsers = [deletedUser];
      service.getDeletedUsersAsync.mockResolvedValue(deletedUsers);

      const result = await controller.getDeletedUsers();

      expect(result).toEqual(deletedUsers);
      expect(service.getDeletedUsersAsync).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createDto = new CreateUserDto();
      createDto.email = 'newuser@example.com';
      createDto.role = UserRoles.ADMIN;
      const createdUser = { ...mockUser, id: 'new-uuid' };
      const baseUserDto = new BaseUserDto();
      Object.assign(baseUserDto, createdUser);
      service.createUserAsync.mockResolvedValue(baseUserDto);

      const result = await controller.createUser(createDto);

      expect(result).toEqual(baseUserDto);
      expect(service.createUserAsync).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateDto = new UpdateUserDto();
      updateDto.firstName = 'Jane';
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      const baseUserDto = new BaseUserDto();
      Object.assign(baseUserDto, updatedUser);
      service.updateUserAsync.mockResolvedValue(baseUserDto);

      const result = await controller.updateUser('user-uuid-1', updateDto);

      expect(result).toEqual(baseUserDto);
      expect(service.updateUserAsync).toHaveBeenCalledWith('user-uuid-1', updateDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      service.deleteUserAsync.mockResolvedValue({ userId: 'user-uuid-1' });

      const result = await controller.deleteUser('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(service.deleteUserAsync).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('restoreUser', () => {
    it('should restore user', async () => {
      service.restoreUserAsync.mockResolvedValue({ userId: 'user-uuid-1' });

      const result = await controller.restoreUser('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(service.restoreUserAsync).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      service.resetPasswordAsync.mockResolvedValue({ userId: 'user-uuid-1' });

      const result = await controller.resetPassword('user-uuid-1');

      expect(result).toEqual({ userId: 'user-uuid-1' });
      expect(service.resetPasswordAsync).toHaveBeenCalledWith('user-uuid-1');
    });
  });
});
