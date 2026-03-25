# BWL Server Project Skill

Use this skill when working with the NestJS server in `apps/server/`.

## When to Use

- Creating new modules, controllers, services, entities, or DTOs
- Adding new API endpoints
- Implementing authentication/authorization
- Writing tests for server code
- Following established patterns and conventions

## Quick Start

```bash
# Navigate to server
cd apps/server

# Run tests
pnpm test

# Build
pnpm build

# Run in development
pnpm start:dev
```

## Project Architecture

### Core Patterns

1. **Module Organization**: Each feature is a self-contained module with controllers, services, entities, and DTOs
2. **Base Classes**: `AbstractEntity` for all entities, `Base*Service` for shared operations
3. **Path Aliases**: Use `@/*` for imports (e.g., `@modules/user/entities`)
4. **Soft Delete**: All entities support soft delete via `@DeleteDateColumn`
5. **ULID IDs**: All entity IDs are ULIDs generated via `ulid()`

### Key Files

| File | Purpose |
|------|---------|
| `src/base/entities/base.entity.ts` | AbstractEntity - base for all entities |
| `src/base/dtos/query-options.dto.ts` | Pagination DTOs |
| `src/base/types/base.type.ts` | Response types |
| `src/base/decorators/auth.decorator.ts` | @Auth(), @RBAC() decorators |
| `src/base/decorators/response-swagger.decorator.ts` | @ApiResponseType() |
| `src/base/interceptors/response.interceptor.ts` | ResponseInterceptor |

## Creating a New Module

### 1. Create Module Structure

```
src/modules/your-module/
├── __tests__/
│   └── your-module.service.spec.ts
├── controllers/
│   ├── your-controller.controller.ts
│   └── index.ts
├── dto/
│   ├── base-your-dto.dto.ts
│   ├── create-your-dto.dto.ts
│   ├── update-your-dto.dto.ts
│   └── index.ts
├── entities/
│   ├── your.entity.ts
│   └── index.ts
├── enums/
│   ├── your-enum.enum.ts
│   └── index.ts
├── services/
│   ├── base-your.service.ts
│   ├── your.service.ts
│   └── index.ts
└── your.module.ts
```

### 2. Create Entity

```typescript
// entities/your.entity.ts
@Entity(Tables.YourTable)
export class Your extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ enum: YourEnum })
  type: YourEnum;
}
```

### 3. Create DTOs

```typescript
// dto/base-your.dto.ts
export class BaseYourDto extends PickType(Your, [
  'id', 'name', 'type', 'createdAt'
]) {}

// dto/create-your.dto.ts
export class CreateYourDto extends PickType(Your, [
  'name', 'password', 'type'
]) {}

// dto/update-your.dto.ts
export class UpdateYourDto extends PartialType(BaseYourDto) {}
```

### 4. Create Base Service

```typescript
// services/base-your.service.ts
@Injectable()
export class BaseYourService {
  constructor(
    @InjectRepository(Your)
    private readonly yourRepository: Repository<Your>,
  ) {}

  async findByIdAsync(id: string): Promise<Your> {
    const entity = await this.yourRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException({ message: `Your with ID ${id} not found`, code: 'YOUR_NOT_FOUND' });
    }
    return entity;
  }
}
```

### 5. Create Service

```typescript
// services/your.service.ts
@Injectable()
export class YourService extends BaseYourService {
  constructor(
    @InjectRepository(Your)
    yourRepository: Repository<Your>,
  ) {
    super(yourRepository);
  }

  async getYourAsync(queryOptions: QueryOptionsDto) {
    const { getPagination, skip, take } = new QueryOptionsHelper(queryOptions);
    const [entities, count] = await this.yourRepository.findAndCount({ skip, take });
    const dtos = entities.map(e => plainToInstance(BaseYourDto, e, { excludeExtraneousValues: true }));
    return { data: dtos, pagination: getPagination({ count, total: entities.length }) };
  }

  async createAsync(dto: CreateYourDto) {
    const entity = this.yourRepository.create(dto);
    return plainToInstance(BaseYourDto, await this.yourRepository.save(entity), { excludeExtraneousValues: true });
  }
}
```

### 6. Create Controller

```typescript
// controllers/your.controller.ts
@ApiTags('Your')
@Auth()
@Controller('your')
export class YourController {
  constructor(private readonly yourService: YourService) {}

  @RBAC(YourRoles.ADMIN)
  @ApiOperation({ summary: 'Get all' })
  @ApiQueryOptions()
  @ApiResponseType(BaseYourDto, { isArray: true, hasPagination: true })
  @Get('get-yours')
  async getAll(@QueryOptions() queryOptions: QueryOptionsDto) {
    return this.yourService.getYourAsync(queryOptions);
  }

  @ApiOperation({ summary: 'Create' })
  @ApiResponseType(BaseYourDto)
  @Post('create')
  async create(@Body() dto: CreateYourDto) {
    return this.yourService.createAsync(dto);
  }
}
```

### 7. Create Module

```typescript
// your.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Your]), SharedModule],
  controllers: [YourController],
  providers: [BaseYourService, YourService],
  exports: [BaseYourService, YourService],
})
export class YourModule {}
```

### 8. Register in AppModule

```typescript
// app.module.ts
@Module({
  imports: [
    // ... existing modules
    YourModule,
  ],
})
export class AppModule {}
```

## Adding Tests

### Unit Test Example

```typescript
// __tests__/your.service.spec.ts
describe('YourService', () => {
  let service: YourService;
  let yourRepository: jest.Mocked<Repository<Your>>;

  const mockYour = {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    name: 'Test',
    type: YourEnum.Type,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(Your),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<YourService>(YourService);
    yourRepository = module.get(getRepositoryToken(Your));
  });

  describe('getYourAsync', () => {
    it('should return paginated results', async () => {
      yourRepository.findAndCount.mockResolvedValue([[mockYour], 1]);
      const result = await service.getYourAsync({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
```

## Common Patterns

### Using QueryOptionsHelper

```typescript
const { getPagination, skip, take } = new QueryOptionsHelper(queryOptionsDto);
// Use skip/take in repository query
// Call getPagination with count results
```

### Using CursorQueryOptionsHelper

```typescript
const helper = new CursorQueryOptionsHelper(dto, {
  cursorField: 'createdAt',
  direction: 'DESC',
  acceptFilterFields: ['email', 'userName'],
});
// helper.buildWhereConditions() for where clause
// helper.getCursorLimit() for take
// helper.getCursorOrder() for order
// helper.getCursorPagination(items) for response
```

### Using RBAC

```typescript
@Auth()                    // Requires JWT
@RBAC(UserRoles.ADMIN)     // Requires ADMIN role
@Get('admin-only')
async adminEndpoint() {}
```

### Soft Delete Queries

```typescript
// Include soft-deleted
await repo.find({ where: { id }, withDeleted: true });

// Find only soft-deleted
await repo.find({ where: { deletedAt: Not(IsNull()) } });
```

## File Location Reference

| Type | Location |
|------|----------|
| Base entities | `src/base/entities/` |
| Base DTOs | `src/base/dtos/` |
| Base services | `src/base/services/` |
| Global enums | `src/enums/` |
| Global constants | `src/constants/` |
| Migrations | `src/migrations/` |
| Email templates | `src/templates/` |
| Exception filter | `src/base/filters/` |
| Guards | `src/base/guards/` |
| Interceptors | `src/base/interceptors/` |

## Path Aliases

```typescript
// Use these in imports
import { AbstractEntity } from '@base/entities';
import { QueryOptionsDto } from '@base/dtos';
import { Tables } from '@enums/tables.enum';
import { UserService } from '@modules/user/services';
```
