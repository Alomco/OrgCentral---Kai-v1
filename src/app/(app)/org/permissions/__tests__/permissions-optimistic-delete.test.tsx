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

const orgId = "org-perm-delete";
const baseUrl = `/api/org/${orgId}/permissions`;

const db: { resources: PermissionResource[] } = { resources: [
  { id: "p1", orgId, resource: "org.test", actions: ["read"], description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: "p2", orgId, resource: "org.temp", actions: ["read","update"], description: null, createdAt: new Date(), updatedAt: new Date() }
] };

describe("permissions optimistic delete", () => {
  it("removes resource immediately and stays removed after invalidate", async () => {
    server.resetHandlers(
      http.get(baseUrl, () => HttpResponse.json({ resources: db.resources.map((resource) => ({
        ...resource,
        actions: [...resource.actions],
      })) })),
      http.delete(`${baseUrl}/p2`, () => {
        db.resources = db.resources.filter((resource) => resource.id !== "p2");
        return HttpResponse.json({}, { status: 204 });
      })
    );

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PermissionResourceManager orgId={orgId} resources={db.resources} />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/org\.temp/)).toBeInTheDocument();

    // Click the delete trigger button in the org.temp row
    const row = screen.getByText(/org\.temp/).closest('div.rounded-lg');
    if (!row) {
      throw new Error('Missing permission row');
    }
    const rowElement = row as HTMLElement;
    await userEvent.click(within(rowElement).getByRole('button', { name: /edit/i }));
    const delBtn = within(rowElement).getByRole('button', { name: /delete/i });
    await userEvent.click(delBtn);

    // Confirm in dialog
    const confirm = await screen.findByRole('button', { name: /delete resource/i });
    await userEvent.click(confirm);

    // Optimistic removal
    await waitFor(() => expect(screen.queryByText(/org\.temp/)).not.toBeInTheDocument());

    await qc.invalidateQueries({ queryKey: permissionKeys.list(orgId) });
    await waitFor(() => expect(screen.queryByText(/org\.temp/)).not.toBeInTheDocument());
  });
});

