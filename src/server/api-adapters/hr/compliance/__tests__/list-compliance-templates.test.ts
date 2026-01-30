import { describe, expect, it, vi } from 'vitest';
import type { ComplianceTemplate } from '@/server/types/compliance-types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceTemplateRepository } from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';

import { listComplianceTemplatesController } from '../list-compliance-templates';

const { authorization } = vi.hoisted(() => {
    const tenantScope = {
        orgId: 'org1',
        dataResidency: 'GLOBAL_RESTRICTED',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
    } as const;

    const authorization: RepositoryAuthorizationContext = {
        ...tenantScope,
        tenantScope,
        roleKey: 'custom',
        userId: 'user1',
        permissions: { organization: ['read'] },
    };

    return { authorization };
});

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: vi.fn(async () => ({ authorization })),
}));

function makeRequest(url: string): Request {
    return new Request(url, { headers: new Headers() });
}

function buildRepository(templates: ComplianceTemplate[]): IComplianceTemplateRepository {
    return {
        createTemplate: async () => templates[0] ?? {
            id: 'seed',
            orgId: 'org1',
            name: 'Seed',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        updateTemplate: async () => templates[0] ?? {
            id: 'seed',
            orgId: 'org1',
            name: 'Seed',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        deleteTemplate: async () => {},
        getTemplate: async () => templates[0] ?? null,
        listTemplates: async () => templates,
    };
}

describe('listComplianceTemplatesController', () => {
    const templates: ComplianceTemplate[] = [
        {
            id: 't1',
            orgId: 'org1',
            name: 'Benefits Overview',
            categoryKey: 'benefits',
            version: '1',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 't2',
            orgId: 'org1',
            name: 'Code of Conduct',
            categoryKey: 'conduct',
            version: '2',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    it('returns all templates when q is empty', async () => {
        const repo = buildRepository(templates);
        const result = await listComplianceTemplatesController(
            makeRequest('https://example.com/api/hr/compliance/templates'),
            { complianceTemplateRepository: repo },
        );

        expect(result.templates).toHaveLength(2);
    });

    it('filters by q (name/category/version)', async () => {
        const repo = buildRepository(templates);
        const result = await listComplianceTemplatesController(
            makeRequest('https://example.com/api/hr/compliance/templates?q=benefits'),
            { complianceTemplateRepository: repo },
        );

        expect(result.templates).toHaveLength(1);
        expect(result.templates[0]?.id).toBe('t1');
    });
});
