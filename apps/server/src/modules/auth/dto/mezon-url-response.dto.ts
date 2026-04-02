import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MezonUrlResponseDto {
  @ApiProperty({ description: 'The Mezon OAuth2 login redirect URL' })
  @Expose()
  url: string;
}
