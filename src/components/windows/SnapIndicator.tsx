import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SnapZone = 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

interface SnapIndicatorProps {
  zone: SnapZone;
}

export const SnapIndicator = forwardRef<HTMLDivElement, SnapIndicatorProps>(
  ({ zone }, ref) => {
  if (!zone) return null;

  const getZoneStyles = () => {
    switch (zone) {
      case 'left':
        return 'left-0 top-0 w-1/2 h-[calc(100%-48px)]';
      case 'right':
        return 'right-0 top-0 w-1/2 h-[calc(100%-48px)]';
      case 'top':
        return 'left-0 top-0 w-full h-[calc(100%-48px)]';
      case 'top-left':
        return 'left-0 top-0 w-1/2 h-[calc(50%-24px)]';
      case 'top-right':
        return 'right-0 top-0 w-1/2 h-[calc(50%-24px)]';
      case 'bottom-left':
        return 'left-0 top-1/2 w-1/2 h-[calc(50%-24px)]';
      case 'bottom-right':
        return 'right-0 top-1/2 w-1/2 h-[calc(50%-24px)]';
      default:
        return '';
    }
  };

    return (
      <div
        ref={ref}
        className={cn(
          "fixed pointer-events-none z-[9997]",
          "bg-primary/20 border-2 border-primary rounded-lg",
          "animate-pulse",
          getZoneStyles()
        )}
      />
    );
  }
);

SnapIndicator.displayName = 'SnapIndicator';

export function getSnapZone(x: number, y: number, screenWidth: number, screenHeight: number): SnapZone {
  const edgeThreshold = 20;
  const cornerThreshold = 50;

  const isNearLeft = x < edgeThreshold;
  const isNearRight = x > screenWidth - edgeThreshold;
  const isNearTop = y < edgeThreshold;
  const isNearBottom = y > screenHeight - 48 - edgeThreshold;

  // Corners
  if (isNearLeft && isNearTop && x < cornerThreshold && y < cornerThreshold) {
    return 'top-left';
  }
  if (isNearRight && isNearTop && x > screenWidth - cornerThreshold && y < cornerThreshold) {
    return 'top-right';
  }
  if (isNearLeft && isNearBottom) {
    return 'bottom-left';
  }
  if (isNearRight && isNearBottom) {
    return 'bottom-right';
  }

  // Edges
  if (isNearLeft) return 'left';
  if (isNearRight) return 'right';
  if (isNearTop) return 'top';

  return null;
}

export function getSnapDimensions(zone: SnapZone): { x: number; y: number; width: number; height: number } | null {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - 48; // Account for taskbar

  switch (zone) {
    case 'left':
      return { x: 0, y: 0, width: screenWidth / 2, height: screenHeight };
    case 'right':
      return { x: screenWidth / 2, y: 0, width: screenWidth / 2, height: screenHeight };
    case 'top':
      return { x: 0, y: 0, width: screenWidth, height: screenHeight };
    case 'top-left':
      return { x: 0, y: 0, width: screenWidth / 2, height: screenHeight / 2 };
    case 'top-right':
      return { x: screenWidth / 2, y: 0, width: screenWidth / 2, height: screenHeight / 2 };
    case 'bottom-left':
      return { x: 0, y: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 };
    case 'bottom-right':
      return { x: screenWidth / 2, y: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 };
    default:
      return null;
  }
}
