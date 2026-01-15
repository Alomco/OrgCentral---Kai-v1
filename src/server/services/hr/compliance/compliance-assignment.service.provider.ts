import { ComplianceAssignmentService, type ComplianceAssignmentServiceDependencies } from './compliance-assignment-service';
import { buildComplianceAssignmentServiceDependencies, type ComplianceAssignmentServiceDependencyOptions } from '@/server/repositories/providers/hr/compliance-assignment-service-dependencies';

export interface ComplianceAssignmentServiceProviderOptions {
    prismaOptions?: ComplianceAssignmentServiceDependencyOptions['prismaOptions'];
}

const sharedComplianceAssignmentService = (() => {
    const dependencies = buildComplianceAssignmentServiceDependencies();
    return new ComplianceAssignmentService(dependencies);
})();

export function getComplianceAssignmentService(
    overrides?: Partial<ComplianceAssignmentServiceDependencies>,
    options?: ComplianceAssignmentServiceDependencyOptions,
): ComplianceAssignmentService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedComplianceAssignmentService;
    }

    const dependencies = buildComplianceAssignmentServiceDependencies({
        prismaOptions: options?.prismaOptions,
        overrides,
    });

    return new ComplianceAssignmentService(dependencies);
}

export type ComplianceAssignmentServiceContract = Pick<ComplianceAssignmentService, 'assignCompliancePack'>;
