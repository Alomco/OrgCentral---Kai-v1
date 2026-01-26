'use client';

import { memo, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { NotificationItem } from '@/components/notifications/notification-item';
import type { HRNotificationDTO } from '@/server/types/hr/notifications';
import { markHrNotificationRead, deleteHrNotification } from '../actions';

interface NotificationListProps {
  notifications: HRNotificationDTO[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isPending, startTransition] = useTransition();
  const refreshReference = useRef<() => void>(() => router.refresh());

  useEffect(() => {
    refreshReference.current = () => router.refresh();
  }, [router]);

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      if (current.size === notifications.length) {
        return new Set();
      }
      return new Set(notifications.map((notification) => notification.id));
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkRead = () => {
    if (selectedIds.size === 0) {
      return;
    }
    
    startTransition(async () => {
      const promises = Array.from(selectedIds).map(id => 
        markHrNotificationRead({ notificationId: id })
      );
      await Promise.all(promises);
      toast.success(`${String(selectedIds.size)} notifications marked as read`);
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      return;
    }

    startTransition(async () => {
      const promises = Array.from(selectedIds).map(id => 
        deleteHrNotification({ notificationId: id })
      );
      await Promise.all(promises);
      toast.success(`${String(selectedIds.size)} notifications deleted`);
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg border-dashed">
        <p className="text-lg font-medium">No notifications found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3 px-2">
          <Checkbox 
            checked={selectedIds.size === notifications.length && notifications.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkRead} 
                disabled={isPending}
                className="h-8"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark Read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkDelete} 
                disabled={isPending}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div
        className="space-y-2"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 720px' }}
      >
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            selected={selectedIds.has(notification.id)}
            onToggle={() => toggleSelect(notification.id)}
            onRefresh={refreshReference.current}
          />
        ))}
      </div>
    </div>
  );
}

interface NotificationRowProps {
  notification: HRNotificationDTO;
  selected: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

const NotificationRow = memo(function NotificationRow({
  notification,
  selected,
  onToggle,
  onRefresh,
}: NotificationRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-4 pl-2">
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      </div>
      <div className="flex-1">
        <NotificationItem
          notification={notification}
          onRead={onRefresh}
          onDelete={onRefresh}
        />
      </div>
    </div>
  );
});
