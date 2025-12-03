import { context as otelContext } from '@opentelemetry/api';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { appLogger } from '@/server/logging/structured-logger';

export interface ServiceExecutionContext {
    authorization: RepositoryAuthorizationContext;
    correlationId?: string;
    metadata?: Record<string, unknown>;
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
            ...context.metadata,
        } satisfies Record<string, unknown>;

        return otelContext.with(telemetryContext, () =>
            this.logger.executeWithSpan(`service.${operationName}`, async () => operation(), spanMetadata),
        );
    }
}
