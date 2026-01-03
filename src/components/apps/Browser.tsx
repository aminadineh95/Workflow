import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Star,
  Plus,
  X,
  MoreVertical,
  Search,
  Globe,
  ExternalLink,
  Clock,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
  favicon?: string;
}

interface Bookmark {
  id: string;
  url: string;
  title: string;
  icon?: string;
}

// Popular quick links for new tab
const QUICK_LINKS = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📚' },
  { name: 'GitHub', url: 'https://github.com', icon: '💻' },
  { name: 'Twitter/X', url: 'https://x.com', icon: '🐦' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
  { name: 'Amazon', url: 'https://www.amazon.com', icon: '🛒' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' },
];

const HISTORY_STORAGE_KEY = 'browser-history';
const BOOKMARKS_STORAGE_KEY = 'browser-bookmarks';

export function Browser() {
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const getHostname = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleNavigate = (url: string) => {
    if (!url.trim()) return;
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        // Use Google search
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    
    // Add to history
    const historyEntry: HistoryEntry = {
      url: finalUrl,
      title: getHostname(finalUrl),
      timestamp: Date.now(),
    };
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
    
    // Open in new browser tab
    const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer');
    
    // Show toast notification
    if (newWindow) {
      toast({
        title: "Opening in new tab",
        description: getHostname(finalUrl),
      });
    } else {
      // Pop-up was blocked
      toast({
        title: "Pop-up blocked",
        description: "Click 'Copy URL' to copy the link manually",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(finalUrl)}
            className="gap-1"
          >
            <Copy size={14} />
            Copy URL
          </Button>
        ),
      });
    }
    
    // Clear input
    setInputUrl('');
    setSearchSuggestions([]);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copied!",
        description: "Paste it in a new browser tab",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: url,
      });
    }
  };

  const handleInputChange = (value: string) => {
    setInputUrl(value);
    
    // Generate suggestions from history and bookmarks
    if (value.length > 1) {
      const lowerValue = value.toLowerCase();
      const historySuggestions = history
        .filter(h => h.url.toLowerCase().includes(lowerValue) || h.title.toLowerCase().includes(lowerValue))
        .slice(0, 3)
        .map(h => h.url);
      const bookmarkSuggestions = bookmarks
        .filter(b => b.url.toLowerCase().includes(lowerValue) || b.title.toLowerCase().includes(lowerValue))
        .slice(0, 2)
        .map(b => b.url);
      setSearchSuggestions([...new Set([...historySuggestions, ...bookmarkSuggestions])].slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  };

  const addBookmark = (url: string, title: string) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      url,
      title,
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeHistoryEntry = (timestamp: number) => {
    setHistory(prev => prev.filter(h => h.timestamp !== timestamp));
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Navigation Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "p-1.5 rounded-md hover:bg-secondary",
            showHistory && "bg-secondary"
          )}
          title="History"
        >
          <Clock size={16} />
        </button>
        <button 
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={cn(
            "p-1.5 rounded-md hover:bg-secondary",
            showBookmarks && "bg-secondary"
          )}
          title="Bookmarks"
        >
          <Star size={16} />
        </button>

        {/* Address Bar */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-border">
            <Globe size={14} className="text-muted-foreground" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNavigate(inputUrl);
                }
                if (e.key === 'Escape') {
                  setSearchSuggestions([]);
                }
              }}
              onFocus={() => setShowHistory(false)}
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Search Google or enter URL - Opens in new tab"
            />
            {inputUrl && (
              <button 
                onClick={() => copyToClipboard(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`)}
                className="p-1 rounded hover:bg-secondary"
                title="Copy URL"
              >
                <Copy size={14} className="text-muted-foreground" />
              </button>
            )}
            <button 
              onClick={() => handleNavigate(inputUrl)}
              className="p-1 rounded hover:bg-secondary"
              title="Open in new tab"
            >
              <ExternalLink size={14} className="text-muted-foreground" />
            </button>
          </div>
          
          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {searchSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleNavigate(suggestion);
                    setSearchSuggestions([]);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-left"
                >
                  <Globe size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-1.5 rounded-md hover:bg-secondary">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-64 border-r border-border flex flex-col bg-secondary/20">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="font-medium text-sm">History</span>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="h-7 text-xs">
                Clear All
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                ) : (
                  history.map((entry) => (
                    <div
                      key={entry.timestamp}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary group cursor-pointer"
                      onClick={() => handleNavigate(entry.url)}
                    >
                      <Globe size={14} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{entry.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{entry.url}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryEntry(entry.timestamp);
                        }}
                        className="p-1 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Bookmarks Sidebar */}
        {showBookmarks && (
          <div className="w-64 border-r border-border flex flex-col bg-secondary/20">
            <div className="px-3 py-2 border-b border-border">
              <span className="font-medium text-sm">Bookmarks</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {bookmarks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No bookmarks yet</p>
                ) : (
                  bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary group cursor-pointer"
                      onClick={() => handleNavigate(bookmark.url)}
                    >
                      <Star size={14} className="text-yellow-500 shrink-0" fill="currentColor" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{bookmark.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        className="p-1 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Content - New Tab Page */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Web Browser</h1>
            <p className="text-muted-foreground">Websites open in a new browser tab</p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full max-w-lg mb-8">
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-full border border-border">
              <Search size={18} className="text-muted-foreground" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(inputUrl)}
                className="flex-1 bg-transparent outline-none"
                placeholder="Search Google or enter URL"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={() => handleNavigate(inputUrl)}
                disabled={!inputUrl.trim()}
              >
                <ExternalLink size={14} className="mr-1" />
                Open
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-4 gap-4 mb-8 max-w-xl">
            {QUICK_LINKS.map((site) => (
              <button
                key={site.name}
                onClick={() => handleNavigate(site.url)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {site.icon}
                </div>
                <span className="text-sm">{site.name}</span>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="text-center text-muted-foreground max-w-md">
            <p className="text-sm mb-2">
              <ExternalLink size={14} className="inline mr-1" />
              All websites open in a new browser tab for full functionality
            </p>
            <p className="text-xs">
              Your browsing history and bookmarks are saved locally
            </p>
          </div>

          {/* Recent History */}
          {history.length > 0 && (
            <div className="mt-8 w-full max-w-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock size={14} />
                Recently Visited
              </h3>
              <div className="space-y-1">
                {history.slice(0, 5).map((entry) => (
                  <button
                    key={entry.timestamp}
                    onClick={() => handleNavigate(entry.url)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 text-left group"
                  >
                    <Globe size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                    <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
