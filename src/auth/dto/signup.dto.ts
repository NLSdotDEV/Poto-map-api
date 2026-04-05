import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  first_name?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  last_name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  phone_number: string;
}
