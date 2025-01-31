import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty({ message: "Full name shouldn't be empty." })
  fullName: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Valid email address',
  })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: '+250789123456',
    description: 'Phone number with country code',
  })
  @IsNotEmpty({ message: "Phone number shouldn't be empty." })
  phone: string;

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
