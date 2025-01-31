import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './impls/roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/models/role.entity';
import { Permission } from 'src/models/permission.entity';
import { User } from 'src/models/user.entity';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, WinstonLoggerService],
})
export class RolesModule {}
