import { IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

/**
 * @class VerifyOtpDto
 * Data transfer object for OTP verification requests.
 */
export class VerifyOtpDto {
  /**
   * @property {string} phone_number - The phone number that requested the OTP.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10)
  phone_number: string;

  /**
   * @property {string} otp - The 5-digit OTP code sent via SMS.
   */
  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  otp: string;
}
