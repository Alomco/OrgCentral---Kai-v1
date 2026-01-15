import { SecurityIncidentResponseService } from './incident-response-service';
import type { IncidentResponseServiceOptions } from './incident-types';

let sharedService: SecurityIncidentResponseService | null = null;

export type SecurityIncidentResponseServiceContract = Pick<
    SecurityIncidentResponseService,
    | 'reportIncident'
    | 'updateIncident'
    | 'assignIncident'
    | 'updateIncidentStatus'
    | 'escalateIncident'
    | 'addEvidenceToIncident'
    | 'registerWorkflow'
    | 'getWorkflow'
>;

export function getSecurityIncidentResponseService(
    options?: IncidentResponseServiceOptions,
): SecurityIncidentResponseService {
    if (!sharedService || options) {
        const service = new SecurityIncidentResponseService(options);
        if (!options) {
            sharedService = service;
        }
        return service;
    }

    return sharedService;
}
