import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MezonLoginDto {
  @ApiProperty({
    description: 'OAuth2 Authorization Code from Mezon redirect',
    example: 'abc123xyz...',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
