import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './services/auth.service';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [JwtModule.register({ global: true }), UserModule, OtpModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    AuthService,
  ],
})
export class AuthModule {}
