import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * @class VerifyOtpDto
 * Data transfer object for OTP verification requests.
 */
export class VerifyOtpDto {
  /**
   * @property {string} otp - The 5-digit OTP code sent via SMS.
   */
  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  otp: string;
}
