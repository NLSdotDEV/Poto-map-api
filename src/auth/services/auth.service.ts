import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginDto } from '../dto/login.dto';
import { SignupDto } from '../dto/signup.dto';
import { UserService } from 'src/user/services/user.service';
import { Role } from 'src/user/enums/user.role.enum';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OtpRequested } from '../interfaces/otp_requested.interface';
import { OtpService } from 'src/otp/services/otp.service';
import { JwtConstants } from '../contants';
import { AuthResponse } from '../interfaces/auth_response.interface';
import * as bcrypt from 'bcrypt';

/**
 * @class AuthService
 * Orchestrates the authentication lifecycle: login, signup, OTP verification, and session management.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private event: EventEmitter2,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  /**
   * @method login
   * @param {LoginDto} data - User phone number
   * @returns {Promise<boolean>} True if OTP was requested
   * @description Validates user existence and triggers OTP delivery.
   */
  async login(data: LoginDto) {
    const user = await this.userService.getUserByPhone(data.phone_number);
    const results = await this.event.emitAsync('login:requested', {
      ...user,
    } as OtpRequested);

    return results.length > 0;
  }

  /**
   * @method signup
   * @param {SignupDto} data - New user information
   * @returns {Promise<boolean>} True if user was created and OTP requested
   * @description Creates a new user and triggers the initial OTP delivery.
   */
  async signup(data: SignupDto) {
    const user = await this.userService.createUser({
      first_name: data.first_name ?? null,
      last_name: data.last_name,
      phone_number: data.phone_number,
      role: Role.USER,
    });

    const results = await this.event.emitAsync('signup:requested', {
      ...user,
    } as OtpRequested);

    return results.length > 0;
  }

  /**
   * @method verifyOtp
   * @param {string} otp - The code provided by the user
   * @returns {Promise<AuthResponse>} The JWT session tokens
   * @description Finalizes authentication by validating the OTP and issuing tokens.
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
    const user = await this.otpService.validateOtp(phoneNumber, otp);
    return this.generateTokens(user);
  }

  /**
   * @method refreshToken
   * @param {string} refreshToken - The current refresh token from the cookie
   * @returns {Promise<AuthResponse>} A new pair of session tokens
   * @description Validates the refresh token against the database hash and rotates the session.
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: JwtConstants.refreshSecret,
      });

      // Special fetch to select the hidden refresh_token field
      const user = await this.userService.findWithRefreshToken(payload.sub);
      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('Session revoked');
      }

      // Security comparison against hashed value
      const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid session');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException(
        e instanceof UnauthorizedException ? e.message : 'Session expired',
      );
    }
  }

  /**
   * @method logout
   * @param {string} userId - The id of the currently authenticated user
   * @description Revokes the session by clearing the refresh token from the database.
   */
  async logout(userId: string) {
    await this.userService.clearRefreshToken(userId);
  }

  /**
   * @method generateTokens
   * @private
   * @param {User} user - The user to generate tokens for
   * @returns {Promise<AuthResponse>} The generated access and refresh tokens
   * @description Generates and persists a new set of JWTs for a user.
   */
  private async generateTokens(user: User): Promise<AuthResponse> {
    const payload = { sub: user.id, phone: user.phone_number, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: JwtConstants.accessSecret,
        expiresIn: JwtConstants.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: JwtConstants.refreshSecret,
        expiresIn: JwtConstants.refreshTokenExpiresIn,
      }),
    ]);

    // Persist hashed refresh token for revocation support
    await this.userService.updateUser(user.id, {
      refresh_token: refreshToken,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + JwtConstants.accessTokenCookieExpiration(),
    };
  }
}
