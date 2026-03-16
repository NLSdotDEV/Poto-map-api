import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './contants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JwtConstants.secret,
      signOptions: { expiresIn: '10h' },
    }),
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
