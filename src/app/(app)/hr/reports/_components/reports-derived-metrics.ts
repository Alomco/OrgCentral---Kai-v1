import type { EmployeeDirectoryStats } from '@/server/use-cases/hr/people/get-employee-directory-stats';
import type { ReportsMetrics } from '../reports-utils';

export function getReportsDerivedMetrics(metrics: ReportsMetrics, employeeStats: EmployeeDirectoryStats) {
    const trainingTotal = metrics.trainingCompleted + metrics.trainingInProgress;
    const trainingCompletionRate = trainingTotal > 0
        ? Math.round((metrics.trainingCompleted / trainingTotal) * 100)
        : 0;
    const complianceCoverageRate = metrics.complianceTotal > 0
        ? Math.round((metrics.complianceComplete / metrics.complianceTotal) * 100)
        : 0;
    const complianceCompletedDelta = metrics.complianceCompletedPrev30 > 0
        ? Math.round(
            ((metrics.complianceCompletedLast30 - metrics.complianceCompletedPrev30) /
                metrics.complianceCompletedPrev30) * 100,
        )
        : null;
    const complianceDeltaLabel = complianceCompletedDelta === null
        ? 'N/A'
        : `${complianceCompletedDelta >= 0 ? '+' : ''}${String(complianceCompletedDelta)}%`;
    const absenceRate = employeeStats.active > 0
        ? Math.round((metrics.absencesOpen / employeeStats.active) * 100)
        : 0;

    return {
        trainingCompletionRate,
        complianceCoverageRate,
        complianceCompletedDelta,
        complianceDeltaLabel,
        absenceRate,
    };
}
