import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../controllers/account.controller';
import { AccountService } from '../services/account.service';
import { AuthorizedContext } from '../types';
import { UpdateInfoDto, ChangePasswordDto } from '../dto';

describe('AccountController', () => {
  let controller: AccountController;
  let service: jest.Mocked<AccountService>;

  const mockContext: AuthorizedContext = {
    userId: 'user-uuid-1',
    userName: 'testuser',
    role: 'user',
    jti: 'jti-uuid',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getCurrentUserAsync: jest.fn(),
            updateProfileAsync: jest.fn(),
            changePasswordAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get(AccountService);
  });

  describe('getCurrentUser', () => {
    it('should return current user info', async () => {
      const expectedResult = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      };
      service.getCurrentUserAsync.mockResolvedValue(expectedResult as never);

      const result = await controller.getCurrentUser(mockContext);

      expect(result).toEqual(expectedResult);
      expect(service.getCurrentUserAsync).toHaveBeenCalledWith(
        mockContext.userId,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = new UpdateInfoDto();
      updateDto.firstName = 'Jane';
      updateDto.lastName = 'Smith';
      const expectedResult = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        userName: 'testuser',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      service.updateProfileAsync.mockResolvedValue(expectedResult as never);

      const result = await controller.updateProfile(mockContext, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateProfileAsync).toHaveBeenCalledWith(
        mockContext.userId,
        updateDto,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const expectedResult = {
        isSuccess: true,
        message: 'Password changed successfully',
      };
      service.changePasswordAsync.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(
        mockContext,
        changePasswordDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.changePasswordAsync).toHaveBeenCalledWith(
        mockContext.userId,
        changePasswordDto,
      );
    });
  });
});
