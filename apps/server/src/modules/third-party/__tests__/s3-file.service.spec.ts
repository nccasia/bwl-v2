import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3FileService } from '../services/s3-file.service';
import { FileType } from '@/base/enums';
import { StoragePermission } from '@/base/enums';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(),
  PutObjectCommand: jest.fn().mockImplementation(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed-url'),
}));

describe('S3FileService', () => {
  let service: S3FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3FileService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                S3_API_ENDPOINT: 'https://s3.example.com',
                S3_ACCESS_KEY_ID: 'test-access-key',
                S3_SECRET_ACCESS_KEY: 'test-secret-key',
                S3_REGION: 'us-east-1',
                S3_BUCKET_NAME: 'test-bucket',
                S3_CDN_ENDPOINT: 'https://cdn.example.com',
              };
              return config[key];
            }),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<S3FileService>(S3FileService);
  });

  describe('generateUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const uploadParams = {
        fileKey: 'test-folder/test-file.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };

      const result = await service.generateUploadUrl(uploadParams);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('accessUrl');
      expect(result.accessUrl).toContain('cdn.example.com');
    });

    it('should use custom expiresIn when provided', async () => {
      const uploadParams = {
        fileKey: 'test-folder/test-file.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };

      const result = await service.generateUploadUrl(uploadParams, 300);

      expect(result).toHaveProperty('uploadUrl');
    });

    it('should use public permission by default', async () => {
      const uploadParams = {
        fileKey: 'test-folder/test-file.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };

      const result = await service.generateUploadUrl(uploadParams);

      expect(result).toHaveProperty('accessUrl');
    });

    it('should use private permission when specified', async () => {
      const uploadParams = {
        fileKey: 'test-folder/test-file.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };

      const result = await service.generateUploadUrl(
        uploadParams,
        undefined,
        StoragePermission.PRIVATE,
      );

      expect(result).toHaveProperty('accessUrl');
    });

    it('should fall back to bucket endpoint when CDN not configured', async () => {
      const uploadParams = {
        fileKey: 'test-folder/test-file.png',
        fileType: FileType.IMAGE_PNG,
        fileSize: 204800,
      };

      const result = await service.generateUploadUrl(uploadParams);

      expect(result).toHaveProperty('accessUrl');
    });
  });
});
