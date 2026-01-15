import { context as otelContext } from '@opentelemetry/api';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { appLogger } from '@/server/logging/structured-logger';
import { getSecurityEventService } from './security/security-event-service.provider';
import type { EnhancedSecurityContext } from '@/server/types/enhanced-security-types';

export interface ServiceExecutionContext {
    authorization: RepositoryAuthorizationContext;
    correlationId?: string;
    metadata?: Record<string, unknown>;
    securityContext?: EnhancedSecurityContext;
}

export abstract class AbstractBaseService {
    protected readonly logger = appLogger;

    protected async executeInServiceContext<T>(
        context: ServiceExecutionContext,
        operationName: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        const telemetryContext = this.logger.createLogContext(
            context.authorization.orgId,
            context.correlationId,
        );
        const spanMetadata = {
            orgId: context.authorization.orgId,
            userId: context.authorization.userId,
            operation: operationName,
            dataClassification: context.authorization.dataClassification,
            dataResidency: context.authorization.dataResidency,
            mfaVerified: context.authorization.mfaVerified,
            requiresMfa: context.authorization.requiresMfa,
            piiAccessRequired: context.authorization.piiAccessRequired,
            ...context.metadata,
        } satisfies Record<string, unknown>;

        // Log security event for service operation
        await this.logServiceOperation(context, operationName);

        return otelContext.with(telemetryContext, async () => {
            try {
                const result = await this.logger.executeWithSpan(`service.${operationName}`, async () => operation(), spanMetadata);

                // Log successful operation
                await this.logServiceOperationSuccess(context, operationName);

                return result;
            } catch (error) {
                // Log failed operation
                await this.logServiceOperationFailure(context, operationName, error);

                // Re-throw the error
                throw error;
            }
        });
    }

    private async logServiceOperation(context: ServiceExecutionContext, operationName: string): Promise<void> {
        // Only log if security context is available and operation is sensitive
        if (context.securityContext ||
            context.authorization.piiAccessRequired ||
            context.authorization.dataBreachRisk ||
            context.authorization.dataClassification === 'SECRET' ||
            context.authorization.dataClassification === 'TOP_SECRET') {

            await getSecurityEventService().logSecurityEvent({
                orgId: context.authorization.orgId,
                eventType: 'service.operation.started',
                severity: 'info',
                description: `Service operation started: ${operationName}`,
                userId: context.authorization.userId,
                ipAddress: context.authorization.ipAddress,
                userAgent: context.authorization.userAgent,
                resourceId: operationName,
                resourceType: 'service_operation',
                piiAccessed: context.authorization.piiAccessRequired,
                dataClassification: context.authorization.dataClassification,
                dataResidency: context.authorization.dataResidency,
                metadata: {
                    operationName,
                    sessionId: context.authorization.sessionId ?? null,
                    role: context.authorization.roleKey,
                    mfaVerified: context.authorization.mfaVerified ?? null,
                },
            });
        }
    }

    private async logServiceOperationSuccess(context: ServiceExecutionContext, operationName: string): Promise<void> {
        // Only log if security context is available and operation is sensitive
        if (context.securityContext ||
            context.authorization.piiAccessRequired ||
            context.authorization.dataBreachRisk ||
            context.authorization.dataClassification === 'SECRET' ||
            context.authorization.dataClassification === 'TOP_SECRET') {

            await getSecurityEventService().logSecurityEvent({
                orgId: context.authorization.orgId,
                eventType: 'service.operation.completed',
                severity: 'info',
                description: `Service operation completed successfully: ${operationName}`,
                userId: context.authorization.userId,
                ipAddress: context.authorization.ipAddress,
                userAgent: context.authorization.userAgent,
                resourceId: operationName,
                resourceType: 'service_operation',
                piiAccessed: context.authorization.piiAccessRequired,
                dataClassification: context.authorization.dataClassification,
                dataResidency: context.authorization.dataResidency,
                metadata: {
                    operationName,
                    sessionId: context.authorization.sessionId ?? null,
                    role: context.authorization.roleKey,
                    mfaVerified: context.authorization.mfaVerified ?? null,
                },
            });
        }
    }

    private async logServiceOperationFailure(context: ServiceExecutionContext, operationName: string, error: unknown): Promise<void> {
        // Always log operation failures for security auditing
        await getSecurityEventService().logSecurityEvent({
            orgId: context.authorization.orgId,
            eventType: 'service.operation.failed',
            severity: 'high',
            description: `Service operation failed: ${operationName} - ${error instanceof Error ? error.message : 'Unknown error'}`,
            userId: context.authorization.userId,
            ipAddress: context.authorization.ipAddress,
            userAgent: context.authorization.userAgent,
            resourceId: operationName,
            resourceType: 'service_operation',
            piiAccessed: context.authorization.piiAccessRequired,
            dataClassification: context.authorization.dataClassification,
            dataResidency: context.authorization.dataResidency,
            metadata: {
                operationName,
                sessionId: context.authorization.sessionId ?? null,
                role: context.authorization.roleKey,
                mfaVerified: context.authorization.mfaVerified ?? null,
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                } : { value: String(error) },
            },
        });
    }
}
