import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2,
  SkipBack,
  SkipForward,
  Upload,
  Film,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  windowId: string;
}

export function VideoPlayer({ windowId }: VideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoName(file.name);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col bg-black"
      onMouseMove={handleMouseMove}
    >
      {videoSrc ? (
        <>
          {/* Video Container */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              className="max-w-full max-h-full object-contain"
              onClick={handlePlayPause}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={handlePlayPause}
              >
                <div className="w-20 h-20 rounded-full bg-background/80 flex items-center justify-center">
                  <Play className="w-10 h-10 text-foreground ml-1" />
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0"
              )}
            >
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleSkip(-10)}>
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 w-12 h-12" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleSkip(10)}>
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-24 cursor-pointer"
                    />
                  </div>

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleFullscreen}>
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* File Name Bar */}
          <div className="p-2 bg-muted/20 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-white/80 truncate">{videoName}</span>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="ghost" size="sm" className="text-white/80" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Open New
                </span>
              </Button>
            </label>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 p-8">
          <Film className="w-24 h-24 opacity-50" />
          <h2 className="text-xl font-semibold text-white/80">No Video Loaded</h2>
          <p className="text-sm text-center">Upload a video file to start watching</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Open Video File
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
