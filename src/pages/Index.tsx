import React from 'react';
import { WindowProvider } from '@/contexts/WindowContext';
import { Desktop } from '@/components/windows/Desktop';
import { Taskbar } from '@/components/windows/Taskbar';
import { WindowManager } from '@/components/windows/WindowManager';

const Index = () => {
  return (
    <WindowProvider>
      <div className="h-screen w-screen overflow-hidden relative select-none">
        {/* Desktop with icons and wallpaper */}
        <Desktop />
        
        {/* Window Manager for all open windows */}
        <WindowManager />
        
        {/* Taskbar at bottom */}
        <Taskbar />
      </div>
    </WindowProvider>
  );
};

export default Index;
