import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../controllers/comment.controller';
import { BaseCommentDto, CreateCommentDto, UpdateCommentDto } from '../dto';
import { CommentService } from '../service';

describe('CommentController', () => {
  let controller: CommentController;
  let service: jest.Mocked<CommentService>;

  const mockUser = { userId: 'user-uuid-1', role: 'admin' } as any;

  const mockCommentDto: Partial<BaseCommentDto> = {
    id: 'comment-uuid-1',
    postId: 'post-uuid-1',
    authorId: 'user-uuid-1',
    content: 'Hello world',
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            getCommentsByPostAsync: jest.fn(),
            getRepliesByCommentAsync: jest.fn(),
            createCommentAsync: jest.fn(),
            updateCommentAsync: jest.fn(),
            deleteCommentAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get(CommentService);
  });

  describe('getByPost', () => {
    it('should return paginated comments for a post', async () => {
      const expectedResult = { data: [mockCommentDto], pagination: { limit: 10, hasNextPage: false, nextCursor: undefined } };
      service.getCommentsByPostAsync.mockResolvedValue(expectedResult as never);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;
      queryOptions.filters = {};

      const result = await controller.getByPost('post-uuid-1', queryOptions);

      expect(result).toEqual(expectedResult);
      expect(service.getCommentsByPostAsync).toHaveBeenCalledWith('post-uuid-1', queryOptions);
    });
  });

  describe('getReplies', () => {
    it('should return replies for a comment', async () => {
      const expectedResult = { data: [mockCommentDto], pagination: { limit: 10, hasNextPage: false, nextCursor: undefined } };
      service.getRepliesByCommentAsync.mockResolvedValue(expectedResult as never);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;
      queryOptions.filters = {};

      const result = await controller.getReplies('comment-uuid-1', queryOptions);

      expect(result).toEqual(expectedResult);
      expect(service.getRepliesByCommentAsync).toHaveBeenCalledWith('comment-uuid-1', queryOptions);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const dto = new CreateCommentDto();
      dto.postId = 'post-uuid-1';
      dto.content = 'Hello world';

      const commentDto = new BaseCommentDto();
      Object.assign(commentDto, mockCommentDto);
      service.createCommentAsync.mockResolvedValue(commentDto);

      const result = await controller.createComment(mockUser, dto);

      expect(result).toEqual(commentDto);
      expect(service.createCommentAsync).toHaveBeenCalledWith('user-uuid-1', dto);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const dto = new UpdateCommentDto();
      dto.content = 'Updated content';

      const updatedDto = new BaseCommentDto();
      Object.assign(updatedDto, { ...mockCommentDto, content: 'Updated content', isEdited: true });
      service.updateCommentAsync.mockResolvedValue(updatedDto);

      const result = await controller.updateComment('comment-uuid-1', mockUser, dto);

      expect(result.isEdited).toBe(true);
      expect(service.updateCommentAsync).toHaveBeenCalledWith('comment-uuid-1', 'user-uuid-1', dto);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      service.deleteCommentAsync.mockResolvedValue({ commentId: 'comment-uuid-1' });

      const result = await controller.deleteComment('comment-uuid-1', mockUser);

      expect(result).toEqual({ commentId: 'comment-uuid-1' });
      expect(service.deleteCommentAsync).toHaveBeenCalledWith('comment-uuid-1', 'user-uuid-1');
    });
  });
});
