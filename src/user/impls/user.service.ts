import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserAbstractService } from '../user.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../dto/register-user.dto';
import IResponse from 'src/payload/response.enum';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';
import { UtilsService } from 'src/utils/impls/utils.service';
import { HelperService } from 'src/helpers/impls/helper.service';
import { ERole } from 'src/roles/constants/role.enum';
import { Role } from 'src/models/role.entity';
import { Permission } from 'src/models/permission.entity';

@Injectable()
export class UserService implements UserAbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly logger: WinstonLoggerService,
    private readonly utilsService: UtilsService,
    private readonly helperService: HelperService,
  ) {}

  registerUser = async (dto: RegisterUserDto): Promise<IResponse> => {
    this.logger.log('Registration ==> UserService');
    // check the email
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

    // create the user with the USER role and assign all permissions
    const user: User = await this.helperService.createUser(dto);

    // assign the role and permissions
    const userRole = await this.roleRepository.findOne({
      where: { name: ERole.USER },
    });

    if (!userRole) {
      throw new Error('Role USER not found');
    }

    user.role = userRole;

    // TODO: before saving the user, send the OTP on the email and phone number

    await this.userRepository.save(user);

    const populatedUser: User = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.id = :id', { id: user.id })
      .getOne();

    return {
      message: 'User registered successfully',
      data: populatedUser,
      status: 201,
      success: true,
    };
  };
}
