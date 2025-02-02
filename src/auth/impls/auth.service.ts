import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthAbstractService } from '../auth.abstract.service';
import { LoginDto } from '../dto/login.dto';
import IResponse from 'src/payload/response.enum';
import { UtilsService } from 'src/utils/impls/utils.service';
import { JwtService } from 'src/jwt/impls/jwt.service';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';
import { ForgotPassDto } from '../dto/forgot-pass.dto';
import { Otp } from 'src/models/otp.entity';
import { EOtpAction } from 'src/common/enums/otp-actions.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { VerifyForgotPassDto } from '../dto/verify-forgot-pass-otp.dto';
import { VerifyAccountDto } from '../dto/verify-account.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class AuthService implements AuthAbstractService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
    private readonly logger: WinstonLoggerService,

    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly transactionService: TransactionService,
    private readonly twilioService: TwilioService,
  ) {}

  login = async (dto: LoginDto): Promise<IResponse> => {
    this.logger.log('Login ==> Auth Service');
    const transaction = await this.transactionService.startTransaction();
    const { email, phone, password } = dto;

    // Find user by email or phone
    const user = await this.utilsService.findOneByEmailOrPhone(
      email,
      phone,
      transaction,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    if (!user.isVerified)
      throw new UnauthorizedException(
        `Verification OTP sent to ${user.phoneNumber} or ${user.email}, verify to continue or request another OTP.`,
      );

    // password validation
    if (!(await this.utilsService.isPasswordValid(dto.password, user.password)))
      throw new UnauthorizedException('Invalid login credentials.');

    // token
    const token = await this.jwtService.sign({
      userId: user.id,
      roleId: user.role.id,
    });

    return {
      status: 'success',
      message: 'Login successful',
      data: token,
      success: true,
    };
  };

  forgotPassword = async (dto: ForgotPassDto): Promise<IResponse> => {
    const transaction = await this.transactionService.startTransaction();

    const { email, phone } = dto;

    // Find user by email or phone
    const user = await this.utilsService.findOneByEmailOrPhone(
      email,
      phone,
      transaction,
    );
    if (!user) {
      throw new NotFoundException(
        'User not found with provided email or phone.',
      );
    }

    if (!user.isVerified)
      throw new ForbiddenException(
        `Please check ${user.phoneNumber} or ${user.email} for the OTP sent, or request another.`,
      );

    // first check if the otp exists
    const eOtp: Otp = await transaction.otpRepository.findOne({
      where: { user: { id: user.id }, action: EOtpAction.FORGOT_PASS },
      relations: ['user'],
    });

    if (eOtp)
      throw new ForbiddenException(
        `Check ${user.phoneNumber} or ${user.email} for the OTP.`,
      );

    const otp: Otp = new Otp();
    otp.user = user;
    otp.action = EOtpAction.FORGOT_PASS;
    otp.otp = await this.utilsService.generateOtp();
    otp.isUsed = false;
    console.log(otp);

    let smsSent = false;
    let emailSent = false;

    try {
      await this.twilioService.sendSms(
        dto.phone,
        `Your forgot password OTP for Aguura is ${otp.otp}`,
      );
    } catch (smsError) {
      this.logger.error('Error sending OTP: ', smsError.message);
    }

    try {
      await this.utilsService.VerifyAccountTemplate(
        dto.email,
        otp.otp,
        'Forgot password OTP',
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

    await this.transactionService.commitTransaction();

    return {
      message: 'OTP sent successfully to your email and/or phone.',
      status: 'success',
      success: true,
    };
  };

  async verifyForgotPassOtp(dto: VerifyForgotPassDto): Promise<IResponse> {
    const transaction = await this.transactionService.startTransaction();

    // get the user by phone or email
    const user = await this.utilsService.findOneByEmailOrPhone(
      dto.email,
      dto.phone,
      transaction,
    );

    if (!user)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to reset your password.',
      );

    // get the otp
    const otp: Otp = await transaction.otpRepository.findOne({
      where: [
        { user: { email: dto.email }, action: EOtpAction.FORGOT_PASS },
        {
          user: { phoneNumber: dto.phone },
          action: EOtpAction.FORGOT_PASS,
        },
      ],
    });

    if (!otp)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to reset your password.',
      );

    if (otp.isUsed)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to reset your password.',
      );

    // validate the otp
    if (!(await this.utilsService.verifyOtp(dto.otp, otp.otp)))
      throw new UnauthorizedException(
        'Invalid OTP provided, please try again or request a new one.',
      );

    otp.validatedOtp = true;
    await transaction.userRepository.save(user);
    await transaction.otpRepository.save(otp);

    await this.transactionService.commitTransaction();
    return {
      status: 'success',
      message: 'OTP verified successfully, you can now reset the password.',
      success: true,
    };
  }

  async verifyAccount(dto: VerifyAccountDto): Promise<IResponse> {
    const transaction = await this.transactionService.startTransaction();

    // get the user by phone or email
    const user = await this.utilsService.findOneByEmailOrPhone(
      dto.email,
      dto.phone,
      transaction,
    );

    if (!user)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to verify your account.',
      );

    // get the otp
    const otp: Otp = await transaction.otpRepository.findOne({
      where: [
        { user: { email: dto.email }, action: EOtpAction.REGISTRATION },
        {
          user: { phoneNumber: dto.phone },
          action: EOtpAction.REGISTRATION,
        },
      ],
    });

    if (!otp)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to verify your account.',
      );

    if (otp.isUsed)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to verify your account.',
      );

    // validate the otp
    if (!(await this.utilsService.verifyOtp(dto.otp, otp.otp)))
      throw new UnauthorizedException(
        'Invalid OTP provided, please try again or request a new one.',
      );

    otp.isUsed = true;
    user.isVerified = true;
    // remove the otp from the database and delete it from the user
    user.otps = user.otps.filter((otpRecord) => otpRecord.id !== otp.id);
    await transaction.userRepository.save(user);
    await transaction.otpRepository.save(otp);
    await transaction.otpRepository.remove(otp);

    await this.transactionService.commitTransaction();
    return {
      status: 'success',
      message: 'Account verified successfully, login to continue.',
      success: true,
    };
  }

  resetPassword = async (dto: ResetPasswordDto): Promise<IResponse> => {
    const transaction = await this.transactionService.startTransaction();

    const user: User = await transaction.userRepository.findOne({
      where: { id: dto.userId },
      relations: ['otps', 'role'],
    });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found.`);

    // get the otp
    const otp: Otp = await transaction.otpRepository.findOne({
      where: { user: { id: user.id }, action: EOtpAction.FORGOT_PASS },
    });

    if (!otp)
      throw new NotFoundException(
        'OTP not found, request a new one to proceed.',
      );

    // validate otp
    if (!otp.validatedOtp)
      throw new ForbiddenException(
        'Invalid OTP provided, request for the new one to proceed.',
      );

    // if the otp is found set the password to the new one and delete the otp from the db and from the user
    if (
      !(await this.utilsService.validatePasswordWithConfirmPassword(
        dto.password,
        dto.confirmPassword,
      ))
    )
      throw new BadRequestException(
        'Confirm password should match the password.',
      );

    otp.isUsed = true;
    // remove the otp from the database and delete it from the user
    user.otps = user.otps.filter((otpRecord) => otpRecord.id !== otp.id);
    user.password = dto.password;
    await transaction.userRepository.save(user);
    await transaction.otpRepository.save(otp);
    await transaction.otpRepository.remove(otp);

    await this.transactionService.commitTransaction();
    return {
      status: 'success',
      message:
        'Password reset successfully, you can now login with the new password.',
      success: true,
    };
  };

  resendOtp = async (dto: ResendOtpDto): Promise<IResponse> => {
    const transaction = await this.transactionService.startTransaction();

    // get the user by phone or email
    const user = await this.utilsService.findOneByEmailOrPhone(
      dto.email,
      dto.phone,
      transaction,
    );

    if (!user)
      throw new UnauthorizedException(
        'Invalid OTP provided, request another one to reset your password.',
      );

    // get the otps
    const otps: Otp[] = await transaction.otpRepository.find({
      where: [
        { user: { email: dto.email }, action: dto.action },
        {
          user: { phoneNumber: dto.phone },
          action: dto.action,
        },
      ],
    });

    if (otps.length > 0) {
      for (const otp of otps) {
        // remove it from the user
        user.otps = user.otps.filter((otpRecord) => otpRecord.id !== otp.id);
      }
      await transaction.otpRepository.remove(otps);
    }

    const otp: Otp = new Otp();
    otp.user = user;
    otp.action = dto.action;
    otp.otp = await this.utilsService.generateOtp();
    otp.isUsed = false;

    let smsSent = false;
    let emailSent = false;

    try {
      await this.twilioService.sendSms(
        dto.phone,
        `Your ${dto.action == EOtpAction.REGISTRATION ? 'registration' : 'forgot password'} OTP for Aguura is ${otp.otp}`,
      );
    } catch (smsError) {
      this.logger.error('Error sending OTP: ', smsError.message);
    }

    try {
      await this.utilsService.VerifyAccountTemplate(
        dto.email,
        otp.otp,
        `${dto.action == EOtpAction.REGISTRATION ? 'Registration' : 'Forgot password'} OTP`,
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

    await transaction.userRepository.save(user);
    await transaction.otpRepository.save(otp);

    await this.transactionService.commitTransaction();

    return {
      message: 'New OTP has been sent successfully.',
      status: 'success',
      success: true,
    };
  };
}
