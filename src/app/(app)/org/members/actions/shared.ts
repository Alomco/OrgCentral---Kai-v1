
export type MemberActionState =
    | { status: 'idle' }
    | { status: 'success'; message: string; requestId: string }
    | { status: 'error'; message: string; requestId: string };

export type InviteMemberActionState =
    | { status: 'idle' }
    | { status: 'success'; message: string; token: string; alreadyInvited: boolean }
    | { status: 'error'; message: string };

export function normalizeRoleList(input: string): string[] {
    const roles = input
        .split(',')
        .map((role) => role.trim())
        .filter((role) => role.length > 0);

    const first = roles[0];
    return [typeof first === 'string' ? first : 'member'];
}
