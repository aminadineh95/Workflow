export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  props?: Record<string, unknown>;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  action: string;
  position: { x: number; y: number };
  url?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  content?: string;
  size?: number;
  dateModified: Date;
  icon?: string;
}

export interface ClipboardItem {
  files: FileItem[];
  operation: 'copy' | 'cut';
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
  action?: () => void;
  submenu?: ContextMenuItem[];
}

export interface Settings {
  wallpaper: string;
  theme: 'light' | 'dark';
  accentColor: string;
  taskbarPosition: 'bottom' | 'top' | 'left' | 'right';
  taskbarAlignment: 'center' | 'left';
}
