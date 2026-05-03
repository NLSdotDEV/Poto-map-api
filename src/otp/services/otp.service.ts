import { BadRequestException, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { type OtpRequested } from 'src/auth/interfaces/otp_requested.interface';
import { OtpGeneratorService } from './otp_generator.service';
import { OtpRepository } from '../repositories/otp.repository';
import { UserService } from 'src/user/services/user.service';
import { SmsService } from 'src/sms/services/sms.service';

/**
 * @class OtpService
 * Handles OTP lifecycle: creation, delivery (via SMS), and validation.
 */
@Injectable()
export class OtpService {
  constructor(
    private otpGenerator: OtpGeneratorService,
    private otpRepository: OtpRepository,
    private userService: UserService,
    private smsService: SmsService,
  ) {}

  /**
   * @method sendOtp
   * @private
   * @onEvent login:requested, signup:requested
   * @param {OtpRequested} payload - Data from the event emitter
   * @description Generates a valid OTP and sends it via SMS.
   */
  @OnEvent('login:requested')
  @OnEvent('signup:requested')
  private async sendOtp(payload: OtpRequested) {
    const userId = payload.id;
    const otp = await this.otpGenerator.generateValidOtp(userId);

    const message = `Bonjour ${payload.last_name} votre code de verification à votre app poto map: ${otp}`;
    this.smsService.sendSms(payload.phone_number, message);
  }

  /**
   * @method validateOtp
   * @param {string} otp - The OTP code to validate
   * @returns {Promise<User>} The verified user
   * @throws {BadRequestException} If the OTP is invalid or expired
   * @description Validates an OTP and updates the user's verification state.
   */
  async validateOtp(phoneNumber: string, otp: string) {
    const user = await this.otpRepository.validateOtp(phoneNumber, otp);

    if (!user) {
      throw new BadRequestException('invalid otp provided');
    }

    if (!user.is_verified) {
      await this.userService.updateUser(user.id, {
        is_verified: true,
      });
    }

    return user;
  }
}
