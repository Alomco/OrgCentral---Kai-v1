import { readJson } from '@/server/api-adapters/http/request-utils';
import {
    resolveComplianceControllerDependencies,
    type ComplianceControllerDependencies,
    type ResolvedComplianceControllerDependencies,
} from '@/server/services/hr/compliance/compliance-controller-dependencies';

export {
    readJson,
    resolveComplianceControllerDependencies,
};

export type { ComplianceControllerDependencies, ResolvedComplianceControllerDependencies };
