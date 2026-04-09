import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities';
import { BaseCommentService } from '../service/base-comment.service';

describe('BaseCommentService', () => {
  let service: BaseCommentService;
  let commentRepository: jest.Mocked<Repository<Comment>>;

  const mockComment: Partial<Comment> = {
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
      providers: [
        BaseCommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BaseCommentService>(BaseCommentService);
    commentRepository = module.get(getRepositoryToken(Comment));
  });

  describe('findCommentByIdAsync', () => {
    it('should return comment when found', async () => {
      commentRepository.findOne.mockResolvedValue(mockComment as Comment);

      const result = await service.findCommentByIdAsync('comment-uuid-1');

      expect(result).toEqual(mockComment);
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'comment-uuid-1' },
      });
    });

    it('should throw NotFoundException when comment not found', async () => {
      commentRepository.findOne.mockResolvedValue(null);

      await expect(service.findCommentByIdAsync('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
