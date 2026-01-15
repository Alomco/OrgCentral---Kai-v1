/**
 * TODO: Refactor this file (currently > 250 LOC).
 * Action: Split into smaller modules and ensure adherence to SOLID principles, Dependency Injection, and Design Patterns.
 */
export {
    RepositoryAuthorizer,
    enforcePermission,
    getRepositoryAuthorizer,
    withRepositoryAuthorization,
} from './repository-authorizer';
export { toRepositoryAuthorizationError } from './repository-authorization.helpers';
