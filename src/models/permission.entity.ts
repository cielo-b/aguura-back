import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { EPermission } from 'src/permissions/constants/permission.enum';

@Entity('permissions')
@Index('idx_action_role', ['action', 'role'], { unique: true })
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EPermission,
  })
  action: EPermission;

  @ManyToOne(() => Role, (role) => role.permissions)
  role: Role;
}
