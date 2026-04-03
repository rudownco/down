// Mirrored from /common/src/utils/permissions.ts — keep in sync

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

const ROLE_PERMISSIONS: Record<GroupRole, Permission[]> = {
  owner: ['group.delete', 'group.edit_settings', 'group.transfer_ownership'],
  admin: ['member.invite', 'member.remove', 'member.promote', 'event.create', 'event.edit'],
  member: ['event.suggest_time'],
  initiate: ['event.view', 'event.vote', 'event.rsvp'],
};

const ROLE_HIERARCHY: GroupRole[] = ['owner', 'admin', 'member', 'initiate'];

export function getPermissions(role: GroupRole): Set<Permission> {
  const rankIndex = ROLE_HIERARCHY.indexOf(role);
  const perms = new Set<Permission>();
  for (let i = rankIndex; i < ROLE_HIERARCHY.length; i++) {
    for (const p of ROLE_PERMISSIONS[ROLE_HIERARCHY[i]]) perms.add(p);
  }
  return perms;
}

export function hasPermission(role: GroupRole, permission: Permission): boolean {
  return getPermissions(role).has(permission);
}

export function canManageRole(actor: GroupRole, target: GroupRole): boolean {
  return ROLE_RANK[actor] > ROLE_RANK[target];
}

export function getRoleRank(role: GroupRole): number {
  return ROLE_RANK[role];
}

export function getAssignableRoles(actorRole: GroupRole, targetRole: GroupRole): GroupRole[] {
  if (!hasPermission(actorRole, 'member.promote')) return [];
  if (!canManageRole(actorRole, targetRole)) return [];
  const assignable: GroupRole[] = ['admin', 'member', 'initiate'];
  return assignable.filter(r => r !== targetRole && ROLE_RANK[actorRole] > ROLE_RANK[r]);
}
