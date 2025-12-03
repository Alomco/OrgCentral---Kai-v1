/**
 * Shared utilities for use-cases.
 * Provides reusable functions for normalization, validation, parsing, and building objects.
 * 
 * @module @/server/use-cases/shared
 */

// Normalizers
export {
    normalizeHeaders,
    normalizeActor,
    normalizeEmploymentType,
    normalizeRoles,
    normalizeEmail,
    normalizeString,
    normalizeToken,
    type NormalizedActor,
    type EmploymentType as NormalizedEmploymentType,
} from './normalizers';

// Validators
export {
    assertNonEmpty,
    assertEmailMatch,
    assertNotExpired,
    assertStatus,
    assertAuthenticated,
    assertDependency,
    assertNonEmptyArray,
    assertInSet,
} from './validators';

// Parsers
export {
    parseDate,
    parseDateWithDefault,
    parseISODate,
    parseNumber,
    parseInteger,
    parseBoolean,
    parseJSON,
    parseCSV,
} from './parsers';

// Builders
export {
    buildAuthorizationContext,
    buildMetadata,
    buildTimestamps,
    buildUpdateTimestamp,
    generateEmployeeNumber,
    generatePrefixedId,
    buildDefaults,
    compactObject,
    mergeObjects,
    type BuildAuthContextOptions,
    type TimestampFields,
} from './builders';

// Types
export type {
    SuccessResult,
    Actor,
    PaginationInput,
    PaginationResult,
    FilterInput,
    EmploymentType,
    Metadata,
    Timestamps,
    SoftDelete,
    AuditFields,
    NetworkMetadata,
    RequestContext,
    OperationResult,
    Nullable,
    PartialBy,
    RequiredBy,
} from './types';
