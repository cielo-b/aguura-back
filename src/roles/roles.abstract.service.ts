import { Permission } from 'src/models/permission.entity';
import { Role } from 'src/models/role.entity';
import { User } from 'src/models/user.entity';
import { EPermission } from 'src/permissions/constants/permission.enum';

export abstract class RolesAbstractService {
  // Create a new role
  abstract createRole(name: string): Promise<Role>;

  // Update a role's details (like name)
  abstract updateRole(id: string, name: string): Promise<Role>;

  // Delete a role
  abstract deleteRole(id: string): Promise<void>;

  // Fetch all roles
  abstract getAllRoles(): Promise<Role[]>;

  // Assign a permission to a role
  abstract assignPermissionToRole(
    roleId: string,
    action: EPermission,
  ): Promise<Permission>;

  // Remove a permission from a role
  abstract removePermissionFromRole(
    roleId: string,
    action: EPermission,
  ): Promise<void>;

  // Get permissions for a given role
  abstract getPermissionsForRole(roleId: string): Promise<Permission[]>;

  // Get users associated with a role
  abstract getUsersByRole(roleId: string): Promise<User[]>;

  // Check if a role exists by its name
  abstract checkRoleExistence(name: string): Promise<boolean>;
}
