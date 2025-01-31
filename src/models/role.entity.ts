import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  Index,
} from 'typeorm';
import { Permission } from './permission.entity';
import { ERole } from 'src/roles/constants/role.enum';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ERole,
  })
  name: ERole;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
