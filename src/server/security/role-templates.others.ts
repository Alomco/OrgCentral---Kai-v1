import { RoleScope } from '@/server/types/prisma';
import type { OrgPermissionMap } from './access-control';
import { ROLE_PERMISSION_STATEMENTS } from './role-permission-statements';

export const managerTemplate = {
  name: 'manager',
  description: 'Manager with team-level HR access.',
  scope: RoleScope.ORG,
  permissions: {
    'org.settings': ['read'],
    member: ['read'],
    'hr.people.profile': ['read', 'list'],
    'hr.people.contract': ['read', 'list'],
    'hr.absence': ['read', 'list', 'acknowledge'],
    'hr.absence.attachment': ['create', 'delete'],
    'hr.compliance.item': ['read', 'list'],
    'hr.leave.request': ['read', 'list', 'approve'],
    'hr.leave.balance': ['read'],
    'hr.notification': ['read', 'list'],
    'hr.performance.review': ['read', 'list', 'create', 'update'],
    'hr.performance.goal': ['read', 'list', 'create', 'update'],
    'hr.time.entry': ['read', 'list', 'approve'],
    'hr.time.sheet': ['read', 'list', 'approve'],
    'hr.training.record': ['read', 'list'],
  } satisfies OrgPermissionMap,
  inherits: ['member'],
  isSystem: true,
  isDefault: true,
} as const;

export const complianceTemplate = {
  name: 'compliance',
  description: 'Compliance officer with audit access.',
  scope: RoleScope.ORG,
  permissions: {
    'org.settings': ['read'],
    audit: ROLE_PERMISSION_STATEMENTS.audit,
    residency: ROLE_PERMISSION_STATEMENTS.residency,
    'hr.people.profile': ['read', 'list'],
    'hr.compliance.item': ROLE_PERMISSION_STATEMENTS['hr.compliance.item'],
    'hr.compliance.template': ROLE_PERMISSION_STATEMENTS['hr.compliance.template'],
    'hr.policy': ['read', 'list'],
  } satisfies OrgPermissionMap,
  inherits: ['member'],
  isSystem: true,
  isDefault: true,
} as const;

export const memberTemplate = {
  name: 'member',
  description: 'Standard member with self-service HR access.',
  scope: RoleScope.ORG,
  permissions: {
    'org.settings': ['read'],
    'hr.people.profile': ['read', 'list', 'update'],
    'hr.people.contract': ['read', 'list'],
    'hr.absence': ['read', 'list', 'create'],
    'hr.absence.attachment': ['create', 'delete'],
    'hr.compliance.item': ['read', 'list', 'update'],
    'hr.leave.request': ['read', 'list', 'create', 'cancel'],
    'hr.leave.balance': ['read'],
    'hr.notification': ['read', 'list'],
    'hr.performance.review': ['read', 'list'],
    'hr.performance.goal': ['read', 'list'],
    'hr.policy': ['read', 'list'],
    'hr.policy.acknowledgment': ['acknowledge'],
    'hr.time.entry': ['read', 'list', 'create', 'update'],
    'hr.time.sheet': ['read', 'list'],
    'hr.training.record': ['read', 'list'],
    'hr.training.enrollment': ['enroll', 'complete'],
  } satisfies OrgPermissionMap,
  inherits: [],
  isSystem: true,
  isDefault: true,
} as const;
