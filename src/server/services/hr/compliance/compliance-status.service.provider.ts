import { ComplianceStatusService, type ComplianceStatusServiceDependencies } from '@/server/services/hr/compliance/compliance-status-service';
import { createComplianceStatusRepository } from '@/server/repositories/providers/hr/compliance-status-repository-provider';

const complianceStatusRepository = createComplianceStatusRepository();

const defaultDependencies: ComplianceStatusServiceDependencies = {
  complianceStatusRepository,
};

const sharedComplianceStatusService = new ComplianceStatusService(defaultDependencies);

export function getComplianceStatusService(
  overrides?: Partial<ComplianceStatusServiceDependencies>,
): ComplianceStatusService {
  if (!overrides || Object.keys(overrides).length === 0) {
    return sharedComplianceStatusService;
  }

  return new ComplianceStatusService({
    ...defaultDependencies,
    ...overrides,
  });
}

export type ComplianceStatusServiceContract = Pick<ComplianceStatusService, 'getStatusForUser'>;
