/**
 * ABAC policy types used across the application
 */
export type AbacEffect = 'allow' | 'deny';

export type AbacOperator = 'eq' | 'in' | 'ne' | 'gt' | 'lt';

export interface AbacCondition {
  // Example: { subject: { roles: ['orgAdmin'] }, resource: { departmentId: 'dept-x' } }
  subject?: Record<string, unknown>;
  resource?: Record<string, unknown>;
}

export interface AbacPolicy {
  id: string;
  description?: string;
  effect: AbacEffect;
  actions: string[]; // e.g., ['read', 'update']
  resources: string[]; // e.g., ['document', 'leave-request']
  condition?: AbacCondition;
  priority?: number; // higher priority evaluated first
}
