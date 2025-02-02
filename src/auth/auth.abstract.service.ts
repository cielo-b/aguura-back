import IResponse from 'src/payload/response.enum';
import { LoginDto } from './dto/login.dto';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { VerifyForgotPassDto } from './dto/verify-forgot-pass-otp.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

export abstract class AuthAbstractService {
  abstract login(dto: LoginDto): Promise<IResponse>;
  abstract forgotPassword(dto: ForgotPassDto): Promise<IResponse>;
  abstract verifyForgotPassOtp(dto: VerifyForgotPassDto): Promise<IResponse>;
  abstract verifyAccount(dto: VerifyAccountDto): Promise<IResponse>;
  abstract resetPassword(dto: ResetPasswordDto): Promise<IResponse>;
  abstract resendOtp(dto: ResendOtpDto): Promise<IResponse>;
}
