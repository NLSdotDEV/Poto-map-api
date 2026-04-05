import { Injectable } from '@nestjs/common';
import { OtpRepository } from '../repositories/otp.repository';
import { randomInt } from 'crypto';
import { OtpStatus } from '../enums/otp.status.enum';

/**
 * @class OtpGeneratorService
 * Responsibility: Generate secure, non-conflicting, and time-limited OTP codes.
 */
@Injectable()
export class OtpGeneratorService {
  constructor(private otpRepo: OtpRepository) {}

  /**
   * @method generateValidOtp
   * @param {string} userId - The owner of the OTP
   * @returns {Promise<string>} A valid 5-digit OTP code
   * @description Checks for an existing valid OTP; if none exists, generates a unique new one using secure random values.
   */
  async generateValidOtp(userId: string) {
    const hasValidOtp = await this.otpRepo.getValidOtp(userId);

    // if user don't have a valid otp stored, generate a new one with crypto
    if (!hasValidOtp) {
      let otp = randomInt(10000, 99000).toString();
      let exists = await this.otpRepo.exists({
        where: { otp },
      });

      while (exists) {
        otp = randomInt(10000, 99000).toString();
        exists = await this.otpRepo.exists({
          where: { otp },
        });
      }

      const currentDate = new Date();
      const expiresAt = new Date();
      expiresAt.setMinutes(currentDate.getMinutes() + 5);

      const saveOtp = this.otpRepo.create({
        expires_at: expiresAt,
        otp,
        status: OtpStatus.ACTIVE,
        user: { id: userId },
      });

      await this.otpRepo.save(saveOtp);
      return otp;
    }

    return hasValidOtp.otp;
  }
}
