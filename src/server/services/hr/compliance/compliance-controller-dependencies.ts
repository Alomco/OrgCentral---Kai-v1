import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { IComplianceCategoryRepository } from '@/server/repositories/contracts/hr/compliance/compliance-category-repository-contract';
import type { IComplianceTemplateRepository } from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import {
    getComplianceAssignmentService,
    type ComplianceAssignmentServiceContract,
} from '@/server/services/hr/compliance/compliance-assignment.service.provider';

export interface ResolvedComplianceControllerDependencies {
    session: GetSessionDependencies;
    complianceItemRepository: IComplianceItemRepository;
    complianceCategoryRepository: IComplianceCategoryRepository;
    complianceTemplateRepository: IComplianceTemplateRepository;
    assignmentService: ComplianceAssignmentServiceContract;
}

export type ComplianceControllerDependencies = Partial<ResolvedComplianceControllerDependencies>;

const {
    complianceItemRepository,
    complianceCategoryRepository,
    complianceTemplateRepository,
} = buildComplianceRepositoryDependencies();
const assignmentService = getComplianceAssignmentService();

const defaultComplianceControllerDependencies: ResolvedComplianceControllerDependencies = {
    session: {},
    complianceItemRepository,
    complianceCategoryRepository,
    complianceTemplateRepository,
    assignmentService,
};

export function resolveComplianceControllerDependencies(
    overrides?: ComplianceControllerDependencies,
): ResolvedComplianceControllerDependencies {
    if (!overrides) {
        return defaultComplianceControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultComplianceControllerDependencies.session,
        complianceItemRepository:
            overrides.complianceItemRepository ?? defaultComplianceControllerDependencies.complianceItemRepository,
        complianceCategoryRepository:
            overrides.complianceCategoryRepository ?? defaultComplianceControllerDependencies.complianceCategoryRepository,
        complianceTemplateRepository:
            overrides.complianceTemplateRepository ?? defaultComplianceControllerDependencies.complianceTemplateRepository,
        assignmentService: overrides.assignmentService ?? defaultComplianceControllerDependencies.assignmentService,
    };
}
