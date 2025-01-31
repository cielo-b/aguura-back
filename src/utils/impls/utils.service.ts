import { Injectable } from '@nestjs/common';
import { UtilsAbstractService } from '../utils.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';

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
}
