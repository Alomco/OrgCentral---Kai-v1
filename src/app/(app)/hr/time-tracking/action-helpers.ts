import { ValidationError } from '@/server/errors';
import { HR_TIME_TRACKING_LIMITS } from '@/server/constants/hr-limits';

export function formDataString(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

export function parseTasks(value: string | undefined): string[] | undefined {
    if (!value) {
        return undefined;
    }

    const tasks = value
        .split(/[,\n]/)
        .map((task) => task.trim())
        .filter(Boolean);

    if (tasks.length > HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT) {
        throw new ValidationError(
            'Tasks must be ' + String(HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT) + ' items or less.',
            { field: 'tasks', limit: HR_TIME_TRACKING_LIMITS.TASKS_MAX_COUNT, actual: tasks.length },
        );
    }

    const overlongTask = tasks.find((task) => task.length > HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH);
    if (overlongTask) {
        throw new ValidationError(
            'Each task must be ' + String(HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH) + ' characters or less.',
            { field: 'tasks', limit: HR_TIME_TRACKING_LIMITS.TASKS_MAX_LENGTH },
        );
    }

    return tasks.length > 0 ? tasks : undefined;
}