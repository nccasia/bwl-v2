import {
  ApiResponseType,
  Auth
} from '@base/decorators';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileUploadResponseDto, UploadAuthorImageDto, UploadAuthorDocumentDto, UploadAvatarDto, UploadPostImageDto } from '../dto';
import { FileUploadService } from '../services';

@ApiTags('File Uploads')
@Auth()
@Controller('uploads')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) { }

  @Post('profile-image')
  @ApiOperation({ summary: 'Upload user profile image' })
  @ApiResponseType(FileUploadResponseDto)
  async uploadProfileImage(
    @Body() fileMetadata: UploadAvatarDto
  ) {
    return this.fileUploadService.generateUploadAvatarUrl(fileMetadata);
  }

  @Post('author-image')
  @ApiOperation({ summary: 'Upload author image' })
  @ApiResponseType(FileUploadResponseDto)
  async uploadAuthorImage(
    @Body() fileMetadata: UploadAuthorImageDto
  ) {
    return this.fileUploadService.generateUploadAuthorUrl(fileMetadata);
  }

  @Post('author-document')
  @ApiOperation({ summary: 'Upload author document' })
  @ApiResponseType(FileUploadResponseDto)
  async uploadAuthorDocument(
    @Body() fileMetadata: UploadAuthorDocumentDto
  ) {
    return this.fileUploadService.generateUploadAuthorDocsUrl(fileMetadata);
  }

  @Post('post-image')
  @ApiOperation({ summary: 'Upload post image' })
  @ApiResponseType(FileUploadResponseDto)
  async uploadPostImage(
    @Body() fileMetadata: UploadPostImageDto
  ) {
    return this.fileUploadService.generateUploadPostImageUrl(fileMetadata);
  }
}
