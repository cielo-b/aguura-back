import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilsAbstractService } from '../utils.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { CreateDateColumn, Repository } from 'typeorm';
import { ECreationAction } from 'src/common/enums/creation-actions.enum';

@Injectable()
export class UtilsService implements UtilsAbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  isEmailUnique = async (email: string): Promise<boolean> => {
    const user: User = await this.userRepository.findOne({ where: { email } });
    if (user) return false;
    return true;
  };

  isPhoneNumberUnique = async (phone: string): Promise<boolean> => {
    const user: User = await this.userRepository.findOne({
      where: { phoneNumber: phone },
    });

    if (user) return false;
    return true;
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
}
