"use client";

import type { TextFilterProps } from './audit-log-helpers';

export function TextFilter({ label, value, onChange, placeholder, type = 'text' }: TextFilterProps) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        className="h-8 rounded-md border bg-background px-2"
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        placeholder={placeholder}
        aria-label={label}
      />
    </label>
  );
}
