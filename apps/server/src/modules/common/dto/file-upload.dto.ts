import { FileType, FileTypeSize } from "@/base/enums";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsString, Max } from "class-validator";

class BaseUploadImageDto {
  @ApiProperty({ description: 'The name of the file to be uploaded', example: 'photo.png' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fileName: string;

  @ApiProperty({ description: 'The MIME type of the file', example: FileType.IMAGE_PNG })
  @IsNotEmpty()
  @IsIn([FileType.IMAGE_JPEG, FileType.IMAGE_JPG, FileType.IMAGE_PNG, FileType.IMAGE_WEBP], {
    message: 'fileType must be a valid image type (jpeg, jpg, png, webp)',
  })
  fileType: FileType;

  @ApiProperty({ description: 'The size of the file in bytes', example: 204800 })
  @IsNotEmpty()
  @IsNumber()
  @Max(FileTypeSize.MAX_IMAGE_SIZE)
  fileSize: number;
}

export class UploadAvatarDto extends BaseUploadImageDto { }
export class UploadAuthorImageDto extends BaseUploadImageDto { }
export class UploadPostImageDto extends BaseUploadImageDto { }

export class UploadAuthorDocumentDto {
  @ApiProperty({ description: 'The name of the file to be uploaded', example: 'document.pdf' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  fileName: string;

  @ApiProperty({ description: 'The MIME type of the file', example: FileType.PDF })
  @IsNotEmpty()
  @IsIn([FileType.IMAGE_JPEG, FileType.IMAGE_JPG, FileType.IMAGE_PNG, FileType.IMAGE_WEBP, FileType.PDF], {
    message: 'fileType must be a valid document or image type',
  })
  fileType: FileType;

  @ApiProperty({ description: 'The size of the file in bytes', example: 5242880 })
  @IsNotEmpty()
  @IsNumber()
  @Max(FileTypeSize.MAX_DOCUMENT_SIZE)
  fileSize: number;
}


export class FileUploadResponseDto {
  @ApiProperty({
    description: 'The URL to upload the file',
    example: 'https://s3.amazonaws.com/bucket-name/upload-url',
  })
  @IsNotEmpty()
  @IsString()
  uploadUrl: string;

  @ApiProperty({
    description: 'The URL to access the uploaded file',
    example: 'https://s3.amazonaws.com/bucket-name/access-url',
  })
  @IsNotEmpty()
  @IsString()
  accessUrl: string;
}