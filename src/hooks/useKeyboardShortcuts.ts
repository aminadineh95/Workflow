import { useEffect, useCallback } from 'react';
import { useWindows } from '@/contexts/WindowContext';

interface KeyboardShortcutsProps {
  onToggleStartMenu: () => void;
  onToggleWidgets: () => void;
  onLockScreen?: () => void;
}

export function useKeyboardShortcuts({ onToggleStartMenu, onToggleWidgets, onLockScreen }: KeyboardShortcutsProps) {
  const { 
    windows, 
    activeWindowId, 
    focusWindow, 
    minimizeWindow, 
    openWindow,
    closeWindow,
  } = useWindows();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Win key - Toggle Start Menu
    if (e.key === 'Meta' || e.key === 'OS') {
      e.preventDefault();
      onToggleStartMenu();
      return;
    }

    // Alt + Tab - Cycle through windows
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      const visibleWindows = windows.filter(w => !w.isMinimized);
      if (visibleWindows.length > 1) {
        const currentIndex = visibleWindows.findIndex(w => w.id === activeWindowId);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        focusWindow(visibleWindows[nextIndex].id);
      } else if (visibleWindows.length === 0 && windows.length > 0) {
        // Restore first minimized window
        focusWindow(windows[0].id);
      }
      return;
    }

    // Win + D - Show desktop (minimize all)
    if ((e.metaKey || e.key === 'Meta') && e.key === 'd') {
      e.preventDefault();
      windows.forEach(w => minimizeWindow(w.id));
      return;
    }

    // Ctrl + Shift + Esc - Task Manager
    if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
      e.preventDefault();
      openWindow({
        title: 'Task Manager',
        icon: 'Monitor',
        component: 'TaskManager',
        x: 150,
        y: 80,
        width: 800,
        height: 500,
        isMinimized: false,
        isMaximized: false,
      });
      return;
    }

    // Win + W - Widgets
    if ((e.metaKey || e.key === 'Meta') && e.key === 'w') {
      e.preventDefault();
      onToggleWidgets();
      return;
    }

    // Win + E - File Explorer
    if ((e.metaKey || e.key === 'Meta') && e.key === 'e') {
      e.preventDefault();
      openWindow({
        title: 'File Explorer',
        icon: 'Folder',
        component: 'FileExplorer',
        x: 100,
        y: 50,
        width: 900,
        height: 600,
        isMinimized: false,
        isMaximized: false,
      });
      return;
    }

    // Win + I - Settings
    if ((e.metaKey || e.key === 'Meta') && e.key === 'i') {
      e.preventDefault();
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
      });
      return;
    }

    // Alt + F4 - Close active window
    if (e.altKey && e.key === 'F4') {
      e.preventDefault();
      if (activeWindowId) {
        closeWindow(activeWindowId);
      }
      return;
    }

    // Win + L - Lock screen
    if ((e.metaKey || e.key === 'Meta') && e.key === 'l') {
      e.preventDefault();
      onLockScreen?.();
      return;
    }
  }, [windows, activeWindowId, focusWindow, minimizeWindow, openWindow, closeWindow, onToggleStartMenu, onToggleWidgets, onLockScreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
