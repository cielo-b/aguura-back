import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { Stock } from './stock.entity';
import { Role } from './role.entity';
import { Otp } from './otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Stock, (stock) => stock.user)
  stocks: Stock[];

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  phoneCountryCode: string;

  @Column({ type: 'varchar', length: 15, nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Column({ type: 'varchar', nullable: false })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  fcmToken?: string;

  @Column({ type: 'decimal', default: 0 })
  monthlyPayment: number;

  @Column({ type: 'varchar', nullable: true })
  tin?: string;

  @Column({ type: 'varchar', nullable: true })
  bhfId?: string;

  @Column({ type: 'varchar', nullable: true })
  dvcSrlNo?: string;

  @Column({ type: 'decimal', nullable: true })
  credit?: number;

  @Column({ type: 'boolean', default: false })
  suspended: boolean;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', default: 'RW' })
  countryCode: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  hasEbm: boolean;

  @Column({ type: 'decimal', nullable: true })
  initialSales?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 🔒 Hash password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2a$')) {
      // Check if it's already hashed
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
