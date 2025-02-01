import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthAbstractService } from '../auth.abstract.service';
import { LoginDto } from '../dto/login.dto';
import IResponse from 'src/payload/response.enum';
import { UtilsService } from 'src/utils/impls/utils.service';
import { JwtService } from 'src/jwt/impls/jwt.service';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';

@Injectable()
export class AuthService implements AuthAbstractService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
    private readonly logger: WinstonLoggerService
  ) {}

  login = async (dto: LoginDto): Promise<IResponse> => {

    this.logger.log("Login ==> Auth Service")
    const { email, phone, password } = dto;

    // Find user by email or phone
    const user = await this.utilsService.findOneByEmailOrPhone(email, phone);
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    // TODO: finish the implementation of this verification

    // if (!user.isVerified)
    //   throw new UnauthorizedException(
    //     `Verification OTP sent to ${user.phoneNumber} or ${user.email}, verify to continue or request another OTP.`,
    //   );

    // password validation
    if (!(await this.utilsService.isPasswordValid(dto.password, user.password)))
      throw new UnauthorizedException('Invalid login credentials.');

    // token
    const token = await this.jwtService.sign({
      userId: user.id,
      roleId: user.role.id,
    });

    return {
      status: 'success',
      message: 'Login successful',
      data: token,
      success: true,
    };
  };
}
