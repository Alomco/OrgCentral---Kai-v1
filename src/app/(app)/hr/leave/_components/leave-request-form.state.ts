'use client';

import type { RefObject } from 'react';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';

import { useLeaveAttachment } from './leave-request-attachment';
import { submitLeaveRequestAction } from '../actions';
import type { LeaveRequestFormState } from '../form-state';
import type { LeaveBalance } from '@/server/types/leave-types';

export interface UseLeaveRequestFormReturn {
    state: LeaveRequestFormState;
    fieldErrors: LeaveRequestFormState['fieldErrors'];
    action: (formData: FormData) => void;
    pending: boolean;
    leaveTypeErrorId?: string;
    totalDaysErrorId?: string;
    startDateErrorId?: string;
    endDateErrorId?: string;
    reasonErrorId?: string;
    feedbackRef: RefObject<HTMLDivElement | null>;
    formRef: RefObject<HTMLFormElement | null>;
    confirmedSubmit: boolean;
    isHalfDay: boolean;
    setIsHalfDay: (next: boolean) => void;
    leaveType: string;
    setLeaveType: (value: string) => void;
    leaveTypeOptions: string[];
    selectedBalance: LeaveBalance | null;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    reason: string;
    setReason: (value: string) => void;
    calculatedDays: number;
    showPreview: boolean;
    setShowPreview: (open: boolean) => void;
    handlePreviewOpenChange: (open: boolean) => void;
    requestId: string;
    uploading: boolean;
    uploadError: string | null;
    uploadedAttachments: { fileName: string; contentType: string; fileSize: number; storageKey: string; checksum?: string }[];
    attachmentsValue: string;
    handleEvidenceChange: ReturnType<typeof useLeaveAttachment>['handleEvidenceChange'];
    handleConfirmSubmit: () => void;
    halfDayLockedToSingleDate: boolean;
    balanceText: string | null;
    handleStartDateChange: (value: string) => void;
}

export function useLeaveRequestForm(initialState: LeaveRequestFormState, balances?: LeaveBalance[]): UseLeaveRequestFormReturn {
    const [state, action, pending] = useActionState(submitLeaveRequestAction, initialState);
    const feedbackReference = useRef<HTMLDivElement | null>(null);
    const formReference = useRef<HTMLFormElement | null>(null);
    const previousStatus = useRef(state.status);
    const [confirmedSubmit, setConfirmedSubmit] = useState(false);
    const initialValues = initialState.values;
    const [isHalfDay, setIsHalfDay] = useState<boolean>(initialValues.isHalfDay ?? false);
    const [leaveType, setLeaveType] = useState<string>(initialValues.leaveType);
    const [startDate, setStartDate] = useState<string>(initialValues.startDate);
    const [endDate, setEndDate] = useState<string>(initialValues.endDate ?? initialValues.startDate);
    const [reason, setReason] = useState<string>(initialValues.reason ?? '');
    const [showPreview, setShowPreview] = useState(false);
    const [showClientErrors, setShowClientErrors] = useState(false);
    const [requestId] = useState<string>(() => crypto.randomUUID());
    const { uploading, uploadError, uploadedAttachments, attachmentsValue, handleEvidenceChange } = useLeaveAttachment(requestId);
    const leaveTypeOptions = useMemo(() => balances?.map((balance) => balance.leaveType) ?? [], [balances]);
    const selectedBalance = useMemo(() => balances?.find((balance) => balance.leaveType === leaveType) ?? null, [balances, leaveType]);

    useEffect(() => {
        formReference.current?.setAttribute('aria-busy', pending ? 'true' : 'false');
        if (!pending && state.status !== 'idle' && previousStatus.current !== state.status) {
            feedbackReference.current?.focus();
        }
        previousStatus.current = state.status;
    }, [pending, state.status]);

    const halfDayLockedToSingleDate = isHalfDay && Boolean(startDate);
    const effectiveEndDate = halfDayLockedToSingleDate ? startDate : (endDate || startDate);
    const calculatedDays = useMemo(
        () => computeTotalDays(startDate, effectiveEndDate, isHalfDay),
        [startDate, effectiveEndDate, isHalfDay],
    );

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        if (!endDate) {
            setEndDate(value);
        }
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);
    };
    const clientFieldErrors = useMemo<NonNullable<LeaveRequestFormState['fieldErrors']>>(() => {
        const errors: NonNullable<LeaveRequestFormState['fieldErrors']> = {};
        if (!leaveType.trim()) {
            errors.leaveType = 'Select a leave type.';
        }

        const today = getTodayDateInputValue();

        if (startDate && startDate < today) {
            errors.startDate = 'Start date cannot be in the past.';
        }
        if (startDate && effectiveEndDate && effectiveEndDate < startDate) {
            errors.endDate = 'End date must be on or after the start date.';
        }
        if (calculatedDays <= 0) {
            errors.totalDays = 'Total days must be greater than 0.';
        }
        return errors;
    }, [leaveType, startDate, effectiveEndDate, calculatedDays]);

    const stateFieldErrors = useMemo(() => {
        if (!state.fieldErrors || state.status === 'idle') {
            return undefined;
        }
        const stateValues = state.values;
        const matchesLocal =
            stateValues.leaveType === leaveType
            && stateValues.startDate === startDate
            && (stateValues.endDate ?? '') === (endDate || '')
            && Boolean(stateValues.isHalfDay) === isHalfDay
            && (stateValues.reason ?? '') === reason
            && stateValues.totalDays === calculatedDays;

        return matchesLocal ? state.fieldErrors : undefined;
    }, [state.fieldErrors, state.status, state.values, leaveType, startDate, endDate, isHalfDay, reason, calculatedDays]);

    const fieldErrors = useMemo(() => {
        if (!showClientErrors) {
            return stateFieldErrors;
        }
        return {
            ...(stateFieldErrors ?? {}),
            ...clientFieldErrors,
        };
    }, [stateFieldErrors, clientFieldErrors, showClientErrors]);
    const leaveTypeErrorId = fieldErrors?.leaveType ? 'leaveType-error' : undefined;
    const totalDaysErrorId = fieldErrors?.totalDays ? 'totalDays-error' : undefined;
    const startDateErrorId = fieldErrors?.startDate ? 'startDate-error' : undefined;
    const endDateErrorId = fieldErrors?.endDate ? 'endDate-error' : undefined;
    const reasonErrorId = fieldErrors?.reason ? 'reason-error' : undefined;
    const hasClientErrors = Object.keys(clientFieldErrors).length > 0;

    function handleConfirmSubmit() {
        if (hasClientErrors) {
            setShowClientErrors(true);
            return;
        }
        setConfirmedSubmit(true);
        setShowPreview(false);
        formReference.current?.requestSubmit();
        setConfirmedSubmit(false);
    }

    function handlePreviewOpenChange(open: boolean) {
        if (!open) {
            setShowPreview(false);
            return;
        }
        setShowClientErrors(true);
        if (hasClientErrors) {
            return;
        }
        setShowPreview(true);
    }

    const balanceText = balanceForType(balances, leaveType);

    return {
        state,
        fieldErrors,
        action,
        pending,
        leaveTypeErrorId,
        totalDaysErrorId,
        startDateErrorId,
        endDateErrorId,
        reasonErrorId,
        feedbackRef: feedbackReference,
        formRef: formReference,
        confirmedSubmit,
        isHalfDay,
        setIsHalfDay,
        leaveType,
        setLeaveType,
        leaveTypeOptions,
        selectedBalance,
        startDate,
        setStartDate,
        endDate,
        setEndDate: handleEndDateChange,
        reason,
        setReason,
        calculatedDays,
        showPreview,
        setShowPreview,
        handlePreviewOpenChange,
        requestId,
        uploading,
        uploadError,
        uploadedAttachments,
        attachmentsValue,
        handleEvidenceChange,
        handleConfirmSubmit,
        halfDayLockedToSingleDate,
        balanceText,
        handleStartDateChange,
    };
}

function balanceForType(balances: LeaveBalance[] | undefined, leaveType: string | undefined): string | null {
    if (!leaveType) { return null; }
    const match = balances?.find((balance) => balance.leaveType === leaveType);
    if (!match) { return null; }
    const availableText = match.available.toLocaleString();
    return `${availableText} days available`;
}

function parseDateOnly(value: string | undefined) {
    if (!value) { return null; }
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) { return null; }
    return new Date(Date.UTC(year, month - 1, day));
}

function getTodayDateInputValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year.toString()}-${month}-${day}`;
}

function computeTotalDays(start: string, end: string, isHalfDay: boolean): number {
    const startDate = parseDateOnly(start);
    if (!startDate) { return 0; }
    const fallbackEnd = end || start;
    const endDate = parseDateOnly(fallbackEnd) ?? startDate;
    if (endDate < startDate) { return 0; }
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const fullDays = Math.max(diffDays, 1);
    const total = isHalfDay ? Math.max(0.5, fullDays - 0.5) : fullDays;
    return Number(total.toFixed(1));
}

