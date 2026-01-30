// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../test/msw-setup";
import { MembersListClient } from "../_components/members-list.client";
import { memberKeys, membersSearchKey } from "../_components/members.api";
import type { UserData } from "@/server/types/leave-types";

const orgId = 'org1';
const baseUrl = `/api/org/${orgId}/members`;
const putUrl = (userId: string) => `/api/org/${orgId}/membership/${userId}`;

const timestamp = new Date().toISOString();
const users: UserData[] = [
  {
    id: 'u1',
    email: 'a@example.com',
    displayName: 'A',
    roles: ['member'],
    memberships: [{ organizationId: orgId, organizationName: 'Org One', roles: ['member'], status: 'ACTIVE' }],
    memberOf: [orgId],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'u2',
    email: 'b@example.com',
    displayName: 'B',
    roles: ['member'],
    memberships: [{ organizationId: orgId, organizationName: 'Org One', roles: ['member'], status: 'ACTIVE' }],
    memberOf: [orgId],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

function renderList(query: string) {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MembersListClient
        orgId={orgId}
        currentQueryKey={query}
        initial={{ users, totalCount: 2, page: 1, pageSize: 25 }}
      />
    </QueryClientProvider>
  );
  return qc;
}

describe('members remove from org', () => {
  it('optimistically removes and stays removed (status=ACTIVE filter)', async () => {
    const query = new URLSearchParams({ status: 'ACTIVE', page: '1', pageSize: '25' }).toString();
    const mutableUsers = users.map((user) => ({
      ...user,
      memberships: user.memberships.map((membership) => ({ ...membership })),
      roles: [...user.roles],
    }));

    const expectedKey = membersSearchKey(new URLSearchParams(query));
    server.resetHandlers(
      http.get(baseUrl, ({ request }) => {
        const url = new URL(request.url);
        const actualKey = membersSearchKey(url.searchParams);
        if (actualKey !== expectedKey) {
          return HttpResponse.json({ message: 'bad query' }, { status: 400 });
        }
        const status = url.searchParams.get('status');
        const filtered = status
          ? mutableUsers.filter((user) => user.memberships.some((member) => member.status === status))
          : mutableUsers;
        return HttpResponse.json({ users: filtered, totalCount: filtered.length, page: 1, pageSize: 25 });
      }),
      http.put(putUrl('u2'), async ({ request }) => {
        const body = await request.json() as { status?: string };
        const target = mutableUsers.find((user) => user.id === 'u2');
        if (target && target.memberships[0] && body.status) {
          target.memberships[0].status = body.status as typeof target.memberships[0]['status'];
        }
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    const qc = renderList(query);

    expect(await screen.findByText('B')).toBeInTheDocument();

    const btns = await screen.findAllByRole('button', { name: /remove from org/i }); await userEvent.click(btns[btns.length-1]);

    await qc.invalidateQueries({ queryKey: memberKeys.list(orgId, expectedKey) });
    await waitFor(() => expect(screen.queryByText('B')).not.toBeInTheDocument());
  });

  it('rolls back on error', async () => {
    const query = new URLSearchParams({ status: 'ACTIVE', page: '1', pageSize: '25' }).toString();
    const mutableUsers = users.map((user) => ({
      ...user,
      memberships: user.memberships.map((membership) => ({ ...membership })),
      roles: [...user.roles],
    }));

    const expectedKey = membersSearchKey(new URLSearchParams(query));
    server.resetHandlers(
      http.get(baseUrl, ({ request }) => {
        const url = new URL(request.url);
        const actualKey = membersSearchKey(url.searchParams);
        if (actualKey !== expectedKey) {
          return HttpResponse.json({ message: 'bad query' }, { status: 400 });
        }
        const status = url.searchParams.get('status');
        const filtered = status
          ? mutableUsers.filter((user) => user.memberships.some((member) => member.status === status))
          : mutableUsers;
        return HttpResponse.json({ users: filtered, totalCount: filtered.length, page: 1, pageSize: 25 });
      }),
      http.put(putUrl('u2'), async () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    );

    renderList(query);

    expect(await screen.findByText('B')).toBeInTheDocument();

    const btns = await screen.findAllByRole('button', { name: /remove from org/i }); await userEvent.click(btns[btns.length-1]);

    await waitFor(() => expect(screen.getByText('B')).toBeInTheDocument());
  });
});




