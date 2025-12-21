"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { LoginActionInput } from "@/features/auth/login/login-contracts";
import { isLoginActionResult, normalizeFieldErrors, type LoginFieldErrors } from "./login-form-errors";

export type ResidencyZoneOption = "UK_ONLY" | "UK_AND_EEA" | "GLOBAL_RESTRICTED";
export type ClassificationLevelOption = "PUBLIC" | "OFFICIAL" | "OFFICIAL_SENSITIVE";

export interface LoginFormValues {
    email: string;
    password: string;
    orgSlug: string;
    residency: ResidencyZoneOption;
    classification: ClassificationLevelOption;
    rememberMe: boolean;
}

export interface UseLoginFormOptions {
    initialOrgSlug?: string;
    initialResidency?: ResidencyZoneOption;
    initialClassification?: ClassificationLevelOption;
}

export interface UseLoginFormResult {
    values: LoginFormValues;
    errors: LoginFieldErrors;
    submitMessage: string | null;
    isSubmitting: boolean;
    handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleCheckboxToggle: (field: "rememberMe", checked: boolean) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const DEFAULT_VALUES: LoginFormValues = {
    email: "",
    password: "",
    orgSlug: "",
    residency: "UK_ONLY",
    classification: "OFFICIAL",
    rememberMe: true,
};

function sanitize(values: LoginFormValues): LoginFormValues {
    return {
        ...values,
        email: values.email.trim().toLowerCase(),
        password: values.password.trim(),
        orgSlug: values.orgSlug.trim(),
    };
}

function isFormIncomplete(values: LoginFormValues): boolean {
    return !values.email || !values.password || !values.orgSlug;
}

export function useLoginForm(options?: UseLoginFormOptions): UseLoginFormResult {
    const router = useRouter();
    const [values, setValues] = useState<LoginFormValues>({
        ...DEFAULT_VALUES,
        orgSlug: options?.initialOrgSlug ?? DEFAULT_VALUES.orgSlug,
        residency: options?.initialResidency ?? DEFAULT_VALUES.residency,
        classification: options?.initialClassification ?? DEFAULT_VALUES.classification,
    });
    const [errors, setErrors] = useState<LoginFieldErrors>({});
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const memoizedValues = useMemo(() => sanitize(values), [values]);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
    }, []);

    const handleCheckboxToggle = useCallback((field: "rememberMe", checked: boolean) => {
        setValues((previous) => ({ ...previous, [field]: checked }));
    }, []);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        (async () => {
            setSubmitMessage(null);
            setErrors({});

            if (isFormIncomplete(memoizedValues)) {
                setSubmitMessage("Please complete every required field.");
                return;
            }

            const payload: LoginActionInput = {
                ...memoizedValues,
                userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
            };

            setIsSubmitting(true);
            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "same-origin",
                });
                const body: unknown = await response.json().catch(() => ({}));

                if (!isLoginActionResult(body)) {
                    setSubmitMessage("Unexpected response from auth service.");
                    return;
                }

                if (body.ok) {
                    setSubmitMessage(body.message);
                    if (body.redirectUrl) {
                        router.push(body.redirectUrl);
                    }
                    return;
                }

                setErrors(normalizeFieldErrors(body.fieldErrors));
                setSubmitMessage(body.message);
            } catch {
                setSubmitMessage("We could not reach the authentication service. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        })().catch(() => {
            setSubmitMessage("We could not reach the authentication service. Please try again.");
            setIsSubmitting(false);
        });
    }, [memoizedValues, router]);

    return {
        values,
        errors,
        submitMessage,
        isSubmitting,
        handleInputChange,
        handleCheckboxToggle,
        handleSubmit,
    };
}
