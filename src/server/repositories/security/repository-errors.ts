export class RepositoryAuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RepositoryAuthorizationError';
    }
}
