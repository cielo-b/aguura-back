import IResponse from 'src/payload/response.enum';
import { RegisterSuperAdminDto } from './dto/register-superadmin.dto';

export abstract class SuperadminAbstractService {
  abstract createSuperAdmin(dto: RegisterSuperAdminDto): Promise<IResponse>;
}
