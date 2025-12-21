"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, RefreshCcw, Shield, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DebugOrgSummary {
  id: string;
  slug: string;
  name: string;
}

interface DebugSecurityResponseAuthenticated {
  ok: true;
  authenticated: true;
  session: {
    user: {
      id: string;
      email: string | null;
      name: string | null;
    };
    session: {
      activeOrganizationId: string | null;
      expiresAt?: string;
      createdAt?: string;
    };
  };
  organizations?: DebugOrgSummary[];
  authorization?: {
    orgId: string;
    userId: string;
    roleKey: string;
    dataResidency: string;
    dataClassification: string;
    auditSource: string;
    correlationId: string;
    developmentSuperAdmin?: boolean;
  };
  rbac?: {
    roleStatements?: Record<string, string[]>;
  };
  abac?: {
    policyCount: number;
    policies: {
      id: string;
      effect: "allow" | "deny";
      actions: string[];
      resources: string[];
      priority?: number;
      description?: string;
    }[];
    usingFallbackPolicies: boolean;
  };
  warning?: string;
}

interface DebugSecurityResponseUnauthenticated {
  ok: true;
  authenticated: false;
}

type DebugSecurityResponse = DebugSecurityResponseAuthenticated | DebugSecurityResponseUnauthenticated;

const TOAST_LONG_MS = 1500;
const TOAST_SHORT_MS = 1200;
const DEBUG_TITLE = "Dev security widget";

function truncateId(value: string | null | undefined, head = 8, tail = 4): string {
  if (!value) {
    return "-";
  }
  if (value.length <= head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function renderSessionSection(payload: DebugSecurityResponseAuthenticated, onCopy: (value: string) => void) {
  return (
    <section className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Session</div>
      <div className="space-y-1 rounded-xl border bg-background/60 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">User</span>
          <span className="truncate font-medium">{payload.session.user.email ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">User ID</span>
          <button
            type="button"
            className="font-mono text-[11px] underline underline-offset-2"
            onClick={() => onCopy(payload.session.user.id)}
          >
            {truncateId(payload.session.user.id)}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Active org</span>
          <span className="font-mono text-[11px]">{truncateId(payload.session.session.activeOrganizationId)}</span>
        </div>
      </div>
    </section>
  );
}

function renderAuthorizationSection(
  authorization: DebugSecurityResponseAuthenticated["authorization"],
  onCopy: (value: string) => void,
) {
  if (!authorization) {
    return null;
  }
  return (
    <section className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Authorization</div>
      <div className="space-y-1 rounded-xl border bg-background/60 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Role</span>
          <span className="font-medium">{authorization.roleKey}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Org ID</span>
          <button
            type="button"
            className="font-mono text-[11px] underline underline-offset-2"
            onClick={() => onCopy(authorization.orgId)}
          >
            {truncateId(authorization.orgId)}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Residency</span>
          <span className="font-medium">{authorization.dataResidency}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Classification</span>
          <span className="font-medium">{authorization.dataClassification}</span>
        </div>
      </div>
    </section>
  );
}

function renderAbacSection(payload: DebugSecurityResponseAuthenticated) {
  if (!payload.abac) {
    return null;
  }
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">ABAC</div>
        <Badge variant={payload.abac.usingFallbackPolicies ? "outline" : "secondary"}>
          {payload.abac.policyCount} policies
        </Badge>
      </div>
      <div className="rounded-xl border bg-background/60 px-3 py-2">
        <div className="text-muted-foreground">
          {payload.abac.usingFallbackPolicies ? "Using fallback policies (dev bootstrap)." : "Using tenant-configured policies."}
        </div>
        <div className="mt-2 space-y-1 font-mono text-[11px]">
          {payload.abac.policies.slice(0, 5).map((policy) => (
            <div key={policy.id} className="truncate">
              {policy.effect.toUpperCase()} {policy.id}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderRbacSection(payload: DebugSecurityResponseAuthenticated) {
  const statements = payload.rbac?.roleStatements;
  if (!statements) {
    return null;
  }
  return (
    <section className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">RBAC</div>
      <div className="space-y-2 rounded-xl border bg-background/60 px-3 py-2">
        {Object.entries(statements).map(([resource, actions]) => (
          <div key={resource} className="flex items-start justify-between gap-3">
            <div className="font-mono text-[11px] text-muted-foreground">{resource}</div>
            <div className="text-right font-mono text-[11px]">{actions.join(", ")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderOrganizationsSection(
  organizations: DebugSecurityResponseAuthenticated["organizations"],
  onCopy: (value: string) => void,
) {
  if (!organizations?.length) {
    return null;
  }
  return (
    <section className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Organizations</div>
      <div className="space-y-1 rounded-xl border bg-background/60 px-3 py-2">
        {organizations.map((org) => (
          <div key={org.id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-medium">{org.name}</div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">{org.slug}</div>
            </div>
            <button
              type="button"
              className="font-mono text-[11px] underline underline-offset-2"
              onClick={() => onCopy(org.id)}
            >
              {truncateId(org.id)}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderTools(onCopyJson: () => void, toast: string | null) {
  return (
    <section className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tools</div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/admin-signup">Admin bootstrap</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onCopyJson}>
          <Copy className="h-4 w-4" />
          Copy JSON
        </Button>
      </div>
      {toast ? <div className="text-[11px] text-muted-foreground">{toast}</div> : null}
    </section>
  );
}

export function DevelopmentSecurityWidget() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DebugSecurityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isDevelopment = process.env.NODE_ENV === "development";

  const fetchSecurity = useCallback(async () => {
    if (!isDevelopment) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/security", { cache: "no-store" });
      const body: unknown = await response.json().catch(() => null);
      if (body && typeof body === "object") {
        setPayload(body as DebugSecurityResponse);
      } else {
        setPayload(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDevelopment]);

  const summary = useMemo(() => {
    if (!payload?.ok) {
      return DEBUG_TITLE;
    }
    if (!payload.authenticated) {
      return "Not signed in";
    }
    const role = payload.authorization?.roleKey ?? "unknown-role";
    const org = payload.authorization?.orgId ?? payload.session.session.activeOrganizationId ?? null;
    return `${role} | org ${truncateId(org)}`;
  }, [payload]);

  const collapsedBadge = useMemo(() => {
    if (!payload?.ok || !payload.authenticated) {
      return null;
    }
    const role = payload.authorization?.roleKey ?? "unknown";
    const variant = payload.authorization?.developmentSuperAdmin ? "destructive" : "secondary";
    return <Badge variant={variant}>{role}</Badge>;
  }, [payload]);

  const handleToggle = useCallback(() => {
    setOpen((previous) => {
      const next = !previous;
      if (next) {
        fetchSecurity().catch(() => {
          setToast("Failed to load security context");
        });
      }
      return next;
    });
  }, [fetchSecurity]);

  const handleCopyJson = useCallback(async () => {
    if (!payload) {
      return;
    }
    const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
    setToast(ok ? "Copied debug JSON" : "Clipboard blocked");
    window.setTimeout(() => setToast(null), TOAST_LONG_MS);
  }, [payload]);

  const handleCopyValue = useCallback(async (value: string) => {
    const ok = await copyToClipboard(value);
    setToast(ok ? "Copied" : "Clipboard blocked");
    window.setTimeout(() => setToast(null), TOAST_SHORT_MS);
  }, []);

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-background/95 text-foreground shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-semibold">Dev security</div>
                {payload?.ok && payload.authenticated && payload.authorization?.developmentSuperAdmin ? (
                  <Badge variant="destructive">super</Badge>
                ) : null}
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground">{summary}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={fetchSecurity}
                disabled={isLoading}
                aria-label="Refresh security context"
              >
                <RefreshCcw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <div className="max-h-[65vh] space-y-4 overflow-auto px-4 py-3 text-xs">
            {payload?.ok && payload.authenticated ? (
              <>
                {payload.warning ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    {payload.warning}
                  </div>
                ) : null}

                {renderSessionSection(payload, handleCopyValue)}
                {renderAuthorizationSection(payload.authorization, handleCopyValue)}
                {renderAbacSection(payload)}
                {renderRbacSection(payload)}
                {renderOrganizationsSection(payload.organizations, handleCopyValue)}
                {renderTools(handleCopyJson, toast)}
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Not signed in</div>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href="/login">Go to login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button type="button" variant="secondary" size="sm" className="rounded-full shadow-lg" onClick={handleToggle}>
          <Shield className="h-4 w-4" />
          <span>Security</span>
          {collapsedBadge ? <span className="ml-1">{collapsedBadge}</span> : null}
        </Button>
      )}
    </div>
  );
}
