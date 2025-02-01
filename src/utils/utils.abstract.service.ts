import { ECreationAction } from 'src/common/enums/creation-actions.enum';
import { User } from 'src/models/user.entity';

export abstract class UtilsAbstractService {
  // validate user's email
  abstract isEmailUnique(email: string): Promise<boolean>;

  // validate phone number
  abstract isPhoneNumberUnique(phone: string): Promise<boolean>;

  // validate 2 passwords
  abstract validatePasswordWithConfirmPassword(
    password: string,
    confirmPassword: string,
  ): Promise<boolean>;

  // validate user creation keys
  abstract validateKey(key: string, action: ECreationAction): Promise<boolean>;

  abstract findOneByEmailOrPhone(
    email: string,
    phone: string,
  ): Promise<User | null>;

  abstract isPasswordValid(
    password: string,
    dbPassword: string,
  ): Promise<boolean>;
}
