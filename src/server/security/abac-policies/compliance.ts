/**
 * ABAC Policies - Compliance Tier
 *
 * Policies for compliance officers.
 *
 * @module abac-policies/compliance
 */
import type { AbacPolicy } from '../abac-types';
import { HR_RESOURCE_TYPE } from '../authorization/hr-permissions/resources';

/** Resources compliance officers can read. */
const COMPLIANCE_READ_RESOURCES = [
    HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
    HR_RESOURCE_TYPE.COMPLIANCE_TEMPLATE,
    HR_RESOURCE_TYPE.COMPLIANCE_REVIEW,
    HR_RESOURCE_TYPE.POLICY,
    HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
    HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
];

/** Resources compliance officers can fully manage. */
const COMPLIANCE_MANAGE_RESOURCES = [
    HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
    HR_RESOURCE_TYPE.COMPLIANCE_TEMPLATE,
    HR_RESOURCE_TYPE.COMPLIANCE_REVIEW,
];

/**
 * Compliance officer policies.
 * Priority: 700
 */
export const COMPLIANCE_POLICIES: AbacPolicy[] = [
    {
        id: 'default:abac:compliance:read-all',
        description: 'Compliance officers can read all compliance-related resources.',
        effect: 'allow',
        actions: ['read', 'list'],
        resources: COMPLIANCE_READ_RESOURCES,
        condition: { subject: { roles: ['compliance'] } },
        priority: 700,
    },
    {
        id: 'default:abac:compliance:manage-compliance',
        description: 'Compliance officers have full compliance management access.',
        effect: 'allow',
        actions: ['*'],
        resources: COMPLIANCE_MANAGE_RESOURCES,
        condition: { subject: { roles: ['compliance'] } },
        priority: 700,
    },
];
