import { Injectable } from '@nestjs/common';
import { PermissionsAbstractService } from '../permissions.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/models/role.entity';
import { User } from 'src/models/user.entity';
import { Permission } from 'src/models/permission.entity';
import { Repository } from 'typeorm';
import { EPermission } from '../constants/permission.enum';

@Injectable()
export class PermissionsService implements PermissionsAbstractService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async hasPermission(user: User, action: EPermission): Promise<boolean> {
    const permissions = await this.getPermissionsForUser(user.id);
    return permissions.some((permission) => permission.action === action);
  }

  async createPermission(
    roleId: string,
    action: EPermission,
  ): Promise<Permission> {
    const permission = new Permission();
    permission.role = { id: roleId } as any; // Assuming role exists
    permission.action = action;
    return await permission.save();
  }

  async removePermission(roleId: string, action: EPermission): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { role: { id: roleId }, action },
    });
    if (permission) {
      await permission.remove();
    }
  }

  async getPermissionsForUser(userId: string): Promise<Permission[]> {
    const user: User = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
    if (!user) throw new Error('User not found');
    return user.role.permissions;
  }

  async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new Error('Role not found');
    return role.permissions;
  }

  async checkPermissionExistence(
    roleId: string,
    action: EPermission,
  ): Promise<boolean> {
    const permission = await this.permissionRepository.findOne({
      where: { role: { id: roleId }, action },
    });
    return !!permission;
  }

  async updatePermission(
    permissionId: string,
    action: EPermission,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) throw new Error('Permission not found');
    permission.action = action;
    return await permission.save();
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await Permission.find();
  }
}
