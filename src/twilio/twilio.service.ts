import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: Twilio.Twilio;
  private from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !this.from) {
      this.logger.error('Twilio credentials are missing in .env file!');
      throw new NotFoundException('Missing Twilio credentials');
    }

    this.client = Twilio(accountSid, authToken);
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.from,
        to: to,
      });

      this.logger.log(`SMS sent successfully: ${response.sid}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw new Error('Failed to send SMS');
    }
  }
}
