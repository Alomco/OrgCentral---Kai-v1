import { BaseTypedError, type ErrorDetails } from './base-error';

export { BaseTypedError } from './base-error';
export type { ErrorDetails } from './base-error';

export class EntityNotFoundError extends BaseTypedError {
    constructor(entity: string, details?: ErrorDetails) {
        super(`${entity} not found`, 'ENTITY_NOT_FOUND', details);
    }
}

export class ValidationError extends BaseTypedError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

export class AuthorizationError extends BaseTypedError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 'AUTHORIZATION_ERROR', details);
    }
}

export class InfrastructureError extends BaseTypedError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 'INFRASTRUCTURE_ERROR', details);
    }
}

export class ConflictError extends BaseTypedError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 'CONFLICT_ERROR', details);
    }
}

export class RateLimitError extends BaseTypedError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 'RATE_LIMIT_EXCEEDED', details);
    }
}

export {
    AbsenceAlreadyClosedError,
    AbsenceAnalysisInProgressError,
    AbsenceAttachmentNotFoundError,
    AbsenceAttachmentTypeError,
    AbsenceAttachmentSizeError,
} from './hr-absences';

export { LeavePolicyInUseError } from './hr-leave-policies';
