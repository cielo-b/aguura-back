import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'user id' })
  @IsNotEmpty({ message: 'User id is required.' })
  userId: string;

  @ApiProperty({
    example: 'Pass1234',
    description:
      'Password with at least 8 characters, one letter, and one number',
  })
  @IsNotEmpty({ message: "Password shouldn't be empty." })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  password: string;

  @ApiProperty({
    example: 'Pass1234',
    description: 'Confirm password, must match password',
  })
  @IsNotEmpty({ message: "Confirm password shouldn't be empty." })
  confirmPassword: string;
}
