import { Injectable } from '@nestjs/common';
import { RolesAbstractService } from '../roles.abstract.service';
import { Permission } from 'src/models/permission.entity';
import { Role } from 'src/models/role.entity';
import { User } from 'src/models/user.entity';
import { EPermission } from 'src/permissions/constants/permission.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERole } from '../constants/role.enum';
import { WinstonLoggerService } from 'src/common/log/winston-logger.service';

@Injectable()
export class RolesService implements RolesAbstractService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,

    private readonly logger: WinstonLoggerService,
  ) {}

  async onModuleInit() {
    await this.createRolesAndPermissions();
  }

  async createRolesAndPermissions() {
    // Check if the roles already exist
    const roles = await this.roleRepository.find();

    if (roles.length === 0) {
      // If roles don't exist, create them
      const adminRole = this.roleRepository.create({ name: ERole.ADMIN });
      const userRole = this.roleRepository.create({ name: ERole.USER });
      const distRole = this.roleRepository.create({ name: ERole.DISTRIBUTOR });
      const producerRole = this.roleRepository.create({ name: ERole.PRODUCER });
      const superRole = this.roleRepository.create({ name: ERole.SUPER_ADMIN });

      await this.roleRepository.save([
        adminRole,
        userRole,
        distRole,
        producerRole,
        superRole,
      ]);

      // Create permissions for the roles
      const permissions = [
        EPermission.READ,
        EPermission.CREATE,
        EPermission.UPDATE,
        EPermission.DELETE,
      ];

      // Assign permissions to the roles
      const adminPermissions = permissions.map((action) =>
        this.permissionsRepository.create({
          action,
          role: adminRole,
        }),
      );
      const userPermissions = permissions.map((action) =>
        this.permissionsRepository.create({
          action,
          role: userRole,
        }),
      );
      const distPermissions = permissions.map((action) =>
        this.permissionsRepository.create({
          action,
          role: distRole,
        }),
      );

      const producerPermissions = permissions.map((action) =>
        this.permissionsRepository.create({
          action,
          role: producerRole,
        }),
      );

      const superPermissions = permissions.map((action) =>
        this.permissionsRepository.create({
          action,
          role: superRole,
        }),
      );

      // Save permissions
      await this.permissionsRepository.save([
        ...adminPermissions,
        ...userPermissions,
        ...distPermissions,
        ...superPermissions,
        ...producerPermissions,
      ]);

      this.logger.log('Permissions created for roles');
    } else {
      this.logger.log('Roles already exist, skipping creation.');
    }
  }

  async createRole(name: ERole): Promise<Role> {
    const role = new Role();
    role.name = name;
    return await role.save();
  }

  async updateRole(id: string, name: ERole): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new Error('Role not found');
    role.name = name;
    return await role.save();
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new Error('Role not found');
    await role.remove();
  }

  async getAllRoles(): Promise<Role[]> {
    return await Role.find();
  }

  async assignPermissionToRole(
    roleId: string,
    action: EPermission,
  ): Promise<Permission> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new Error('Role not found');
    const permission = new Permission();
    permission.role = role;
    permission.action = action;
    return await permission.save();
  }

  async removePermissionFromRole(
    roleId: string,
    action: EPermission,
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new Error('Role not found');
    const permission = role.permissions.find((p) => p.action === action);
    if (permission) {
      await permission.remove();
    }
  }

  async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new Error('Role not found');
    return role.permissions;
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    const role: Role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });
    if (!role) throw new Error('Role not found');
    return role.users;
  }

  async checkRoleExistence(name: ERole): Promise<boolean> {
    const role = await this.roleRepository.findOne({ where: { name } });
    return !!role;
  }
}
