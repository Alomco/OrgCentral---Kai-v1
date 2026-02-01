import type { DataResidencyZone, DataClassificationLevel } from '@/server/types/tenant';
import type { SecurityConfiguration } from './security-configuration-provider';

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return defaultValue;
};

export function buildDefaultSecurityConfiguration(): SecurityConfiguration {
  return {
    // Data residency settings
    defaultDataResidency: (process.env.DEFAULT_DATA_RESIDENCY as DataResidencyZone | undefined) ?? 'UK_ONLY',
    allowedDataResidencies: (process.env.ALLOWED_DATA_RESIDENCIES?.split(',') as DataResidencyZone[] | undefined) ?? ['UK_ONLY'],

    // Data classification settings
    defaultDataClassification: (process.env.DEFAULT_DATA_CLASSIFICATION as DataClassificationLevel | undefined) ?? 'OFFICIAL',
    classificationHierarchy: {
      OFFICIAL: 1,
      OFFICIAL_SENSITIVE: 2,
      SECRET: 3,
      TOP_SECRET: 4,
    },

    // PII protection settings
    piiDetectionEnabled: parseBoolean(process.env.PII_DETECTION_ENABLED, true),
    piiMaskingEnabled: parseBoolean(process.env.PII_MASKING_ENABLED, true),
    piiEncryptionRequired: parseBoolean(process.env.PII_ENCRYPTION_REQUIRED, true),

    // Authentication settings
    mfaRequiredForClassifiedData: (process.env.MFA_REQUIRED_FOR_CLASSIFIED?.split(',') as DataClassificationLevel[] | undefined) ?? ['SECRET', 'TOP_SECRET'],
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES ?? '120', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? '5', 10),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES ?? '30', 10),

    // DLP settings
    dlpEnabled: parseBoolean(process.env.DLP_ENABLED, true),
    dlpAutoQuarantine: parseBoolean(process.env.DLP_AUTO_QUARANTINE, false),
    dlpNotificationEnabled: parseBoolean(process.env.DLP_NOTIFICATION_ENABLED, true),

    // Audit settings
    auditLoggingEnabled: parseBoolean(process.env.AUDIT_LOGGING_ENABLED, true),
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS ?? '365', 10),
    securityEventLogging: parseBoolean(process.env.SECURITY_EVENT_LOGGING, true),

    // Compliance settings
    complianceMonitoringEnabled: parseBoolean(process.env.COMPLIANCE_MONITORING_ENABLED, true),
    complianceReportingFrequency: (process.env.COMPLIANCE_REPORTING_FREQUENCY as 'daily' | 'weekly' | 'monthly' | 'quarterly' | undefined) ?? 'monthly',
    gdprComplianceMode: parseBoolean(process.env.GDPR_COMPLIANCE_MODE, false),

    // Network security settings
    ipWhitelist: process.env.IP_WHITELIST?.split(',') ?? [],
    suspiciousIpNotification: parseBoolean(process.env.SUSPICIOUS_IP_NOTIFICATION, true),

    // Incident response settings
    incidentNotificationEnabled: parseBoolean(process.env.INCIDENT_NOTIFICATION_ENABLED, true),
    escalationContacts: process.env.ESCALATION_CONTACTS?.split(',') ?? [],
    autoEscalationThreshold: parseInt(process.env.AUTO_ESCALATION_THRESHOLD ?? '5', 10),
  };
}
