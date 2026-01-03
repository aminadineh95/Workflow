import React, { useState, useRef } from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  RotateCcw,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Folder,
  FileText,
  Monitor,
  Music,
  Image,
  Video,
  Download,
  HardDrive,
  Plus,
  Upload,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileItem } from '@/types/windows';

interface FileExplorerProps {
  path?: string;
}

export function FileExplorer({ path = 'this-pc' }: FileExplorerProps) {
  const { files, addFile, getFilesInFolder, openWindow, moveToRecycleBin, renameFile, downloadFile } = useWindows();
  const [currentPath, setCurrentPath] = useState(path);
  const [pathHistory, setPathHistory] = useState<string[]>([path]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickAccess = [
    { id: 'desktop', name: 'Desktop', icon: Monitor },
    { id: 'downloads', name: 'Downloads', icon: Download },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'pictures', name: 'Pictures', icon: Image },
    { id: 'music', name: 'Music', icon: Music },
    { id: 'videos', name: 'Videos', icon: Video },
  ];

  const thisPCItems = [
    { id: 'desktop', name: 'Desktop', icon: Monitor, type: 'folder' as const },
    { id: 'documents', name: 'Documents', icon: FileText, type: 'folder' as const },
    { id: 'downloads', name: 'Downloads', icon: Download, type: 'folder' as const },
    { id: 'pictures', name: 'Pictures', icon: Image, type: 'folder' as const },
    { id: 'music', name: 'Music', icon: Music, type: 'folder' as const },
    { id: 'videos', name: 'Videos', icon: Video, type: 'folder' as const },
    { id: 'c-drive', name: 'Local Disk (C:)', icon: HardDrive, type: 'folder' as const },
  ];

  const folderItems = getFilesInFolder(currentPath);

  const navigateTo = (itemId: string) => {
    const newHistory = [...pathHistory.slice(0, historyIndex + 1), itemId];
    setPathHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(itemId);
    setSelectedItem(null);
    setEditingItem(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(pathHistory[historyIndex - 1]);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(pathHistory[historyIndex + 1]);
      setSelectedItem(null);
    }
  };

  const handleUp = () => {
    if (currentPath !== 'this-pc') {
      navigateTo('this-pc');
    }
  };

  const handleRefresh = () => {
    // Force re-render
    setSelectedItem(null);
  };

  const handleNewFolder = () => {
    const newId = addFile({
      name: 'New Folder',
      type: 'folder',
      parentId: currentPath,
    });
    setEditingItem(newId);
    setSelectedItem(newId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          addFile({
            name: file.name,
            type: 'file',
            parentId: currentPath,
            content: reader.result as string,
            size: file.size,
          });
        };
        // Read as text for text files, as data URL for others
        if (file.type.startsWith('text/') || 
            file.name.match(/\.(txt|md|json|js|ts|css|html|xml|csv)$/i)) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (selectedItem) {
      const file = files.find(f => f.id === selectedItem);
      if (file && file.type === 'file') {
        downloadFile(selectedItem);
      }
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      moveToRecycleBin(selectedItem);
      setSelectedItem(null);
    }
  };

  const handleRename = (id: string, newName: string) => {
    renameFile(id, newName);
    setEditingItem(null);
  };

  const getPathDisplay = () => {
    if (currentPath === 'this-pc') return 'This PC';
    const folder = [...thisPCItems, ...files].find(f => f.id === currentPath);
    return folder?.name || currentPath;
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else {
      // Open text files in Notepad with fileId so it can save
      openWindow({
        title: `${item.name} - Notepad`,
        icon: 'FileText',
        component: 'Notepad',
        x: 150,
        y: 80,
        width: 700,
        height: 500,
        isMinimized: false,
        isMaximized: false,
        props: { fileId: item.id },
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-card">
        <button 
          onClick={handleNewFolder}
          disabled={currentPath === 'this-pc'}
          className="flex items-center gap-2 px-3 py-1.5 text-sm win-hover rounded-md disabled:opacity-50"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New</span>
        </button>
        <div className="h-6 w-px bg-border mx-1" />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={currentPath === 'this-pc'}
          className="flex items-center gap-2 px-3 py-1.5 text-sm win-hover rounded-md disabled:opacity-50"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="h-6 w-px bg-border mx-1" />
        <button 
          onClick={handleDownload}
          disabled={!selectedItem || files.find(f => f.id === selectedItem)?.type !== 'file'}
          className="flex items-center gap-2 px-3 py-1.5 text-sm win-hover rounded-md disabled:opacity-50"
          title="Download to device"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Download</span>
        </button>
        <div className="h-6 w-px bg-border mx-1" />
        <button 
          onClick={handleDelete}
          disabled={!selectedItem}
          className="flex items-center gap-2 px-3 py-1.5 text-sm win-hover rounded-md disabled:opacity-50"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Delete</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-1.5 win-hover rounded-md"
          title={viewMode === 'grid' ? 'List view' : 'Grid view'}
        >
          {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
        </button>
        <button className="p-1.5 win-hover rounded-md">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-card">
        <button 
          onClick={handleBack}
          disabled={historyIndex <= 0}
          className="p-1.5 win-hover rounded-md disabled:opacity-50"
          title="Back"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={handleForward}
          disabled={historyIndex >= pathHistory.length - 1}
          className="p-1.5 win-hover rounded-md disabled:opacity-50"
          title="Forward"
        >
          <ChevronRight size={16} />
        </button>
        <button 
          onClick={handleUp}
          disabled={currentPath === 'this-pc'}
          className="p-1.5 win-hover rounded-md disabled:opacity-50"
          title="Up"
        >
          <ChevronUp size={16} />
        </button>
        <button 
          onClick={handleRefresh}
          className="p-1.5 win-hover rounded-md"
          title="Refresh"
        >
          <RotateCcw size={16} />
        </button>
        
        {/* Address Bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-md mx-2">
          <span className="text-sm">{getPathDisplay()}</span>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-md w-48">
          <Search size={14} className="text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search"
            className="bg-transparent text-sm outline-none flex-1"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-border bg-card/50 overflow-y-auto hidden md:block">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">Quick access</div>
            {quickAccess.map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md win-hover text-left",
                  currentPath === item.id && "bg-primary/10"
                )}
              >
                <item.icon size={16} />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
            
            <div className="h-px bg-border my-2" />
            
            <button
              onClick={() => navigateTo('this-pc')}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md win-hover text-left",
                currentPath === 'this-pc' && "bg-primary/10"
              )}
            >
              <Monitor size={16} />
              <span>This PC</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 p-4 overflow-auto"
          onClick={() => {
            setSelectedItem(null);
            setEditingItem(null);
          }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {currentPath === 'this-pc' ? (
                thisPCItems.map(item => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item.id);
                    }}
                    onDoubleClick={() => navigateTo(item.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-md win-hover",
                      selectedItem === item.id && "bg-primary/10"
                    )}
                  >
                    <item.icon size={40} className="text-primary" />
                    <span className="text-xs text-center truncate w-full">{item.name}</span>
                  </button>
                ))
              ) : (
                <>
                  {folderItems.map((item: FileItem) => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item.id);
                      }}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-md win-hover",
                        selectedItem === item.id && "bg-primary/10"
                      )}
                    >
                      {item.type === 'folder' ? (
                        <Folder size={40} className="text-primary" />
                      ) : (
                        <FileText size={40} className="text-muted-foreground" />
                      )}
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          defaultValue={item.name}
                          autoFocus
                          className="text-xs text-center bg-card px-1 rounded outline-none ring-1 ring-primary w-full"
                          onBlur={(e) => handleRename(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(item.id, (e.target as HTMLInputElement).value);
                            } else if (e.key === 'Escape') {
                              setEditingItem(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-xs text-center truncate w-full">{item.name}</span>
                      )}
                    </button>
                  ))}
                  {folderItems.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      This folder is empty
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {currentPath === 'this-pc' ? (
                thisPCItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item.id);
                    }}
                    onDoubleClick={() => navigateTo(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left",
                      selectedItem === item.id && "bg-primary/10"
                    )}
                  >
                    <item.icon size={20} className="text-primary" />
                    <span className="flex-1 text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">File folder</span>
                  </button>
                ))
              ) : (
                folderItems.map((item: FileItem) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item.id);
                    }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md win-hover text-left",
                      selectedItem === item.id && "bg-primary/10"
                    )}
                  >
                    {item.type === 'folder' ? (
                      <Folder size={20} className="text-primary" />
                    ) : (
                      <FileText size={20} className="text-muted-foreground" />
                    )}
                    <span className="flex-1 text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.type === 'folder' ? 'File folder' : 'File'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-card text-xs text-muted-foreground">
        <span>
          {currentPath === 'this-pc' 
            ? `${thisPCItems.length} items` 
            : `${folderItems.length} items`}
        </span>
        {selectedItem && <span>1 item selected</span>}
      </div>
    </div>
  );
}
