import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import type { HrNotificationServiceContract } from '@/server/repositories/contracts/notifications';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { ensureEmployeeByEmployeeNumber } from './leave-service.helpers';
import {
    handleSubmitLeaveRequest,
    handleApproveLeaveRequest,
    handleRejectLeaveRequest,
    handleCancelLeaveRequest,
    handleListLeaveRequests,
} from './leave-service.operations';
import {
    type ApproveLeaveRequestDependencies,
    type ApproveLeaveRequestInput,
    type ApproveLeaveRequestResult,
    type CancelLeaveRequestDependencies,
    type CancelLeaveRequestInput,
    type CancelLeaveRequestResult,
    type RejectLeaveRequestDependencies,
    type RejectLeaveRequestInput,
    type RejectLeaveRequestResult,
    type GetLeaveRequestsDependencies,
    type GetLeaveRequestsInput,
    type GetLeaveRequestsResult,
    getLeaveRequest,
    type GetLeaveRequestDependencies,
    type GetLeaveRequestInput,
    type GetLeaveRequestResult,
    getLeaveBalance,
    type GetLeaveBalanceDependencies,
    type GetLeaveBalanceInput,
    type GetLeaveBalanceResult,
    ensureEmployeeBalances,
    type EnsureEmployeeBalancesDependencies,
    type EnsureEmployeeBalancesInput,
    type EnsureEmployeeBalancesResult,
    createLeaveBalanceWithPolicy,
    type CreateLeaveBalanceDependencies,
    type CreateLeaveBalanceInput,
    type CreateLeaveBalanceResult,
    type SubmitLeaveRequestDependencies,
    type SubmitLeaveRequestInput,
    type SubmitLeaveRequestResult,
    addLeaveAttachments,
    type AddLeaveAttachmentsDependencies,
    type AddLeaveAttachmentsInput,
    type AddLeaveAttachmentsResult,
    listLeaveAttachments,
    type ListLeaveAttachmentsDependencies,
    type ListLeaveAttachmentsInput,
    type ListLeaveAttachmentsResult,
    presignLeaveAttachmentDownload,
    type PresignLeaveAttachmentDownloadDependencies,
    type PresignLeaveAttachmentDownloadInput,
    type PresignLeaveAttachmentDownloadResult,
} from '@/server/use-cases/hr/leave';
import type { LeaveDecisionContext } from '@/server/use-cases/hr/leave/shared/leave-request-helpers';
import type { LeaveServiceRuntime } from './leave-service.operations';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type LeaveServiceDependencies = ApproveLeaveRequestDependencies &
    CancelLeaveRequestDependencies &
    RejectLeaveRequestDependencies &
    GetLeaveRequestDependencies &
    GetLeaveRequestsDependencies &
    GetLeaveBalanceDependencies &
    EnsureEmployeeBalancesDependencies &
    SubmitLeaveRequestDependencies &
    AddLeaveAttachmentsDependencies &
    ListLeaveAttachmentsDependencies &
    PresignLeaveAttachmentDownloadDependencies &
    CreateLeaveBalanceDependencies & {
        hrNotificationService?: HrNotificationServiceContract;
        profileRepository: IEmployeeProfileRepository;
    };

export class LeaveService extends AbstractHrService {
    constructor(private readonly dependencies: LeaveServiceDependencies) {
        super();
    }

    async submitLeaveRequest(input: SubmitLeaveRequestInput): Promise<SubmitLeaveRequestResult> {
        return handleSubmitLeaveRequest(this.runtime(), input);
    }

    async addLeaveAttachments(input: AddLeaveAttachmentsInput): Promise<AddLeaveAttachmentsResult> {
        return this.runOperation('hr.leave.attachments.add', this.coerceAuthorization(input.authorization), { requestId: input.requestId }, () => addLeaveAttachments(this.dependencies, input));
    }

    async listLeaveAttachments(input: ListLeaveAttachmentsInput): Promise<ListLeaveAttachmentsResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE,
            resourceAttributes: { requestId: input.requestId },
        });

        return this.runOperation(
            'hr.leave.attachments.list',
            authorization,
            { requestId: input.requestId },
            () => listLeaveAttachments(this.dependencies, { ...input, authorization }),
        );
    }

    async presignLeaveAttachmentDownload(input: PresignLeaveAttachmentDownloadInput): Promise<PresignLeaveAttachmentDownloadResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE,
            resourceAttributes: { attachmentId: input.attachmentId },
        });

        return this.runOperation(
            'hr.leave.attachments.presign-download',
            authorization,
            { attachmentId: input.attachmentId },
            () => presignLeaveAttachmentDownload(this.dependencies, { ...input, authorization }),
        );
    }

    async approveLeaveRequest(input: ApproveLeaveRequestInput): Promise<ApproveLeaveRequestResult> {
        return handleApproveLeaveRequest(this.runtime(), input);
    }

    async rejectLeaveRequest(input: RejectLeaveRequestInput): Promise<RejectLeaveRequestResult> {
        return handleRejectLeaveRequest(this.runtime(), input);
    }

    async cancelLeaveRequest(input: CancelLeaveRequestInput): Promise<CancelLeaveRequestResult> {
        return handleCancelLeaveRequest(this.runtime(), input);
    }

    async listLeaveRequests(input: GetLeaveRequestsInput): Promise<GetLeaveRequestsResult> {
        return handleListLeaveRequests(this.runtime(), input);
    }

    async getLeaveRequest(input: GetLeaveRequestInput): Promise<GetLeaveRequestResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE,
            resourceAttributes: { requestId: input.requestId },
        });
        const normalizedInput: GetLeaveRequestInput = { ...input, authorization };
        return this.runOperation(
            'hr.leave.request.get',
            authorization,
            { requestId: input.requestId },
            () => getLeaveRequest(this.dependencies, normalizedInput),
        );
    }

    async getLeaveBalance(input: GetLeaveBalanceInput): Promise<GetLeaveBalanceResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        const profile = await ensureEmployeeByEmployeeNumber(
            this.dependencies.profileRepository,
            authorization.orgId,
            input.employeeId,
        );
        const normalizedInput: GetLeaveBalanceInput = { ...input, authorization, employeeId: profile.userId };
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE_BALANCE,
            resourceAttributes: { employeeId: input.employeeId, targetUserId: profile.userId, year: input.year },
        });
        return this.runOperation(
            'hr.leave.balance.get',
            authorization,
            { employeeId: input.employeeId, targetUserId: profile.userId, year: input.year },
            () => getLeaveBalance(this.dependencies, normalizedInput),
        );
    }

    async ensureEmployeeBalances(input: EnsureEmployeeBalancesInput): Promise<EnsureEmployeeBalancesResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_LEAVE_BALANCE,
            resourceAttributes: { employeeId: input.employeeId, year: input.year },
        });
        await ensureEmployeeByEmployeeNumber(
            this.dependencies.profileRepository,
            authorization.orgId,
            input.employeeId,
        );
        return this.runOperation(
            'hr.leave.balance.ensure',
            authorization,
            { employeeId: input.employeeId, year: input.year, leaveTypes: input.leaveTypes },
            () => ensureEmployeeBalances(this.dependencies, input),
        );
    }

    async createLeaveBalance(input: CreateLeaveBalanceInput): Promise<CreateLeaveBalanceResult> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_LEAVE_BALANCE,
            resourceAttributes: { employeeId: input.balance.employeeId, balanceId: input.balance.id },
        });
        await ensureEmployeeByEmployeeNumber(
            this.dependencies.profileRepository,
            authorization.orgId,
            input.balance.employeeId,
        );
        return this.runOperation(
            'hr.leave.balance.create',
            authorization,
            { balanceId: input.balance.id, employeeId: input.balance.employeeId },
            () => createLeaveBalanceWithPolicy(this.dependencies, input),
        );
    }

    private runOperation<TResult>(
        operation: string,
        authorization: RepositoryAuthorizationContext,
        metadata: Record<string, unknown> | undefined,
        handler: () => Promise<TResult>,
    ): Promise<TResult> {
        const context: ServiceExecutionContext = this.buildContext(authorization, { metadata });
        return this.executeInServiceContext(context, operation, handler);
    }

    private coerceAuthorization(value: unknown): RepositoryAuthorizationContext {
        return value as RepositoryAuthorizationContext;
    }

    private coerceDecisionContext(value: unknown): LeaveDecisionContext {
        return value as LeaveDecisionContext;
    }

    private runtime(): LeaveServiceRuntime {
        return {
            ensureOrgAccess: this.ensureOrgAccess.bind(this),
            coerceAuthorization: this.coerceAuthorization.bind(this),
            coerceDecisionContext: this.coerceDecisionContext.bind(this),
            runOperation: this.runOperation.bind(this),
            dependencies: this.dependencies,
            logger: this.logger,
        };
    }
}
