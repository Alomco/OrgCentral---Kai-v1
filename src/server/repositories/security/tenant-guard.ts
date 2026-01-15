import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';
import type { RepositoryAuthorizationContext, SecurityEventLogInput } from '@/server/types/repository-authorization';
import { type ClassificationResidencyInfo, type ScopedRecord, isClassificationCompliant } from './tenant-guard.utils';

export class TenantAccessGuard {
    assertReadable<TRecord extends ScopedRecord>(
        record: TRecord | null | undefined,
        context: RepositoryAuthorizationContext,
        resourceType: string,
    ): TRecord {
        if (!record) {
            throw new RepositoryAuthorizationError('Record not found.');
        }

        this.assertOrg(record.orgId, context, resourceType, 'read');
        this.assertClassification(record, context, resourceType, 'read');
        this.assertResidency(record, context, resourceType, 'read');
        this.validatePii(context, 'read', resourceType, record);

        return record;
    }

    assertWritable(
        recordOrgId: string | null | undefined,
        context: RepositoryAuthorizationContext,
        resourceType: string,
        operation: 'write' | 'update' | 'delete',
    ): void {
        this.assertOrg(recordOrgId, context, resourceType, operation);
        this.assertClassification(context, context, resourceType, operation);
        this.assertResidency(context, context, resourceType, operation);
        this.validatePii(context, operation, resourceType);
    }

    validateDataResidency(
        context: RepositoryAuthorizationContext,
        operation: string,
        resourceType: string,
    ): void {
        this.logSecurityEvent(context, {
            orgId: context.orgId,
            eventType: 'security.data-residency.validation',
            severity: 'info',
            description: `Data residency validation for ${operation} on ${resourceType}`,
            userId: context.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: {
                operation,
                resourceType,
                dataResidency: context.dataResidency,
                dataClassification: context.dataClassification,
                mfaVerified: Boolean(context.mfaVerified),
            },
        });
    }

    validatePii(
        context: RepositoryAuthorizationContext,
        operation: 'read' | 'write' | 'delete' | 'update',
        resourceType: string,
        record?: ScopedRecord,
    ): void {
        if (!context.piiAccessRequired) {
            return;
        }

        const piiPermissions = ['pii:read', 'pii:write', 'pii:delete', 'pii:process'] as const;
        const hasPermission = piiPermissions.some((permission) =>
            Object.values(context.permissions).some((actions) => Array.isArray(actions) && actions.includes(permission)),
        );

        if (!hasPermission) {
            this.logSecurityEvent(context, {
                orgId: context.orgId,
                eventType: 'security.pii-access-denied',
                severity: 'high',
                description: `PII access denied for ${operation} on ${resourceType}`,
                userId: context.userId,
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                metadata: {
                    operation,
                    resourceType,
                    userId: context.userId,
                    sessionId: context.sessionId ?? null,
                    role: context.roleKey,
                },
            });

            throw new RepositoryAuthorizationError(
                `PII access requires explicit permissions. User ${context.userId} lacks required permissions.`,
            );
        }

        const isSensitiveRead =
            operation === 'read' &&
            (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET');

        if (isSensitiveRead && !context.mfaVerified) {
            throw new RepositoryAuthorizationError(
                `MFA verification required for reading PII in ${context.dataClassification} classification`,
            );
        }

        const recordClassification = record?.dataClassification;
        if (recordClassification && !isClassificationCompliant(context.dataClassification, recordClassification)) {
            throw new RepositoryAuthorizationError(
                `Data classification violation: context=${context.dataClassification}, record=${recordClassification}`,
            );
        }
    }

    private assertOrg(
        recordOrgId: string | null | undefined,
        context: RepositoryAuthorizationContext,
        resourceType: string,
        operation: string,
    ): void {
        if (recordOrgId === context.orgId) {
            return;
        }

        const recordOrgIdValue = recordOrgId ?? 'unknown';
        this.logSecurityEvent(context, {
            orgId: context.orgId,
            eventType: 'security.cross-tenant-access-attempt',
            severity: 'critical',
            description: `Cross-tenant ${operation} attempt detected: record orgId ${recordOrgIdValue} vs context orgId ${context.orgId}`,
            userId: context.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            resourceId: recordOrgIdValue,
            resourceType,
            metadata: {
                attemptedOrgId: recordOrgId ?? null,
                authorizedOrgId: context.orgId,
                userId: context.userId,
                sessionId: context.sessionId ?? null,
                role: context.roleKey,
            },
        });

        throw new RepositoryAuthorizationError('Cross-tenant access detected.');
    }

    private assertClassification(
        record: ClassificationResidencyInfo,
        context: RepositoryAuthorizationContext,
        resourceType: string,
        operation: string,
    ): void {
        if (!record.dataClassification) {
            return;
        }

        if (isClassificationCompliant(context.dataClassification, record.dataClassification)) {
            return;
        }

        this.logSecurityEvent(context, {
            orgId: context.orgId,
            eventType: 'security.data-classification.violation',
            severity: 'high',
            description: `Data classification violation on ${operation} for ${resourceType}`,
            userId: context.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: {
                operation,
                resourceType,
                contextClassification: context.dataClassification,
                recordClassification: record.dataClassification ?? null,
            },
        });

        throw new RepositoryAuthorizationError(
            `Data classification violation: context=${context.dataClassification}, record=${record.dataClassification}`,
        );
    }

    private assertResidency(
        record: ClassificationResidencyInfo,
        context: RepositoryAuthorizationContext,
        resourceType: string,
        operation: string,
    ): void {
        if (!record.dataResidency) {
            return;
        }

        const matchesResidency = record.dataResidency === context.dataResidency;
        if (matchesResidency) {
            return;
        }

        this.logSecurityEvent(context, {
            orgId: context.orgId,
            eventType: 'security.data-residency.violation',
            severity: 'high',
            description: `Data residency violation on ${operation} for ${resourceType}`,
            userId: context.userId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: {
                operation,
                resourceType,
                contextResidency: context.dataResidency,
                recordResidency: record.dataResidency ?? null,
            },
        });

        throw new RepositoryAuthorizationError(
            `Data residency violation: context=${context.dataResidency}, record=${record.dataResidency}`,
        );
    }

    private logSecurityEvent(
        context: RepositoryAuthorizationContext,
        input: SecurityEventLogInput,
    ): void {
        if (!context.securityEventLogger) {
            return;
        }
        context.securityEventLogger.logSecurityEvent(input).catch(() => undefined);
    }
}

let sharedGuard: TenantAccessGuard | null = null;

export function getTenantAccessGuard(): TenantAccessGuard {
    sharedGuard ??= new TenantAccessGuard();
    return sharedGuard;
}
