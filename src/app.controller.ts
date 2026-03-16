import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './auth/auth.guard';

@Controller()
@UseGuards(JwtGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAppVersion() {
    const appVersion = await this.appService.getAppVersion();

    return {
      app_version: appVersion,
    };
  }
}
