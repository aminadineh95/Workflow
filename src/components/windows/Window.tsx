import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Minus, Square, X, Maximize2, Copy } from 'lucide-react';
import { useWindows } from '@/contexts/WindowContext';
import { WindowState } from '@/types/windows';
import { cn } from '@/lib/utils';
import { SnapIndicator, SnapZone, getSnapZone, getSnapDimensions } from './SnapIndicator';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export function Window({ window: win, children }: WindowProps) {
  const { 
    activeWindowId, 
    requestCloseWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindows();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const [isSnapped, setIsSnapped] = useState(false);
  const [preSnapPosition, setPreSnapPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const isActive = activeWindowId === win.id;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    focusWindow(win.id);
    
    if ((e.target as HTMLElement).closest('.window-titlebar')) {
      if (win.isMaximized) {
        // Unmaximize and start dragging
        restoreWindow(win.id);
        setIsDragging(true);
        setDragOffset({
          x: win.width / 2,
          y: 15,
        });
        return;
      }
      
      // Save position for unsnap
      if (isSnapped) {
        setPreSnapPosition({ x: win.x, y: win.y, width: win.width, height: win.height });
      }
      
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - win.x,
        y: e.clientY - win.y,
      });
    }
  }, [focusWindow, win.id, win.x, win.y, win.width, win.isMaximized, isSnapped, restoreWindow]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (win.isMaximized) return;
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: win.width,
      height: win.height,
    });
  }, [win.isMaximized, win.width, win.height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
        
        // Check for snap zones
        const zone = getSnapZone(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
        setSnapZone(zone);
        
        updateWindowPosition(win.id, newX, newY);
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(400, resizeStart.width + deltaX);
        const newHeight = Math.max(300, resizeStart.height + deltaY);
        updateWindowSize(win.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && snapZone) {
        const snapDims = getSnapDimensions(snapZone);
        if (snapDims) {
          // Save pre-snap position
          if (!isSnapped) {
            setPreSnapPosition({ x: win.x, y: win.y, width: win.width, height: win.height });
          }
          updateWindowPosition(win.id, snapDims.x, snapDims.y);
          updateWindowSize(win.id, snapDims.width, snapDims.height);
          setIsSnapped(true);
        }
      } else if (isDragging && isSnapped && preSnapPosition) {
        // Unsnap and restore size
        updateWindowSize(win.id, preSnapPosition.width, preSnapPosition.height);
        setIsSnapped(false);
        setPreSnapPosition(null);
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setSnapZone(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, win.id, win.x, win.y, win.width, win.height, snapZone, isSnapped, preSnapPosition, updateWindowPosition, updateWindowSize]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => requestCloseWindow(win.id), 150);
  };

  const handleMaximize = () => {
    if (win.isMaximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
    setIsSnapped(false);
  };

  if (win.isMinimized) return null;

  // Calculate responsive dimensions
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
  
  const getResponsiveStyle = () => {
    if (win.isMaximized || isMobile) {
      return {
        left: 0,
        top: 0,
        width: '100%',
        height: 'calc(100% - 44px)',
        zIndex: win.zIndex,
      };
    }
    
    if (isTablet) {
      return {
        left: Math.min(win.x, window.innerWidth - 400),
        top: Math.min(win.y, window.innerHeight - 300),
        width: Math.min(win.width, window.innerWidth - 20),
        height: Math.min(win.height, window.innerHeight - 60),
        zIndex: win.zIndex,
      };
    }
    
    return {
      left: win.x,
      top: win.y,
      width: win.width,
      height: win.height,
      zIndex: win.zIndex,
    };
  };

  return (
    <>
      {/* Snap Indicator */}
      {isDragging && !isMobile && <SnapIndicator zone={snapZone} />}
      
      <div
        ref={windowRef}
        className={cn(
          "absolute flex flex-col win-window overflow-hidden select-none",
          isActive ? "ring-1 ring-primary/20 shadow-2xl" : "shadow-lg",
          isClosing ? "animate-window-close" : "animate-window-open",
          isDragging && "cursor-grabbing opacity-90",
          isMobile && "!rounded-none"
        )}
        style={getResponsiveStyle()}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if ((e.target as HTMLElement).closest('.window-titlebar')) {
            focusWindow(win.id);
          }
        }}
      >
        {/* Title Bar */}
        <div 
          className={cn(
            "window-titlebar flex items-center h-7 sm:h-8 px-2 win-titlebar border-b border-border/50",
            !isActive && "opacity-70"
          )}
          onDoubleClick={handleMaximize}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm truncate">{win.title}</span>
          </div>
          
          <div className="window-controls flex items-center -mr-1">
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-9 sm:w-11 h-7 sm:h-8 flex items-center justify-center win-hover rounded-sm transition-colors"
            >
              <Minus size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleMaximize}
              className="hidden sm:flex w-11 h-8 items-center justify-center win-hover rounded-sm transition-colors"
            >
              {win.isMaximized ? <Copy size={12} className="rotate-180" /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={handleClose}
              className="w-9 sm:w-11 h-7 sm:h-8 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded-sm transition-colors"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-card">
          {children}
        </div>

        {/* Resize Handles - Hidden on mobile */}
        {!win.isMaximized && !isMobile && (
          <>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />
            <div
              className="absolute bottom-0 left-0 right-4 h-1 cursor-s-resize"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
              className="absolute top-8 right-0 bottom-4 w-1 cursor-e-resize"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
          </>
        )}
      </div>
    </>
  );
}
