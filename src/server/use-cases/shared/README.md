# Shared Use-Case Utilities

This module provides reusable utility functions and types for use-case implementations across the application, ensuring consistency, reducing code duplication, and improving maintainability.

## Overview

The shared utilities are organized into five main categories:

1. **Normalizers** - Data normalization and standardization
2. **Validators** - Validation and assertion utilities
3. **Parsers** - Data parsing and type conversion
4. **Builders** - Object construction helpers
5. **Types** - Common type definitions

## Module Structure

```
src/server/use-cases/shared/
├── index.ts           # Main export file
├── normalizers.ts     # Data normalization utilities
├── validators.ts      # Validation and assertion utilities
├── parsers.ts         # Data parsing utilities
├── builders.ts        # Object construction utilities
└── types.ts           # Common type definitions
```

## Usage

### Import from the Main Index

```typescript
import {
    normalizeHeaders,
    normalizeToken,
    assertNonEmpty,
    parseDate,
    buildAuthorizationContext,
    type Actor,
} from '@/server/use-cases/shared';
```

## Normalizers

Functions that transform data into standardized formats:

- **`normalizeHeaders(headers)`** - Converts HeadersInit to Headers instance
- **`normalizeActor(actor)`** - Validates and normalizes user actor data
- **`normalizeEmploymentType(value)`** - Standardizes employment type strings
- **`normalizeRoles(roles)`** - Normalizes roles and returns a single primary role
- **`normalizeEmail(email)`** - Converts email to lowercase
- **`normalizeString(value)`** - Trims whitespace from strings
- **`normalizeToken(token)`** - Validates and trims tokens

### Example

```typescript
const actor = normalizeActor({ userId: '123', email: 'USER@EXAMPLE.COM' });
// Returns: { userId: '123', email: 'user@example.com' }
```

## Validators

Functions that assert conditions and throw errors on validation failures:

- **`assertNonEmpty(value, fieldName)`** - Ensures value is not empty
- **`assertEmailMatch(actual, expected, context)`** - Validates email equality
- **`assertNotExpired(expiresAt, resourceType, context)`** - Checks expiration
- **`assertStatus(actual, expected, resourceType, context)`** - Validates status
- **`assertAuthenticated(userId, email)`** - Ensures authentication credentials
- **`assertDependency(dependency, name)`** - Type guard for required dependencies
- **`assertNonEmptyArray(array, fieldName)`** - Validates non-empty arrays
- **`assertInSet(value, allowedValues, fieldName)`** - Validates value in set

### Example

```typescript
assertNonEmpty(token, 'Invitation token');
assertNotExpired(invitation.expiresAt, 'Invitation', { token });
```

## Parsers

Functions that parse and convert data types:

- **`parseDate(value)`** - Parses Date from string or Date object
- **`parseDateWithDefault(value, defaultValue)`** - Parses with fallback
- **`parseISODate(value)`** - Parses ISO date strings
- **`parseNumber(value)`** - Converts to number
- **`parseInteger(value)`** - Converts to integer
- **`parseBoolean(value)`** - Converts to boolean
- **`parseJSON(value)`** - Parses JSON string
- **`parseCSV(value)`** - Splits CSV strings into arrays

### Example

```typescript
const startDate = parseDate(input.startDate);
const employeeCount = parseInteger(input.count);
```

## Builders

Functions that construct complex objects:

- **`buildAuthorizationContext(options)`** - Creates repository auth context
- **`buildMetadata(data)`** - Creates Prisma JSON metadata
- **`buildTimestamps(now?)`** - Generates timestamp fields
- **`buildUpdateTimestamp(now?)`** - Generates update timestamp
- **`generateEmployeeNumber(prefix?)`** - Creates unique employee numbers
- **`generatePrefixedId(prefix)`** - Creates prefixed unique IDs
- **`buildDefaults(input, defaults)`** - Merges with defaults
- **`compactObject(object)`** - Removes undefined/null values
- **`mergeObjects(...objects)`** - Merges multiple objects

### Example

```typescript
const authContext = buildAuthorizationContext({
    orgId: organization.id,
    userId: user.id,
    dataResidency: tenantScope.dataResidency,
    dataClassification: tenantScope.dataClassification,
    auditSource: 'accept-invitation',
    tenantScope,
});
```

## Types

Common type definitions used across use-cases:

- **`Actor`** - User actor with userId and email
- **`SuccessResult<T>`** - Standard success response wrapper
- **`PaginationInput`** / **`PaginationResult<T>`** - Pagination interfaces
- **`FilterInput`** - Common filter criteria
- **`EmploymentType`** - Employment type enum
- **`Metadata`** - Generic metadata structure
- **`Timestamps`** - Created/updated timestamps
- **`NetworkMetadata`** - IP address and user agent
- **`RequestContext`** - Common request context fields
- **`OperationResult<T, E>`** - Success/error union type

### Example

```typescript
export interface MyUseCaseResult extends SuccessResult<MyData> {
    actor: Actor;
    metadata: NetworkMetadata;
}
```

## Benefits

### Code Reusability
- Eliminates duplicate validation, normalization, and parsing logic
- Single source of truth for common operations
- Easier to maintain and update shared behavior

### Type Safety
- Strong typing throughout all utilities
- Type guards and assertions for runtime safety
- Better IDE autocomplete and type checking

### Consistency
- Standardized error messages and validation behavior
- Uniform data transformations across the application
- Predictable function signatures and return types

### Testability
- Small, focused functions are easier to unit test
- Mocking dependencies is simpler with shared utilities
- Reduces test duplication across use-cases

### Maintainability
- Changes to shared logic only need to be made once
- Clear separation of concerns
- Self-documenting through function and parameter names

## Migration Guide

When refactoring existing use-cases to use shared utilities:

1. **Identify duplicate logic** - Look for repeated normalization, validation, or parsing
2. **Import shared utilities** - Add imports from `@/server/use-cases/shared`
3. **Replace inline functions** - Replace local implementations with shared versions
4. **Update tests** - Ensure tests still pass after refactoring
5. **Run linting** - Fix any linting issues that arise

### Before

```typescript
function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function assertNonEmpty(value: string, field: string): void {
    if (!value?.trim()) {
        throw new ValidationError(`${field} is required`);
    }
}

// ... use in function
```

### After

```typescript
import { normalizeEmail, assertNonEmpty } from '@/server/use-cases/shared';

// ... use in function
```

## Best Practices

1. **Always validate input** - Use validators before processing data
2. **Normalize early** - Normalize data at the entry point of use-cases
3. **Parse with care** - Handle undefined/null cases explicitly
4. **Build consistently** - Use builders for complex object construction
5. **Type everything** - Leverage TypeScript for compile-time safety

## Contributing

When adding new shared utilities:

1. Place them in the appropriate category file
2. Add JSDoc comments explaining purpose and usage
3. Export from `index.ts` for easy importing
4. Update this README with the new utility
5. Ensure linting and type checking pass
6. Write unit tests for the new utility

## Examples from Codebase

### Accept Invitation Use-Case

```typescript
import {
    normalizeActor,
    normalizeToken,
    normalizeRoles,
    normalizeEmploymentType,
    assertEmailMatch,
    assertNotExpired,
    assertStatus,
    parseDate,
    buildAuthorizationContext,
} from '@/server/use-cases/shared';

export async function acceptInvitation(deps, input) {
    const token = normalizeToken(input.token);
    const actor = normalizeActor(input.actor);
    
    // Validation
    assertStatus(record.status, 'pending', 'Invitation', { token });
    assertNotExpired(record.expiresAt, 'Invitation', { token });
    assertEmailMatch(actorEmail, record.targetEmail, 'Email mismatch');
    
    // Processing
    const roles = normalizeRoles(record.onboardingData.roles);
    const startDate = parseDate(record.onboardingData.startDate);
    
    return { success: true, /* ... */ };
}
```

### Get Session Use-Case

```typescript
import { normalizeHeaders, buildMetadata } from '@/server/use-cases/shared';

export async function getSessionContext(deps, input) {
    const headers = normalizeHeaders(input.headers);
    
    const metadata = buildMetadata({
        activeOrganizationId: session.session.activeOrganizationId,
        residency: metadataInput.dataResidency,
        classification: metadataInput.dataClassification,
    });
    
    return { session, authorization };
}
```

## Related Documentation

- [Use-Case Layer Architecture](../../../docs/backend-migration-plan.md)
- [Repository Pattern](../../repositories/README.md)
- [Security Guards](../../security/guards.ts)
- [Structured Logging](../../../docs/structured-logging-setup.md)

---

**Module Version:** 1.0.0  
**Last Updated:** November 2025  
**Maintainer:** OrgCentral Backend Team
