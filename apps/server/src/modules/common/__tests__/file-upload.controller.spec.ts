import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from '../controllers/file-upload.controller';
import { FileUploadService } from '../services/file-upload.service';
import { FileType } from '@/base/enums';
import { UploadAvatarDto } from '../dto';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let service: jest.Mocked<FileUploadService>;

  const mockPresignedData = {
    uploadUrl: 'https://s3.example.com/upload-url',
    accessUrl: 'https://cdn.example.com/file-key',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: {
            generateUploadAvatarUrl: jest.fn(),
            generateUploadAuthorUrl: jest.fn(),
            generateUploadAuthorDocsUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
    service = module.get(FileUploadService);
  });

  describe('uploadProfileImage', () => {
    it('should generate profile image upload URL', async () => {
      const fileMetadata: UploadAvatarDto = {
        fileName: 'avatar.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };
      service.generateUploadAvatarUrl.mockResolvedValue(mockPresignedData);

      const result = await controller.uploadProfileImage(fileMetadata);

      expect(result).toEqual(mockPresignedData);
      expect(service.generateUploadAvatarUrl).toHaveBeenCalledWith(fileMetadata);
    });
  });

  describe('uploadAuthorImage', () => {
    it('should generate author image upload URL', async () => {
      const fileMetadata: UploadAvatarDto = {
        fileName: 'author.jpg',
        fileType: FileType.IMAGE_JPEG,
        fileSize: 102400,
      };
      service.generateUploadAuthorUrl.mockResolvedValue(mockPresignedData);

      const result = await controller.uploadAuthorImage(fileMetadata);

      expect(result).toEqual(mockPresignedData);
      expect(service.generateUploadAuthorUrl).toHaveBeenCalledWith(fileMetadata);
    });
  });

  describe('uploadAuthorDocument', () => {
    it('should generate author document upload URL', async () => {
      const fileMetadata: UploadAvatarDto = {
        fileName: 'document.pdf',
        fileType: FileType.PDF,
        fileSize: 512000,
      };
      service.generateUploadAuthorDocsUrl.mockResolvedValue(mockPresignedData);

      const result = await controller.uploadAuthorDocument(fileMetadata);

      expect(result).toEqual(mockPresignedData);
      expect(service.generateUploadAuthorDocsUrl).toHaveBeenCalledWith(
        fileMetadata,
      );
    });
  });
});
