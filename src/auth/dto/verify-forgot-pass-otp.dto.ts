import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateIf, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyForgotPassDto {
  @ApiPropertyOptional({
    example: 'johndoe@example.com',
    description: 'Valid email address (required if phone is not provided)',
  })
  @ValidateIf((o) => !o.phone)
  @IsNotEmpty({ message: 'Either email or phone must be provided.' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    example: '+250789123456',
    description:
      'Phone number with country code (required if email is not provided)',
  })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Either email or phone must be provided.' })
  phone?: string;

  @ApiProperty({
    example: '4568',
    description: 'OTP sent to email or phone number.',
  })
  @IsNotEmpty({
    message: 'OTP is required, check the registration email or phone number.',
  })
  otp: string;
}
