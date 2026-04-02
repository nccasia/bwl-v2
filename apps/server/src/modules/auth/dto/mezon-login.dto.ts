import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MezonLoginDto {
  @ApiProperty({
    description: 'OAuth2 ID Token obtained from Mezon (via FE code exchange)',
    example: 'eyJhbGciOiJIUzI1NiIsIn...',
  })
  @IsNotEmpty()
  @IsString()
  id_token: string;
}
