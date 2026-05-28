import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MezonWebViewDto {
  @ApiProperty({
    description:
      'Raw initData string from Mezon WebView (window.Mezon.WebView.initParams["data"]). ' +
      'This is the Base64-encoded, query-string-formatted payload injected by Mezon.',
    example: 'dXNlcl9pZD0xMjMmdXNlcm5hbWU9am9obiZoYXNoPWFiY2Rl',
  })
  @IsNotEmpty()
  @IsString()
  hashData: string;
}
