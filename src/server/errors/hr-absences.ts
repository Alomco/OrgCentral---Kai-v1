import { BaseTypedError, type ErrorDetails } from './base-error';

export class AbsenceAlreadyClosedError extends BaseTypedError {
    constructor(details?: ErrorDetails) {
        super('Absence is already closed.', 'ABSENCE_ALREADY_CLOSED', details);
    }
}

export class AbsenceAnalysisInProgressError extends BaseTypedError {
    constructor(details?: ErrorDetails) {
        super('Absence analysis already completed. Re-run requires force flag.', 'ABSENCE_ANALYSIS_IN_PROGRESS', details);
    }
}

export class AbsenceAttachmentNotFoundError extends BaseTypedError {
    constructor(message = 'No attachment found for AI validation.', details?: ErrorDetails) {
        super(message, 'ABSENCE_ATTACHMENT_NOT_FOUND', details);
    }
}

export class AbsenceAttachmentTypeError extends BaseTypedError {
    constructor(contentType: string, details?: ErrorDetails) {
        super('Attachment type is not supported for validation.', 'ABSENCE_ATTACHMENT_TYPE_UNSUPPORTED', {
            contentType,
            ...details,
        });
    }
}

export class AbsenceAttachmentSizeError extends BaseTypedError {
    constructor(actualBytes: number, maxBytes: number, details?: ErrorDetails) {
        super('Attachment exceeds the maximum size for validation.', 'ABSENCE_ATTACHMENT_TOO_LARGE', {
            actualBytes,
            maxBytes,
            ...details,
        });
    }
}
