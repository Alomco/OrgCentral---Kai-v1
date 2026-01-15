import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SecureTenantScopedRecord } from '@/server/types/repository-authorization';
import type { JsonValue } from '@/server/types/json';
import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';
import { applyPiiProtection } from './pii-detection-protection-guards.helpers';

export interface PiiDetectionResult {
  hasPii: boolean;
  piiTypes: string[];
  confidence: number; // 0-100
  locations: string[]; // Where in the data PII was found
}

export interface PiiProtectionResult {
  isProtected: boolean;
  protectionApplied: string[];
  originalData: JsonValue;
  protectedData: JsonValue;
}

/**
 * Detects PII in various data structures
 */
export function detectPii(data: JsonValue | undefined, context?: RepositoryAuthorizationContext): PiiDetectionResult {
  const piiTypes: string[] = [];
  const locations: string[] = [];
  let hasPii = false;

  // Check for various PII patterns
  if (typeof data === 'string') {
    // Check for email addresses
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(data)) {
      piiTypes.push('email');
      locations.push('string_value');
      hasPii = true;
    }

    // Check for phone numbers
    if (/\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(data)) {
      piiTypes.push('phone');
      locations.push('string_value');
      hasPii = true;
    }

    // Check for potential SSNs (US format) or similar
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(data)) {
      piiTypes.push('ssn');
      locations.push('string_value');
      hasPii = true;
    }

    // Check for potential UK postcodes
    if (/[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}/i.test(data)) {
      piiTypes.push('uk_postcode');
      locations.push('string_value');
      hasPii = true;
    }

    // Check for potential credit card numbers
    if (/\b(?:\d{4}[-\s]?){3}\d{4}\b|\b(?:\d{4}[-\s]?){2}\d{7}\b/.test(data.replace(/\s/g, ''))) {
      piiTypes.push('credit_card');
      locations.push('string_value');
      hasPii = true;
    }
  } else if (Array.isArray(data)) {
    data.forEach((value, index) => {
      const result = detectPii(value, context);
      if (result.hasPii) {
        hasPii = true;
        result.piiTypes.forEach(type => {
          if (!piiTypes.includes(type)) {
            piiTypes.push(type);
          }
        });
        result.locations.forEach(location => {
          locations.push(`${String(index)}.${location}`);
        });
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    // Recursively check object properties
    for (const [key, value] of Object.entries(data as Record<string, JsonValue | undefined>)) {
      const result = detectPii(value, context);
      if (result.hasPii) {
        hasPii = true;
        result.piiTypes.forEach(type => {
          if (!piiTypes.includes(type)) {
            piiTypes.push(type);
          }
        });
        result.locations.forEach(location => {
          locations.push(`${key}.${location}`);
        });
      }
    }
  }

  return {
    hasPii,
    piiTypes: Array.from(new Set(piiTypes)), // Remove duplicates
    confidence: hasPii ? 90 : 0, // Simplified confidence calculation
    locations: Array.from(new Set(locations)), // Remove duplicates
  };
}

/**
 * Applies protection to data containing PII
 */
export function protectPii(data: JsonValue, protectionLevel: 'mask' | 'encrypt' | 'tokenize' = 'mask'): PiiProtectionResult {
  const originalData = JSON.parse(JSON.stringify(data)) as JsonValue;
  const protectionApplied: string[] = [];
  const protectedData = applyPiiProtection(
    JSON.parse(JSON.stringify(data)) as JsonValue,
    protectionLevel,
    protectionApplied,
  );

  return {
    isProtected: protectionApplied.length > 0,
    protectionApplied,
    originalData,
    protectedData,
  };
}

/**
 * Validates that a record doesn't contain unauthorized PII
 */
export function validatePiiAccess(
  context: RepositoryAuthorizationContext,
  record: SecureTenantScopedRecord,
  operation: 'read' | 'write' | 'delete' | 'update'
): void {
  // Check if this is a PII-sensitive operation
  if (context.piiAccessRequired || record.piiDetected) {
    // Verify the user has appropriate permissions for PII access
    const piiPermissions = ['pii:read', 'pii:write', 'pii:delete', 'pii:process'];
    const hasPiiPermission = piiPermissions.some(permission =>
      Object.values(context.permissions).some(actions =>
        actions?.includes(permission) ?? false
      )
    );

    if (!hasPiiPermission) {
      throw new RepositoryAuthorizationError(
        `Access to PII data requires explicit PII permissions. User ${context.userId} lacks required permissions.`
      );
    }

    // For read operations on PII-sensitive records, ensure additional security measures
    if (operation === 'read' && (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET')) {
      if (!context.mfaVerified) {
        throw new RepositoryAuthorizationError(
          `MFA verification required for reading PII in ${context.dataClassification} classification`
        );
      }
    }
  }
}

/**
 * Guard function that throws an error if PII validation fails
 */
export function assertPiiCompliance(
  context: RepositoryAuthorizationContext,
  data: JsonValue,
  operation: 'read' | 'write' | 'delete' | 'update'
): void {
  const piiDetection = detectPii(data, context);

  if (piiDetection.hasPii) {
    // Mark that PII access is required for this operation without mutating the original context
    const contextWithPii: RepositoryAuthorizationContext = {
      ...context,
      piiAccessRequired: true,
    };

    // Validate access permissions
    validatePiiAccess(contextWithPii, {
      orgId: context.orgId,
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
      piiDetected: true,
    }, operation);

    // For write operations, ensure data is properly protected
    if (operation === 'write' && context.dataClassification !== 'OFFICIAL') {
      // For non-OFFICIAL classifications, ensure PII is protected
      const protectionResult = protectPii(data, 'mask');
      if (protectionResult.isProtected) {
        // Update the data with protection applied
        if (
          typeof data === 'object' && data !== null &&
          typeof protectionResult.protectedData === 'object' &&
          protectionResult.protectedData !== null
        ) {
          Object.assign(
            data as Record<string, JsonValue>,
            protectionResult.protectedData as Record<string, JsonValue>,
          );
        }
      }
    }
  }
}

/**
 * Creates a PII-safe version of data for logging or transmission
 */
export function createPiiSafeCopy(data: JsonValue): JsonValue {
  const protectionResult = protectPii(data, 'mask');
  return protectionResult.protectedData;
}
