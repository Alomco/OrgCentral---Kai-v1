# Cache Profiles and Tags

## Cache profiles
- CACHE_LIFE_BRIEF: 'seconds' for short-lived fallback caching
- CACHE_LIFE_SHORT: 'minutes' for frequently changing read data
- CACHE_LIFE_LONG: 'hours' for stable settings and templates

Profiles live in src/server/repositories/cache-profiles.ts.

## Usage pattern
1. Use cacheLife with a profile constant.
2. Use noStore for non-OFFICIAL classifications.
3. Register tenant-scoped cache tags.

Example (simplified):

```
import { cacheLife, unstable_noStore as noStore } from 'next/cache';
import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';

if (authorization.dataClassification !== 'OFFICIAL') {
  noStore();
  return loadData();
}

'use cache';
cacheLife(CACHE_LIFE_SHORT);
return loadData();
```

## Cache tag registry
Cache tag scopes live in src/server/repositories/cache-scopes.ts.

Current scopes:
- CACHE_SCOPE_CHECKLIST_TEMPLATES
- CACHE_SCOPE_CHECKLIST_INSTANCES
- CACHE_SCOPE_COMPLIANCE_TEMPLATES
- CACHE_SCOPE_COMPLIANCE_CATEGORIES
- CACHE_SCOPE_COMPLIANCE_ITEMS
- CACHE_SCOPE_BRANDING
- CACHE_SCOPE_ROLES
- CACHE_SCOPE_PERMISSIONS
- CACHE_SCOPE_ABAC_POLICIES
- CACHE_SCOPE_TENANT_THEME
- CACHE_SCOPE_ENTERPRISE_MANAGED_ORGS
- CACHE_SCOPE_DEPARTMENTS
- CACHE_SCOPE_LEAVE_BALANCES
- CACHE_SCOPE_LEAVE_POLICIES
- CACHE_SCOPE_LEAVE_REQUESTS
- CACHE_SCOPE_ABSENCES
- CACHE_SCOPE_SECURITY_EVENTS
- CACHE_SCOPE_PEOPLE_PROFILES
- CACHE_SCOPE_PEOPLE_CONTRACTS
- CACHE_SCOPE_PERFORMANCE_REVIEWS
- CACHE_SCOPE_PERFORMANCE_GOALS
- CACHE_SCOPE_TIME_ENTRIES
- CACHE_SCOPE_TRAINING_RECORDS
- CACHE_SCOPE_HR_POLICIES
- CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS
- CACHE_SCOPE_HR_NOTIFICATIONS
- CACHE_SCOPE_HR_SETTINGS
- CACHE_SCOPE_NOTIFICATION_PREFERENCES
- CACHE_SCOPE_ONBOARDING_INVITATIONS
- CACHE_SCOPE_COMPLIANCE_STATUS
- CACHE_SCOPE_BILLING_SUBSCRIPTION
- CACHE_SCOPE_BILLING_PAYMENT_METHODS
- CACHE_SCOPE_BILLING_INVOICES
- CACHE_SCOPE_BILLING_UPCOMING

When adding a new domain, define a scope in cache-scopes.ts and use it for tag registration and invalidation.
