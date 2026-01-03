import React, { useState, useEffect } from 'react';
import { X, GripHorizontal, ExternalLink, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveTVWidgetProps {
  onClose?: () => void;
}

const STORAGE_KEY = 'livetv-widget-position';

export function LiveTVWidget({ onClose }: LiveTVWidgetProps) {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: 20, y: 300 };
      }
    }
    return { x: 20, y: 300 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.livetv-close-btn') || 
        (e.target as HTMLElement).closest('.livetv-content')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, e.clientX - dragOffset.x),
      y: Math.max(0, e.clientY - dragOffset.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleOpenLive = () => {
    window.open('https://abcnews.go.com/Live', '_blank', 'noopener,noreferrer');
  };


  return (
    <div
      className={cn(
        "absolute z-50 w-80 sm:w-96 bg-background/90 backdrop-blur-xl rounded-xl shadow-2xl border border-border overflow-hidden",
        isDragging && "cursor-grabbing"
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 bg-muted/50 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripHorizontal className="w-4 h-4" />
          <Radio className="w-4 h-4 text-red-500" />
          <span>ABC News Live</span>
        </div>
        {onClose && (
          <button 
            className="livetv-close-btn p-1 rounded hover:bg-destructive/20 transition-colors"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="livetv-content p-4">
        {/* Video Preview Area */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-3 group cursor-pointer" onClick={handleOpenLive}>
          {/* Placeholder/Preview */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Radio className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <div className="text-sm font-medium">ABC News Live</div>
              <div className="text-xs opacity-75 mt-1">24/7 Breaking News</div>
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <div className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm">
              <svg 
                className="w-8 h-8 text-white ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          {/* Live Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-600 rounded-md">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-white">LIVE</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">ABC News Live</div>
              <div className="text-xs text-muted-foreground">24/7 Breaking News Coverage</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleOpenLive}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Open Full Screen
            </button>
          </div>

          {/* Description */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Watch breaking news, live events, and in-depth coverage from ABC News.
          </div>
        </div>
      </div>
    </div>
  );
}

