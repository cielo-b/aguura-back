import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './impls/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';
import { UtilsService } from 'src/utils/impls/utils.service';
import { HelperService } from 'src/helpers/impls/helper.service';
import { Role } from 'src/models/role.entity';
import { Permission } from 'src/models/permission.entity';
import { Otp } from 'src/models/otp.entity';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Otp])],
  controllers: [UserController],
  providers: [UserService, WinstonLoggerService, UtilsService, HelperService, TransactionService],
})
export class UserModule {}
