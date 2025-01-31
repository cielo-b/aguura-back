import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { SuperadminAbstractService } from '../superadmin.abstract.service';
import IResponse from 'src/payload/response.enum';
import { RegisterSuperAdminDto } from '../dto/register-superadmin.dto';
import { UtilsService } from 'src/utils/impls/utils.service';
import { ECreationAction } from 'src/common/enums/creation-actions.enum';
import { ERole } from 'src/roles/constants/role.enum';
import { HelperService } from 'src/helpers/impls/helper.service';
import { Role } from 'src/models/role.entity';

@Injectable()
export class SuperadminService implements SuperadminAbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,

    private readonly utilsService: UtilsService,
    private readonly helperService: HelperService,
  ) {}

  createSuperAdmin = async (dto: RegisterSuperAdminDto): Promise<IResponse> => {
    // validate super admin key
    if (
      !(await this.utilsService.validateKey(
        dto.key,
        ECreationAction.CREATE_SUPER_ADMIN,
      ))
    )
      throw new ForbiddenException(
        `Invalid SUPER ADMIN CREATION KEY provided.`,
      );

    // only one super admin allowed
    const eS: User[] = await this.userRepository.find({
      where: { role: { name: ERole.SUPER_ADMIN } },
    });
    if (eS.length > 1)
      throw new ForbiddenException(`Only one super admin allowed.`);

    // validate the email
    if (!(await this.utilsService.isEmailUnique(dto.email)))
      throw new BadRequestException(`Email ${dto.email} already taken.`);

    // check the phone number
    if (!(await this.utilsService.isPhoneNumberUnique(dto.phone)))
      throw new BadRequestException(`Phone number ${dto.phone} already taken.`);

    // check the passwords
    if (
      !(await this.utilsService.validatePasswordWithConfirmPassword(
        dto.password,
        dto.confirmPassword,
      ))
    )
      throw new BadRequestException('Password must be confirmed.');

    // create the user
    const user: User = await this.helperService.createUser(dto);

    // assign the role and permissions
    const userRole = await this.roleRepository.findOne({
      where: { name: ERole.SUPER_ADMIN },
    });

    if (!userRole) {
      throw new Error('Role SUPER ADMIN not found');
    }

    user.role = userRole;
    await this.userRepository.save(user);

    const populatedUser: User = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.id = :id', { id: user.id })
      .getOne();

    return {
      message: 'Super admin registered successfully',
      data: populatedUser,
      status: 201,
      success: true,
    };
  };
}
