import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SecurityCondition, SecurityPolicy } from './security-policy.types';

export function evaluatePolicyConditions(
  policy: SecurityPolicy,
  context: RepositoryAuthorizationContext,
): boolean {
  if (policy.conditions.length === 0) {
    return true;
  }

  for (const condition of policy.conditions) {
    if (!evaluateCondition(condition, context)) {
      return false;
    }
  }

  return true;
}

function evaluateCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  switch (condition.type) {
    case 'data_classification':
      return evaluateDataClassificationCondition(condition, context);

    case 'data_residency':
      return evaluateDataResidencyCondition(condition, context);

    case 'user_role':
      return evaluateUserRoleCondition(condition, context);

    case 'ip_address':
      return evaluateIpAddressCondition(condition, context);

    case 'mfa_status':
      return evaluateMfaStatusCondition(condition, context);

    case 'time_based':
      return evaluateTimeBasedCondition(condition);
    case 'device_compliance':
      return false;

    default:
      return false;
  }
}

function evaluateDataClassificationCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  const currentValue = context.dataClassification;
  const expectedValue = condition.value as string;

  switch (condition.operator) {
    case 'equals':
      return currentValue === expectedValue;
    case 'not_equals':
      return currentValue !== expectedValue;
    case 'greater_than':
    case 'less_than':
    case 'contains':
    case 'matches_regex':
      return false;
  }
}

function evaluateDataResidencyCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  const currentValue = context.dataResidency;
  const expectedValue = condition.value as string;

  switch (condition.operator) {
    case 'equals':
      return currentValue === expectedValue;
    case 'not_equals':
      return currentValue !== expectedValue;
    case 'greater_than':
    case 'less_than':
    case 'contains':
    case 'matches_regex':
      return false;
  }
}

function evaluateUserRoleCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  const currentValue = context.roleKey;
  const expectedValue = condition.value as string;
  const roles = context.roles ?? [];

  switch (condition.operator) {
    case 'equals':
      return currentValue === expectedValue;
    case 'not_equals':
      return currentValue !== expectedValue;
    case 'contains':
      return roles.includes(expectedValue);
    case 'greater_than':
    case 'less_than':
    case 'matches_regex':
      return false;
  }
}

function evaluateIpAddressCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  const currentValue = context.ipAddress ?? '';
  const expectedValue = condition.value as string;

  switch (condition.operator) {
    case 'equals':
      return currentValue === expectedValue;
    case 'not_equals':
      return currentValue !== expectedValue;
    case 'contains':
      return currentValue.length > 0 && currentValue.includes(expectedValue);
    case 'matches_regex':
      try {
        const regex = new RegExp(expectedValue);
        return currentValue.length > 0 && regex.test(currentValue);
      } catch {
        return false;
      }
    case 'greater_than':
    case 'less_than':
      return false;
  }
}

function evaluateMfaStatusCondition(
  condition: SecurityCondition,
  context: RepositoryAuthorizationContext,
): boolean {
  const currentValue = context.mfaVerified;
  const expectedValue = condition.value as boolean;

  switch (condition.operator) {
    case 'equals':
      return currentValue === expectedValue;
    case 'not_equals':
      return currentValue !== expectedValue;
    case 'greater_than':
    case 'less_than':
    case 'contains':
    case 'matches_regex':
      return false;
  }
}

function evaluateTimeBasedCondition(condition: SecurityCondition): boolean {
  const now = new Date();
  const expectedValue = condition.value as string;

  switch (expectedValue) {
    case 'weekdays':
      return now.getDay() >= 1 && now.getDay() <= 5;
    case 'weekends':
      return now.getDay() === 0 || now.getDay() === 6;
    case 'business_hours': {
      const hour = now.getHours();
      return hour >= 9 && hour < 17;
    }
    default:
      return true;
  }
}
