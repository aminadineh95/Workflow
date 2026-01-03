import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { WindowState, FileItem, Settings, ClipboardItem } from '@/types/windows';

type CloseHandler = () => boolean; // returns true if close should proceed

interface WindowContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  files: FileItem[];
  settings: Settings;
  clipboard: ClipboardItem | null;
  isLocked: boolean;
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex'>) => string;
  closeWindow: (id: string) => void;
  requestCloseWindow: (id: string) => void;
  registerCloseHandler: (windowId: string, handler: CloseHandler) => void;
  unregisterCloseHandler: (windowId: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  addFile: (file: Omit<FileItem, 'id' | 'dateModified'>) => string;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  getFileById: (id: string) => FileItem | undefined;
  updateSettings: (settings: Partial<Settings>) => void;
  getFilesInFolder: (folderId: string | null) => FileItem[];
  recycledFiles: FileItem[];
  moveToRecycleBin: (id: string) => void;
  restoreFromRecycleBin: (id: string) => void;
  emptyRecycleBin: () => void;
  copyFiles: (fileIds: string[]) => void;
  cutFiles: (fileIds: string[]) => void;
  pasteFiles: (targetFolderId: string) => void;
  lockScreen: () => void;
  unlockScreen: () => void;
  downloadFile: (id: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

const defaultSettings: Settings = {
  wallpaper: 'default',
  theme: 'light',
  accentColor: 'blue',
  taskbarPosition: 'bottom',
  taskbarAlignment: 'center',
};

const STORAGE_KEY = 'workflow-os-files';
const SETTINGS_KEY = 'workflow-os-settings';

const defaultFiles: FileItem[] = [
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: null, dateModified: new Date() },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'this-pc', dateModified: new Date() },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'this-pc', dateModified: new Date() },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'this-pc', dateModified: new Date() },
  { id: 'music', name: 'Music', type: 'folder', parentId: 'this-pc', dateModified: new Date() },
  { id: 'videos', name: 'Videos', type: 'folder', parentId: 'this-pc', dateModified: new Date() },
];

const loadFilesFromStorage = (): FileItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((f: FileItem) => ({ ...f, dateModified: new Date(f.dateModified) }));
    }
  } catch (e) {
    console.error('Failed to load files from storage:', e);
  }
  return defaultFiles;
};

const loadSettingsFromStorage = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load settings from storage:', e);
  }
  return defaultSettings;
};

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>(() => loadFilesFromStorage());
  const [recycledFiles, setRecycledFiles] = useState<FileItem[]>([]);
  const [settings, setSettings] = useState<Settings>(() => loadSettingsFromStorage());
  const [nextZIndex, setNextZIndex] = useState(100);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [closeHandlers] = useState<Map<string, () => boolean>>(new Map());

  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const openWindow = useCallback((window: Omit<WindowState, 'id' | 'zIndex'>) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow: WindowState = {
      ...window,
      id,
      zIndex: nextZIndex,
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
    return id;
  }, [nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    closeHandlers.delete(id);
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => prev === id ? null : prev);
  }, [closeHandlers]);

  const requestCloseWindow = useCallback((id: string) => {
    const handler = closeHandlers.get(id);
    if (handler) {
      const shouldClose = handler();
      if (shouldClose) {
        closeWindow(id);
      }
    } else {
      closeWindow(id);
    }
  }, [closeHandlers, closeWindow]);

  const registerCloseHandler = useCallback((windowId: string, handler: () => boolean) => {
    closeHandlers.set(windowId, handler);
  }, [closeHandlers]);

  const unregisterCloseHandler = useCallback((windowId: string) => {
    closeHandlers.delete(windowId);
  }, [closeHandlers]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    setActiveWindowId(null);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: true } : w
    ));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false, isMaximized: false } : w
    ));
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
  }, [nextZIndex]);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, x, y } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, width, height } : w
    ));
  }, []);

  const addFile = useCallback((file: Omit<FileItem, 'id' | 'dateModified'>) => {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFile: FileItem = {
      ...file,
      id,
      dateModified: new Date(),
    };
    setFiles(prev => [...prev, newFile]);
    return id;
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const renameFile = useCallback((id: string, name: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, name, dateModified: new Date() } : f
    ));
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, content, dateModified: new Date() } : f
    ));
  }, []);

  const getFileById = useCallback((id: string) => {
    return files.find(f => f.id === id);
  }, [files]);

  const downloadFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.type === 'file') {
      const blob = new Blob([file.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [files]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getFilesInFolder = useCallback((folderId: string | null) => {
    return files.filter(f => f.parentId === folderId);
  }, [files]);

  const moveToRecycleBin = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setRecycledFiles(prev => [...prev, { ...file, parentId: 'recycle-bin' }]);
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  }, [files]);

  const restoreFromRecycleBin = useCallback((id: string) => {
    const file = recycledFiles.find(f => f.id === id);
    if (file) {
      setFiles(prev => [...prev, { ...file, parentId: 'desktop' }]);
      setRecycledFiles(prev => prev.filter(f => f.id !== id));
    }
  }, [recycledFiles]);

  const emptyRecycleBin = useCallback(() => {
    setRecycledFiles([]);
  }, []);

  const copyFiles = useCallback((fileIds: string[]) => {
    const filesToCopy = files.filter(f => fileIds.includes(f.id));
    setClipboard({ files: filesToCopy, operation: 'copy' });
  }, [files]);

  const cutFiles = useCallback((fileIds: string[]) => {
    const filesToCut = files.filter(f => fileIds.includes(f.id));
    setClipboard({ files: filesToCut, operation: 'cut' });
  }, [files]);

  const pasteFiles = useCallback((targetFolderId: string) => {
    if (!clipboard) return;

    clipboard.files.forEach(file => {
      const newId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newFile: FileItem = {
        ...file,
        id: newId,
        parentId: targetFolderId,
        name: clipboard.operation === 'copy' ? `${file.name}` : file.name,
        dateModified: new Date(),
      };
      setFiles(prev => [...prev, newFile]);

      if (clipboard.operation === 'cut') {
        setFiles(prev => prev.filter(f => f.id !== file.id));
      }
    });

    if (clipboard.operation === 'cut') {
      setClipboard(null);
    }
  }, [clipboard]);

  const lockScreen = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockScreen = useCallback(() => {
    setIsLocked(false);
  }, []);

  return (
    <WindowContext.Provider value={{
      windows,
      activeWindowId,
      files,
      settings,
      clipboard,
      isLocked,
      openWindow,
      closeWindow,
      requestCloseWindow,
      registerCloseHandler,
      unregisterCloseHandler,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      addFile,
      deleteFile,
      renameFile,
      updateFileContent,
      getFileById,
      updateSettings,
      getFilesInFolder,
      recycledFiles,
      moveToRecycleBin,
      restoreFromRecycleBin,
      emptyRecycleBin,
      copyFiles,
      cutFiles,
      pasteFiles,
      lockScreen,
      unlockScreen,
      downloadFile,
    }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
}
