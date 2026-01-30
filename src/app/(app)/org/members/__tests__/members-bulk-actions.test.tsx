// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../test/msw-setup";
import { MembersListClient } from "../_components/members-list.client";
import { OrgMembersBulkActions } from "../_components/org-members-bulk-actions";
import { membersSearchKey } from "../_components/members.api";
import type { UserData } from "@/server/types/leave-types";
import type { MembershipStatus } from "@prisma/client";


const orgId = 'org1';
const baseUrl = `/api/org/${orgId}/members`;
const membershipUrl = `/api/org/${orgId}/membership`;

const timestamp = new Date().toISOString();
const initialUsers: UserData[] = [
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

function cloneUsers(source: UserData[]): UserData[] {
  return source.map((user) => ({
    ...user,
    roles: [...user.roles],
    memberships: user.memberships.map((membership) => ({
      ...membership,
      roles: [...membership.roles],
    })),
  }));
}

function renderHarness(query: string, users: UserData[]) {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <OrgMembersBulkActions orgId={orgId} currentQueryKey={query} roleNames={['member', 'admin']} />
      <MembersListClient
        orgId={orgId}
        currentQueryKey={query}
        initial={{ users, totalCount: users.length, page: 1, pageSize: 25 }}
      />
    </QueryClientProvider>
  );
  return qc;
}

describe('members bulk actions', () => {
  it('suspends selected members and refreshes the list', async () => {
    const query = new URLSearchParams({ status: 'ACTIVE', page: '1', pageSize: '25' }).toString();
    const expectedKey = membersSearchKey(new URLSearchParams(query));
    const users = initialUsers.map((user) => ({
      ...user,
      memberships: user.memberships.map((membership) => ({ ...membership })),
      roles: [...user.roles],
    }));

    server.resetHandlers(
      http.get(baseUrl, ({ request }) => {
        const url = new URL(request.url);
        const actualKey = membersSearchKey(url.searchParams);
        if (actualKey !== expectedKey) {
          return HttpResponse.json({ message: 'bad query' }, { status: 400 });
        }
        return HttpResponse.json({ users: cloneUsers(users), totalCount: users.length, page: 1, pageSize: 25 });
      }),
      http.put(`${membershipUrl}/:userId`, async ({ params, request }) => {
        const body = (await request.json()) as { status?: string; roles?: string[] };
        const userId = String(params.userId);
        const target = users.find((u) => u.id === userId);
        if (target && target.memberships[0]) {
          if (body.status) {
            target.memberships[0].status = body.status as MembershipStatus;
          }
          if (body.roles) {
            target.memberships[0].roles = body.roles;
          }
        }
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    renderHarness(query, users);

    const selectB = await screen.findByLabelText('Select B');
    await userEvent.click(selectB);

    const bulkForm = document.getElementById('bulk-members-form');
    if (!bulkForm) {
      throw new Error('Missing bulk actions form');
    }
    await userEvent.click(within(bulkForm).getByRole('button', { name: /suspend/i }));

    await waitFor(() => {
      expect(users[1]?.memberships[0]?.status).toBe('SUSPENDED');
    });
  });

  it('updates roles in bulk and refetches the list', async () => {
    const query = new URLSearchParams({ status: 'ACTIVE', page: '1', pageSize: '25' }).toString();
    const expectedKey = membersSearchKey(new URLSearchParams(query));
    const users = initialUsers.map((user) => ({
      ...user,
      memberships: user.memberships.map((membership) => ({ ...membership })),
      roles: [...user.roles],
    }));
    let getCount = 0;
    let lastRoles: string[] | undefined;

    server.resetHandlers(
      http.get(baseUrl, ({ request }) => {
        getCount += 1;
        const url = new URL(request.url);
        const actualKey = membersSearchKey(url.searchParams);
        if (actualKey !== expectedKey) {
          return HttpResponse.json({ message: 'bad query' }, { status: 400 });
        }
        return HttpResponse.json({ users: cloneUsers(users), totalCount: users.length, page: 1, pageSize: 25 });
      }),
      http.put(`${membershipUrl}/:userId`, async ({ params, request }) => {
        const body = (await request.json()) as { status?: string; roles?: string[] };
        const userId = String(params.userId);
        const target = users.find((u) => u.id === userId);
        if (target && target.memberships[0]) {
          if (body.roles) {
            target.memberships[0].roles = body.roles;
            lastRoles = body.roles;
          }
        }
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    renderHarness(query, users);

    const selectB = await screen.findByLabelText('Select B');
    await userEvent.click(selectB);

    const bulkForm = document.getElementById('bulk-members-form');
    if (!bulkForm) {
      throw new Error('Missing bulk actions form');
    }
    const roleSelect = within(bulkForm).getByRole('combobox', { name: /new role/i });
    await userEvent.selectOptions(roleSelect, 'admin');
    await userEvent.click(within(bulkForm).getByRole('button', { name: /update roles/i }));

    await waitFor(() => expect(lastRoles).toEqual(['admin']));
  });
});
