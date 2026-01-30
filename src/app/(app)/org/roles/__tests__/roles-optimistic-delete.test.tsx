// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../test/msw-setup";
import { RolesListClient } from "../_components/roles-list.client";
import type { Role } from "@/server/types/hr-types";

const orgId = "org1";
const baseUrl = `/api/org/${orgId}/roles`;

const { db } = vi.hoisted(() => ({
  db: {
    roles: [
      { id: "r1", name: "admin", description: null, permissions: {} },
      { id: "r2", name: "member", description: null, permissions: {} },
    ] as Role[],
  },
}));

vi.mock("../actions", () => ({
  createRoleAction: vi.fn(async () => ({ status: "success", message: "Role created." })),
  updateRoleInlineAction: vi.fn(async () => ({ status: "success", message: "Role updated." })),
  deleteRoleInlineAction: vi.fn(async () => ({ status: "success", message: "Role deleted." })),
}));

describe("roles optimistic delete", () => {
  it("removes role immediately and stays removed after invalidate", async () => {
    server.resetHandlers(
      http.get(baseUrl, () => HttpResponse.json({ roles: db.roles })),
      http.delete(`${baseUrl}/r2`, () => {
        db.roles = db.roles.filter((r: any) => r.id !== "r2");
        return HttpResponse.json({}, { status: 204 });
      }),
    );

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RolesListClient orgId={orgId} initial={db.roles} />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/admin/i)).toBeInTheDocument();
    expect(await screen.findByText(/member/i)).toBeInTheDocument();

    // Click delete inside the member row
    const deleteButtons = await screen.findAllByRole('button', { name: /delete role/i });
    // Assume the second role row has the delete button we need
    await userEvent.click(deleteButtons[1]);

    // Optimistic removal: member should disappear
    await waitFor(() => expect(screen.queryByText(/member/i)).not.toBeInTheDocument());

    // Invalidate and re-fetch should keep it gone
    await qc.invalidateQueries({ queryKey: ["org", orgId, "roles"] });
    await waitFor(() => expect(screen.queryByText(/member/i)).not.toBeInTheDocument());
  });
});

