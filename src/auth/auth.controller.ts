import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerResponse } from 'src/payload/controller-response';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './impls/auth.service';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { VerifyForgotPassDto } from './dto/verify-forgot-pass-otp.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 201, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return new ControllerResponse(true, result);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: 201,
    description: 'Password reset OTP sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async forgotPass(@Body() dto: ForgotPassDto) {
    const result = await this.authService.forgotPassword(dto);
    return new ControllerResponse(true, result);
  }

  @Post('verify-forgot-password')
  @ApiOperation({ summary: 'Verify forgot password OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully, user can reset their password.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or OTP invalid/expired',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with provided email/phone',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP',
  })
  async verifyForgotPass(@Body() dto: VerifyForgotPassDto) {
    const result = await this.authService.verifyForgotPassOtp(dto);
    return new ControllerResponse(true, result);
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verify account' })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully, login to continue.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or OTP invalid/expired',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with provided email/phone',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP',
  })
  async verifyAccount(@Body() dto: VerifyAccountDto) {
    const result = await this.authService.verifyAccount(dto);
    return new ControllerResponse(true, result);
  }
}
