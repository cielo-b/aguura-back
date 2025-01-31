import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './impls/permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/models/role.entity';
import { User } from 'src/models/user.entity';
import { Permission } from 'src/models/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
