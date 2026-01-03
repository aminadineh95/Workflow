import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import defaultWallpaper from '@/assets/wallpaper-default.jpg';

interface LockScreenProps {
  onUnlock: () => void;
  wallpaper?: string;
}

export function LockScreen({ onUnlock, wallpaper }: LockScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newDragY = Math.max(-window.innerHeight, Math.min(0, clientY - window.innerHeight));
    setDragY(newDragY);
    
    if (newDragY < -150) {
      handleUnlock();
    }
  };

  const handleMouseUp = () => {
    if (dragY > -150) {
      setDragY(0);
    }
    setIsDragging(false);
  };

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  const handleClick = () => {
    handleUnlock();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleUnlock();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] transition-transform duration-400",
        isUnlocking && "-translate-y-full"
      )}
      style={{
        transform: isUnlocking ? undefined : `translateY(${dragY}px)`,
        backgroundImage: `url(${wallpaper || defaultWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white select-none">
        {/* Time */}
        <div className="text-center mb-4">
          <div className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tight drop-shadow-lg">
            {formatTime(currentTime)}
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-light mt-2 drop-shadow-lg">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Swipe/Click indicator */}
        <div 
          className="absolute bottom-20 flex flex-col items-center cursor-pointer animate-bounce"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
          <span className="text-sm sm:text-base mt-2 drop-shadow-lg">Click or swipe up to unlock</span>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute top-6 right-6 flex items-center gap-3 text-white">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>
        </svg>
      </div>
    </div>
  );
}
