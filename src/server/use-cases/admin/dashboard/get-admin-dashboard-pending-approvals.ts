import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { PendingApprovalSummary } from '@/server/types/admin-dashboard';
import { listPendingReviewComplianceItemsForUi } from '@/server/use-cases/hr/compliance/list-pending-review-items.cached';

export async function getAdminDashboardPendingApprovals(
    authorization: RepositoryAuthorizationContext,
): Promise<PendingApprovalSummary[]> {
    const result = await listPendingReviewComplianceItemsForUi({ authorization, take: 6 }).catch(() => ({ items: [] }));

    return result.items.map((item) => ({
        id: item.id,
        title: 'Compliance item awaiting review',
        type: 'compliance',
        href: `/hr/compliance/${item.id}`,
        dueDate: item.dueDate ?? null,
    }));
}
