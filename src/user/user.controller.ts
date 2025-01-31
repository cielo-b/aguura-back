import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './impls/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ControllerResponse } from 'src/payload/controller-response';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const result = await this.userService.registerUser(registerUserDto);
    return new ControllerResponse(true, result);
  }
}
