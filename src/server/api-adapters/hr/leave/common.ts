import { readJson } from '@/server/api-adapters/http/request-utils';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
    type ResolvedLeaveControllerDependencies,
} from '@/server/services/hr/leave/leave-controller-dependencies';

export {
    readJson,
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
};

export type { LeaveControllerDependencies, ResolvedLeaveControllerDependencies };
