import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() credentials: LoginDTO) {
    const response = await this.authService.login({
      email: credentials.email,
      password: credentials.password,
      phone: credentials.phone
    });

    return {
      success: true,
      message: 'login successfully',
      data: response,
    };
  }

  @Post('signup')
  @HttpCode(200)
  async signUp(@Body() data: SignupDTO) {
    const response = await this.authService.signUp({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country: data.country,
      countryCode: data.countryCode,
      phone: data.phone,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation,
    });

    return {
      success: true,
      message: 'signed up successfully',
      data: response,
    };
  }
}
