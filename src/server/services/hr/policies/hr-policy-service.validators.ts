import { ValidationError } from '@/server/errors';
import { assertNonEmpty } from '@/server/use-cases/shared/validators';
import type { CreatePolicyDTO, UpdatePolicyDTO } from './hr-policy-service.types';

export function validateCreatePolicy(policy: CreatePolicyDTO): void {
    assertNonEmpty(policy.title, 'title');
    assertNonEmpty(policy.content, 'content');
    assertNonEmpty(policy.version, 'version');

    assertValidDate(policy.effectiveDate, 'effectiveDate');
    if (policy.expiryDate) {
        assertValidDate(policy.expiryDate, 'expiryDate');
        assertValidPolicyDateRange(policy.effectiveDate, policy.expiryDate);
    }
}

export function validateUpdatePolicy(updates: UpdatePolicyDTO): void {
    if (updates.title !== undefined) {
        assertNonEmpty(updates.title, 'title');
    }

    if (updates.content !== undefined) {
        assertNonEmpty(updates.content, 'content');
    }

    if (updates.version !== undefined) {
        assertNonEmpty(updates.version, 'version');
    }

    if (updates.effectiveDate !== undefined) {
        assertValidDate(updates.effectiveDate, 'effectiveDate');
    }

    if (updates.expiryDate !== undefined && updates.expiryDate !== null) {
        assertValidDate(updates.expiryDate, 'expiryDate');
    }
}

export function assertValidDate(value: Date, fieldName: string): void {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new ValidationError(`${fieldName} must be a valid Date.`);
    }
}

export function assertValidPolicyDateRange(effectiveDate: Date, expiryDate: Date): void {
    if (expiryDate.getTime() < effectiveDate.getTime()) {
        throw new ValidationError('expiryDate cannot be before effectiveDate.', {
            effectiveDate: effectiveDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
        });
    }
}
