import React, { useState, useRef } from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { 
  Search,
  Palette,
  Monitor,
  Wifi,
  Bell,
  Lock,
  Clock,
  Accessibility,
  Shield,
  HardDrive,
  Gamepad2,
  Info,
  ChevronRight,
  Sun,
  Moon,
  Image,
  Upload,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import defaultWallpaper from '@/assets/wallpaper-default.jpg';
import bloomWallpaper from '@/assets/wallpaper-bloom.jpg';
import sunsetWallpaper from '@/assets/wallpaper-sunset.jpg';
import glowWallpaper from '@/assets/wallpaper-glow.jpg';

interface SettingsAppProps {
  page?: string;
}

const menuItems = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'bluetooth', label: 'Bluetooth & devices', icon: Wifi },
  { id: 'network', label: 'Network & internet', icon: Wifi },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'apps', label: 'Apps', icon: HardDrive },
  { id: 'accounts', label: 'Accounts', icon: Lock },
  { id: 'time', label: 'Time & language', icon: Clock },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'privacy', label: 'Privacy & security', icon: Shield },
  { id: 'update', label: 'Windows Update', icon: Info },
];

const wallpapers = [
  { id: 'default', name: 'Flow', url: defaultWallpaper },
  { id: 'bloom', name: 'Bloom', url: bloomWallpaper },
  { id: 'sunset', name: 'Sunset', url: sunsetWallpaper },
  { id: 'glow', name: 'Glow', url: glowWallpaper },
  { id: 'solid-blue', name: 'Solid Blue', color: 'hsl(207, 90%, 54%)' },
  { id: 'solid-dark', name: 'Solid Dark', color: 'hsl(0, 0%, 15%)' },
  { id: 'solid-gray', name: 'Solid Gray', color: 'hsl(220, 14%, 50%)' },
  { id: 'solid-purple', name: 'Solid Purple', color: 'hsl(270, 70%, 40%)' },
  { id: 'solid-green', name: 'Solid Green', color: 'hsl(140, 50%, 35%)' },
];

const accentColors = [
  { id: 'blue', color: 'hsl(207, 90%, 54%)', name: 'Blue' },
  { id: 'purple', color: 'hsl(270, 70%, 60%)', name: 'Purple' },
  { id: 'pink', color: 'hsl(330, 70%, 60%)', name: 'Pink' },
  { id: 'red', color: 'hsl(0, 70%, 55%)', name: 'Red' },
  { id: 'orange', color: 'hsl(30, 80%, 55%)', name: 'Orange' },
  { id: 'green', color: 'hsl(140, 50%, 45%)', name: 'Green' },
  { id: 'teal', color: 'hsl(180, 50%, 45%)', name: 'Teal' },
];

export function SettingsApp({ page: initialPage = 'system' }: SettingsAppProps) {
  const { settings, updateSettings } = useWindows();
  const [activePage, setActivePage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [customWallpapers, setCustomWallpapers] = useState<{ id: string; name: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const id = `custom-${Date.now()}`;
        setCustomWallpapers(prev => [...prev, { id, name: file.name, url }]);
        updateSettings({ wallpaper: id });
      };
      reader.readAsDataURL(file);
    }
  };

  const allWallpapers = [...wallpapers, ...customWallpapers];

  const renderContent = () => {
    switch (activePage) {
      case 'personalization':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Personalization</h2>
              <p className="text-muted-foreground">Background, colors, themes</p>
            </div>

            {/* Background */}
            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Image size={20} />
                Background
              </h3>
              
              {/* Upload Button */}
              <div className="flex items-center gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallpaperUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Upload size={16} />
                  Browse photos
                </button>
                <span className="text-sm text-muted-foreground">Upload your own wallpaper</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {allWallpapers.map((wp) => {
                  const hasUrl = 'url' in wp && wp.url;
                  const hasColor = 'color' in wp && wp.color;
                  
                  return (
                  <button
                    key={wp.id}
                    onClick={() => updateSettings({ wallpaper: wp.id })}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 transition-all relative group",
                      settings.wallpaper === wp.id 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-border"
                    )}
                  >
                    {hasUrl ? (
                      <img src={(wp as { url: string }).url} alt={wp.name} className="w-full h-full object-cover" />
                    ) : hasColor ? (
                      <div className="w-full h-full" style={{ background: (wp as { color: string }).color }} />
                    ) : null}
                    {settings.wallpaper === wp.id && (
                      <div className="absolute top-1 right-1 w-4 sm:w-5 h-4 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={10} className="sm:w-3 sm:h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-background/80 text-[10px] sm:text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {wp.name}
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Theme */}
            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Palette size={20} />
                Choose your mode
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    updateSettings({ theme: 'light' });
                    document.documentElement.classList.remove('dark');
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 flex items-center gap-3 transition-all",
                    settings.theme === 'light'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Sun size={24} />
                  <div className="text-left">
                    <div className="font-medium">Light</div>
                    <div className="text-xs text-muted-foreground">Best for bright environments</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    updateSettings({ theme: 'dark' });
                    document.documentElement.classList.add('dark');
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 flex items-center gap-3 transition-all",
                    settings.theme === 'dark'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Moon size={24} />
                  <div className="text-left">
                    <div className="font-medium">Dark</div>
                    <div className="text-xs text-muted-foreground">Best for low-light environments</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Accent color</h3>
              <div className="flex gap-3 flex-wrap">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ accentColor: color.id })}
                    className={cn(
                      "w-10 h-10 rounded-full transition-transform hover:scale-110 relative",
                      settings.accentColor === color.id && "ring-2 ring-offset-2 ring-foreground"
                    )}
                    style={{ background: color.color }}
                    title={color.name}
                  >
                    {settings.accentColor === color.id && (
                      <Check size={16} className="absolute inset-0 m-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Display</h2>
              <p className="text-muted-foreground">Brightness, night light, display settings</p>
            </div>

            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Brightness & color</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Brightness</span>
                    <span className="text-sm text-muted-foreground">100%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Scale & layout</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scale</span>
                  <select className="px-3 py-1.5 bg-secondary rounded-md text-sm">
                    <option>100%</option>
                    <option>125%</option>
                    <option>150%</option>
                    <option>175%</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Display resolution</span>
                  <select className="px-3 py-1.5 bg-secondary rounded-md text-sm">
                    <option>1920 x 1080</option>
                    <option>1600 x 900</option>
                    <option>1366 x 768</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'taskbar':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Taskbar</h2>
              <p className="text-muted-foreground">Taskbar behaviors and appearance</p>
            </div>

            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Taskbar alignment</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSettings({ taskbarAlignment: 'center' })}
                  className={cn(
                    "px-4 py-2 rounded-md border-2 transition-all",
                    settings.taskbarAlignment === 'center'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  Center
                </button>
                <button
                  onClick={() => updateSettings({ taskbarAlignment: 'left' })}
                  className={cn(
                    "px-4 py-2 rounded-md border-2 transition-all",
                    settings.taskbarAlignment === 'left'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  Left
                </button>
              </div>
            </div>

            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Taskbar items</h3>
              <div className="space-y-3">
                {[
                  { id: 'search', label: 'Search', enabled: true },
                  { id: 'widgets', label: 'Widgets', enabled: true },
                  { id: 'chat', label: 'Chat', enabled: false },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <button
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        item.enabled ? "bg-primary" : "bg-secondary"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-card transition-transform",
                          item.enabled ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="win-window p-4 space-y-4">
              <h3 className="font-medium">Keyboard shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Start menu</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Win</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Switch windows</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Alt + Tab</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Show desktop</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Win + D</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Widgets</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Win + W</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open File Explorer</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Win + E</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Settings</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Win + I</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Task Manager</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Ctrl + Shift + Esc</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Close window</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">Alt + F4</kbd>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">System</h2>
              <p className="text-muted-foreground">Display, sound, notifications, power</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'display', label: 'Display', desc: 'Monitors, brightness, night light, display profile', icon: Monitor },
                { id: 'sound', label: 'Sound', desc: 'Volume levels, output, input, sound devices', icon: Bell },
                { id: 'notifications', label: 'Notifications', desc: 'Alerts from apps and system', icon: Bell },
                { id: 'power', label: 'Power & battery', desc: 'Sleep, battery usage, battery saver', icon: HardDrive },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className="w-full flex items-center gap-4 p-4 win-window hover:bg-secondary/50 transition-colors text-left"
                >
                  <item.icon size={24} className="text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-full">
      {/* Sidebar - Collapsible on mobile */}
      <div className="w-full sm:w-56 lg:w-64 border-b sm:border-b-0 sm:border-r border-border bg-card/50 flex-shrink-0 overflow-y-auto max-h-[30vh] sm:max-h-none">
        {/* Search */}
        <div className="p-2 sm:p-4">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-md">
            <Search size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Find a setting"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm outline-none"
            />
          </div>
        </div>

        {/* Menu - Horizontal scroll on mobile */}
        <nav className="px-2 pb-2 sm:pb-0 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-md text-xs sm:text-sm transition-colors text-left whitespace-nowrap flex-shrink-0 sm:flex-shrink sm:w-full",
                activePage === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary"
              )}
            >
              <item.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
