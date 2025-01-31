import IResponse from 'src/payload/response.enum';
import { RegisterUserDto } from './dto/register-user.dto';

export abstract class UserAbstractService {
  abstract registerUser(dto: RegisterUserDto): Promise<IResponse>;
}
