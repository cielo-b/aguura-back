import { ECreationAction } from 'src/common/enums/creation-actions.enum';

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
}
