import React, { useState, useEffect } from 'react';
import { X, Cloud, Sun, CloudRain, Newspaper, TrendingUp, Calendar, Clock, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetsPanel({ isOpen, onClose }: WidgetsPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const weather = {
    temp: '72°F',
    condition: 'Partly Cloudy',
    high: '78°F',
    low: '65°F',
    location: 'Your Location',
  };

  const news = [
    { id: 1, title: 'Breaking: Technology advances continue to reshape daily life', source: 'Tech News' },
    { id: 2, title: 'Markets see positive growth in latest trading session', source: 'Finance Daily' },
    { id: 3, title: 'New discoveries in space exploration announced', source: 'Science Today' },
  ];

  const stocks = [
    { symbol: 'MSFT', price: '378.50', change: '+1.2%' },
    { symbol: 'AAPL', price: '189.25', change: '+0.8%' },
    { symbol: 'GOOGL', price: '142.30', change: '-0.3%' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-background/20" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-11 sm:bottom-12 w-full sm:w-[400px] max-w-full z-[9999]",
          "bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold">Widgets</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Widgets Content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto h-[calc(100%-50px)] sm:h-[calc(100%-60px)]">
          {/* Weather Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Cloud size={14} className="sm:w-4 sm:h-4" />
              Weather
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-light">{weather.temp}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{weather.condition}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  H: {weather.high} • L: {weather.low}
                </div>
              </div>
              <Sun size={40} className="sm:w-12 sm:h-12 text-yellow-500" />
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{weather.location}</div>
          </div>

          {/* Calendar Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              Calendar
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-3xl sm:text-4xl font-light">
                {currentTime.getDate()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock size={14} className="sm:w-4 sm:h-4" />
              Clock
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true 
                })}
              </div>
            </div>
          </div>

          {/* Stocks Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <TrendingUp size={14} className="sm:w-4 sm:h-4" />
              Markets
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm">${stock.price}</div>
                    <div className={cn(
                      "text-[10px] sm:text-xs",
                      stock.change.startsWith('+') ? "text-green-500" : "text-red-500"
                    )}>
                      {stock.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Newspaper size={14} className="sm:w-4 sm:h-4" />
              Top Stories
            </div>
            <div className="space-y-2 sm:space-y-3">
              {news.map((item) => (
                <div key={item.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="text-xs sm:text-sm font-medium hover:text-primary cursor-pointer transition-colors line-clamp-2">
                    {item.title}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{item.source}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live TV Widget */}
          <div className="win-window p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Radio size={14} className="sm:w-4 sm:h-4 text-red-500" />
              ABC News Live
            </div>
            <div className="space-y-2">
              <div className="aspect-video bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Radio className="w-8 h-8 mx-auto mb-1 opacity-90" />
                  <div className="text-xs font-medium">24/7 Breaking News</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Live Stream</span>
                <div className="flex items-center gap-1 text-red-500">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">LIVE</span>
                </div>
              </div>
              <button
                onClick={() => window.open('https://abcnews.go.com/Live', '_blank', 'noopener,noreferrer')}
                className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
              >
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
