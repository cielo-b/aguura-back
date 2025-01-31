import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './impls/superadmin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { UtilsService } from 'src/utils/impls/utils.service';
import { HelperService } from 'src/helpers/impls/helper.service';
import { Role } from 'src/models/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [SuperadminController],
  providers: [SuperadminService, UtilsService, HelperService],
})
export class SuperadminModule {}
