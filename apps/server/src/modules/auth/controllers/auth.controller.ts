import { LOGOUT } from '@base/decorators/auth.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CredentialLoginDto, ForgetPasswordDto, MezonLoginDto, MezonWebViewLoginDto } from '../dto';
import { AuthService, MezonAuthService } from '../services';
import { AuthorizedContext, ResponseToken } from '../types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mezonAuthService: MezonAuthService,
  ) {}

  @ApiResponseType(ResponseToken)
  @ApiOperation({ summary: 'Login with credentials (email + password)' })
  @Post('credential-login')
  async credentialLoginAsync(@Body() authDto: CredentialLoginDto) {
    return await this.authService.credentialLoginAsync(authDto);
  }


  @ApiResponseType(ResponseToken)
  @ApiOperation({
    summary: 'Login with Mezon Authorization Code',
    description: 'Exchange an OAuth2 authorization code for a BWL access token. Auto-registers new users.',
  })
  @Post('mezon-login')
  async mezonLoginAsync(@Body() dto: MezonLoginDto) {
    return await this.mezonAuthService.mezonLoginAsync(dto);
  }

  @ApiResponseType(ResponseToken)
  @ApiOperation({
    summary: 'Login via Mezon WebView (init data)',
    description:
      'Authenticate using the base64-encoded Mezon WebView init data string ' +
      '(from #data= URL hash param). Parses user identity, auto-registers new users, returns a token.',
  })
  @Post('mezon-webview-login')
  async mezonWebViewLoginAsync(@Body() dto: MezonWebViewLoginDto) {
    return await this.mezonAuthService.mezonWebViewLoginAsync(dto);
  }

  @ApiOperation({ summary: 'Send forget password email' })
  @Post('forget-password')
  async forgetPasswordAsync(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgetPasswordAsync(forgetPasswordDto);
  }

  @ApiOperation({ summary: 'Logout user and revoke access token' })
  @LOGOUT()
  @Post('logout')
  async logoutAsync(@UserRequest() context: AuthorizedContext) {
    return await this.authService.logoutAsync(context);
  }
}
