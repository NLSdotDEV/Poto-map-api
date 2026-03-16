import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Either email or phone must be provided' })
  phone?: string;

  @IsStrongPassword()
  @IsString()
  password: string;
}
