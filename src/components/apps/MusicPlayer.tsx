import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Plus, 
  Music, 
  Heart,
  List,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
  url?: string;
  isFavorite: boolean;
}

interface MusicPlayerProps {
  windowId: string;
}

const defaultTracks: Track[] = [
  { id: '1', name: 'Chill Vibes', artist: 'Ambient Artist', duration: 180, isFavorite: false },
  { id: '2', name: 'Electronic Dreams', artist: 'Synth Wave', duration: 210, isFavorite: true },
  { id: '3', name: 'Acoustic Morning', artist: 'Folk Band', duration: 195, isFavorite: false },
  { id: '4', name: 'Jazz Nights', artist: 'Smooth Jazz Trio', duration: 240, isFavorite: true },
  { id: '5', name: 'Rock Anthem', artist: 'Power Chords', duration: 225, isFavorite: false },
];

export function MusicPlayer({ windowId }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [view, setView] = useState<'all' | 'favorites'>('all');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = tracks[currentTrackIndex];
  const displayTracks = view === 'favorites' ? tracks.filter(t => t.isFavorite) : tracks;

  const handleNext = useCallback(() => {
    if (isShuffle) {
      let newIndex = Math.floor(Math.random() * tracks.length);
      while (newIndex === currentTrackIndex && tracks.length > 1) {
        newIndex = Math.floor(Math.random() * tracks.length);
      }
      setCurrentTrackIndex(newIndex);
    } else if (isRepeat) {
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex(prev => (prev === tracks.length - 1 ? 0 : prev + 1));
    }
    setCurrentTime(0);
  }, [isShuffle, isRepeat, currentTrackIndex, tracks.length]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentTrackIndex, currentTrack, handleNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex(prev => (prev === 0 ? tracks.length - 1 : prev - 1));
      setCurrentTime(0);
    }
  };


  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFavorite = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const playTrack = (index: number) => {
    const trackInAllList = tracks.findIndex(t => t.id === displayTracks[index].id);
    setCurrentTrackIndex(trackInAllList);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const deleteTrack = (trackId: string) => {
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    if (trackIndex === currentTrackIndex) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (tracks.length > 1) {
        setCurrentTrackIndex(prev => (prev === 0 ? 0 : prev - 1));
      }
    } else if (trackIndex < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/')) {
          const url = URL.createObjectURL(file);
          const newTrack: Track = {
            id: `upload-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            duration: 180, // Will be updated when metadata loads
            url,
            isFavorite: false,
          };
          setTracks(prev => [...prev, newTrack]);
        }
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Now Playing Section */}
      <div className="p-6 flex flex-col items-center border-b border-border/50">
        {/* Album Art Placeholder */}
        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-lg">
          <Music className="w-20 h-20 text-primary/50" />
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold truncate max-w-64">
            {currentTrack?.name || 'No Track Selected'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentTrack?.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <Slider
            value={[currentTime]}
            max={currentTrack?.duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack?.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(isShuffle && 'text-primary')}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <SkipForward className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn(isRepeat && 'text-primary')}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 mt-4 w-32">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Playlist Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tabs & Actions */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex gap-2">
            <Button
              variant={view === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('all')}
            >
              <List className="w-4 h-4 mr-1" />
              All
            </Button>
            <Button
              variant={view === 'favorites' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('favorites')}
            >
              <Heart className="w-4 h-4 mr-1" />
              Favorites
            </Button>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Plus className="w-4 h-4 mr-1" />
                Add Music
              </span>
            </Button>
          </label>
        </div>

        {/* Track List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {displayTracks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {view === 'favorites' ? 'No favorite tracks yet' : 'No tracks in library'}
              </div>
            ) : (
              displayTracks.map((track, index) => {
                const isCurrentTrack = tracks[currentTrackIndex]?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors group',
                      isCurrentTrack ? 'bg-primary/10' : 'hover:bg-muted/50'
                    )}
                    onClick={() => playTrack(index)}
                  >
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                      {isCurrentTrack && isPlaying ? (
                        <div className="flex gap-0.5">
                          <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                          <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-5 bg-primary rounded-full animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Music className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', isCurrentTrack && 'text-primary font-medium')}>
                        {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                      >
                        <Heart className={cn('w-4 h-4', track.isFavorite && 'fill-red-500 text-red-500')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
