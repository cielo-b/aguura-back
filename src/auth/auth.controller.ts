import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerResponse } from 'src/payload/controller-response';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './impls/auth.service';

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
}
