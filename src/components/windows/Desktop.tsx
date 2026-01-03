import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { DesktopIcon } from '@/types/windows';
import { ContextMenu } from './ContextMenu';
import { WeatherWidget } from './WeatherWidget';
import { LiveTVWidget } from './LiveTVWidget';
import { cn } from '@/lib/utils';
import defaultWallpaper from '@/assets/wallpaper-default.jpg';
import bloomWallpaper from '@/assets/wallpaper-bloom.jpg';
import sunsetWallpaper from '@/assets/wallpaper-sunset.jpg';
import glowWallpaper from '@/assets/wallpaper-glow.jpg';

// Grid settings for Windows-style icon arrangement
const GRID_SIZE = 90;
const ICON_WIDTH = 80;
const ICON_HEIGHT = 88;
const GRID_PADDING = 10;

const ICONS_STORAGE_KEY = 'desktop-icon-positions';
const WEATHER_WIDGET_VISIBLE_KEY = 'weather-widget-visible';
const LIVETV_WIDGET_VISIBLE_KEY = 'livetv-widget-visible';

// Windows 11 style SVG icons
const Win11Icons = {
  ThisPC: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="8" width="40" height="28" rx="2" className="fill-primary/20 stroke-primary" strokeWidth="2"/>
      <rect x="8" y="12" width="32" height="20" className="fill-primary/10"/>
      <rect x="18" y="36" width="12" height="4" className="fill-muted-foreground"/>
      <rect x="14" y="40" width="20" height="2" rx="1" className="fill-muted-foreground"/>
    </svg>
  ),
  RecycleBin: ({ empty = false }: { empty?: boolean }) => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <path d="M12 16h24v24a4 4 0 01-4 4H16a4 4 0 01-4-4V16z" className={empty ? "fill-muted/50" : "fill-muted"} stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12h32v4H8z" className="fill-muted-foreground"/>
      <path d="M18 12V8a2 2 0 012-2h8a2 2 0 012 2v4" className="stroke-muted-foreground fill-none" strokeWidth="2"/>
      {!empty && (
        <>
          <path d="M18 22v12M24 22v12M30 22v12" className="stroke-background" strokeWidth="2"/>
        </>
      )}
    </svg>
  ),
  Folder: ({ color = "primary" }: { color?: string }) => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <path d="M4 12a4 4 0 014-4h12l4 4h16a4 4 0 014 4v20a4 4 0 01-4 4H8a4 4 0 01-4-4V12z" className={`fill-${color}/80`}/>
      <path d="M4 16h40v24a4 4 0 01-4 4H8a4 4 0 01-4-4V16z" className={`fill-${color}`}/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <path d="M12 4h16l12 12v28a4 4 0 01-4 4H12a4 4 0 01-4-4V8a4 4 0 014-4z" className="fill-card stroke-border" strokeWidth="2"/>
      <path d="M28 4v12h12" className="stroke-border fill-muted" strokeWidth="2"/>
      <path d="M14 24h20M14 32h16M14 40h12" className="stroke-muted-foreground" strokeWidth="2"/>
    </svg>
  ),
  Edge: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <circle cx="24" cy="24" r="20" className="fill-primary"/>
      <path d="M24 8c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3C14.5 30.5 18.9 28 24 28c5.1 0 9.5 2.5 11.3 7.3 2.9-2.9 4.7-6.9 4.7-11.3 0-8.8-7.2-16-16-16z" className="fill-primary-foreground/90"/>
      <circle cx="30" cy="20" r="8" className="fill-primary"/>
    </svg>
  ),
  Documents: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <path d="M4 12a4 4 0 014-4h12l4 4h16a4 4 0 014 4v20a4 4 0 01-4 4H8a4 4 0 01-4-4V12z" className="fill-amber-400/80"/>
      <path d="M4 16h40v24a4 4 0 01-4 4H8a4 4 0 01-4-4V16z" className="fill-amber-500"/>
      <path d="M14 24h20M14 30h16" className="stroke-amber-700/50" strokeWidth="2"/>
    </svg>
  ),
  Website: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="8" width="40" height="32" rx="3" className="fill-blue-500"/>
      <rect x="6" y="10" width="36" height="28" rx="2" className="fill-white"/>
      <circle cx="24" cy="20" r="6" className="fill-blue-400"/>
      <path d="M14 36c0-6 4.5-10 10-10s10 4 10 10" className="fill-blue-400"/>
      <rect x="4" y="8" width="40" height="6" rx="3" className="fill-blue-600"/>
      <circle cx="9" cy="11" r="1.5" className="fill-red-400"/>
      <circle cx="14" cy="11" r="1.5" className="fill-yellow-400"/>
      <circle cx="19" cy="11" r="1.5" className="fill-green-400"/>
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <circle cx="24" cy="24" r="20" className="fill-[#24292e]"/>
      <path d="M24 8C15.16 8 8 15.16 8 24c0 7.08 4.58 13.08 10.94 15.18.8.14 1.1-.34 1.1-.76 0-.38-.02-1.64-.02-2.98-4.02.74-5.06-1.02-5.38-1.96-.18-.46-.96-1.88-1.64-2.26-.56-.3-1.36-1.04-.02-1.06 1.26-.02 2.16 1.16 2.46 1.64 1.44 2.42 3.74 1.74 4.66 1.32.14-1.04.56-1.74 1.02-2.14-3.56-.4-7.28-1.78-7.28-7.9 0-1.74.62-3.18 1.64-4.3-.16-.4-.72-2.04.16-4.24 0 0 1.34-.42 4.4 1.64 1.28-.36 2.64-.54 4-.54s2.72.18 4 .54c3.06-2.08 4.4-1.64 4.4-1.64.88 2.2.32 3.84.16 4.24 1.02 1.12 1.64 2.54 1.64 4.3 0 6.14-3.74 7.5-7.3 7.9.58.5 1.08 1.46 1.08 2.96 0 2.14-.02 3.86-.02 4.4 0 .42.3.92 1.1.76C35.42 37.08 40 31.06 40 24c0-8.84-7.16-16-16-16z" className="fill-white"/>
    </svg>
  ),
  Photos: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="8" width="40" height="32" rx="3" className="fill-emerald-500"/>
      <circle cx="16" cy="18" r="4" className="fill-yellow-300"/>
      <path d="M4 32l10-8 8 6 12-10 10 8v4a3 3 0 01-3 3H7a3 3 0 01-3-3v-0z" className="fill-emerald-700"/>
      <path d="M14 40l8-6 12 10H7a3 3 0 01-3-3v-1l10-0z" className="fill-emerald-600"/>
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="6" width="40" height="36" rx="3" className="fill-[#0c0c0c]"/>
      <rect x="6" y="12" width="36" height="28" rx="1" className="fill-[#1a1a1a]"/>
      <rect x="4" y="6" width="40" height="6" rx="3" className="fill-[#2d2d2d]"/>
      <circle cx="9" cy="9" r="1.5" className="fill-red-400"/>
      <circle cx="14" cy="9" r="1.5" className="fill-yellow-400"/>
      <circle cx="19" cy="9" r="1.5" className="fill-green-400"/>
      <path d="M10 20l6 4-6 4" className="stroke-green-400 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 30h12" className="stroke-green-400" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  MusicPlayer: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="6" width="40" height="36" rx="4" className="fill-gradient-to-br from-purple-500 to-pink-500"/>
      <rect x="4" y="6" width="40" height="36" rx="4" className="fill-purple-500"/>
      <circle cx="24" cy="22" r="10" className="fill-purple-700"/>
      <circle cx="24" cy="22" r="4" className="fill-purple-300"/>
      <path d="M18 36h12M22 36v4M26 36v4M20 40h8" className="stroke-purple-200" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  VideoPlayer: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="8" width="40" height="32" rx="3" className="fill-rose-500"/>
      <rect x="6" y="10" width="36" height="28" rx="2" className="fill-rose-600"/>
      <polygon points="20,16 20,32 32,24" className="fill-white"/>
      <rect x="4" y="36" width="40" height="4" rx="1" className="fill-rose-700"/>
      <rect x="6" y="37" width="16" height="2" rx="1" className="fill-rose-400"/>
    </svg>
  ),
  CalendarApp: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="8" width="40" height="36" rx="3" className="fill-blue-500"/>
      <rect x="4" y="8" width="40" height="10" rx="3" className="fill-blue-600"/>
      <rect x="6" y="20" width="36" height="22" className="fill-white"/>
      <path d="M12 6v6M24 6v6M36 6v6" className="stroke-blue-300" strokeWidth="2" strokeLinecap="round"/>
      <rect x="10" y="24" width="6" height="5" rx="1" className="fill-blue-200"/>
      <rect x="21" y="24" width="6" height="5" rx="1" className="fill-blue-200"/>
      <rect x="32" y="24" width="6" height="5" rx="1" className="fill-blue-200"/>
      <rect x="10" y="33" width="6" height="5" rx="1" className="fill-blue-200"/>
      <rect x="21" y="33" width="6" height="5" rx="1" className="fill-primary"/>
      <rect x="32" y="33" width="6" height="5" rx="1" className="fill-blue-200"/>
    </svg>
  ),
  TasksApp: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="6" width="40" height="36" rx="3" className="fill-green-500"/>
      <rect x="8" y="12" width="32" height="26" className="fill-white"/>
      <circle cx="14" cy="18" r="2" className="fill-green-500"/>
      <rect x="20" y="16" width="16" height="3" rx="1" className="fill-green-300"/>
      <circle cx="14" cy="26" r="2" className="stroke-green-500 fill-none" strokeWidth="2"/>
      <rect x="20" y="24" width="14" height="3" rx="1" className="fill-green-300"/>
      <circle cx="14" cy="34" r="2" className="stroke-green-500 fill-none" strokeWidth="2"/>
      <rect x="20" y="32" width="12" height="3" rx="1" className="fill-green-300"/>
    </svg>
  ),
  EmailApp: () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <rect x="4" y="10" width="40" height="28" rx="3" className="fill-blue-400"/>
      <path d="M4 14l20 12 20-12" className="stroke-blue-600 fill-none" strokeWidth="2"/>
      <rect x="4" y="10" width="40" height="6" className="fill-blue-500"/>
      <path d="M4 13l20 12 20-12" className="stroke-white fill-none" strokeWidth="2"/>
    </svg>
  ),
};

const defaultIcons: DesktopIcon[] = [
  // Left column icons
  { id: 'this-pc', name: 'This PC', icon: 'ThisPC', action: 'file-explorer', position: { x: GRID_PADDING, y: GRID_PADDING } },
  { id: 'recycle-bin', name: 'Recycle Bin', icon: 'RecycleBin', action: 'recycle-bin', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE } },
  { id: 'documents', name: 'Documents', icon: 'Documents', action: 'file-explorer-documents', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE * 2 } },
  { id: 'photos', name: 'Photos', icon: 'Photos', action: 'photos', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE * 3 } },
  { id: 'terminal', name: 'Terminal', icon: 'Terminal', action: 'terminal', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE * 4 } },
  { id: 'music-player', name: 'Music', icon: 'MusicPlayer', action: 'music-player', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE * 5 } },
  { id: 'video-player', name: 'Videos', icon: 'VideoPlayer', action: 'video-player', position: { x: GRID_PADDING, y: GRID_PADDING + GRID_SIZE * 6 } },
  { id: 'calendar-app', name: 'Calendar', icon: 'CalendarApp', action: 'calendar', position: { x: GRID_PADDING + GRID_SIZE, y: GRID_PADDING } },
  { id: 'tasks-app', name: 'Tasks', icon: 'TasksApp', action: 'tasks', position: { x: GRID_PADDING + GRID_SIZE, y: GRID_PADDING + GRID_SIZE } },
  { id: 'email-app', name: 'Email', icon: 'EmailApp', action: 'email', position: { x: GRID_PADDING + GRID_SIZE, y: GRID_PADDING + GRID_SIZE * 2 } },
  // Right side icons
  { id: 'resume-website', name: 'My Resume', icon: 'Website', action: 'website', position: { x: 1200, y: GRID_PADDING }, url: 'https://aminadineh.ir/' },
  { id: 'github-profile', name: 'My Projects', icon: 'GitHub', action: 'website', position: { x: 1200, y: GRID_PADDING + GRID_SIZE }, url: 'https://github.com/aminadineh95' },
];

const wallpaperMap: Record<string, string> = {
  'default': defaultWallpaper,
  'bloom': bloomWallpaper,
  'sunset': sunsetWallpaper,
  'glow': glowWallpaper,
};

// Snap position to grid
const snapToGrid = (x: number, y: number, maxWidth: number, maxHeight: number) => {
  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE + GRID_PADDING;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE + GRID_PADDING;
  return {
    x: Math.max(GRID_PADDING, Math.min(maxWidth - ICON_WIDTH - GRID_PADDING, snappedX)),
    y: Math.max(GRID_PADDING, Math.min(maxHeight - ICON_HEIGHT - GRID_PADDING, snappedY)),
  };
};

// Check if a grid position is occupied
const isPositionOccupied = (x: number, y: number, icons: DesktopIcon[], excludeId?: string) => {
  return icons.some(icon => 
    icon.id !== excludeId && 
    Math.abs(icon.position.x - x) < GRID_SIZE - 10 && 
    Math.abs(icon.position.y - y) < GRID_SIZE - 10
  );
};

// Find next available grid position
const findNextAvailablePosition = (icons: DesktopIcon[], maxWidth: number, maxHeight: number) => {
  const cols = Math.floor((maxWidth - GRID_PADDING * 2) / GRID_SIZE);
  const rows = Math.floor((maxHeight - GRID_PADDING * 2) / GRID_SIZE);
  
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = col * GRID_SIZE + GRID_PADDING;
      const y = row * GRID_SIZE + GRID_PADDING;
      if (!isPositionOccupied(x, y, icons)) {
        return { x, y };
      }
    }
  }
  return { x: GRID_PADDING, y: icons.length * GRID_SIZE + GRID_PADDING };
};

export function Desktop() {
  const { openWindow, addFile, settings, recycledFiles, clipboard, copyFiles, cutFiles, pasteFiles } = useWindows();
  const [icons, setIcons] = useState<DesktopIcon[]>(() => {
    const saved = localStorage.getItem(ICONS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved positions with default icons (in case new icons were added)
        return defaultIcons.map(defaultIcon => {
          const savedIcon = parsed.find((s: DesktopIcon) => s.id === defaultIcon.id);
          return savedIcon ? { ...defaultIcon, position: savedIcon.position } : defaultIcon;
        }).concat(parsed.filter((s: DesktopIcon) => !defaultIcons.find(d => d.id === s.id)));
      } catch {
        return defaultIcons;
      }
    }
    return defaultIcons;
  });
  const [showWeatherWidget, setShowWeatherWidget] = useState(() => {
    const saved = localStorage.getItem(WEATHER_WIDGET_VISIBLE_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [showLiveTVWidget, setShowLiveTVWidget] = useState(() => {
    const saved = localStorage.getItem(LIVETV_WIDGET_VISIBLE_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null);
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Save icons to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(icons));
  }, [icons]);

  // Save weather widget visibility
  useEffect(() => {
    localStorage.setItem(WEATHER_WIDGET_VISIBLE_KEY, String(showWeatherWidget));
  }, [showWeatherWidget]);

  // Save Live TV widget visibility
  useEffect(() => {
    localStorage.setItem(LIVETV_WIDGET_VISIBLE_KEY, String(showLiveTVWidget));
  }, [showLiveTVWidget]);

  // Keyboard shortcuts for copy/paste/cut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingIcon) return;
      
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c' && selectedIcons.length > 0) {
        e.preventDefault();
        copyFiles(selectedIcons);
      }
      
      // Ctrl+X - Cut
      if (e.ctrlKey && e.key === 'x' && selectedIcons.length > 0) {
        e.preventDefault();
        cutFiles(selectedIcons);
      }
      
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteFiles('desktop');
        // Add pasted icons to desktop
        clipboard.files.forEach((file, index) => {
          const newIcon: DesktopIcon = {
            id: `pasted-${Date.now()}-${index}`,
            name: file.name,
            icon: file.type === 'folder' ? 'Folder' : 'FileText',
            action: file.type === 'folder' ? 'folder' : 'text-file',
            position: { x: 20, y: (icons.length + index) * 90 + 20 },
          };
          setIcons(prev => [...prev, newIcon]);
        });
      }
      
      // Delete - Move to recycle bin
      if (e.key === 'Delete' && selectedIcons.length > 0) {
        e.preventDefault();
        selectedIcons.forEach(id => handleDeleteIcon(id));
        setSelectedIcons([]);
      }
      
      // Ctrl+A - Select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelectedIcons(icons.map(i => i.id));
      }
      
      // Escape - Deselect all
      if (e.key === 'Escape') {
        setSelectedIcons([]);
        setEditingIcon(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcons, clipboard, copyFiles, cutFiles, pasteFiles, icons, editingIcon]);

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    switch (icon.action) {
      case 'file-explorer':
        openWindow({
          title: 'This PC',
          icon: 'Monitor',
          component: 'FileExplorer',
          x: 100,
          y: 50,
          width: 900,
          height: 600,
          isMinimized: false,
          isMaximized: false,
          props: { path: 'this-pc' },
        });
        break;
      case 'recycle-bin':
        openWindow({
          title: 'Recycle Bin',
          icon: 'Trash2',
          component: 'RecycleBin',
          x: 150,
          y: 80,
          width: 800,
          height: 500,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'file-explorer-documents':
        openWindow({
          title: 'Documents',
          icon: 'Folder',
          component: 'FileExplorer',
          x: 120,
          y: 60,
          width: 900,
          height: 600,
          isMinimized: false,
          isMaximized: false,
          props: { path: 'documents' },
        });
        break;
      case 'folder':
        openWindow({
          title: icon.name,
          icon: 'Folder',
          component: 'FileExplorer',
          x: 120,
          y: 60,
          width: 900,
          height: 600,
          isMinimized: false,
          isMaximized: false,
          props: { path: icon.id },
        });
        break;
      case 'text-file':
        openWindow({
          title: `${icon.name} - Notepad`,
          icon: 'FileText',
          component: 'Notepad',
          x: 150,
          y: 80,
          width: 700,
          height: 500,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'website':
        if (icon.url) {
          window.open(icon.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'photos':
        openWindow({
          title: 'Photos',
          icon: 'Image',
          component: 'Photos',
          x: 100,
          y: 50,
          width: 900,
          height: 650,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'terminal':
        openWindow({
          title: 'Terminal',
          icon: 'Terminal',
          component: 'Terminal',
          x: 150,
          y: 100,
          width: 800,
          height: 500,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'music-player':
        openWindow({
          title: 'Music',
          icon: 'Music',
          component: 'MusicPlayer',
          x: 120,
          y: 60,
          width: 450,
          height: 700,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'video-player':
        openWindow({
          title: 'Videos',
          icon: 'Film',
          component: 'VideoPlayer',
          x: 100,
          y: 50,
          width: 900,
          height: 600,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'calendar':
        openWindow({
          title: 'Calendar',
          icon: 'Calendar',
          component: 'CalendarApp',
          x: 120,
          y: 60,
          width: 800,
          height: 600,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'tasks':
        openWindow({
          title: 'Tasks',
          icon: 'FileText',
          component: 'TasksApp',
          x: 100,
          y: 50,
          width: 850,
          height: 600,
          isMinimized: false,
          isMaximized: false,
        });
        break;
      case 'email':
        openWindow({
          title: 'Email',
          icon: 'Globe',
          component: 'EmailApp',
          x: 80,
          y: 40,
          width: 950,
          height: 650,
          isMinimized: false,
          isMaximized: false,
        });
        break;
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === desktopRef.current) {
      setSelectedIcons([]);
      setEditingIcon(null);
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, iconId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, iconId });
    if (iconId && !selectedIcons.includes(iconId)) {
      setSelectedIcons([iconId]);
    }
  };

  const handleNewFolder = () => {
    const newId = `folder-${Date.now()}`;
    const rect = desktopRef.current?.getBoundingClientRect();
    const maxWidth = rect?.width || 1920;
    const maxHeight = rect?.height || 1080;
    const position = findNextAvailablePosition(icons, maxWidth, maxHeight);
    
    const newFolder: DesktopIcon = {
      id: newId,
      name: 'New Folder',
      icon: 'Folder',
      action: 'folder',
      position,
    };
    setIcons(prev => [...prev, newFolder]);
    addFile({
      name: 'New Folder',
      type: 'folder',
      parentId: 'desktop',
    });
    setContextMenu(null);
    setEditingIcon(newId);
    setSelectedIcons([newId]);
  };

  const handleNewTextDocument = () => {
    const newId = `file-${Date.now()}`;
    const rect = desktopRef.current?.getBoundingClientRect();
    const maxWidth = rect?.width || 1920;
    const maxHeight = rect?.height || 1080;
    const position = findNextAvailablePosition(icons, maxWidth, maxHeight);
    
    const newFile: DesktopIcon = {
      id: newId,
      name: 'New Text Document.txt',
      icon: 'FileText',
      action: 'text-file',
      position,
    };
    setIcons(prev => [...prev, newFile]);
    setContextMenu(null);
    setEditingIcon(newId);
    setSelectedIcons([newId]);
    
    openWindow({
      title: 'New Text Document.txt - Notepad',
      icon: 'FileText',
      component: 'Notepad',
      x: 150,
      y: 80,
      width: 700,
      height: 500,
      isMinimized: false,
      isMaximized: false,
    });
  };

  const handleRenameIcon = (iconId: string, newName: string) => {
    setIcons(prev => prev.map(icon => 
      icon.id === iconId ? { ...icon, name: newName } : icon
    ));
    setEditingIcon(null);
  };

  const handleDeleteIcon = (iconId: string) => {
    if (['this-pc', 'recycle-bin', 'documents'].includes(iconId)) return;
    setIcons(prev => prev.filter(icon => icon.id !== iconId));
    setContextMenu(null);
  };

  const getDesktopContextMenuItems = () => [
    { id: 'view', label: 'View', submenu: [
      { id: 'large-icons', label: 'Large icons', action: () => setContextMenu(null) },
      { id: 'medium-icons', label: 'Medium icons', action: () => setContextMenu(null) },
      { id: 'small-icons', label: 'Small icons', action: () => setContextMenu(null) },
    ]},
    { id: 'sort', label: 'Sort by', submenu: [
      { id: 'name', label: 'Name', action: () => setContextMenu(null) },
      { id: 'size', label: 'Size', action: () => setContextMenu(null) },
      { id: 'date', label: 'Date modified', action: () => setContextMenu(null) },
    ]},
    { id: 'refresh', label: 'Refresh', action: () => setContextMenu(null) },
    { id: 'sep1', label: '', separator: true },
    { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', disabled: !clipboard, action: () => {
      if (clipboard) {
        pasteFiles('desktop');
        clipboard.files.forEach((file, index) => {
          const newIcon: DesktopIcon = {
            id: `pasted-${Date.now()}-${index}`,
            name: file.name,
            icon: file.type === 'folder' ? 'Folder' : 'FileText',
            action: file.type === 'folder' ? 'folder' : 'text-file',
            position: { x: 20, y: (icons.length + index) * 90 + 20 },
          };
          setIcons(prev => [...prev, newIcon]);
        });
      }
      setContextMenu(null);
    }},
    { id: 'sep2', label: '', separator: true },
    { id: 'new', label: 'New', submenu: [
      { id: 'folder', label: 'Folder', action: handleNewFolder },
      { id: 'text', label: 'Text Document', action: handleNewTextDocument },
    ]},
    { id: 'sep3', label: '', separator: true },
    { id: 'display', label: 'Display settings', action: () => {
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
        props: { page: 'display' },
      });
      setContextMenu(null);
    }},
    { id: 'personalize', label: 'Personalize', action: () => {
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
        props: { page: 'personalization' },
      });
      setContextMenu(null);
    }},
  ];

  const getIconContextMenuItems = (iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    const isSystemIcon = ['this-pc', 'recycle-bin', 'documents'].includes(iconId);
    const currentSelection = selectedIcons.includes(iconId) ? selectedIcons : [iconId];
    
    return [
      { id: 'open', label: 'Open', action: () => {
        if (icon) handleIconDoubleClick(icon);
        setContextMenu(null);
      }},
      { id: 'sep1', label: '', separator: true },
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', disabled: isSystemIcon, action: () => {
        cutFiles(currentSelection);
        setContextMenu(null);
      }},
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', disabled: isSystemIcon, action: () => {
        copyFiles(currentSelection);
        setContextMenu(null);
      }},
      { id: 'sep2', label: '', separator: true },
      { id: 'rename', label: 'Rename', shortcut: 'F2', disabled: isSystemIcon, action: () => {
        setEditingIcon(iconId);
        setContextMenu(null);
      }},
      { id: 'delete', label: 'Delete', shortcut: 'Del', disabled: isSystemIcon, action: () => {
        currentSelection.forEach(id => handleDeleteIcon(id));
        setSelectedIcons([]);
      }},
      { id: 'sep3', label: '', separator: true },
      { id: 'properties', label: 'Properties', action: () => setContextMenu(null) },
    ];
  };

  const getWallpaperStyle = () => {
    const wallpaperUrl = wallpaperMap[settings.wallpaper];
    if (wallpaperUrl) {
      return { backgroundImage: `url(${wallpaperUrl})` };
    }
    
    // Solid colors
    const colors: Record<string, string> = {
      'solid-blue': 'hsl(207, 90%, 54%)',
      'solid-dark': 'hsl(0, 0%, 15%)',
      'solid-gray': 'hsl(220, 14%, 50%)',
      'solid-purple': 'hsl(270, 70%, 40%)',
      'solid-green': 'hsl(140, 50%, 35%)',
    };
    return { background: colors[settings.wallpaper] || colors['solid-blue'] };
  };

  const renderIcon = (icon: DesktopIcon) => {
    switch (icon.icon) {
      case 'ThisPC':
        return <Win11Icons.ThisPC />;
      case 'RecycleBin':
        return <Win11Icons.RecycleBin empty={recycledFiles.length === 0} />;
      case 'Documents':
        return <Win11Icons.Documents />;
      case 'Folder':
        return <Win11Icons.Folder />;
      case 'FileText':
        return <Win11Icons.FileText />;
      case 'Website':
        return <Win11Icons.Website />;
      case 'GitHub':
        return <Win11Icons.GitHub />;
      case 'Photos':
        return <Win11Icons.Photos />;
      case 'Terminal':
        return <Win11Icons.Terminal />;
      case 'MusicPlayer':
        return <Win11Icons.MusicPlayer />;
      case 'VideoPlayer':
        return <Win11Icons.VideoPlayer />;
      default:
        return <Win11Icons.Folder />;
    }
  };


  return (
    <div
      ref={desktopRef}
      className="absolute inset-0 bottom-11 sm:bottom-12 overflow-hidden touch-none select-none"
      style={{
        ...getWallpaperStyle(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={handleDesktopClick}
      onContextMenu={(e) => handleContextMenu(e)}
      onMouseDown={(e) => {
        if (e.target === desktopRef.current && e.button === 0) {
          const rect = desktopRef.current.getBoundingClientRect();
          setSelectionBox({
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top,
            endX: e.clientX - rect.left,
            endY: e.clientY - rect.top,
          });
        }
      }}
      onMouseMove={(e) => {
        if (selectionBox && desktopRef.current) {
          const rect = desktopRef.current.getBoundingClientRect();
          setSelectionBox(prev => prev ? {
            ...prev,
            endX: e.clientX - rect.left,
            endY: e.clientY - rect.top,
          } : null);
          
          // Select icons within the box
          const minX = Math.min(selectionBox.startX, e.clientX - rect.left);
          const maxX = Math.max(selectionBox.startX, e.clientX - rect.left);
          const minY = Math.min(selectionBox.startY, e.clientY - rect.top);
          const maxY = Math.max(selectionBox.startY, e.clientY - rect.top);
          
          const selectedIds = icons.filter(icon => {
            const iconCenterX = icon.position.x + 40;
            const iconCenterY = icon.position.y + 44;
            return iconCenterX >= minX && iconCenterX <= maxX && iconCenterY >= minY && iconCenterY <= maxY;
          }).map(i => i.id);
          
          setSelectedIcons(selectedIds);
        }
      }}
      onMouseUp={() => {
        setSelectionBox(null);
      }}
      onMouseLeave={() => {
        setSelectionBox(null);
      }}
    >
      {/* Selection Box */}
      {selectionBox && (
        <div
          className="absolute border border-primary bg-primary/10 pointer-events-none z-50"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY),
          }}
        />
      )}
      {/* Desktop Icons */}
      {icons.map((icon) => {
        const isEditing = editingIcon === icon.id;
        
        return (
          <div
            key={icon.id}
            draggable={!editingIcon}
            className={cn(
              "absolute flex flex-col items-center justify-center w-[70px] h-[80px] sm:w-20 sm:h-[88px] rounded-md cursor-pointer transition-colors",
              selectedIcons.includes(icon.id) ? "bg-primary/20 ring-1 ring-primary/40" : "hover:bg-foreground/5 active:bg-foreground/10",
              draggingIcon === icon.id && "opacity-50"
            )}
            style={{ left: icon.position.x, top: icon.position.y }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.ctrlKey || e.metaKey) {
                // Multi-select with Ctrl/Cmd
                setSelectedIcons(prev => 
                  prev.includes(icon.id) 
                    ? prev.filter(id => id !== icon.id)
                    : [...prev, icon.id]
                );
              } else if (e.shiftKey && selectedIcons.length > 0) {
                // Range select with Shift
                const iconIndex = icons.findIndex(i => i.id === icon.id);
                const lastSelectedIndex = icons.findIndex(i => i.id === selectedIcons[selectedIcons.length - 1]);
                const start = Math.min(iconIndex, lastSelectedIndex);
                const end = Math.max(iconIndex, lastSelectedIndex);
                setSelectedIcons(icons.slice(start, end + 1).map(i => i.id));
              } else {
                setSelectedIcons([icon.id]);
              }
              setEditingIcon(null);
            }}
            onDoubleClick={() => handleIconDoubleClick(icon)}
            onDragStart={(e) => {
              setDraggingIcon(icon.id);
              if (!selectedIcons.includes(icon.id)) {
                setSelectedIcons([icon.id]);
              }
              e.dataTransfer.setData('text/plain', icon.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={(e) => {
              if (desktopRef.current) {
                const rect = desktopRef.current.getBoundingClientRect();
                const rawX = e.clientX - rect.left - 40;
                const rawY = e.clientY - rect.top - 44;
                
                // Snap to grid
                const snapped = snapToGrid(rawX, rawY, rect.width, rect.height);
                
                // Calculate offset for moving multiple icons
                const offsetX = snapped.x - icon.position.x;
                const offsetY = snapped.y - icon.position.y;
                
                setIcons(prev => {
                  const newIcons = [...prev];
                  selectedIcons.forEach(selectedId => {
                    const idx = newIcons.findIndex(i => i.id === selectedId);
                    if (idx !== -1) {
                      const newPos = snapToGrid(
                        newIcons[idx].position.x + offsetX,
                        newIcons[idx].position.y + offsetY,
                        rect.width,
                        rect.height
                      );
                      // Check if position is occupied by another non-selected icon
                      const isOccupied = isPositionOccupied(newPos.x, newPos.y, newIcons.filter(i => !selectedIcons.includes(i.id)), selectedId);
                      if (!isOccupied) {
                        newIcons[idx] = { ...newIcons[idx], position: newPos };
                      }
                    }
                  });
                  return newIcons;
                });
              }
              setDraggingIcon(null);
              setDragPreview(null);
            }}
            onDrag={(e) => {
              if (desktopRef.current && e.clientX !== 0 && e.clientY !== 0) {
                const rect = desktopRef.current.getBoundingClientRect();
                const rawX = e.clientX - rect.left - 40;
                const rawY = e.clientY - rect.top - 44;
                const snapped = snapToGrid(rawX, rawY, rect.width, rect.height);
                setDragPreview(snapped);
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              const now = Date.now();
              if ((window as any).lastTap && now - (window as any).lastTap < 300) {
                handleIconDoubleClick(icon);
              } else {
                setSelectedIcons([icon.id]);
              }
              (window as any).lastTap = now;
            }}
            onContextMenu={(e) => handleContextMenu(e, icon.id)}
          >
            <div className="mb-1 drop-shadow-lg scale-90 sm:scale-100">
              {renderIcon(icon)}
            </div>
            {isEditing ? (
              <input
                type="text"
                defaultValue={icon.name}
                autoFocus
                className="text-[10px] sm:text-xs text-center bg-card px-1 rounded outline-none ring-1 ring-primary w-full"
                onBlur={(e) => handleRenameIcon(icon.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameIcon(icon.id, (e.target as HTMLInputElement).value);
                  } else if (e.key === 'Escape') {
                    setEditingIcon(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-[10px] sm:text-xs text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium px-1 select-none max-w-full truncate">
                {icon.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Grid Preview when dragging */}
      {dragPreview && draggingIcon && (
        <div
          className="absolute w-20 h-[88px] border-2 border-dashed border-primary/50 rounded-md pointer-events-none z-40"
          style={{ left: dragPreview.x, top: dragPreview.y }}
        />
      )}

      {/* Weather Widget */}
      {showWeatherWidget && (
        <WeatherWidget onClose={() => setShowWeatherWidget(false)} />
      )}

      {/* Live TV Widget */}
      {showLiveTVWidget && (
        <LiveTVWidget onClose={() => setShowLiveTVWidget(false)} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.iconId 
            ? getIconContextMenuItems(contextMenu.iconId) 
            : getDesktopContextMenuItems()
          }
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
