import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './impls/auth.service';
import { UtilsService } from 'src/utils/impls/utils.service';
import { JwtService } from 'src/jwt/impls/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UtilsService, JwtService, WinstonLoggerService],
})
export class AuthModule {}
