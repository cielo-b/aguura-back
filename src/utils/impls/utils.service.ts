import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilsAbstractService } from '../utils.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ECreationAction } from 'src/common/enums/creation-actions.enum';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class UtilsService implements UtilsAbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly transactionService: TransactionService,
  ) {}

  isEmailUnique = async (email: string): Promise<boolean> => {
    await this.transactionService.startTransaction();
    try {
      const user: User = await this.transactionService
        .getRepository(this.userRepository)
        .findOne({ where: { email } });
      if (user) return false;
      this.transactionService.commitTransaction();
      return true;
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  };

  isPhoneNumberUnique = async (phone: string): Promise<boolean> => {
    await this.transactionService.startTransaction();
    try {
      const user: User = await this.transactionService
        .getRepository(this.userRepository)
        .findOne({
          where: { phoneNumber: phone },
        });

      if (user) return false;
      await this.transactionService.commitTransaction();
      return true;
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  };

  async validatePasswordWithConfirmPassword(
    password: string,
    confirmPassword: string,
  ): Promise<boolean> {
    return password === confirmPassword;
  }

  validateKey = async (
    key: string,
    action: ECreationAction,
  ): Promise<boolean> => {
    let res: boolean;
    switch (action) {
      case ECreationAction.CREATE_ADMIN: {
        res = String(process.env.CREATE_ADMIN_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_DISTRIBUTOR: {
        res = String(process.env.CREATE_DISTRIBUTOR_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_PRODUCER: {
        res = String(process.env.CREATE_PRODUCER_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_SUPER_ADMIN: {
        res = String(process.env.CREATE_SUPER_ADMIN_KEY) === String(key);
        break;
      }

      default:
        throw new BadRequestException(`Key action provided ${action} invalid.`);
    }

    return res;
  };

  async findOneByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<User | null> {
    await this.transactionService.startTransaction();
    try {
      const user = await this.transactionService
        .getRepository(this.userRepository)
        .findOne({
          where: [{ email }, { phoneNumber: phone }],
          relations: ['role', 'otps'],
        });
      await this.transactionService.commitTransaction();
      return user;
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  }

  async isPasswordValid(
    password: string,
    dbPassword: string,
  ): Promise<boolean> {
    console.log(await bcrypt.compare(password, dbPassword));
    return await bcrypt.compare(password, dbPassword);
  }

  async generateOtp(): Promise<string> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
  }

  async verifyOtp(otp: string, dbOtp: string): Promise<boolean> {
    return await bcrypt.compare(otp, dbOtp);
  }
}
