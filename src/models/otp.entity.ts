import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity';
import { EOtpAction } from 'src/common/enums/otp-actions.enum';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Exclude()
  user: User;

  @Column({
    type: 'enum',
    enum: EOtpAction,
  })
  action: EOtpAction;

  @Column({ type: 'varchar', length: 255 })
  otp: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'boolean', default: false })
  validatedOtp: boolean;

  @BeforeInsert()
  async hashOtp() {
    if (this.otp) {
      this.otp = await bcrypt.hash(this.otp, 8);
    }
  }
}
