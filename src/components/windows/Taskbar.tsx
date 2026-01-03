import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { ContextMenu } from './ContextMenu';
import { WidgetsPanel } from './WidgetsPanel';
import { SystemTray } from './SystemTray';
import { LockScreen } from './LockScreen';
import { NotificationCenter } from './NotificationCenter';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ChevronUp, Power, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Windows 11 style SVG icons
const Win11Icons = {
  Search: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="#FFC107" />
      <path d="M3 8h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" fill="#FFD54F" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <circle cx="12" cy="12" r="10" className="fill-blue-500" />
      <path d="M12 2C7 2 4 7 4 12s3 10 8 10c1.5 0 2-1 2-2s-1.5-2-3-2c-2 0-3.5-1.5-3.5-3.5S9.5 11 12 11c1.5 0 2.5-.5 3-1.5.5-1 1-2.5 2-2.5 2 0 3 1.5 3 3" stroke="#fff" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="7" r="3" className="fill-green-400" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <path d="M6 2h8l6 6v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#90CAF9" />
      <path d="M14 2v6h6" fill="#64B5F6" />
      <path d="M8 12h8M8 16h6" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Calculator: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#607D8B" />
      <rect x="6" y="4" width="12" height="5" rx="1" fill="#90A4AE" />
      <circle cx="8" cy="12" r="1.2" fill="#fff" />
      <circle cx="12" cy="12" r="1.2" fill="#fff" />
      <circle cx="16" cy="12" r="1.2" fill="#fff" />
      <circle cx="8" cy="16" r="1.2" fill="#fff" />
      <circle cx="12" cy="16" r="1.2" fill="#fff" />
      <circle cx="16" cy="16" r="1.2" fill="#fff" />
      <circle cx="8" cy="20" r="1.2" fill="#fff" />
      <circle cx="12" cy="20" r="1.2" fill="#fff" />
      <circle cx="16" cy="20" r="1.2" fill="#fff" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="#78909C" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="#B0BEC5" />
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" fill="#455A64" />
      <rect x="4" y="5" width="16" height="10" rx="1" fill="#81D4FA" />
      <path d="M8 20h8M12 17v3" stroke="#455A64" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Trash2: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none">
      <path d="M4 6h16l-1.5 14a2 2 0 01-2 2h-9a2 2 0 01-2-2L4 6z" fill="#78909C" />
      <path d="M3 6h18" stroke="#546E7A" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#546E7A" strokeWidth="2" />
      <path d="M10 10v8M14 10v8" stroke="#B0BEC5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Start: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1" fill="#0078D4" />
      <rect x="13" y="3" width="8" height="8" rx="1" fill="#0078D4" />
      <rect x="3" y="13" width="8" height="8" rx="1" fill="#0078D4" />
      <rect x="13" y="13" width="8" height="8" rx="1" fill="#0078D4" />
    </svg>
  ),
  TaskView: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Widgets: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="#4FC3F7" />
      <rect x="13" y="3" width="8" height="11" rx="2" fill="#81C784" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="#FFB74D" />
      <rect x="13" y="16" width="8" height="5" rx="2" fill="#F06292" />
    </svg>
  ),
};

// Icon component wrapper
const TaskbarIcon = ({ icon }: { icon: keyof typeof Win11Icons }) => {
  const IconComponent = Win11Icons[icon];
  return IconComponent ? <IconComponent /> : null;
};
export function Taskbar() {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    openWindow,
    settings,
    isLocked,
    lockScreen,
    unlockScreen
  } = useWindows();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleStartMenu: () => setIsStartOpen(prev => !prev),
    onToggleWidgets: () => setIsWidgetsOpen(prev => !prev),
    onLockScreen: lockScreen
  });
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY - 100
    });
  };
  const taskbarContextItems = [{
    id: 'taskbar-settings',
    label: 'Taskbar settings',
    action: () => {
      openWindow({
        title: 'Settings',
        icon: 'Settings',
        component: 'SettingsApp',
        x: 100,
        y: 50,
        width: 1000,
        height: 700,
        isMinimized: false,
        isMaximized: false,
        props: {
          page: 'taskbar'
        }
      });
      setContextMenu(null);
    }
  }, {
    id: 'task-manager',
    label: 'Task Manager',
    action: () => {
      openWindow({
        title: 'Task Manager',
        icon: 'Monitor',
        component: 'TaskManager',
        x: 150,
        y: 80,
        width: 800,
        height: 500,
        isMinimized: false,
        isMaximized: false
      });
      setContextMenu(null);
    }
  }, {
    id: 'sep1',
    label: '',
    separator: true
  }, {
    id: 'show-desktop',
    label: 'Show desktop',
    action: () => {
      windows.forEach(w => minimizeWindow(w.id));
      setContextMenu(null);
    }
  }];
  const pinnedApps = [{
    id: 'explorer',
    icon: 'Folder',
    title: 'File Explorer',
    component: 'FileExplorer'
  }, {
    id: 'browser',
    icon: 'Globe',
    title: 'Edge',
    component: 'Browser'
  }, {
    id: 'notepad',
    icon: 'FileText',
    title: 'Notepad',
    component: 'Notepad'
  }, {
    id: 'calculator',
    icon: 'Calculator',
    title: 'Calculator',
    component: 'Calculator'
  }, {
    id: 'settings',
    icon: 'Settings',
    title: 'Settings',
    component: 'SettingsApp'
  }];
  const openPinnedApp = useCallback((app: typeof pinnedApps[0]) => {
    openWindow({
      title: app.title,
      icon: app.icon,
      component: app.component,
      x: 100 + Math.random() * 100,
      y: 50 + Math.random() * 50,
      width: app.component === 'Calculator' ? 350 : 900,
      height: app.component === 'Calculator' ? 500 : 600,
      isMinimized: false,
      isMaximized: false
    });
  }, [openWindow]);
  const handleTaskbarClick = useCallback((app: typeof pinnedApps[0]) => {
    const existingWindows = windows.filter(w => w.component === app.component);
    if (existingWindows.length === 0) {
      openPinnedApp(app);
    } else if (existingWindows.length === 1) {
      const win = existingWindows[0];
      if (win.isMinimized) {
        focusWindow(win.id);
      } else if (activeWindowId === win.id) {
        minimizeWindow(win.id);
      } else {
        focusWindow(win.id);
      }
    } else {
      const activeIndex = existingWindows.findIndex(w => w.id === activeWindowId);
      if (activeIndex >= 0) {
        const nextIndex = (activeIndex + 1) % existingWindows.length;
        focusWindow(existingWindows[nextIndex].id);
      } else {
        focusWindow(existingWindows[0].id);
      }
    }
  }, [windows, activeWindowId, focusWindow, minimizeWindow, openPinnedApp]);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isStartOpen && !target.closest('.start-menu') && !target.closest('.start-button')) {
        setIsStartOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isStartOpen]);
  const taskbarAlignment = settings.taskbarAlignment === 'left' ? 'justify-start' : 'justify-center';

  // Render lock screen if locked
  if (isLocked) {
    return <LockScreen onUnlock={unlockScreen} />;
  }
  return <>
      <div className="fixed bottom-0 left-0 right-0 h-11 sm:h-12 win-taskbar flex items-center px-1 sm:px-2 z-[9999]" onContextMenu={handleContextMenu}>
        {/* Left Section - Widgets */}
        <div className="flex items-center">
          <button onClick={() => setIsWidgetsOpen(!isWidgetsOpen)} className={cn("w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md win-hover transition-colors", isWidgetsOpen && "bg-primary/10")} title="Widgets (Win+W)">
            <TaskbarIcon icon="Widgets" />
          </button>
        </div>

        {/* Center Section */}
        <div className={cn("flex items-center gap-0.5 sm:gap-1 flex-1", taskbarAlignment)}>
          {/* Start Button */}
          <button onClick={e => {
          e.stopPropagation();
          setIsStartOpen(!isStartOpen);
        }} className={cn("start-button w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-md win-hover transition-colors", isStartOpen && "bg-primary/10")} title="Start (Win)">
            <TaskbarIcon icon="Start" />
          </button>

          {/* Search */}
          <button onClick={() => setIsStartOpen(true)} className="hidden xs:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-md win-hover" title="Search">
            <TaskbarIcon icon="Search" />
          </button>

          {/* Task View */}
          <button className="hidden xs:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-md win-hover" title="Task View">
            <TaskbarIcon icon="TaskView" />
          </button>
          

          {/* Pinned Apps */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2">
            {pinnedApps.slice(0, window.innerWidth < 400 ? 3 : pinnedApps.length).map(app => {
            const appWindows = windows.filter(w => w.component === app.component);
            const isOpen = appWindows.length > 0;
            const isActive = appWindows.some(w => w.id === activeWindowId);
            const iconKey = app.icon as keyof typeof Win11Icons;
            return <button key={app.id} onClick={() => handleTaskbarClick(app)} className={cn("w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-md win-hover transition-colors relative group", isActive && "bg-primary/10")} title={app.title}>
                  <div className="transition-transform group-hover:scale-110">
                    <TaskbarIcon icon={iconKey} />
                  </div>
                  {isOpen && <div className={cn("absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all", isActive ? "w-4 sm:w-5 bg-primary" : "w-1.5 sm:w-2 bg-muted-foreground/60")} />}
                </button>;
          })}
          </div>
        </div>

        {/* Open Windows (non-pinned) - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1 overflow-hidden">
          {windows.filter(w => !pinnedApps.some(p => p.component === w.component)).slice(0, 3).map(win => {
          const iconKey = win.icon as keyof typeof Win11Icons;
          return <button key={win.id} onClick={() => {
            if (win.isMinimized) {
              focusWindow(win.id);
            } else if (activeWindowId === win.id) {
              minimizeWindow(win.id);
            } else {
              focusWindow(win.id);
            }
          }} className={cn("h-10 px-2 sm:px-3 flex items-center gap-2 rounded-md win-hover transition-colors max-w-[150px] sm:max-w-[200px] relative", activeWindowId === win.id && "bg-primary/10")}>
                  <TaskbarIcon icon={iconKey} />
                  <span className="text-sm truncate hidden md:inline">{win.title}</span>
                  <div className={cn("absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full", activeWindowId === win.id ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground")} />
                </button>;
        })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
          <HiddenIconsPanel />
          
          <SystemTray onLock={lockScreen} />
          
          <button onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)} className="flex flex-col items-end px-1.5 sm:px-3 h-9 sm:h-10 justify-center win-hover rounded-md">
            <span className="text-[10px] sm:text-xs">{formatTime(currentTime)}</span>
            <span className="text-[10px] sm:text-xs hidden xs:block">{formatDate(currentTime)}</span>
          </button>
          
          {/* Show Desktop Button */}
          <button onClick={() => windows.forEach(w => minimizeWindow(w.id))} className="w-1 h-9 sm:h-10 hover:bg-primary/20 transition-colors" title="Show desktop (Win+D)" />
        </div>
      </div>

      {/* Start Menu */}
      {isStartOpen && <StartMenu onClose={() => setIsStartOpen(false)} onLock={() => {
      setIsStartOpen(false);
      lockScreen();
    }} onOpenApp={(component, title, icon) => {
      openWindow({
        title,
        icon,
        component,
        x: 100 + Math.random() * 100,
        y: 50 + Math.random() * 50,
        width: component === 'Calculator' ? 350 : 900,
        height: component === 'Calculator' ? 500 : 600,
        isMinimized: false,
        isMaximized: false
      });
    }} />}

      {/* Widgets Panel */}
      <WidgetsPanel isOpen={isWidgetsOpen} onClose={() => setIsWidgetsOpen(false)} />

      {/* Notification Center */}
      <NotificationCenter isOpen={isNotificationCenterOpen} onClose={() => setIsNotificationCenterOpen(false)} />

      {/* Context Menu */}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={taskbarContextItems} onClose={() => setContextMenu(null)} />}
    </>;
}
interface StartMenuProps {
  onClose: () => void;
  onOpenApp: (component: string, title: string, icon: string) => void;
  onLock: () => void;
}
const StartMenu = forwardRef<HTMLDivElement, StartMenuProps>(function StartMenuInner({
  onClose,
  onOpenApp,
  onLock
}, ref) {
  const [searchQuery, setSearchQuery] = useState('');
  const apps = [{
    name: 'File Explorer',
    iconName: 'Folder',
    component: 'FileExplorer'
  }, {
    name: 'Edge',
    iconName: 'Globe',
    component: 'Browser'
  }, {
    name: 'Notepad',
    iconName: 'FileText',
    component: 'Notepad'
  }, {
    name: 'Calculator',
    iconName: 'Calculator',
    component: 'Calculator'
  }, {
    name: 'Terminal',
    iconName: 'Monitor',
    component: 'Terminal'
  }, {
    name: 'Music',
    iconName: 'Monitor',
    component: 'MusicPlayer'
  }, {
    name: 'Videos',
    iconName: 'Monitor',
    component: 'VideoPlayer'
  }, {
    name: 'Calendar',
    iconName: 'Monitor',
    component: 'CalendarApp'
  }, {
    name: 'Tasks',
    iconName: 'FileText',
    component: 'TasksApp'
  }, {
    name: 'Email',
    iconName: 'Globe',
    component: 'EmailApp'
  }, {
    name: 'Photos',
    iconName: 'Monitor',
    component: 'Photos'
  }, {
    name: 'Settings',
    iconName: 'Settings',
    component: 'SettingsApp'
  }, {
    name: 'This PC',
    iconName: 'Monitor',
    component: 'FileExplorer'
  }, {
    name: 'Task Manager',
    iconName: 'Monitor',
    component: 'TaskManager'
  }, {
    name: 'Recycle Bin',
    iconName: 'Trash2',
    component: 'RecycleBin'
  }];
  const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleAppClick = (app: typeof apps[0]) => {
    onOpenApp(app.component, app.name, app.iconName);
    onClose();
  };
  return <div ref={ref} className="start-menu fixed bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 w-[calc(100vw-16px)] sm:w-[600px] max-w-[600px] max-h-[80vh] overflow-hidden win-window animate-start-menu z-[9999]" onClick={e => e.stopPropagation()}>
        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-secondary/50 rounded-full">
            <div className="text-muted-foreground">
              <TaskbarIcon icon="Search" />
            </div>
            <input type="text" placeholder="Type here to search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" autoFocus />
          </div>
        </div>

        {/* Pinned Apps */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[40vh]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium">Pinned</span>
            <button className="text-xs px-2 py-1 rounded-md win-hover">All apps &gt;</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2">
            {filteredApps.map((app, i) => {
              const iconKey = app.iconName as keyof typeof Win11Icons;
              return <button key={i} onClick={() => handleAppClick(app)} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-md win-hover transition-colors">
                <div className="w-6 h-6 sm:w-7 sm:h-7">
                  <TaskbarIcon icon={iconKey} />
                </div>
                <span className="text-[10px] sm:text-xs text-center truncate w-full">{app.name}</span>
              </button>;
            })}
          </div>
        </div>

        {/* Recommended - Hidden on very small screens */}
        <div className="hidden xs:block p-3 sm:p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium">Recommended</span>
            <button className="text-xs px-2 py-1 rounded-md win-hover">More &gt;</button>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground text-center py-2 sm:py-4">
            No recent items
          </div>
        </div>

        {/* User & Power */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-t border-border">
          <button className="flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-md win-hover">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={14} className="sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm">User</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onLock} className="p-1.5 sm:p-2 rounded-md win-hover" title="Lock">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </button>
            <button className="p-1.5 sm:p-2 rounded-md win-hover" title="Power">
              <Power size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>;
});
StartMenu.displayName = 'StartMenu';

// Hidden Icons Panel Component
function HiddenIconsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenIcons = [{
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️'
  }, {
    id: 'security',
    name: 'Windows Security',
    icon: '🛡️'
  }, {
    id: 'updates',
    name: 'Windows Update',
    icon: '🔄'
  }, {
    id: 'usb',
    name: 'Safely Remove Hardware',
    icon: '🔌'
  }];
  return <div className="relative hidden sm:block">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-6 h-10 items-center justify-center win-hover rounded-sm" title="Show hidden icons">
        <ChevronUp size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-12 right-0 min-w-[200px] win-window rounded-lg p-2 z-[9999] animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-4 gap-1">
              {hiddenIcons.map(icon => <button key={icon.id} className="w-10 h-10 flex items-center justify-center rounded-md win-hover transition-colors text-lg" title={icon.name}>
                  {icon.icon}
                </button>)}
            </div>
          </div>
        </>}
    </div>;
}