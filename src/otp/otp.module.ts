import { Module } from '@nestjs/common';
import { OtpService } from './services/otp.service';
import { OtpController } from './otp.controller';
import { OtpGeneratorService } from './services/otp_generator.service';
import { OtpRepository } from './repositories/otp.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';

import { UserModule } from 'src/user/user.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), UserModule, SmsModule],
  providers: [OtpService, OtpGeneratorService, OtpRepository],
  controllers: [OtpController],
})
export class OtpModule {}
