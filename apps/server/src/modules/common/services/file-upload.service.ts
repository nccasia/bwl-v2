import { BucketFolders } from '@/enums';
import { S3FileService } from '@/modules/third-party/services';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import slug from 'slug';
import { CommonErrorCode } from '../constants';
import { splitFileName } from '@/utils';
import {
  FileUploadResponseDto,
  UploadAuthorImageDto,
  UploadAvatarDto,
  UploadPostImageDto
} from '../dto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  constructor(
    private readonly s3FileService: S3FileService,
  ) { }

  async generateUploadAvatarUrl(fileMetadata: UploadAvatarDto): Promise<FileUploadResponseDto> {
    const { fileName, fileType, fileSize } = fileMetadata;
    const { originalName, fileExt } = splitFileName(fileName);
    const fileKey = `${BucketFolders.USER_AVATARS}/${slug(originalName)}-${Date.now()}.${fileExt}`;
    const presignedData = await this.s3FileService.generateUploadUrl({
      fileKey,
      fileType,
      fileSize
    }).catch((e) => {
      this.logger.error('Failed to generate upload URL: ', e);
      throw new BadRequestException({
        message: 'Failed to generate upload URL',
        code: CommonErrorCode.UPLOAD_FAILED
      })
    });
    return presignedData;
  }

  async generateUploadAuthorUrl(fileMetadata: UploadAuthorImageDto): Promise<FileUploadResponseDto> {
    const { fileName, fileType, fileSize } = fileMetadata;
    const { originalName, fileExt } = splitFileName(fileName);
    const fileKey = `${BucketFolders.AUTHOR_IMAGES}/${slug(originalName)}-${Date.now()}.${fileExt}`;
    const presignedData = await this.s3FileService.generateUploadUrl({
      fileKey,
      fileType,
      fileSize
    }).catch((e) => {
      this.logger.error('Failed to generate upload URL: ', e);
      throw new BadRequestException({
        message: 'Failed to generate upload URL',
        code: CommonErrorCode.UPLOAD_FAILED
      })
    });
    return presignedData;
  }

  async generateUploadPostImageUrl(fileMetadata: UploadPostImageDto): Promise<FileUploadResponseDto> {
    const { fileName, fileType, fileSize } = fileMetadata;
    const { originalName, fileExt } = splitFileName(fileName);
    const fileKey = `${BucketFolders.POST_IMAGES}/${slug(originalName)}-${Date.now()}.${fileExt}`;
    const presignedData = await this.s3FileService.generateUploadUrl({
      fileKey,
      fileType,
      fileSize
    }).catch((e) => {
      this.logger.error('Failed to generate upload URL: ', e);
      throw new BadRequestException({
        message: 'Failed to generate upload URL',
        code: CommonErrorCode.UPLOAD_FAILED
      })
    });
    return presignedData;
  }
}

