"use client";

import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { isApiErrorResponse, parseFieldErrors } from "./waitlist-form-errors";

export interface WaitlistFormData {
    name: string;
    email: string;
    industry: string;
}

export interface UseWaitlistFormResult {
    formData: WaitlistFormData;
    fieldErrors: Record<string, string>;
    submitMessage: string | null;
    isSubmitting: boolean;
    handleInputChange: (event_: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (event_: FormEvent<HTMLFormElement>) => Promise<void>;
}

interface UseWaitlistFormOptions {
    endpoint?: string;
}

const INITIAL_FORM_STATE: WaitlistFormData = {
    name: "",
    email: "",
    industry: "",
};

function sanitizeFormData(data: WaitlistFormData): WaitlistFormData {
    return {
        name: data.name.trim(),
        email: data.email.trim(),
        industry: data.industry.trim(),
    };
}

function hasEmptyFields(data: WaitlistFormData): boolean {
    return !data.name || !data.email || !data.industry;
}

export function useWaitlistForm(options?: UseWaitlistFormOptions): UseWaitlistFormResult {
    const endpoint = options?.endpoint ?? "/api/auth/waitlist";
    const [formData, setFormData] = useState<WaitlistFormData>(INITIAL_FORM_STATE);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = useCallback((event_: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event_.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (event_: FormEvent<HTMLFormElement>) => {
        event_.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        const trimmed = sanitizeFormData(formData);
        if (hasEmptyFields(trimmed)) {
            setSubmitMessage("Please complete all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            setFieldErrors({});

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trimmed),
            });

            const body: unknown = await response.json().catch(() => ({}));

            if (response.status === 201 || response.status === 200) {
                setSubmitMessage("Thanks for joining our waitlist! Check your email for next steps.");
                setFormData({ ...INITIAL_FORM_STATE });
                return;
            }

            if (response.status === 429) {
                setSubmitMessage("Too many submissions from this IP. Please try again later.");
                return;
            }

            if (isApiErrorResponse(body)) {
                const payloadErrors = parseFieldErrors(body.error.details);
                if (Object.keys(payloadErrors).length > 0) {
                    setFieldErrors(payloadErrors);
                }
                setSubmitMessage(body.error.message);
                return;
            }

            setSubmitMessage("An unexpected error occurred. Please try again.");
        } catch {
            setSubmitMessage("Something went wrong — please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    }, [endpoint, formData]);

    return {
        formData,
        fieldErrors,
        submitMessage,
        isSubmitting,
        handleInputChange,
        handleSubmit,
    };
}
