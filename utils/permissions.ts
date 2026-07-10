export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

/**
 * Checks if a user with the given role can perform a specific action.
 * Extend this map as you add new actions.
 */
export function canPerform(role: UserRole, action: string): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.USER]: [],
    [UserRole.STAFF]: ['view_products'],
    [UserRole.MANAGER]: ['view_products', 'create_order', 'view_orders'],
    [UserRole.MODERATOR]: ['view_users', 'manage_users', 'view_products', 'view_analytics'],
    [UserRole.ADMIN]: ['*'], // admin can do everything
  };

  const allowed = rolePermissions[role] ?? [];
  return allowed.includes('*') || allowed.includes(action);
}

/** Helper to guard API routes */
export function authorize(requiredAction: string, userRole: string | undefined): boolean {
  if (!userRole) return false;
  return canPerform(userRole as UserRole, requiredAction);
}
