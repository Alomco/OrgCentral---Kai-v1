export type RoleActionType = 'created' | 'updated' | 'deleted';

export interface RoleUpdatePayload {
    roleId: string;
    roleName: string;
    action: RoleActionType;
}
