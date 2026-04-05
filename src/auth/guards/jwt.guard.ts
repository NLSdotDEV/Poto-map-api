import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtConstants } from '../contants';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private getToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') return token;

    return request?.cookies['access_token'];
  }
}
