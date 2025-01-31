import { User } from 'src/models/user.entity';
import { ERole } from 'src/roles/constants/role.enum';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';

export abstract class HelperAbstractService {
  abstract createUser(dto: RegisterUserDto): Promise<User>;
}
