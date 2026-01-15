import { AuthorizationError, type ErrorDetails } from '@/server/errors';

export class RepositoryAuthorizationError extends AuthorizationError {
    constructor(message: string, options?: { cause?: unknown }) {
        const details: ErrorDetails =
            options?.cause === undefined ? undefined : { cause: options.cause };
        super(message, details);
        this.name = 'RepositoryAuthorizationError';
    }
}
