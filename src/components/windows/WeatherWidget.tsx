import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Wind, Droplets, X, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  onClose?: () => void;
}

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy';
  humidity: number;
  windSpeed: number;
  high: number;
  low: number;
  location: string;
  forecast: { day: string; temp: number; condition: 'sunny' | 'cloudy' | 'rainy' }[];
}

const STORAGE_KEY = 'weather-widget-position';

export function WeatherWidget({ onClose }: WeatherWidgetProps) {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: 20, y: 100 };
      }
    }
    return { x: 20, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [weather] = useState<WeatherData>({
    temp: 72,
    condition: 'sunny',
    humidity: 45,
    windSpeed: 8,
    high: 78,
    low: 65,
    location: 'San Francisco, CA',
    forecast: [
      { day: 'Tue', temp: 75, condition: 'sunny' },
      { day: 'Wed', temp: 70, condition: 'cloudy' },
      { day: 'Thu', temp: 68, condition: 'rainy' },
      { day: 'Fri', temp: 72, condition: 'sunny' },
    ],
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.weather-close-btn')) return;
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

  const getWeatherIcon = (condition: string, size: string = 'w-12 h-12') => {
    const iconClass = cn(size);
    switch (condition) {
      case 'sunny':
        return <Sun className={cn(iconClass, 'text-yellow-400')} />;
      case 'cloudy':
        return <Cloud className={cn(iconClass, 'text-gray-400')} />;
      case 'rainy':
        return <CloudRain className={cn(iconClass, 'text-blue-400')} />;
      case 'snowy':
        return <Snowflake className={cn(iconClass, 'text-blue-200')} />;
      case 'stormy':
        return <CloudLightning className={cn(iconClass, 'text-yellow-500')} />;
      case 'windy':
        return <Wind className={cn(iconClass, 'text-gray-500')} />;
      default:
        return <Sun className={cn(iconClass, 'text-yellow-400')} />;
    }
  };

  return (
    <div
      className={cn(
        "absolute z-50 w-64 bg-background/90 backdrop-blur-xl rounded-xl shadow-2xl border border-border overflow-hidden",
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
          <span>Weather</span>
        </div>
        {onClose && (
          <button 
            className="weather-close-btn p-1 rounded hover:bg-destructive/20 transition-colors"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Current Weather */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-light">{weather.temp}°F</div>
            <div className="text-sm text-muted-foreground capitalize">{weather.condition}</div>
            <div className="text-xs text-muted-foreground mt-1">
              H: {weather.high}° • L: {weather.low}°
            </div>
          </div>
          {getWeatherIcon(weather.condition)}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>{weather.windSpeed} mph</span>
          </div>
        </div>

        {/* Location */}
        <div className="text-xs text-muted-foreground mb-3">{weather.location}</div>

        {/* Forecast */}
        <div className="border-t border-border pt-3">
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                {getWeatherIcon(day.condition, 'w-5 h-5')}
                <div className="text-xs mt-1">{day.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
