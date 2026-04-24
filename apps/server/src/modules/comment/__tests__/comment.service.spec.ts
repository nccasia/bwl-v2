import { IsNull } from 'typeorm';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '@modules/notification/service';
import { NotificationGateway } from '@modules/notification/gateway';
import { Post } from '@modules/post/entities';
import { CreateCommentDto, UpdateCommentDto } from '../dto';
import { Comment } from '../entities';
import { CommentService } from '../service/comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: jest.Mocked<Repository<Comment>>;

  const mockComment: Comment = {
    id: 'comment-uuid-1',
    postId: 'post-uuid-1',
    authorId: 'user-uuid-1',
    parentId: undefined,
    content: 'Hello world',
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as Comment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            findOne: jest.fn(),
            increment: jest.fn().mockResolvedValue(undefined),
            createQueryBuilder: jest.fn().mockReturnValue({
              update: jest.fn().mockReturnThis(),
              set: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue(undefined),
            }),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createNotificationAsync: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            broadcast: jest.fn(),
            sendToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get(getRepositoryToken(Comment));
  });

  describe('getCommentsByPostAsync', () => {
    it('should return top-level comments for a post', async () => {
      commentRepository.find.mockResolvedValue([mockComment]);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;

      const result = await service.getCommentsByPostAsync('post-uuid-1', queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(commentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            postId: 'post-uuid-1',
            parentId: IsNull(),
          }),
        }),
      );
    });

    it('should return nextCursor when there are more pages', async () => {
      // findAndCount called with limit+1 items → hasNextPage = true
      const manyComments = Array.from({ length: 11 }, (_, i) => ({
        ...mockComment,
        id: `comment-${i}`,
      })) as Comment[];
      commentRepository.find.mockResolvedValue(manyComments);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;

      const result = await service.getCommentsByPostAsync('post-uuid-1', queryOptions);

      expect(result.data).toHaveLength(10);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.nextCursor).toBeDefined();
    });
  });

  describe('getRepliesByCommentAsync', () => {
    it('should return replies for a comment', async () => {
      const replyComment = { ...mockComment, id: 'comment-uuid-2', parentId: 'comment-uuid-1' } as Comment;
      commentRepository.find.mockResolvedValue([replyComment]);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;

      const result = await service.getRepliesByCommentAsync('comment-uuid-1', queryOptions);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(commentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ parentId: 'comment-uuid-1' }),
        }),
      );
    });
  });

  describe('createCommentAsync', () => {
    it('should create a new top-level comment', async () => {
      const dto = new CreateCommentDto();
      dto.postId = 'post-uuid-1';
      dto.content = 'Hello world';

      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockResolvedValue(mockComment);

      const result = await service.createCommentAsync('user-uuid-1', dto);

      expect(result).toHaveProperty('id');
      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 'user-uuid-1', postId: 'post-uuid-1' }),
      );
    });

    it('should create a reply comment with parentId', async () => {
      const dto = new CreateCommentDto();
      dto.postId = 'post-uuid-1';
      dto.content = 'Reply!';
      dto.parentId = 'comment-uuid-1';

      const replyComment = { ...mockComment, parentId: 'comment-uuid-1' } as Comment;
      commentRepository.create.mockReturnValue(replyComment);
      commentRepository.save.mockResolvedValue(replyComment);

      const result = await service.createCommentAsync('user-uuid-1', dto);

      expect(result).toHaveProperty('parentId', 'comment-uuid-1');
    });
  });

  describe('updateCommentAsync', () => {
    it('should update comment content and set isEdited to true', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.save.mockResolvedValue({ ...mockComment, content: 'Updated', isEdited: true } as Comment);

      const dto = new UpdateCommentDto();
      dto.content = 'Updated';

      const result = await service.updateCommentAsync('comment-uuid-1', 'user-uuid-1', dto);

      expect(result.isEdited).toBe(true);
      expect(commentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Updated', isEdited: true }),
      );
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment);

      const dto = new UpdateCommentDto();
      dto.content = 'Unauthorized update';

      await expect(
        service.updateCommentAsync('comment-uuid-1', 'other-user-id', dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteCommentAsync', () => {
    it('should soft delete a comment', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment);
      commentRepository.softRemove.mockResolvedValue(mockComment);

      const result = await service.deleteCommentAsync('comment-uuid-1', 'user-uuid-1');

      expect(result).toEqual({ commentId: 'comment-uuid-1' });
      expect(commentRepository.softRemove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment);

      await expect(
        service.deleteCommentAsync('comment-uuid-1', 'hacker-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
