// src/server/logging/structured-logger.ts

import type { Span, Attributes, Context } from '@opentelemetry/api';
import { trace, context, createContextKey } from '@opentelemetry/api';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import pino, { type Logger } from 'pino';

const TENANT_ID_KEY = createContextKey('tenantId');
const CORRELATION_ID_KEY = createContextKey('correlationId');

const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  messageKey: 'message',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class StructuredLogger {
  private readonly serviceName: string;
  private readonly resourceAttributes: Attributes;
  private readonly logger: Logger;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.resourceAttributes = {
      [ATTR_SERVICE_NAME]: this.serviceName,
    };
    this.logger = baseLogger.child({ service: serviceName });
  }

  createLogContext(tenantId: string, correlationId?: string) {
    const resolvedCorrelationId = correlationId ?? this.generateCorrelationId();
    return context
      .active()
      .setValue(TENANT_ID_KEY, tenantId)
      .setValue(CORRELATION_ID_KEY, resolvedCorrelationId);
  }

  info(message: string, metadata: Record<string, unknown> = {}) {
    this.write('info', message, metadata);
  }

  warn(message: string, metadata: Record<string, unknown> = {}) {
    this.write('warn', message, metadata);
  }

  error(message: string, metadata: Record<string, unknown> = {}) {
    this.write('error', message, metadata);
  }

  debug(message: string, metadata: Record<string, unknown> = {}) {
    this.write('debug', message, metadata);
  }

  startSpan(operationName: string, metadata: Record<string, unknown> = {}): Span {
    const tracer = trace.getTracer(this.serviceName);
    const currentContext = context.active();
    const tenantId = this.getTenantIdFromContext(currentContext);
    const correlationId = this.getCorrelationIdFromContext(currentContext);

    const spanAttributes = {
      ...metadata,
      'service.name': this.serviceName,
      'tenant.id': tenantId,
      'correlation.id': correlationId,
      'operation.name': operationName,
    };

    return tracer.startSpan(operationName, { attributes: spanAttributes }, currentContext);
  }

  async executeWithSpan<T>(
    operationName: string,
    operation: (span: Span) => Promise<T>,
    metadata: Record<string, unknown> = {},
  ): Promise<T> {
    const span = this.startSpan(operationName, metadata);

    try {
      const result = await operation(span);
      span.setStatus({ code: 0 });
      return result;
    } catch (error) {
      const typedError = error as Error;
      span.setStatus({ code: 2, message: typedError.message });
      span.recordException(typedError);
      throw error;
    } finally {
      span.end();
    }
  }

  getTenantIdFromContext(targetContext?: Context): string | undefined {
    const context_ = targetContext ?? context.active();
    return context_.getValue(TENANT_ID_KEY) as string | undefined;
  }

  getCorrelationIdFromContext(targetContext?: Context): string | undefined {
    const context_ = targetContext ?? context.active();
    return context_.getValue(CORRELATION_ID_KEY) as string | undefined;
  }

  private write(level: LogLevel, message: string, metadata: Record<string, unknown>) {
    const currentContext = context.active();
    const tenantId = this.getTenantIdFromContext(currentContext);
    const correlationId = this.getCorrelationIdFromContext(currentContext);

    const entry = {
      ...metadata,
      tenantId,
      correlationId,
      service: this.serviceName,
    };

    this.logger[level](entry, message);
  }

  private generateCorrelationId(): string {
    return `corr-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  }
}

export const appLogger = new StructuredLogger('orgcentral-backend');