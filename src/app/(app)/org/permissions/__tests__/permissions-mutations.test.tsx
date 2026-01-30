// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../test/msw-setup";
import { PermissionResourceManager } from "../_components/permission-resource-manager";
import { PermissionResourceCreateForm } from "../_components/permission-resource-create-form";
import type { PermissionResourceCreateState } from "../permission-resource-form-utils";
import type { PermissionResource } from "@/server/types/security-types";

const orgId = "org1";
const baseUrl = `/api/org/${orgId}/permissions`;

const { db } = vi.hoisted(() => ({
  db: {
    resources: [{
      id: "p1",
      resource: "org.test",
      actions: ["read"],
      description: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }] as PermissionResource[],
  },
}));

vi.mock("../permission-resource-actions", () => ({
  createPermissionResourceAction: vi.fn(async (_prev: PermissionResourceCreateState, formData: FormData) => {
    const resource = typeof formData.get("resource") === "string" ? String(formData.get("resource")) : "";
    const actionsRaw = typeof formData.get("actions") === "string" ? String(formData.get("actions")) : "";
    const description = typeof formData.get("description") === "string" ? String(formData.get("description")).trim() : "";
    const actions = actionsRaw
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    db.resources.push({
      id: `p${db.resources.length + 1}`,
      resource,
      actions,
      description: description.length > 0 ? description : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      status: "success",
      message: "Permission resource created.",
      values: { resource: "", actions: "", description: "" },
    };
  }),
}));

describe("permissions create flow", () => {
  it("creates and shows new resource after mutation", async () => {
    server.resetHandlers(
      http.get(baseUrl, () => HttpResponse.json({ resources: db.resources })),
    );

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <div>
          <PermissionResourceCreateForm orgId={orgId} />
        <PermissionResourceManager orgId={orgId} resources={db.resources} />
        </div>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/org\.test/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Resource key/i), "org.new");
    await userEvent.type(screen.getByLabelText(/Allowed actions/i), "read");
    await userEvent.click(screen.getByRole("button", { name: /create resource/i }));

    await screen.findByText(/permission resource created/i);
    await waitFor(() => expect(screen.getByText(/org\.new/)).toBeInTheDocument());
  });
});

