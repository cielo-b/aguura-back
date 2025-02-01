import {
  ForbiddenException,
  Injectable,
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
  ) {}

  login = async (dto: LoginDto): Promise<IResponse> => {
    this.logger.log('Login ==> Auth Service');
    await this.transactionService.startTransaction();
    try {
      const { email, phone, password } = dto;

      // Find user by email or phone
      const user = await this.utilsService.findOneByEmailOrPhone(email, phone);
      if (!user) {
        throw new UnauthorizedException('Invalid login credentials.');
      }

      // TODO: finish the implementation of this verification

      // if (!user.isVerified)
      //   throw new UnauthorizedException(
      //     `Verification OTP sent to ${user.phoneNumber} or ${user.email}, verify to continue or request another OTP.`,
      //   );

      // password validation
      if (
        !(await this.utilsService.isPasswordValid(dto.password, user.password))
      )
        throw new UnauthorizedException('Invalid login credentials.');

      // token
      const token = await this.jwtService.sign({
        userId: user.id,
        roleId: user.role.id,
      });

      await this.transactionService.commitTransaction()

      return {
        status: 'success',
        message: 'Login successful',
        data: token,
        success: true,
      };
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  };

  forgotPassword = async (dto: ForgotPassDto): Promise<IResponse> => {
    await this.transactionService.startTransaction();
    try {
      const { email, phone } = dto;

      // Find user by email or phone
      const user = await this.utilsService.findOneByEmailOrPhone(email, phone);
      if (!user) {
        throw new NotFoundException(
          'User not found with provided email or phone.',
        );
      }

      // first check if the otp exists
      const eOtp: Otp = await this.transactionService
        .getRepository(this.otpRepository)
        .findOne({
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

      // TODO: send the otp according to what given either phone or email

      user.otps.push(otp);
      await this.transactionService
        .getRepository(this.userRepository)
        .save(user);
      await this.transactionService.getRepository(this.otpRepository).save(otp);

      await this.transactionService.commitTransaction()

      return {
        message: 'OTP sent successfully to your email and/or phone.',
        status: 'success',
        success: true,
      };
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  };

  async verifyForgotPassOtp(dto: VerifyForgotPassDto): Promise<IResponse> {
    await this.transactionService.startTransaction();
    try {
      // get the user by phone or email
      const user = await this.utilsService.findOneByEmailOrPhone(
        dto.email,
        dto.phone,
      );

      if (!user)
        throw new UnauthorizedException(
          'Invalid OTP provided, request another one to reset your password.',
        );

      // get the otp
      const otp: Otp = await this.transactionService
        .getRepository(this.otpRepository)
        .findOne({
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

      otp.isUsed = true;
      // remove the otp from the database and delete it from the user
      user.otps = user.otps.filter((otpRecord) => otpRecord.id !== otp.id);
      await this.transactionService
        .getRepository(this.userRepository)
        .save(user);
      await this.transactionService.getRepository(this.otpRepository).save(otp);
      await this.transactionService
        .getRepository(this.otpRepository)
        .remove(otp);

        await this.transactionService.commitTransaction()
      return {
        status: 'success',
        message: 'OTP verified successfully, you can not reset the password.',
        success: true,
      };
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  }

  async verifyAccount(dto: VerifyAccountDto): Promise<IResponse> {
    await this.transactionService.startTransaction();
    try {
      // get the user by phone or email
      const user = await this.utilsService.findOneByEmailOrPhone(
        dto.email,
        dto.phone,
      );

      if (!user)
        throw new UnauthorizedException(
          'Invalid OTP provided, request another one to verify your account.',
        );

      // get the otp
      const otp: Otp = await this.transactionService
        .getRepository(this.otpRepository)
        .findOne({
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
      await this.transactionService
        .getRepository(this.userRepository)
        .save(user);
      await this.transactionService.getRepository(this.otpRepository).save(otp);
      await this.transactionService
        .getRepository(this.otpRepository)
        .remove(otp);


        await this.transactionService.commitTransaction()
      return {
        status: 'success',
        message: 'Account verified successfully, login to continue.',
        success: true,
      };
    } catch (error) {
      await this.transactionService.rollbackTransaction();
      throw error;
    } finally {
      await this.transactionService.releaseTransaction();
    }
  }
}
