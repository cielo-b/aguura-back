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
import { Otp } from 'src/models/otp.entity';
import { EOtpAction } from 'src/common/enums/otp-actions.enum';
import { TransactionService } from 'src/transaction/transaction.service';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class UserService implements UserAbstractService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,

    private readonly logger: WinstonLoggerService,
    private readonly utilsService: UtilsService,
    private readonly helperService: HelperService,
    private readonly transactionService: TransactionService,
    private readonly twilioService: TwilioService,
  ) {}

  registerUser = async (dto: RegisterUserDto): Promise<IResponse> => {
    this.logger.log('Registration ==> UserService');
    const transaction = await this.transactionService.startTransaction();
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
    const userRole = await transaction.roleRepository.findOne({
      where: { name: ERole.USER },
    });

    if (!userRole) {
      throw new Error('Role USER not found');
    }

    user.role = userRole;

    // create the otp
    const otp: Otp = new Otp();
    otp.user = user;
    otp.otp = await this.utilsService.generateOtp();
    otp.action = EOtpAction.REGISTRATION;
    otp.isUsed = false;

    let smsSent = false;
    let emailSent = false;

    try {
      await this.twilioService.sendSms(
        dto.phone,
        `Your account verification OTP for Aguura is ${otp.otp}`,
      );
    } catch (smsError) {
      this.logger.error('Error sending OTP: ', smsError.message);
    }

    try {
      await this.utilsService.VerifyAccountTemplate(
        dto.email,
        otp.otp,
        'Account Verification OTP',
      );
      emailSent = true;
    } catch (emailError) {
      this.logger.error('Error sending Email: ', emailError.message);
      // Continue even if email fails
    }

    // Ensure that at least one method succeeds
    if (!smsSent && !emailSent) {
      throw new InternalServerErrorException(
        'Both SMS and Email failed to send.',
      );
    }

    user.otps.push(otp);
    await transaction.userRepository.save(user);
    await transaction.otpRepository.save(otp);

    const populatedUser: User = await transaction.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.id = :id', { id: user.id })
      .getOne();

    await this.transactionService.commitTransaction();

    return {
      message: 'User registered successfully',
      data: populatedUser,
      status: 201,
      success: true,
    };
  };
}
