import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtConstants } from '../contants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * @method canActivate
   * @param {ExecutionContext} context - Standard NestJS context
   * @returns {Promise<boolean>} True if the refresh token is valid
   * @throws {UnauthorizedException} If the token is missing or invalid
   * @description Validates the refresh token from cookies or authorization header.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: JwtConstants.refreshSecret,
      });
      request['user'] = payload;
      request['refreshToken'] = refreshToken;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return true;
  }

  /**
   * @method extractRefreshToken
   * @private
   * @param {Request} request - The Express request object
   * @returns {string | null} The token or null
   */
  private extractRefreshToken(request: Request): string | null {
    // Check Cookies first (preferred)
    if (request.cookies && request.cookies['refresh_token']) {
      return request.cookies['refresh_token'];
    }

    // Check Authorization header for mobile/others
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Refresh' ? token : null;
  }
}
