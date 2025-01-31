import { User } from 'src/models/user.entity';
import { EPermission } from './constants/permission.enum';
import { Permission } from 'src/models/permission.entity';

export abstract class PermissionsAbstractService {
  // Check if a user has a specific permission
  abstract hasPermission(user: User, action: EPermission): Promise<boolean>;

  // Create a permission for a specific action
  abstract createPermission(
    roleId: string,
    action: EPermission,
  ): Promise<Permission>;

  // Remove a permission from a role
  abstract removePermission(roleId: string, action: EPermission): Promise<void>;

  // Get all permissions for a specific user
  abstract getPermissionsForUser(userId: string): Promise<Permission[]>;

  // Get all permissions for a specific role
  abstract getPermissionsForRole(roleId: string): Promise<Permission[]>;

  // Check if a permission exists
  abstract checkPermissionExistence(
    roleId: string,
    action: EPermission,
  ): Promise<boolean>;

  // Update an existing permission
  abstract updatePermission(
    permissionId: string,
    action: EPermission,
  ): Promise<Permission>;

  // Fetch all available permissions
  abstract getAllPermissions(): Promise<Permission[]>;
}
