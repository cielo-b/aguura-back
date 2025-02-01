import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Module({
  providers: [TwilioService],
})
export class TwilioModule {}
