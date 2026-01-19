import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { PrismaOffboardingRepository } from '@/server/repositories/prisma/hr/offboarding';
import { PrismaChecklistInstanceRepository } from '@/server/repositories/prisma/hr/onboarding';
import { getChecklistTemplatesForUi } from '@/server/use-cases/hr/onboarding/templates/get-checklist-templates.cached';
import { getOffboardingByEmployee } from '@/server/use-cases/hr/offboarding';

import { EmployeeOffboardingCard } from './employee-offboarding-card';

export interface EmployeeOffboardingPanelProps {
    authorization: RepositoryAuthorizationContext;
    profile: EmployeeProfile;
}

export async function EmployeeOffboardingPanel({ authorization, profile }: EmployeeOffboardingPanelProps) {
    const offboardingRepository = new PrismaOffboardingRepository();
    const checklistInstanceRepository = new PrismaChecklistInstanceRepository();

    const [offboardingResult, templatesResult] = await Promise.all([
        getOffboardingByEmployee(
            { offboardingRepository },
            { authorization, employeeId: profile.id },
        ),
        getChecklistTemplatesForUi({ authorization, type: 'offboarding' }),
    ]);

    const offboarding = offboardingResult.offboarding;
    const instance = offboarding?.checklistInstanceId
        ? await checklistInstanceRepository.getInstance(
            authorization.orgId,
            offboarding.checklistInstanceId,
        )
        : null;

    const totalItems = instance?.items.length ?? 0;
    const completedItems = instance?.items.filter((item) => item.completed).length ?? 0;
    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const canStart =
        profile.employmentStatus !== 'ARCHIVED' &&
        profile.employmentStatus !== 'OFFBOARDING' &&
        (offboarding?.status !== 'IN_PROGRESS');
    const canComplete =
        offboarding?.status === 'IN_PROGRESS' && (!instance || instance.status === 'COMPLETED');

    return (
        <EmployeeOffboardingCard
            profileId={profile.id}
            offboardingId={offboarding?.id ?? null}
            status={offboarding?.status ?? null}
            startedAt={offboarding?.startedAt ?? null}
            completedAt={offboarding?.completedAt ?? null}
            checklistProgress={instance ? {
                completed: completedItems,
                total: totalItems,
                percent,
                status: instance.status,
            } : null}
            templates={templatesResult.templates.map((template) => ({ id: template.id, name: template.name }))}
            canStart={canStart}
            canComplete={canComplete}
        />
    );
}
