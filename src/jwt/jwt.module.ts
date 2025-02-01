import { Module } from '@nestjs/common';
import { JwtService } from './impls/jwt.service';

@Module({
  providers: [JwtService]
})
export class JwtModule {}
