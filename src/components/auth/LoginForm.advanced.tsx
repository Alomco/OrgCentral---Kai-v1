"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, Fingerprint, Info } from "lucide-react";
import { CustomSelectField } from "./LoginForm.fields";
import { CLASSIFICATION_OPTIONS, RESIDENCY_OPTIONS } from "./LoginForm.constants";
import type { LoginFormValues } from "@/hooks/forms/auth/use-login-form";
import type { LoginFieldErrors as LoginFormErrors } from "@/hooks/forms/auth/login-form-errors";

interface AdvancedOptionsProps {
  values: LoginFormValues;
  errors: LoginFormErrors;
  showAdvanced: boolean;
  onToggle: () => void;
  onValueChange: (change: ChangeEvent<HTMLSelectElement>) => void;
}

export function AdvancedOptions({ values, errors, showAdvanced, onToggle, onValueChange }: AdvancedOptionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-indigo-50/50 p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700/60 dark:from-slate-800/40 dark:to-indigo-900/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100/80 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Advanced options
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Only adjust when your admin requires a specific data region or classification.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">
              Defaults are UK Only and Official. Expand to override for regulated tenants.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? "Hide" : "Show"}
        </Button>
      </div>

      {showAdvanced ? (
        <div className="mt-4 grid gap-3.5 border-t border-slate-200 bg-white/60 px-4 pb-3.5 pt-3.5 md:grid-cols-2 dark:border-slate-700/60 dark:bg-slate-900/20">
          <CustomSelectField
            id="residency"
            name="residency"
            label="Data region"
            icon={<ShieldCheck className="h-4 w-4" />}
            value={values.residency}
            options={RESIDENCY_OPTIONS}
            error={errors.residency}
            onValueChange={(value: string) =>
              onValueChange({ target: { name: "residency", value } } as ChangeEvent<HTMLSelectElement>)
            }
          />

          <CustomSelectField
            id="classification"
            name="classification"
            label="Security level"
            icon={<Fingerprint className="h-4 w-4" />}
            value={values.classification}
            options={CLASSIFICATION_OPTIONS}
            error={errors.classification}
            onValueChange={(value: string) =>
              onValueChange({ target: { name: "classification", value } } as ChangeEvent<HTMLSelectElement>)
            }
          />
        </div>
      ) : null}
    </div>
  );
}
