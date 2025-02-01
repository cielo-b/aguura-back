import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerResponse } from 'src/payload/controller-response';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { SuperadminService } from './impls/superadmin.service';
import { RegisterSuperAdminDto } from './dto/register-superadmin.dto';

@ApiTags('Super admin')
@Controller('superadmin')
export class SuperadminController {
  constructor(private readonly superAdminService: SuperadminService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() createSuperAdminDto: RegisterSuperAdminDto) {
    const result =
      await this.superAdminService.createSuperAdmin(createSuperAdminDto);
    return new ControllerResponse(true, result);
  }
}
