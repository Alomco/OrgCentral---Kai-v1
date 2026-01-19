import { unstable_noStore as noStore } from 'next/cache';
import { differenceInCalendarDays } from 'date-fns';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { PrismaComplianceCategoryRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-category-repository';
import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-item-repository';
import { PrismaComplianceTemplateRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-template-repository';
import { listComplianceTemplates } from '@/server/use-cases/hr/compliance/list-compliance-templates';
import { listEmployeeProfilesForUi } from '@/server/use-cases/hr/people/list-employee-profiles.cached';
import type { EmployeeProfile } from '@/server/types/hr-types';

import { ComplianceExpiryPanel } from './compliance-expiry-panel';
import { buildTemplateItemLookup } from './compliance-template-lookup';

interface ComplianceExpiryPanelLoaderProps {
    authorization: RepositoryAuthorizationContext;
}

function getEmployeeName(profile: EmployeeProfile | undefined): string {
    if (!profile) {
        return 'Unknown employee';
    }
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const firstName = profile.firstName?.trim() ?? '';
    const lastName = profile.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
        return fullName;
    }
    return profile.email ?? profile.userId;
}

export async function ComplianceExpiryPanelLoader({ authorization }: ComplianceExpiryPanelLoaderProps) {
    if (authorization.dataClassification !== 'OFFICIAL') {
        noStore();
    }

    const complianceItemRepository = new PrismaComplianceItemRepository();
    const complianceTemplateRepository = new PrismaComplianceTemplateRepository();
    const complianceCategoryRepository = new PrismaComplianceCategoryRepository();

    const referenceDate = new Date();

    const [expiringItems, templates, categories, profileResult] = await Promise.all([
        complianceItemRepository.findExpiringItemsForOrg(authorization.orgId, referenceDate, 30),
        listComplianceTemplates({ complianceTemplateRepository }, { authorization }),
        complianceCategoryRepository.listCategories(authorization.orgId),
        listEmployeeProfilesForUi({ authorization }),
    ]);

    const templateLookup = buildTemplateItemLookup(templates);
    const categoryLookup = new Map(categories.map((category) => [category.key, category.label] as const));
    const profileLookup = new Map(profileResult.profiles.map((profile) => [profile.userId, profile] as const));

    const resolvedItems = expiringItems
        .map((item) => {
            if (!item.dueDate) {
                return null;
            }

            const templateMeta = templateLookup.get(item.templateItemId);
            const categoryLabel =
                (item.categoryKey ? categoryLookup.get(item.categoryKey) : undefined)
                ?? templateMeta?.categoryKey
                ?? item.categoryKey
                ?? 'General';

            return {
                id: item.id,
                title: templateMeta?.item.name ?? item.templateItemId,
                employeeName: getEmployeeName(profileLookup.get(item.userId)),
                employeeId: item.userId,
                expiryDate: item.dueDate,
                daysUntilExpiry: differenceInCalendarDays(item.dueDate, referenceDate),
                category: categoryLabel,
            };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return <ComplianceExpiryPanel expiringItems={resolvedItems} />;
}
