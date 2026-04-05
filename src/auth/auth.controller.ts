import { Body, Controller, Post, Res, UseGuards, Req } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify_otp.dto';
import type { Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh_token.guard';
import { JwtConstants } from './contants';
import { User } from 'src/user/entities/user.entity';

/**
 * @class AuthController
 * Entry points for all authentication-related requests.
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @method login
   * @param {LoginDto} credentials - Phone number
   * @description Public endpoint to request an OTP code for login.
   */
  @Post('login')
  @Public()
  async login(@Body() credentials: LoginDto) {
    const response = await this.authService.login(credentials);
    return {
      success: response,
      message: `otp code sent to +225${credentials.phone_number}`,
    };
  }

  /**
   * @method signup
   * @param {SignupDto} data - User information
   * @description Public endpoint to register a new user and request an OTP.
   */
  @Post('signup')
  @Public()
  async signup(@Body() data: SignupDto) {
    const response = await this.authService.signup(data);
    return {
      success: response,
      message: `otp code sent to +225${data.phone_number}`,
    };
  }

  /**
   * @method verifyOtp
   * @param {VerifyOtpDto} data - The OTP code
   * @param {Response} res - Express response for cookie setting
   * @description Public endpoint to verify an OTP and start a session.
   */
  @Post('verify-otp')
  @Public()
  async verifyOtp(
    @Body() data: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(data.otp);

    // Set refresh token in secure HTTP-only cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JwtConstants.refreshTokenCookieExpiration(),
    });

    return {
      access_token: result.access_token,
      expires_at: result.expires_at,
    };
  }

  /**
   * @method refresh
   * @param {Request} req - The request containing the refresh token
   * @param {Response} res - Express response for cookie rotation
   * @description Protected endpoint to renew an expired access token using a refresh token.
   */
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshToken(req.refreshToken);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JwtConstants.refreshTokenCookieExpiration(),
    });

    return {
      access_token: result.access_token,
      expires_at: result.expires_at,
    };
  }

  /**
   * @method logout
   * @param {Request} req - The request containing the authenticated user
   * @param {Response} res - Express response to clear the cookie
   * @description Protected endpoint to revoke a session and clear cookies.
   */
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user as User);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
