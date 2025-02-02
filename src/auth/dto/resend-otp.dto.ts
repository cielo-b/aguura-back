import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateIf, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { EOtpAction } from 'src/common/enums/otp-actions.enum';

export class ResendOtpDto {
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
    example: EOtpAction.REGISTRATION,
    description: 'OTP action',
    enum: EOtpAction,
  })
  @IsEnum(EOtpAction, { message: 'OTP action type must be valid.' })
  action: EOtpAction;
}
