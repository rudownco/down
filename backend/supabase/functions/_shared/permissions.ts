// AUTO-GENERATED from common/src/utils/permissions.ts — DO NOT EDIT
// Sync: npm run sync:shared

export type GroupRole = 'owner' | 'admin' | 'member' | 'initiate';

export type Permission =
  | 'group.delete'
  | 'group.edit_settings'
  | 'group.transfer_ownership'
  | 'member.invite'
  | 'member.remove'
  | 'member.promote'
  | 'event.create'
  | 'event.edit'
  | 'event.lock_time'
  | 'event.suggest_time'
  | 'event.vote'
  | 'event.rsvp'
  | 'event.view';

const ROLE_RANK: Record<GroupRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  initiate: 1,
};

// Each role's OWN permissions (not inherited from lower roles)
const ROLE_PERMISSIONS: Record<GroupRole, Permission[]> = {
  owner: ['group.delete', 'group.edit_settings', 'group.transfer_ownership'],
  admin: ['member.invite', 'member.remove', 'member.promote', 'event.create', 'event.edit', 'event.lock_time'],
  member: ['event.suggest_time'],
  initiate: ['event.view', 'event.vote', 'event.rsvp'],
};

const ROLE_HIERARCHY: GroupRole[] = ['owner', 'admin', 'member', 'initiate'];

/** Returns the full set of permissions for a role, including inherited ones. */
export function getPermissions(role: GroupRole): Set<Permission> {
  const rankIndex = ROLE_HIERARCHY.indexOf(role);
  const perms = new Set<Permission>();
  for (let i = rankIndex; i < ROLE_HIERARCHY.length; i++) {
    for (const p of ROLE_PERMISSIONS[ROLE_HIERARCHY[i]]) perms.add(p);
  }
  return perms;
}

/** Checks whether a role has a specific permission (with hierarchy inheritance). */
export function hasPermission(role: GroupRole, permission: Permission): boolean {
  return getPermissions(role).has(permission);
}

/** Returns true if the actor's role outranks the target's role. */
export function canManageRole(actor: GroupRole, target: GroupRole): boolean {
  return ROLE_RANK[actor] > ROLE_RANK[target];
}

/** Returns the numeric rank of a role (higher = more authority). */
export function getRoleRank(role: GroupRole): number {
  return ROLE_RANK[role];
}

/** Returns a display label for a role. */
export function getRoleLabel(role: GroupRole): string {
  switch (role) {
    case 'owner':    return 'Owner';
    case 'admin':    return 'Admin';
    case 'member':   return 'Member';
    case 'initiate': return 'Initiate';
  }
}

/** Returns the roles the actor can assign to the target (excludes 'owner' — use transfer). */
export function getAssignableRoles(actorRole: GroupRole, targetRole: GroupRole): GroupRole[] {
  if (!hasPermission(actorRole, 'member.promote')) return [];
  if (!canManageRole(actorRole, targetRole)) return [];
  const assignable: GroupRole[] = ['admin', 'member', 'initiate'];
  return assignable.filter(r => r !== targetRole && ROLE_RANK[actorRole] > ROLE_RANK[r]);
}
