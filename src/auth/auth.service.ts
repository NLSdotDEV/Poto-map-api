import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtConstants } from './contants';
import { UserRole } from 'src/enum/user_role_enum';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async login(credentials: {
    email?: string;
    password: string;
    phone?: string;
  }) {
    const { email, password, phone } = credentials;

    const searchConditions: FindOptionsWhere<User>[] = [];
    if (email) searchConditions.push({ email });
    if (phone) searchConditions.push({ phone });

    if (searchConditions.length === 0) {
      throw new BadRequestException('Please provide email or phone');
    }

    const user = await User.findOne({
      where: searchConditions, // TypeORM interprets an array as OR
      select: [
        'id',
        'username',
        'firstName',
        'lastName',
        'phone',
        'email',
        'password',
        'createdAt',
        'role',
        'country',
        'countryCode'
      ],
    });

    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    const userPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      countryCode: user.countryCode,
      phone: user.phone,
      role: user.role,
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

  async otpLogin(credentials: { phone: string }) {
    const userRepisotory = User;

    const user = await userRepisotory.findOne({
      where: { phone: credentials.phone },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // TODO: send otp password to login the client
    // create table to store otp related to the user

    return;
  }

  async signUp(data: {
    username?: string | null;
    firstName?: string | null;
    lastName: string;
    email?: string | null;
    password: string;
    passwordConfirmation: string;
    country: string;
    countryCode: string;
    phone: string;
  }) {
    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException('password confirmation does not match');
    }

    const userRepisotory = User;

    // check if user exits
    const userExists = await userRepisotory.findOne({
      where: [
        { email: data.email ?? undefined },
        { username: data.username ?? undefined },
        { phone: data.phone },
      ],
    });

    if (userExists) {
      throw new UnauthorizedException('username, email, or phone already use');
    }

    // create bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(data.password, salt);

    const username = data.username ?? Date.now().toString(32);

    // create new user
    const user = new User();
    user.firstName = data.firstName ?? null;
    user.lastName = data.lastName;
    user.email = data.email ?? null;
    user.password = password;
    user.countryCode = data.countryCode;
    user.country = data.country;
    user.phone = data.phone;
    user.role = UserRole.USER;
    await user.save();

    const userPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      countryCode: user.countryCode,
      phone: user.phone,
      role: user.role,
      joinedAt: user.createdAt,
    };

    const jwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: JwtConstants.secret,
    });

    return {
      user: userPayload,
      accessToken,
    };
  }
}
