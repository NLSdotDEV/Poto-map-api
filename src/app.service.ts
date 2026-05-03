import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppVersion() {
    return '1.0.0';
  }
}
