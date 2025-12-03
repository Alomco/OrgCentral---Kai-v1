# Backend Migration Compliance Controls Checklist

This document outlines compliance controls that must be implemented during the migration of the Firebase backend to the new Prisma/PostgreSQL/Mongo stack. Each control is mapped to the specific domain functions that must implement it.

## 1. Zero-Trust Model Controls

### Control: Authentication Enforcement
- [ ] All API endpoints must validate authentication before processing
- [ ] User identity must be verified in all requests
- [ ] Session validity must be checked on each request
- [ ] Functions affected: All HTTP-triggered functions

### Control: Authorization Verification
- [ ] All API endpoints must validate user authorization
- [ ] Role-based access controls (RBAC) must be enforced
- [ ] Attribute-based access controls (ABAC) where applicable 
- [ ] Functions affected: All functions with permission requirements

### Control: Context Checking
- [ ] Tenant context must be validated on each request
- [ ] Organization isolation must be maintained
- [ ] Cross-tenant data access must be prevented
- [ ] Functions affected: All functions with `tenant_aware` = `true`

## 2. MFA and Identity Requirements

### Control: Adaptive Authentication
- [ ] WebAuthn + TOTP enforced for privileged roles
- [ ] Risk-based challenges triggered by anomalous activity
- [ ] Functions affected: auth.ts functions, admin functions

### Control: Identity Provider Support
- [ ] SAML 2.0 / OIDC support for government IdPs
- [ ] Email-first login for SMB tenants
- [ ] Functions affected: auth.ts functions

## 3. Data Protection & Privacy Controls

### Control: Encryption at Rest
- [ ] Prisma middleware encrypts sensitive data before PostgreSQL storage
- [ ] NI numbers, health and diversity data encrypted
- [ ] Functions affected: All functions storing sensitive data
- [ ] Mongo CSFLE for document sections

### Control: Data Residency
- [ ] All UK data stored in UK sovereign regions
- [ ] Cross-border data flows only with explicit contracts
- [ ] Records tagged with residency metadata
- [ ] `Organization.dataResidency` + `Organization.dataClassification` fields stay in sync with Cabinet Office audit requirements
- [ ] Functions affected: All data storage functions

### Control: GDPR Compliance
- [ ] Subject Access Request (SAR) exporter available
- [ ] Right-to-erasure workflow implemented
- [ ] Data processing logs maintained for ICO inspections
- [ ] SAR scope includes HR People data (profiles, contracts, compliance logs, documents) with redaction rules for NI/health data
- [ ] Functions affected: All data access and modification functions

## 4. Audit and Compliance Automation

### Control: Immutable Audit Log
- [ ] All sensitive actions write to Mongo `auditLogs`
- [ ] Replicated to PostgreSQL tables for compliance
- [ ] Database-level deletion protection enabled
- [ ] Functions affected: All functions with `gov_controls` = `audit_logging`

### Control: Working Time Regulations Compliance
- [ ] Weekly jobs calculate 48-hour rolling averages
- [ ] Alerts sent to managers for exceptions
- [ ] Exceptions logged for review
- [ ] Functions affected: hr-absences.ts, hr-leave.ts functions

### Control: Auto-Enrolment Compliance
- [ ] Threshold evaluation service flags eligible employees
- [ ] Notifications and opt-out window tracking
- [ ] Functions affected: hr-onboarding.ts functions

### Control: Equality Act Compliance
- [ ] Anonymous diversity dashboards
- [ ] Bias detection on recruitment stages
- [ ] Remediation tasks generated
- [ ] Functions affected: hr-onboarding.ts functions

## 5. GDS Alignment Controls

### Control: Accessibility (WCAG 2.2 AA)
- [ ] Semantic HTML in all responses
- [ ] Keyboard-only flows supported
- [ ] Screen-reader compatibility tested
- [ ] Functions affected: All UI-related functions

### Control: Data Export Standards
- [ ] OpenAPI specs published
- [ ] CSV/iCal export support
- [ ] GOV.UK Design System alignment
- [ ] Functions affected: All data export functions

## 6. Monitoring & Detection Controls

### Control: Telemetry Implementation
- [ ] OpenTelemetry traces with tenant tags
- [ ] Data classification tags on metrics
- [ ] Functions affected: All functions

### Control: Threat Detection
- [ ] UEBA rules for anomalous HR data access
- [ ] Findings feed to SIEM system
- [ ] Functions affected: All data access functions

## 7. Domain-Specific Compliance Implementation

### HR Domain Controls
- [ ] Leave management: Validate date ranges and entitlements
- [ ] Absence tracking: Ensure proper audit trails
- [ ] Onboarding: Check regulatory compliance requirements
- [ ] Functions affected: hr-*.ts functions
### HR People Controls
- [ ] Profiles/contracts/documents/compliance log writes carry `orgId`, `dataClassification`, and `residencyTag` fields aligned to tenant metadata
- [ ] All HR People mutations emit audit events (user, org, classification, residency, correlationId) for profile/contract/document/compliance changes
- [ ] Employee document uploads and compliance attachments record retention policy IDs and storage paths tagged with residency/classification
- [ ] Default classification/residency defaults documented and applied in HR People services; cross-region writes blocked unless contract allows
- [ ] SAR/export coverage includes Prisma HR People tables and related storage records with redaction of NI/health/diversity data
- [ ] Functions affected: hr-compliance.ts, hr-onboarding.ts, hr-absences.ts, hr-leave.ts people-facing mutations, people APIs/services

### Organization Admin Controls
- [ ] User role management: Maintain proper segregation of duties
- [ ] Custom role creation: Validate permission assignments
- [ ] Functions affected: org-admin.ts functions

### Platform Admin Controls
- [ ] Global admin access: Implement additional logging
- [ ] Cross-tenant operations: Ensure proper authorization
- [ ] Functions affected: platform-admin.ts, enterprise-admin.ts functions

### Compliance & Workflow Controls
- [ ] Validation workflows: Ensure regulatory compliance
- [ ] Checklist management: Maintain compliance records
- [ ] Functions affected: hr-compliance.ts, workflow-admin.ts functions

## 8. Implementation Verification Checklist

### Pre-Migration Verification
- [ ] All functions mapped to new architecture
- [ ] Security controls implemented in new services
- [ ] Audit logging configured for all functions
- [ ] Tenant isolation verified

### Post-Migration Verification
- [ ] All functions successfully migrated
- [ ] Security controls working as expected
- [ ] Audit logs capturing all required events
- [ ] Tenant data properly isolated
- [ ] Performance benchmarks met
- [ ] Compliance requirements satisfied
- [ ] Rollback plan tested and validated
