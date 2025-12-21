import { BaseTypedError, type ErrorDetails } from './base-error';

export class LeavePolicyInUseError extends BaseTypedError {
    constructor(details?: ErrorDetails) {
        super('Cannot delete policy in use', 'LEAVE_POLICY_IN_USE', details);
    }
}
