import { Injectable } from '@nestjs/common';
import { HelperAbstractService } from '../helper.abstract.service';
import { User } from 'src/models/user.entity';
import { ERole } from 'src/roles/constants/role.enum';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';

@Injectable()
export class HelperService implements HelperAbstractService {
  async createUser(dto: RegisterUserDto): Promise<User> {
    const user = new User();
    user.fullName = dto.fullName;
    user.email = dto.email;
    user.phoneNumber = dto.phone;
    user.password = dto.password;

    return user;
  }
}
