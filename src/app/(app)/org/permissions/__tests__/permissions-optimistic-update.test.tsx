// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../test/msw-setup";
import { PermissionResourceManager } from "../_components/permission-resource-manager";
import { permissionKeys } from "../_components/permissions.api";
import type { PermissionResource } from "@/server/types/security-types";

const orgId = "org1";
const baseUrl = `/api/org/${orgId}/permissions`;

const seed = (): PermissionResource[] => ([{ id: "p1", orgId, resource: "org.test", actions: ["read"], description: "Old", createdAt: new Date(), updatedAt: new Date() }]);

describe("permissions optimistic update", () => {
  it("updates row instantly and persists after re-fetch", async () => {
    const resources = seed();
    server.resetHandlers(
      http.get(baseUrl, () => HttpResponse.json({ resources })),
      http.put(`${baseUrl}/p1`, async ({ request }) => {
        const body = await request.json() as { resource?: string; actions?: string[]; description?: string | null };
        resources[0] = { ...resources[0], ...body, actions: body.actions ?? resources[0].actions, updatedAt: new Date() };
        return HttpResponse.json({ resource: resources[0] }, { status: 200 });
      })
    );

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PermissionResourceManager orgId={orgId} resources={resources} />
      </QueryClientProvider>
    );

    const row = (await screen.findByText(/org\.test/)).closest('div.rounded-lg');
    if (!row) {
      throw new Error('Missing permission row');
    }

    // Edit description inline (open the row form and change field)
    const rowElement = row as HTMLElement;
    await userEvent.click(within(rowElement).getByRole('button', { name: /edit/i }));
    const desc = await within(rowElement).findByLabelText(/Description/i);
    await userEvent.clear(desc);
    await userEvent.type(desc, "Updated");
    await userEvent.click(within(rowElement).getByRole('button', { name: /save/i }));

    // The row shows the update without waiting for re-fetch
    await within(rowElement).findByText("Updated", { selector: 'p' });

    // Invalidate then ensure it still shows
    await qc.invalidateQueries({ queryKey: permissionKeys.list(orgId) });
    await waitFor(async () => { await within(rowElement).findByText("Updated", { selector: 'p' }); });
  });

  it("rolls back on update error", async () => {
    const resources = seed();
    server.resetHandlers(
      http.get(baseUrl, () => HttpResponse.json({ resources })),
      http.put(`${baseUrl}/p1`, async () => HttpResponse.json({ message: "fail" }, { status: 500 }))
    );

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PermissionResourceManager orgId={orgId} resources={resources} />
      </QueryClientProvider>
    );

    const row = (await screen.findByText(/org\.test/)).closest('div.rounded-lg');
    if (!row) {
      throw new Error('Missing permission row');
    }
    expect(screen.getByText("Old")).toBeInTheDocument();

    const rowElement = row as HTMLElement;
    await userEvent.click(within(rowElement).getByRole('button', { name: /edit/i }));
    const desc = await within(rowElement).findByLabelText(/Description/i);
    await userEvent.clear(desc);
    await userEvent.type(desc, "Updated");
    await userEvent.click(within(rowElement).getByRole('button', { name: /save/i }));

    await waitFor(() => expect(within(rowElement).getByText("Old", { selector: 'p' })).toBeInTheDocument());
  });
});

