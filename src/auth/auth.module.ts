import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './impls/auth.service';
import { UtilsService } from 'src/utils/impls/utils.service';
import { JwtService } from 'src/jwt/impls/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';
import { Otp } from 'src/models/otp.entity';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp])],
  controllers: [AuthController],
  providers: [AuthService, UtilsService, JwtService, WinstonLoggerService, TransactionService],
})
export class AuthModule {}
