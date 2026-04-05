import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { SmsModule } from './sms/sms.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      synchronize: true,
      autoLoadEntities: true,
      database: process.env.DATABASE,
      username: process.env.DATABASE_USERNAME,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '') ?? 3306,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    AuthModule,
    UserModule,
    SmsModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
