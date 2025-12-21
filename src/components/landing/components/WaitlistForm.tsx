"use client";

import { Loader2 } from "lucide-react";
import type { CtaContent } from "@/components/landing/config/cta-content";
import { useWaitlistForm } from "@/hooks/forms/landing/use-waitlist-form";
import type { WaitlistFormData } from "@/hooks/forms/landing/use-waitlist-form";

interface WaitlistFormProps {
    content: CtaContent;
}

type FieldKey = keyof WaitlistFormData;

function buildFieldA11yProps(fieldErrors: Record<string, string>, field: FieldKey, descriptionId: string) {
    if (!fieldErrors[field]) {
        return {};
    }

    return {
        "aria-invalid": "true",
        "aria-describedby": descriptionId,
    } as const;
}

export default function WaitlistForm({ content }: WaitlistFormProps) {
    const {
        formData,
        fieldErrors,
        submitMessage,
        isSubmitting,
        handleInputChange,
        handleSubmit,
    } = useWaitlistForm();

    const nameFieldA11yProps = buildFieldA11yProps(fieldErrors, "name", "name-error");
    const emailFieldA11yProps = buildFieldA11yProps(fieldErrors, "email", "email-error");
    const industryFieldA11yProps = buildFieldA11yProps(fieldErrors, "industry", "industry-error");

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Full Name"
                required
                {...nameFieldA11yProps}
                className="w-full px-6 py-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 backdrop-blur-sm focus:outline-none focus:ring-3 focus:ring-blue-400/20 dark:focus:ring-purple-500/30 focus:border-blue-400 dark:focus:border-purple-500 transition-all duration-300"
            />
            {fieldErrors.name && <p id="name-error" className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.name}</p>}

            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Business Email Address"
                required
                {...emailFieldA11yProps}
                className="w-full px-6 py-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 backdrop-blur-sm focus:outline-none focus:ring-3 focus:ring-blue-400/20 dark:focus:ring-purple-500/30 focus:border-blue-400 dark:focus:border-purple-500 transition-all duration-300"
            />
            {fieldErrors.email && <p id="email-error" className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>}

            <label htmlFor="industry" className="sr-only">
                Select your industry
            </label>
            <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
                {...industryFieldA11yProps}
                className="w-full px-6 py-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white backdrop-blur-sm focus:outline-none focus:ring-3 focus:ring-blue-400/20 dark:focus:ring-purple-500/30 focus:border-blue-400 dark:focus:border-purple-500 transition-all duration-300"
            >
                <option value="" disabled>
                    Select Your Industry
                </option>
                {content.industries.map((industry) => (
                    <option key={industry} value={industry.toLowerCase()}>
                        {industry}
                    </option>
                ))}
            </select>
            {fieldErrors.industry && <p id="industry-error" className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.industry}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gradient text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 disabled:opacity-50 hover:shadow-2xl hover:shadow-purple-500/50"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Joining...</span>
                    </div>
                ) : (
                    content.buttonText
                )}
            </button>

            {submitMessage && (
                <div className={`mt-6 p-4 rounded-lg ${submitMessage.includes("wrong") ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"} border ${submitMessage.includes("wrong") ? "border-red-200 dark:border-red-800/50" : "border-green-200 dark:border-green-800/50"}`}>
                    {submitMessage}
                </div>
            )}
        </form>
    );
}
