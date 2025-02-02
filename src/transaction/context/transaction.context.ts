import { QueryRunner, Repository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { Role } from 'src/models/role.entity';
import { Otp } from 'src/models/otp.entity';

export class TransactionContext {
  userRepository: Repository<User>;
  roleRepository: Repository<Role>;
  otpRepository: Repository<Otp>;

  constructor(queryRunner: QueryRunner) {
    this.userRepository = queryRunner.manager.getRepository(User);
    this.roleRepository = queryRunner.manager.getRepository(Role);
    this.otpRepository = queryRunner.manager.getRepository(Otp);
  }
}
