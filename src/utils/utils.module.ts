import { Module } from '@nestjs/common';
import { UtilsService } from './impls/utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UtilsService, WinstonLoggerService, TransactionService],
})
export class UtilsModule {}
