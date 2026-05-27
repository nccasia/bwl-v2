import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MezonWebViewLoginDto {
  @ApiProperty({
    description:
      'Base64-encoded Mezon WebView init data string (from #data= URL hash param)',
    example: 'dXNlcl9pZD0xMjMmdXNlcm5hbWU9am9obg==',
  })
  @IsNotEmpty()
  @IsString()
  hashData: string;
}
