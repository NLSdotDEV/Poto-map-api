import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * @method sendSms
   * @param {string} phone_number - The recipient's phone number
   * @param {string} message - The message content
   * @description Simulated SMS delivery that logs the message to the console.
   */
  sendSms(phone_number: string, message: string): boolean {
    this.logger.log(`[MOCK SMS] Sending to ${phone_number}: ${message}`);
    return true;
  }
}
