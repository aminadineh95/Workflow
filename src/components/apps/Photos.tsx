import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Grid3X3, 
  LayoutGrid, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  X,
  Heart,
  Trash2,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoItem {
  id: string;
  name: string;
  url: string;
  favorite: boolean;
  dateAdded: Date;
}

// Sample photos using placeholder images
const samplePhotos: PhotoItem[] = [
  { id: '1', name: 'Mountain Landscape', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-15') },
  { id: '2', name: 'Ocean Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop', favorite: true, dateAdded: new Date('2024-01-14') },
  { id: '3', name: 'Forest Path', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-13') },
  { id: '4', name: 'City Skyline', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-12') },
  { id: '5', name: 'Flower Garden', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', favorite: true, dateAdded: new Date('2024-01-11') },
  { id: '6', name: 'Snow Mountains', url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-10') },
  { id: '7', name: 'Beach Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-09') },
  { id: '8', name: 'Autumn Leaves', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', favorite: false, dateAdded: new Date('2024-01-08') },
];

type ViewMode = 'all' | 'favorites';
type GridSize = 'small' | 'large';

export function Photos() {
  const [photos, setPhotos] = useState<PhotoItem[]>(samplePhotos);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [gridSize, setGridSize] = useState<GridSize>('large');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const filteredPhotos = viewMode === 'favorites' 
    ? photos.filter(p => p.favorite) 
    : photos;

  const currentIndex = selectedPhoto 
    ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) 
    : -1;

  const handlePhotoClick = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  const toggleFavorite = (photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, favorite: !p.favorite } : p
    ));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
    }
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    if (selectedPhoto?.id === photoId) {
      setLightboxOpen(false);
      setSelectedPhoto(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const newPhoto: PhotoItem = {
          id: `uploaded-${Date.now()}-${Math.random()}`,
          name: file.name,
          url,
          favorite: false,
          dateAdded: new Date(),
        };
        setPhotos(prev => [newPhoto, ...prev]);
      }
    });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            All Photos
          </Button>
          <Button
            variant={viewMode === 'favorites' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('favorites')}
          >
            <Heart className="w-4 h-4 mr-1" />
            Favorites
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setGridSize(gridSize === 'large' ? 'small' : 'large')}
            title={gridSize === 'large' ? 'Small grid' : 'Large grid'}
          >
            {gridSize === 'large' ? <Grid3X3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </Button>

          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      <ScrollArea className="flex-1">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No photos to display</p>
            <p className="text-sm">
              {viewMode === 'favorites' 
                ? 'Mark some photos as favorites to see them here' 
                : 'Upload photos to get started'}
            </p>
          </div>
        ) : (
          <div 
            className={cn(
              "grid gap-2 p-4",
              gridSize === 'large' 
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" 
                : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
            )}
          >
            {filteredPhotos.map(photo => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-md overflow-hidden cursor-pointer bg-muted"
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                
                {/* Favorite indicator */}
                {photo.favorite && (
                  <div className="absolute top-2 right-2">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500 drop-shadow-md" />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate drop-shadow-md">
                    {photo.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Lightbox Dialog - Foreground with highest z-index */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="relative flex flex-col h-[85vh]">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Image container */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Previous button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 text-white hover:bg-white/20 z-10"
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              {/* Main image */}
              {selectedPhoto && (
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {/* Next button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 text-white hover:bg-white/20 z-10"
                onClick={handleNext}
                disabled={currentIndex >= filteredPhotos.length - 1}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>

            {/* Bottom toolbar */}
            {selectedPhoto && (
              <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                <div className="text-white">
                  <p className="font-medium">{selectedPhoto.name}</p>
                  <p className="text-sm text-white/60">
                    {currentIndex + 1} of {filteredPhotos.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => toggleFavorite(selectedPhoto.id)}
                  >
                    <Heart 
                      className={cn(
                        "w-5 h-5",
                        selectedPhoto.favorite && "fill-red-500 text-red-500"
                      )} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => deletePhoto(selectedPhoto.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
