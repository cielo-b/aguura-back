import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';

export class RegisterSuperAdminDto extends RegisterUserDto {
  @ApiProperty({
    example: 'ABC123!@#',
    description: 'Key for super admin creation',
  })
  @IsNotEmpty({ message: 'Please provide the super admin creation key.' })
  key: string;
}
