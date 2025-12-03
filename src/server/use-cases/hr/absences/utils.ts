export {
    type AbsenceMetadata,
    type AbsenceAcknowledgementEntry,
    type AbsenceCancellationMetadata,
    type AbsenceAiValidationMetadata,
    type LeaveBalanceAdjustment,
    coerceAbsenceMetadata,
    mergeMetadata,
    mutateAbsenceMetadata,
} from '@/server/domain/absences/metadata';
export {
    type AbsenceDurationInput,
    calculateAbsenceHours,
    calculateDayPortion,
    resolveHoursPerDay,
} from '@/server/domain/absences/time-calculations';
export { toJsonValue, toNumber } from '@/server/domain/absences/conversions';
