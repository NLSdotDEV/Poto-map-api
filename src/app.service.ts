import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getAppVersion() {
    return "1.0.0"
  }
}
