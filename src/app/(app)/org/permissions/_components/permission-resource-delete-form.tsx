'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { PermissionResource } from '@/server/types/security-types';

import { permissionKeys, deletePermissionResource } from './permissions.api';

interface DeleteContext {
    previousList?: PermissionResource[];
}

export function PermissionResourceDeleteForm(props: { orgId: string; resourceId: string }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const remove = useMutation<undefined, Error, undefined, DeleteContext>({
        mutationFn: async () => {
            await deletePermissionResource(props.orgId, props.resourceId);
            return undefined;
        },
        onMutate: async () => {
            const listKey = permissionKeys.list(props.orgId);
            await queryClient.cancelQueries({ queryKey: listKey });
            const previousList = queryClient.getQueryData<PermissionResource[]>(listKey);
            if (previousList) {
                queryClient.setQueryData(listKey, previousList.filter((item) => item.id !== props.resourceId));
            }
            return { previousList };
        },
        onError: (error, _payload, context) => {
            const listKey = permissionKeys.list(props.orgId);
            if (context?.previousList) {
                queryClient.setQueryData(listKey, context.previousList);
            }
            setMessage(error.message || 'Unable to delete resource.');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.list(props.orgId) }).catch(() => null);
        },
    });

    return (
        <div className="flex flex-wrap items-center justify-end gap-2" aria-busy={remove.isPending}>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                    <Button type="button" size="sm" variant="destructive" disabled={remove.isPending}>
                        {remove.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete permission resource?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. Roles and policies referencing this resource will need to be updated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={remove.isPending}
                            onClick={() => {
                                setConfirmOpen(false);
                                setMessage(null);
                                remove.mutate(undefined);
                            }}
                        >
                            {remove.isPending ? 'Deleting...' : 'Delete resource'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {message ? (
                <p className="text-xs text-destructive">
                    {message}
                </p>
            ) : null}
        </div>
    );
}