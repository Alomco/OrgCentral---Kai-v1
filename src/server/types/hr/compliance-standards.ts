export const COMPLIANCE_STANDARD_KEYS = [
    'GDPR',
    'UK_GDPR',
    'SOX',
    'HIPAA',
    'PCI_DSS',
    'SOC2',
    'ISO27001',
    'NIST_800_53',
] as const;

export type ComplianceStandardKey = typeof COMPLIANCE_STANDARD_KEYS[number];

export interface ComplianceStandard {
    key: ComplianceStandardKey;
    label: string;
    description: string;
}

export const COMPLIANCE_STANDARDS: ComplianceStandard[] = [
    {
        key: 'GDPR',
        label: 'GDPR',
        description: 'EU General Data Protection Regulation',
    },
    {
        key: 'UK_GDPR',
        label: 'UK GDPR',
        description: 'UK General Data Protection Regulation',
    },
    {
        key: 'SOX',
        label: 'SOX',
        description: 'Sarbanes–Oxley Act',
    },
    {
        key: 'HIPAA',
        label: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act',
    },
    {
        key: 'PCI_DSS',
        label: 'PCI DSS',
        description: 'Payment Card Industry Data Security Standard',
    },
    {
        key: 'SOC2',
        label: 'SOC 2',
        description: 'Service Organization Control 2',
    },
    {
        key: 'ISO27001',
        label: 'ISO 27001',
        description: 'Information Security Management Systems',
    },
    {
        key: 'NIST_800_53',
        label: 'NIST 800-53',
        description: 'Security and Privacy Controls for Information Systems',
    },
];
