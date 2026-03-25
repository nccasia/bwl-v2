# BWL Server Project Documentation

## Overview

The BWL Server is a NestJS-based backend application located in `apps/server/`. It provides REST APIs for the BWL platform with features including authentication, user management, email notifications, job queues, and scheduled tasks.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: Passport.js (JWT + OTP)
- **API Documentation**: Swagger (@nestjs/swagger)
- **Validation**: class-validator, class-transformer
- **Job Queue**: BullMQ
- **Email**: Resend with Handlebars templates
- **Testing**: Jest with TestingModule

## Project Structure

```
apps/server/
├── src/
│   ├── app.module.ts                 # Root application module
│   ├── main.ts                       # Entry point with bootstrap
│   ├── base/                         # Shared/base utilities
│   │   ├── decorators/              # Custom decorators
│   │   │   ├── api-query-options.decorator.ts
│   │   │   ├── auth.decorator.ts
│   │   │   ├── query-options.decorator.ts
│   │   │   ├── response-swagger.decorator.ts
│   │   │   └── index.ts
│   │   ├── dtos/                     # Shared DTOs
│   │   │   └── query-options.dto.ts
│   │   ├── entities/                 # Base entities
│   │   │   └── base.entity.ts
│   │   ├── enums/                    # Shared enums
│   │   ├── filters/                  # Exception filters
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/                   # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── rbac.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/             # Response interceptors
│   │   │   └── response.interceptor.ts
│   │   ├── modules/                  # Core NestJS modules
│   │   │   ├── config/
│   │   │   └── database/
│   │   ├── pipes/                    # Custom pipes
│   │   ├── types/                    # Base types
│   │   │   └── base.type.ts
│   │   └── utils/                    # Utilities
│   ├── configs/                      # Configuration files
│   ├── constants/                    # Global constants
│   ├── enums/                        # Global enums
│   │   └── tables.enum.ts
│   ├── migrations/                   # TypeORM migrations
│   │   └── *.ts
│   ├── modules/                      # Feature modules
│   │   ├── auth/
│   │   ├── common/
│   │   ├── cronjob/
│   │   ├── mail/
│   │   ├── queue/
│   │   ├── shared/
│   │   ├── third-party/
│   │   └── user/
│   ├── templates/                    # Email templates (.hbs)
│   └── utils/                         # Shared utilities
├── test/                             # E2E test configuration
├── nest-cli.json
├── tsconfig.json
├── package.json
└── project.json
```

## Module Structure Convention

Each feature module follows a consistent structure:

```
module-name/
├── __tests__/                        # Unit tests
│   └── *.spec.ts
├── controllers/
│   ├── *.controller.ts
│   └── index.ts
├── dto/
│   ├── base-*.dto.ts
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── index.ts
├── entities/
│   ├── *.entity.ts
│   └── index.ts
├── enums/
│   ├── *.enum.ts
│   └── index.ts
├── services/
│   ├── base-*.service.ts
│   ├── *.service.ts
│   └── index.ts
├── types/
│   ├── *.type.ts
│   └── index.ts
└── *.module.ts
```

## Naming Conventions

### Files
- PascalCase: `user.service.ts`, `auth.controller.ts`
- camelCase: `array-converter.util.ts`

### Classes
- PascalCase: `UserService`, `AuthController`
- Suffixes:
  - Controllers: `*Controller`
  - Services: `*Service`, `Base*Service`
  - DTOs: `*Dto`, `Base*Dto`, `Create*Dto`, `Update*Dto`
  - Entities: `*Entity` (extends `AbstractEntity`)
  - Enums: PascalCase singular
  - Filters: `*Filter`, `*ExceptionFilter`
  - Guards: `*Guard`
  - Interceptors: `*Interceptor`

### Methods
- camelCase with `Async` suffix: `getUsersAsync`, `createUserAsync`

### Variables
- camelCase: `userId`, `hashedPassword`, `queryOptions`

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@base/*": ["src/base/*"],
      "@constants": ["src/constants"],
      "@modules/*": ["src/modules/*"],
      "@enums/*": ["src/enums/*"]
    }
  }
}
```

Jest module mapping in `package.json`:

```json
{
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1",
    "^@base/(.*)$": "<rootDir>/base/$1",
    "^@constants$": "<rootDir>/constants",
    "^@enums/(.*)$": "<rootDir>/enums/$1",
    "^@configs/(.*)$": "<rootDir>/configs/$1",
    "^@modules/(.*)$": "<rootDir>/modules/$1"
  }
}
```

## Entities

### AbstractEntity

All entities extend `AbstractEntity` which provides:

- `id`: ULID-based primary key (auto-generated)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete timestamp

```typescript
// src/base/entities/base.entity.ts
export abstract class AbstractEntity {
  @PrimaryColumn()
  @ApiProperty()
  @Expose()
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  @Expose()
  deletedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}
```

### Entity Example

```typescript
@Entity(Tables.User)
export class User extends AbstractEntity {
  @Column({ unique: true })
  userName: string;

  @Column({ select: false })
  hashedPassword: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role: UserRoles;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;
}
```

## DTOs

### Pattern

Use `@nestjs/swagger` `PickType` and `PartialType`:

```typescript
// Base DTO - exposed fields
export class BaseUserDto extends PickType(User, [
  'id', 'userName', 'email', 'role', 'isLocked', 'createdAt'
]) {}

// Create DTO - fields allowed on creation
export class CreateUserDto extends PickType(User, [
  'email', 'userName', 'password', 'role'
]) {}

// Update DTO - all fields optional
export class UpdateUserDto extends PartialType(BaseUserDto) {}
```

### Query Options DTO

Located in `src/base/dtos/query-options.dto.ts`:

```typescript
// Offset-based pagination
export class QueryOptionsDto {
  page?: number = 1;
  limit?: number = 10;
  sort?: Record<string, 'desc' | 'asc'>;
  search?: string;
  filters?: Record<string, Filter>;
}

// Cursor-based pagination
export class CursorQueryOptionsDto {
  limit?: number = 10;
  nextCursor?: string;
  sort?: Record<string, 'desc' | 'asc'>;
  search?: string;
  filters?: Record<string, Filter>;
}
```

## Services

### Base Service Pattern

Base services provide common CRUD operations:

```typescript
// services/base-user.service.ts
@Injectable()
export class BaseUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByIdAsync(id: string): Promise<User> {
    const entity = await this.userRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException({
        message: `User with ID ${id} not found`,
        code: 'USER_NOT_FOUND',
      });
    }
    return entity;
  }
}
```

### Main Service Pattern

```typescript
// services/user.service.ts
@Injectable()
export class UserService extends BaseUserService {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async getUsersAsync(queryOptionsDto: QueryOptionsDto) {
    const { getPagination, skip, take } = new QueryOptionsHelper(queryOptionsDto);
    const [rawUsers, count] = await this.userRepository.findAndCount({ skip, take });
    const users = rawUsers.map(user =>
      plainToInstance(BaseUserDto, user, { excludeExtraneousValues: true })
    );
    return {
      data: users,
      pagination: getPagination({ count, total: rawUsers.length }),
    };
  }
}
```

## Controllers

```typescript
@ApiTags('Users')
@Auth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RBAC(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQueryOptions()
  @ApiResponseType(BaseUserDto, { isArray: true, hasPagination: true })
  @Get('get-users')
  async getUsers(@QueryOptions() queryOptions: QueryOptionsDto) {
    return this.userService.getUsersAsync(queryOptions);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponseType(BaseUserDto)
  @Get('get-user/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findByIdAsync(id);
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponseType(BaseUserDto)
  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createAsync(dto);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponseType(BaseUserDto)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateAsync(id, dto);
  }
}
```

## Decorators

### Auth Decorators

| Decorator | Purpose |
|-----------|---------|
| `@Auth()` | JWT authentication required |
| `@OTPAuth()` | OTP authentication required |
| `@RBAC(...roles)` | Role-based access control |
| `@LOGOUT()` | Logout with token revocation |

### API Decorators

| Decorator | Purpose |
|-----------|---------|
| `@ApiQueryOptions()` | Pagination query options for Swagger |
| `@ApiCursorQueryOptions()` | Cursor pagination for Swagger |
| `@ApiResponseType(Model, options)` | Swagger response type |
| `@QueryOptions()` | Parse query options from request |
| `@UserRequest()` | Get current user from request |
| `@Roles(...roles)` | Set roles for Swagger documentation |

## Pagination

### Offset-Based (QueryOptionsHelper)

```typescript
async getUsers(queryOptions: QueryOptionsDto) {
  const { getPagination, skip, take } = new QueryOptionsHelper(queryOptionsDto);
  const [items, count] = await this.repository.findAndCount({ skip, take });
  return {
    data: items,
    pagination: getPagination({ count, total: items.length }),
  };
}
```

### Cursor-Based (CursorQueryOptionsHelper)

```typescript
async getUsersCursor(dto: CursorQueryOptionsDto) {
  const helper = new CursorQueryOptionsHelper(dto, {
    cursorField: 'createdAt',
    direction: 'DESC',
    acceptFilterFields: ['email', 'userName'],
  });

  const items = await this.repository.find({
    where: helper.buildWhereConditions(),
    take: helper.getCursorLimit(),
    order: helper.getCursorOrder(),
  });

  return {
    data: items,
    pagination: helper.getCursorPagination(items),
  };
}
```

## Error Handling

### Exception Filter

All exceptions are caught by `AllExceptionsFilter`:

```json
{
  "statusCode": 404,
  "isSuccess": false,
  "message": "User not found",
  "code": "USER_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/123"
}
```

### Service-Level Errors

```typescript
throw new NotFoundException({
  message: `User with ID ${userId} not found`,
  code: 'USER_NOT_FOUND',
});

throw new BadRequestException({
  message: 'Email already in use',
  code: 'EMAIL_DUPLICATE',
});
```

## Response Format

All responses are wrapped by `ResponseInterceptor`:

```json
{
  "statusCode": 200,
  "isSuccess": true,
  "data": { ... },
  "pagination": {
    "totalPage": 5,
    "total": 50,
    "pageSize": 10,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "nextCursor": "eyJpZCI6IjAxQVJaM05ERUtTV"
  }
}
```

## Testing

### Test Structure

Tests are located in `__tests__/` directories within each module:

```typescript
// modules/user/__tests__/user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    userName: 'testuser',
    email: 'test@example.com',
    role: UserRoles.USER,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('getUsersAsync', () => {
    it('should return paginated users', async () => {
      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.getUsersAsync({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data[0].userName).toBe('testuser');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
cd apps/server && pnpm test

# Run tests with coverage
cd apps/server && pnpm test:cov

# Run specific test file
cd apps/server && pnpm test -- user.service.spec.ts

# Run in watch mode
cd apps/server && pnpm test:watch
```

## Common Patterns

### Soft Delete

Entities support soft delete via `@DeleteDateColumn`. TypeORM automatically excludes soft-deleted records.

```typescript
// Query with soft-deleted
await repository.find({ where: { id }, withDeleted: true });

// Find only soft-deleted
await repository.find({ where: { deletedAt: Not(IsNull()) } });
```

### Password Handling

Passwords are hashed with bcrypt and excluded from default queries:

```typescript
@Entity(Tables.User)
export class User extends AbstractEntity {
  @Column({ select: false })
  hashedPassword: string;
}

// Explicitly select password when needed
await repository.findOne({ where: { id }, select: ['hashedPassword'] });
```

### Enum Usage

```typescript
// Global enums (src/enums/)
export enum Tables {
  User = 'users',
  FileUpload = 'file_uploads',
}

// Module enums
export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
  ORGANIZATION = 'organization',
}
```

## API Documentation

Swagger documentation is available at `/api/docs` when the server is running.

### Swagger Decorators

```typescript
@ApiTags('Users')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get user by ID' })
@ApiResponse({ status: 200, description: 'User found' })
@ApiResponse({ status: 404, description: 'User not found' })
@Get(':id')
async getUser(@Param('id') id: string) {}
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=bwl

# JWT
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Redis (for queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user
MAIL_PASSWORD=password
```

## Commands

```bash
# Development
cd apps/server && pnpm start:dev

# Build
cd apps/server && pnpm build

# Production
cd apps/server && pnpm start:prod

# Lint
cd apps/server && pnpm lint

# Type check
cd apps/server && pnpm typecheck

# Migrations
cd apps/server && pnpm migration:generate src/migrations/AddUsers
cd apps/server && pnpm migration:run
cd apps/server && pnpm migration:revert
```

## Module Dependencies

```
AppModule
├── ConfigAppModule (configuration)
├── DatabaseModule (TypeORM)
├── SharedModule (common utilities)
├── PassportModule (authentication)
├── CommonModule (common features)
├── AuthModule (authentication)
├── UserModule (user management)
├── MailModule (email)
├── CronjobModule (scheduled tasks)
└── QueueModule (job queues)
```
