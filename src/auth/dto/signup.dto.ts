import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string | null;

  @IsString()
  @IsOptional()
  @MinLength(3)
  firstName?: string | null;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsStrongPassword()
  @IsString()
  password: string;

  @IsStrongPassword()
  @IsString()
  passwordConfirmation: string;

  @IsString()
  country: string;

  @IsString()
  countryCode: string;

  @IsString()
  @MinLength(8)
  phone: string;
}
