import React, { forwardRef } from 'react';
import { 
  X, 
  Bell, 
  Settings, 
  Trash2,
  Calendar,
  File,
  Trash,
  Music,
  Info,
  AppWindow,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, Notification } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<Notification['icon'], React.ElementType> = {
  calendar: Calendar,
  file: File,
  app: AppWindow,
  system: Monitor,
  trash: Trash,
  music: Music,
  info: Info,
};

export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  ({ isOpen, onClose }, ref) => {
    const { 
      notifications, 
      markAsRead, 
      removeNotification, 
      clearAllNotifications, 
      unreadCount 
    } = useNotifications();

    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (minutes < 1) {
        return 'Just now';
      } else if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    if (!isOpen) return null;

    return (
      <>
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={onClose} 
        />
        <div 
          ref={ref}
          className="fixed right-0 top-0 bottom-12 w-80 sm:w-96 win-window z-[9999] flex flex-col animate-in slide-in-from-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={18} />
              <span className="font-medium">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications}
                  className="p-1.5 rounded-md win-hover"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1.5 rounded-md win-hover"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4 border-b border-border">
            <div className="text-center">
              <div className="text-3xl font-light">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bell size={48} className="mb-4 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => {
                  const IconComponent = iconMap[notification.icon] || Bell;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "p-3 rounded-lg mb-2 cursor-pointer transition-colors group",
                        notification.read 
                          ? "bg-secondary/30 hover:bg-secondary/50" 
                          : "bg-primary/10 hover:bg-primary/20"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          notification.read ? "bg-muted" : "bg-primary/20"
                        )}>
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(notification.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center">
              <Settings size={14} />
              Notification settings
            </button>
          </div>
        </div>
      </>
    );
  }
);

NotificationCenter.displayName = 'NotificationCenter';
