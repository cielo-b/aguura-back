import IResponse from 'src/payload/response.enum';
import { LoginDto } from './dto/login.dto';

export abstract class AuthAbstractService {
  abstract login(dto: LoginDto): Promise<IResponse>;
}
