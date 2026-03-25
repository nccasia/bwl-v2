import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileUploadService } from '../services/file-upload.service';
import { S3FileService } from '@/modules/third-party/services';
import { FileType } from '@/base/enums';
import { UploadAvatarDto, UploadAuthorImageDto, UploadAuthorDocumentDto } from '../dto';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let s3FileService: jest.Mocked<S3FileService>;

  const mockPresignedData = {
    uploadUrl: 'https://s3.example.com/upload-url',
    accessUrl: 'https://cdn.example.com/file-key',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: S3FileService,
          useValue: {
            generateUploadUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    s3FileService = module.get(S3FileService);
  });

  describe('generateUploadAvatarUrl', () => {
    const avatarDto: UploadAvatarDto = {
      fileName: 'avatar.png',
      fileType: FileType.IMAGE_PNG,
      fileSize: 204800,
    };

    it('should generate avatar upload URL successfully', async () => {
      s3FileService.generateUploadUrl.mockResolvedValue(mockPresignedData);

      const result = await service.generateUploadAvatarUrl(avatarDto);

      expect(result).toEqual(mockPresignedData);
      expect(s3FileService.generateUploadUrl).toHaveBeenCalledWith({
        fileKey: expect.stringContaining('user-avatars/'),
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      });
    });

    it('should throw BadRequestException when S3 upload fails', async () => {
      s3FileService.generateUploadUrl.mockRejectedValue(new Error('S3 error'));

      await expect(service.generateUploadAvatarUrl(avatarDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateUploadAuthorUrl', () => {
    const authorImageDto: UploadAuthorImageDto = {
      fileName: 'author.jpg',
      fileType: FileType.IMAGE_JPEG,
      fileSize: 102400,
    };

    it('should generate author image upload URL successfully', async () => {
      s3FileService.generateUploadUrl.mockResolvedValue(mockPresignedData);

      const result = await service.generateUploadAuthorUrl(authorImageDto);

      expect(result).toEqual(mockPresignedData);
      expect(s3FileService.generateUploadUrl).toHaveBeenCalledWith({
        fileKey: expect.stringContaining('author-images/'),
        fileType: FileType.IMAGE_JPEG,
        fileSize: 102400,
      });
    });

    it('should throw BadRequestException when S3 upload fails', async () => {
      s3FileService.generateUploadUrl.mockRejectedValue(new Error('S3 error'));

      await expect(
        service.generateUploadAuthorUrl(authorImageDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateUploadAuthorDocsUrl', () => {
    const authorDocDto: UploadAuthorDocumentDto = {
      fileName: 'document.pdf',
      fileType: FileType.PDF,
      fileSize: 512000,
    };

    it('should generate author document upload URL successfully', async () => {
      s3FileService.generateUploadUrl.mockResolvedValue(mockPresignedData);

      const result = await service.generateUploadAuthorDocsUrl(authorDocDto);

      expect(result).toEqual(mockPresignedData);
      expect(s3FileService.generateUploadUrl).toHaveBeenCalledWith({
        fileKey: expect.stringContaining('author-documents/'),
        fileType: FileType.PDF,
        fileSize: 512000,
      });
    });

    it('should throw BadRequestException when S3 upload fails', async () => {
      s3FileService.generateUploadUrl.mockRejectedValue(new Error('S3 error'));

      await expect(
        service.generateUploadAuthorDocsUrl(authorDocDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
