import type { DataResidencyZone, DataClassificationLevel } from '@/server/types/tenant';
import { buildDefaultSecurityConfiguration } from './security-configuration-provider.defaults';

export interface SecurityConfiguration {
  // Data residency settings
  defaultDataResidency: DataResidencyZone;
  allowedDataResidencies: DataResidencyZone[];
  
  // Data classification settings
  defaultDataClassification: DataClassificationLevel;
  classificationHierarchy: Record<DataClassificationLevel, number>;
  
  // PII protection settings
  piiDetectionEnabled: boolean;
  piiMaskingEnabled: boolean;
  piiEncryptionRequired: boolean;
  
  // Authentication settings
  mfaRequiredForClassifiedData: DataClassificationLevel[];
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  
  // DLP settings
  dlpEnabled: boolean;
  dlpAutoQuarantine: boolean;
  dlpNotificationEnabled: boolean;
  
  // Audit settings
  auditLoggingEnabled: boolean;
  auditRetentionDays: number;
  securityEventLogging: boolean;
  
  // Compliance settings
  complianceMonitoringEnabled: boolean;
  complianceReportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  gdprComplianceMode: boolean;
  
  // Network security settings
  ipWhitelist: string[];
  suspiciousIpNotification: boolean;
  
  // Incident response settings
  incidentNotificationEnabled: boolean;
  escalationContacts: string[];
  autoEscalationThreshold: number; // Number of security events that trigger auto-escalation
}

export interface SecurityConfigOverrides {
  orgId: string;
  config: Partial<SecurityConfiguration>;
}

export interface SecurityConfigurationProviderOptions {
  enableOverrides?: boolean;
  defaultConfig?: Partial<SecurityConfiguration>;
}

export class SecurityConfigurationProvider {
  private static instance: SecurityConfigurationProvider | undefined;
  private config: SecurityConfiguration;
  private overrides = new Map<string, Partial<SecurityConfiguration>>();

  private constructor(options?: SecurityConfigurationProviderOptions) {
    this.config = buildDefaultSecurityConfiguration();

    // Apply any default overrides from options
    if (options?.defaultConfig) {
      this.config = { ...this.config, ...options.defaultConfig };
    }
  }

  public static getInstance(options?: SecurityConfigurationProviderOptions): SecurityConfigurationProvider {
    SecurityConfigurationProvider.instance ??= new SecurityConfigurationProvider(options);
    return SecurityConfigurationProvider.instance;
  }

  /**
   * Gets the security configuration for an organization
   */
  public getOrgConfig(orgId: string): SecurityConfiguration {
    const orgOverride = this.overrides.get(orgId);
    
    if (orgOverride) {
      return { ...this.config, ...orgOverride };
    }
    
    return this.config;
  }

  /**
   * Sets security configuration overrides for an organization
   */
  public setOrgConfig(orgId: string, overrides: Partial<SecurityConfiguration>): void {
    this.overrides.set(orgId, overrides);
  }

  /**
   * Removes security configuration overrides for an organization
   */
  public removeOrgConfig(orgId: string): void {
    this.overrides.delete(orgId);
  }

  /**
   * Checks if MFA is required for a given data classification level
   */
  public isMfaRequiredForClassification(classification: DataClassificationLevel, orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.mfaRequiredForClassifiedData.includes(classification);
  }

  /**
   * Checks if PII encryption is required for an organization
   */
  public isPiiEncryptionRequired(orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.piiEncryptionRequired;
  }

  /**
   * Checks if DLP is enabled for an organization
   */
  public isDlpEnabled(orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.dlpEnabled;
  }

  /**
   * Checks if audit logging is enabled for an organization
   */
  public isAuditLoggingEnabled(orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.auditLoggingEnabled;
  }

  /**
   * Checks if an IP address is whitelisted
   */
  public isIpWhitelisted(ipAddress: string, orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.ipWhitelist.includes(ipAddress);
  }

  /**
   * Gets the default data residency for an organization
   */
  public getDefaultDataResidency(orgId?: string): DataResidencyZone {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.defaultDataResidency;
  }

  /**
   * Gets the default data classification for an organization
   */
  public getDefaultDataClassification(orgId?: string): DataClassificationLevel {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.defaultDataClassification;
  }

  /**
   * Checks if a data residency zone is allowed for an organization
   */
  public isDataResidencyAllowed(residency: DataResidencyZone, orgId?: string): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    return config.allowedDataResidencies.includes(residency);
  }

  /**
   * Validates if a classification level is compliant with the required level
   */
  public isClassificationCompliant(
    current: DataClassificationLevel,
    required: DataClassificationLevel,
    orgId?: string
  ): boolean {
    const config = orgId ? this.getOrgConfig(orgId) : this.config;
    
    const currentLevel = config.classificationHierarchy[current];
    const requiredLevel = config.classificationHierarchy[required];
    
    return currentLevel >= requiredLevel;
  }

  /**
   * Gets the security configuration as a plain object
   */
  public getConfigSnapshot(orgId?: string): SecurityConfiguration {
    return { ...this.getOrgConfig(orgId ?? 'default') };
  }

  /**
   * Resets the provider to its initial state (for testing purposes)
   */
  public reset(): void {
    if (process.env.NODE_ENV === 'test') {
      SecurityConfigurationProvider.instance = new SecurityConfigurationProvider();
    }
  }
}

// Export a singleton instance
export const securityConfigProvider = SecurityConfigurationProvider.getInstance();
