import type { DataResidencyZone, DataClassificationLevel } from '@/server/types/tenant';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';
import {
  isClassificationCompliant,
  isResidencyCompliant,
  isUKIPAddress,
  isUKOrEEAIPAddress,
  requiresMfaForClassification,
} from './data-residency-validation-guards.helpers';

const DEFAULT_OPERATION_DESCRIPTION = 'data operation';

export interface DataResidencyValidationResult {
  isValid: boolean;
  violations: string[];
  suggestedRemediation: string[];
}

/**
 * Validates that data residency requirements are met for a given operation
 */
export function validateDataResidency(
  context: RepositoryAuthorizationContext,
  requiredResidency?: DataResidencyZone,
  operationDescription = DEFAULT_OPERATION_DESCRIPTION
): DataResidencyValidationResult {
  const violations: string[] = [];
  const suggestedRemediation: string[] = [];
  const ipAddress = context.ipAddress ?? '';

  // Check if the current data residency meets the required residency
  if (requiredResidency) {
    if (!isResidencyCompliant(context.dataResidency, requiredResidency)) {
      violations.push(
        `Data residency violation: Operation '${operationDescription}' requires ${requiredResidency} but current residency is ${context.dataResidency}`
      );
      suggestedRemediation.push(
        `Move data to compliant region (${requiredResidency}) or adjust operational requirements`
      );
    }
  }

  // Additional validation for specific residency zones
  switch (context.dataResidency) {
    case 'UK_ONLY':
      // Ensure no data is processed outside UK
      if (ipAddress.length > 0 && !ipAddress.includes('.uk') && !isUKIPAddress(ipAddress)) {
        violations.push(
          `UK-only residency violation: Operation initiated from non-UK IP address ${ipAddress}`
        );
        suggestedRemediation.push('Ensure operations are performed from UK-based systems');
      }
      break;

    case 'UK_AND_EEA':
      // Ensure data is not processed outside UK or EEA
      if (ipAddress.length > 0 && !isUKOrEEAIPAddress(ipAddress)) {
        violations.push(
          `UK-EEA residency violation: Operation initiated from non-UK/EEA IP address ${ipAddress}`
        );
        suggestedRemediation.push('Ensure operations are performed from UK or EEA-based systems');
      }
      break;

    case 'GLOBAL_RESTRICTED':
      // For global restricted, ensure sensitive data is handled appropriately
      if (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET') {
        violations.push(
          `Global restricted residency violation: Highly classified data (${context.dataClassification}) should not be processed in GLOBAL_RESTRICTED zone`
        );
        suggestedRemediation.push('Move highly classified data to more restrictive residency zone');
      }
      break;
  }

  return {
    isValid: violations.length === 0,
    violations,
    suggestedRemediation,
  };
}

/**
 * Validates data classification requirements for an operation
 */
export function validateDataClassification(
  context: RepositoryAuthorizationContext,
  requiredClassification?: DataClassificationLevel,
  operationDescription = DEFAULT_OPERATION_DESCRIPTION
): DataResidencyValidationResult {
  const violations: string[] = [];
  const suggestedRemediation: string[] = [];

  // Check if the current classification meets or exceeds the required classification
  if (requiredClassification) {
    if (!isClassificationCompliant(context.dataClassification, requiredClassification)) {
      violations.push(
        `Data classification violation: Operation '${operationDescription}' requires minimum ${requiredClassification} but current classification is ${context.dataClassification}`
      );
      suggestedRemediation.push(
        `Apply appropriate security controls for ${requiredClassification} classification or adjust operational requirements`
      );
    }
  }

  appendClassificationViolations(context, violations, suggestedRemediation);

  return {
    isValid: violations.length === 0,
    violations,
    suggestedRemediation,
  };
}

/**
 * Validates both data residency and classification requirements
 */
export function validateDataCompliance(
  context: RepositoryAuthorizationContext,
  requiredResidency?: DataResidencyZone,
  requiredClassification?: DataClassificationLevel,
  operationDescription = DEFAULT_OPERATION_DESCRIPTION
): DataResidencyValidationResult {
  const residencyValidation = validateDataResidency(context, requiredResidency, operationDescription);
  const classificationValidation = validateDataClassification(context, requiredClassification, operationDescription);

  return {
    isValid: residencyValidation.isValid && classificationValidation.isValid,
    violations: [...residencyValidation.violations, ...classificationValidation.violations],
    suggestedRemediation: [...residencyValidation.suggestedRemediation, ...classificationValidation.suggestedRemediation],
  };
}


/**
 * Guard function that throws an error if data compliance validation fails
 */
export function assertDataCompliance(
  context: RepositoryAuthorizationContext,
  requiredResidency?: DataResidencyZone,
  requiredClassification?: DataClassificationLevel,
  operationDescription = DEFAULT_OPERATION_DESCRIPTION
): void {
  const validationResult = validateDataCompliance(context, requiredResidency, requiredClassification, operationDescription);

  if (!validationResult.isValid) {
    throw new RepositoryAuthorizationError(
      `Data compliance validation failed: ${validationResult.violations.join('; ')}`
    );
  }
}

function appendClassificationViolations(
  context: RepositoryAuthorizationContext,
  violations: string[],
  suggestedRemediation: string[],
): void {
  switch (context.dataClassification) {
    case 'OFFICIAL':
      if (!context.mfaVerified && requiresMfaForClassification(context.dataClassification)) {
        violations.push(
          'OFFICIAL classification violation: MFA required for access to OFFICIAL data but not verified',
        );
        suggestedRemediation.push('Enable and verify MFA for access to OFFICIAL data');
      }
      break;

    case 'OFFICIAL_SENSITIVE':
      if (!context.mfaVerified) {
        violations.push(
          'OFFICIAL_SENSITIVE classification violation: MFA required for access to OFFICIAL_SENSITIVE data but not verified',
        );
        suggestedRemediation.push('Enable and verify MFA for access to OFFICIAL_SENSITIVE data');
      }
      if (!context.requiresMfa) {
        violations.push(
          'OFFICIAL_SENSITIVE classification violation: MFA requirement not properly set for OFFICIAL_SENSITIVE data access',
        );
        suggestedRemediation.push('Ensure MFA is required for OFFICIAL_SENSITIVE data access');
      }
      break;

    case 'SECRET':
      if (!context.mfaVerified) {
        violations.push(
          'SECRET classification violation: MFA required for access to SECRET data but not verified',
        );
        suggestedRemediation.push('Enable and verify MFA for access to SECRET data');
      }
      if (!context.requiresMfa) {
        violations.push(
          'SECRET classification violation: MFA requirement not properly set for SECRET data access',
        );
        suggestedRemediation.push('Ensure MFA is required for SECRET data access');
      }
      if (context.dataResidency === 'GLOBAL_RESTRICTED') {
        violations.push(
          'SECRET classification violation: SECRET data should not be stored in GLOBAL_RESTRICTED residency zone',
        );
        suggestedRemediation.push('Move SECRET data to more restrictive residency zone (UK_ONLY or UK_AND_EEA)');
      }
      break;

    case 'TOP_SECRET':
      if (!context.mfaVerified) {
        violations.push(
          'TOP_SECRET classification violation: MFA required for access to TOP_SECRET data but not verified',
        );
        suggestedRemediation.push('Enable and verify MFA for access to TOP_SECRET data');
      }
      if (!context.requiresMfa) {
        violations.push(
          'TOP_SECRET classification violation: MFA requirement not properly set for TOP_SECRET data access',
        );
        suggestedRemediation.push('Ensure MFA is required for TOP_SECRET data access');
      }
      if (context.dataResidency !== 'UK_ONLY') {
        violations.push(
          `TOP_SECRET classification violation: TOP_SECRET data must be stored in UK_ONLY residency zone but is in ${context.dataResidency}`,
        );
        suggestedRemediation.push('Move TOP_SECRET data to UK_ONLY residency zone');
      }
      break;
  }
}
