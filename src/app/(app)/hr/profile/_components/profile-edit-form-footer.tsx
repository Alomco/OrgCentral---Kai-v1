import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ModalFooter } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';

interface ProfileEditFormFooterProps {
    pending: boolean;
    onCancel?: () => void;
}

export function ProfileEditFormFooter({ pending, onCancel }: ProfileEditFormFooterProps) {
    return (
        <ModalFooter className="sticky bottom-0 z-20 mt-auto border-t border-[oklch(var(--border)/0.55)] bg-[oklch(var(--background)/0.98)] px-5 py-4 backdrop-blur-md">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={pending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={pending} className="min-w-[150px] shadow-lg shadow-[oklch(var(--primary)/0.2)]">
                    {pending ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    {pending ? 'Saving...' : 'Save changes'}
                </Button>
            </div>
        </ModalFooter>
    );
}
