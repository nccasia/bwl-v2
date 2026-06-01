import { Test, TestingModule } from '@nestjs/testing';
import { MezonAuthService } from '../services/mezon-auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@modules/user/entities';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

jest.mock('jwks-rsa', () => jest.fn().mockImplementation(() => ({
  getSigningKey: jest.fn(),
})));

describe('MezonAuthService', () => {
  let service: MezonAuthService;
  let configService: jest.Mocked<ConfigService>;
  let authService: jest.Mocked<AuthService>;
  let usersRepository: any;

  beforeEach(async () => {
    configService = {
    } as any;

    authService = {
      buildTokenForUser: jest.fn(),
    } as any;

    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MezonAuthService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<MezonAuthService>(MezonAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


});
