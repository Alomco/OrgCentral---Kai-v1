'use client';

import type { RefObject } from 'react';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';

import { useLeaveAttachment } from './leave-request-attachment';
import { submitLeaveRequestAction } from '../actions';
import type { LeaveRequestFormState } from '../form-state';
import type { LeaveBalance } from '@/server/types/leave-types';

export interface UseLeaveRequestFormReturn {
    state: LeaveRequestFormState;
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

    const leaveTypeErrorId = state.fieldErrors?.leaveType ? 'leaveType-error' : undefined;
    const totalDaysErrorId = state.fieldErrors?.totalDays ? 'totalDays-error' : undefined;
    const startDateErrorId = state.fieldErrors?.startDate ? 'startDate-error' : undefined;
    const endDateErrorId = state.fieldErrors?.endDate ? 'endDate-error' : undefined;
    const reasonErrorId = state.fieldErrors?.reason ? 'reason-error' : undefined;

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

    const normalizedEndDate = useMemo(() => {
        if (!endDate) { return startDate; }
        if (startDate && endDate < startDate) { return startDate; }
        return endDate;
    }, [startDate, endDate]);

    const calculatedDays = useMemo(
        () => computeTotalDays(startDate, normalizedEndDate, isHalfDay),
        [startDate, normalizedEndDate, isHalfDay],
    );

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setEndDate((current) => {
            if (!current) { return value; }
            return current < value ? value : current;
        });
    };

    const handleEndDateChange = (value: string) => {
        if (startDate && value && value < startDate) {
            setEndDate(startDate);
            return;
        }
        setEndDate(value);
    };

    function handleConfirmSubmit() {
        setConfirmedSubmit(true);
        setShowPreview(false);
        formReference.current?.requestSubmit();
        setConfirmedSubmit(false);
    }

    const halfDayLockedToSingleDate = isHalfDay && Boolean(startDate);
    const balanceText = balanceForType(balances, leaveType);

    return {
        state,
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
        endDate: normalizedEndDate,
        setEndDate: handleEndDateChange,
        reason,
        setReason,
        calculatedDays,
        showPreview,
        setShowPreview,
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

function computeTotalDays(start: string, end: string, isHalfDay: boolean): number {
    const startDate = parseDateOnly(start);
    if (!startDate) { return 0; }
    const fallbackEnd = end || start;
    const endDate = parseDateOnly(fallbackEnd) ?? startDate;
    const normalizedEnd = endDate < startDate ? startDate : endDate;
    const diffDays = Math.floor((normalizedEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const fullDays = Math.max(diffDays, 1);
    const total = isHalfDay ? Math.max(0.5, fullDays - 0.5) : fullDays;
    return Number(total.toFixed(1));
}
