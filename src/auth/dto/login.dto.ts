import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10)
  phone_number: string;
}
