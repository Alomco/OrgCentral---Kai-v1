import { securityConfigProvider } from '../security-configuration-provider';
import type { IncidentResponseWorkflow } from './incident-types';
import { IncidentSeverity } from './incident-types';

export function createDefaultWorkflows(): IncidentResponseWorkflow[] {
    const defaultOrgConfig = securityConfigProvider.getOrgConfig('default');

    return [
        {
            id: 'critical-incident-workflow',
            name: 'Critical Incident Response',
            description: 'Response workflow for critical security incidents',
            severity: IncidentSeverity.Critical,
            steps: [
                {
                    id: 'step1',
                    name: 'Initial Assessment',
                    description: 'Quick assessment of the incident scope and impact',
                    required: true,
                    completed: false,
                    dependencies: [],
                },
                {
                    id: 'step2',
                    name: 'Incident Commander Assigned',
                    description: 'Assign an incident commander to lead response efforts',
                    required: true,
                    completed: false,
                    dependencies: ['step1'],
                },
                {
                    id: 'step3',
                    name: 'Communication Plan Activated',
                    description: 'Activate internal and external communication plans',
                    required: true,
                    completed: false,
                    dependencies: ['step2'],
                },
                {
                    id: 'step4',
                    name: 'Containment Measures Implemented',
                    description: 'Implement immediate containment measures',
                    required: true,
                    completed: false,
                    dependencies: ['step3'],
                },
                {
                    id: 'step5',
                    name: 'Eradication Steps Executed',
                    description: 'Execute steps to eliminate the threat',
                    required: true,
                    completed: false,
                    dependencies: ['step4'],
                },
                {
                    id: 'step6',
                    name: 'Recovery Plan Executed',
                    description: 'Execute recovery plan to restore normal operations',
                    required: true,
                    completed: false,
                    dependencies: ['step5'],
                },
                {
                    id: 'step7',
                    name: 'Lessons Learned Documented',
                    description: 'Document lessons learned and update procedures',
                    required: true,
                    completed: false,
                    dependencies: ['step6'],
                },
            ],
            escalationContacts: defaultOrgConfig.escalationContacts,
            notificationChannels: ['email', 'sms', 'slack'],
            autoTriggerConditions: ['severity=critical', 'data_breach_detected'],
        },
        {
            id: 'high-incident-workflow',
            name: 'High Severity Incident Response',
            description: 'Response workflow for high severity security incidents',
            severity: IncidentSeverity.High,
            steps: [
                {
                    id: 'step1',
                    name: 'Initial Assessment',
                    description: 'Assessment of the incident scope and impact',
                    required: true,
                    completed: false,
                    dependencies: [],
                },
                {
                    id: 'step2',
                    name: 'Team Assembled',
                    description: 'Assemble response team',
                    required: true,
                    completed: false,
                    dependencies: ['step1'],
                },
                {
                    id: 'step3',
                    name: 'Communication Initiated',
                    description: 'Initiate internal communications',
                    required: true,
                    completed: false,
                    dependencies: ['step2'],
                },
                {
                    id: 'step4',
                    name: 'Containment Implemented',
                    description: 'Implement containment measures',
                    required: true,
                    completed: false,
                    dependencies: ['step3'],
                },
                {
                    id: 'step5',
                    name: 'Eradication Performed',
                    description: 'Perform eradication activities',
                    required: true,
                    completed: false,
                    dependencies: ['step4'],
                },
                {
                    id: 'step6',
                    name: 'Recovery Executed',
                    description: 'Execute recovery procedures',
                    required: true,
                    completed: false,
                    dependencies: ['step5'],
                },
            ],
            escalationContacts: defaultOrgConfig.escalationContacts,
            notificationChannels: ['email', 'slack'],
            autoTriggerConditions: ['severity=high', 'system_compromise'],
        },
    ];
}
