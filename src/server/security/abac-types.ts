/**
 * ABAC policy types used across the application
 */
export type AbacEffect = 'allow' | 'deny';

export type AbacOperator = 'eq' | 'in' | 'ne' | 'gt' | 'lt';

export type AbacPrimitive = string | number | boolean | null;
export type AbacAttribute = AbacPrimitive | AbacPrimitive[];

export interface AbacPredicate {
  op: AbacOperator;
  value: AbacAttribute | AbacAttribute[];
}

export type AbacConditionBlock = Record<string, AbacAttribute | AbacPredicate | undefined>;

export interface AbacCondition {
  // Example: { subject: { roles: ['orgAdmin'] }, resource: { departmentId: 'dept-x' } }
  subject?: AbacConditionBlock;
  resource?: AbacConditionBlock;
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
