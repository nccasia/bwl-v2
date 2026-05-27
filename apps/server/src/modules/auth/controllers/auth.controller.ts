import { LOGOUT } from '@base/decorators/auth.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CredentialLoginDto, ForgetPasswordDto, MezonLoginDto, MezonWebViewDto } from '../dto';
import { AuthService, MezonAuthService, MezonWebViewAuthService } from '../services';
import { AuthorizedContext, ResponseToken } from '../types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mezonAuthService: MezonAuthService,
    private readonly mezonWebViewAuthService: MezonWebViewAuthService,
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
    summary: 'Login via Mezon WebView initData',
    description:
      'Authenticate using the initData injected by the Mezon WebView (window.Mezon.WebView.initParams["data"]). ' +
      'Validates the HMAC signature server-side and returns a BWL access token. Auto-registers new users.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('mezon-webview')
  async mezonWebViewLoginAsync(@Body() dto: MezonWebViewDto) {
    return await this.mezonWebViewAuthService.loginWithWebViewData(dto);
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
