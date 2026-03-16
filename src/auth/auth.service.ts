import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtConstants } from './contants';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async login(credentials: { email: string; password: string }) {
    const email = credentials.email;
    const password = credentials.password;

    const userRepisotory = User;
    const user = await userRepisotory.findOne({
      where: { email },
      select: [
        'firstName',
        'lastName',
        'email',
        'password',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const userPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      joinedAt: user.createdAt,
    };

    const jwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: JwtConstants.secret,
    });

    return {
      user: userPayload,
      accessToken,
    };
  }

  
}
