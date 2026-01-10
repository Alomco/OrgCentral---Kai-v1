import { Badge } from '@/components/ui/badge';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';

interface LeaveRequestAttachmentsProps {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
}

export async function LeaveRequestAttachments({ authorization, requestId }: LeaveRequestAttachmentsProps) {
    const service = getLeaveService();
    const result = await service.listLeaveAttachments({ authorization, requestId });

    if (result.attachments.length === 0) {
        return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {result.attachments.map((attachment) => (
                <a
                    key={attachment.id}
                    href={`/api/hr/leave/attachments/${attachment.id}/download`}
                    className="max-w-[180px] truncate"
                    title={`${attachment.fileName} • ${Math.ceil(attachment.fileSize / 1024).toLocaleString()} KB`}
                >
                    <Badge variant="secondary" className="max-w-full truncate">
                        {attachment.fileName}
                    </Badge>
                </a>
            ))}
        </div>
    );
}