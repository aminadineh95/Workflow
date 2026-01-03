import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  FolderOpen, 
  Scissors, 
  Copy, 
  Clipboard,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  FilePlus,
} from 'lucide-react';
import { useWindows } from '@/contexts/WindowContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NotepadProps {
  content?: string;
  fileId?: string;
  windowId?: string;
}

export function Notepad({ content: initialContent = '', fileId, windowId }: NotepadProps) {
  const { files, addFile, updateFileContent, getFileById, getFilesInFolder, registerCloseHandler, unregisterCloseHandler, closeWindow } = useWindows();
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState('Untitled');
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('documents');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasUnsavedChangesRef = React.useRef(hasUnsavedChanges);

  // Keep ref in sync with state
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Register close handler to intercept close attempts
  useEffect(() => {
    if (windowId) {
      registerCloseHandler(windowId, () => {
        if (hasUnsavedChangesRef.current) {
          setIsCloseDialogOpen(true);
          return false; // Prevent close
        }
        return true; // Allow close
      });

      return () => {
        unregisterCloseHandler(windowId);
      };
    }
  }, [windowId, registerCloseHandler, unregisterCloseHandler]);

  const handleDiscardAndClose = () => {
    setIsCloseDialogOpen(false);
    if (windowId) {
      closeWindow(windowId);
    }
  };

  const handleSaveAndClose = () => {
    if (currentFileId) {
      updateFileContent(currentFileId, content);
      setIsCloseDialogOpen(false);
      if (windowId) {
        closeWindow(windowId);
      }
    } else {
      setIsCloseDialogOpen(false);
      setNewFileName(fileName === 'Untitled' ? '' : fileName);
      setIsSaveDialogOpen(true);
    }
  };

  // Load file content if fileId is provided
  useEffect(() => {
    if (fileId) {
      const file = getFileById(fileId);
      if (file) {
        setContent(file.content || '');
        setFileName(file.name);
        setCurrentFileId(fileId);
        setHasUnsavedChanges(false);
      }
    }
  }, [fileId, getFileById]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if this component's textarea or the dialogs are focused
      const activeElement = document.activeElement;
      const isInNotepad = activeElement?.closest('[data-notepad]') || 
                          isSaveDialogOpen || 
                          isOpenDialogOpen;
      
      if (!isInNotepad) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+S = Save As
              setNewFileName(fileName === 'Untitled' ? '' : fileName);
              setIsSaveDialogOpen(true);
            } else {
              // Ctrl+S = Save
              if (currentFileId) {
                updateFileContent(currentFileId, content);
                setHasUnsavedChanges(false);
              } else {
                setNewFileName(fileName === 'Untitled' ? '' : fileName);
                setIsSaveDialogOpen(true);
              }
            }
            break;
          case 'o':
            e.preventDefault();
            setIsOpenDialogOpen(true);
            break;
          case 'n':
            e.preventDefault();
            setContent('');
            setFileName('Untitled');
            setCurrentFileId(null);
            setHasUnsavedChanges(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFileId, content, fileName, isSaveDialogOpen, isOpenDialogOpen, updateFileContent]);

  const lineCount = content.split('\n').length;
  const charCount = content.length;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleNew = () => {
    setContent('');
    setFileName('Untitled');
    setCurrentFileId(null);
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    if (currentFileId) {
      // Update existing file
      updateFileContent(currentFileId, content);
      setHasUnsavedChanges(false);
    } else {
      // Open save dialog for new file
      setNewFileName(fileName === 'Untitled' ? '' : fileName);
      setIsSaveDialogOpen(true);
    }
  };

  const handleSaveAs = () => {
    setNewFileName(fileName === 'Untitled' ? '' : fileName);
    setIsSaveDialogOpen(true);
  };

  const confirmSave = () => {
    if (!newFileName.trim()) return;
    
    const finalName = newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`;
    const newFileId = addFile({
      name: finalName,
      type: 'file',
      parentId: selectedFolder,
      content: content,
    });
    setCurrentFileId(newFileId);
    setFileName(finalName);
    setHasUnsavedChanges(false);
    setIsSaveDialogOpen(false);
    setNewFileName('');
  };

  const handleOpen = () => {
    setIsOpenDialogOpen(true);
  };

  const openFile = (id: string) => {
    const file = getFileById(id);
    if (file && file.type === 'file') {
      setContent(file.content || '');
      setFileName(file.name);
      setCurrentFileId(id);
      setHasUnsavedChanges(false);
      setIsOpenDialogOpen(false);
    }
  };

  const handleExportToDevice = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromDevice = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.css,.html,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setContent(reader.result as string);
          setFileName(file.name.replace(/\.[^/.]+$/, ''));
          setCurrentFileId(null);
          setHasUnsavedChanges(true);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 8));
  };

  // Get all text files for the open dialog
  const textFiles = files.filter(f => f.type === 'file' && (f.name.endsWith('.txt') || f.content !== undefined));
  const folders = files.filter(f => f.type === 'folder' && ['documents', 'desktop', 'downloads'].includes(f.id));

  return (
    <div className="flex flex-col h-full bg-card" data-notepad>
      {/* Menu Bar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border text-sm">
        <div className="relative group">
          <button className="px-3 py-1 rounded-sm hover:bg-secondary">File</button>
          <div className="absolute left-0 top-full hidden group-hover:block bg-card border border-border rounded-md shadow-lg py-1 min-w-[180px] z-50">
            <button onClick={handleNew} className="w-full px-4 py-1.5 text-left hover:bg-secondary flex justify-between">
              <span>New</span>
              <span className="text-muted-foreground text-xs">Ctrl+N</span>
            </button>
            <button onClick={handleOpen} className="w-full px-4 py-1.5 text-left hover:bg-secondary flex justify-between">
              <span>Open from OS...</span>
              <span className="text-muted-foreground text-xs">Ctrl+O</span>
            </button>
            <button onClick={handleImportFromDevice} className="w-full px-4 py-1.5 text-left hover:bg-secondary">Import from Device...</button>
            <div className="h-px bg-border my-1" />
            <button onClick={handleSave} className="w-full px-4 py-1.5 text-left hover:bg-secondary flex justify-between">
              <span>Save to OS {hasUnsavedChanges && '•'}</span>
              <span className="text-muted-foreground text-xs">Ctrl+S</span>
            </button>
            <button onClick={handleSaveAs} className="w-full px-4 py-1.5 text-left hover:bg-secondary flex justify-between">
              <span>Save As...</span>
              <span className="text-muted-foreground text-xs">Ctrl+Shift+S</span>
            </button>
            <button onClick={handleExportToDevice} className="w-full px-4 py-1.5 text-left hover:bg-secondary">Export to Device</button>
            <div className="h-px bg-border my-1" />
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Exit</button>
          </div>
        </div>
        <div className="relative group">
          <button className="px-3 py-1 rounded-sm hover:bg-secondary">Edit</button>
          <div className="absolute left-0 top-full hidden group-hover:block bg-card border border-border rounded-md shadow-lg py-1 min-w-[160px] z-50">
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Undo</button>
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Cut</button>
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Copy</button>
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Paste</button>
            <button className="w-full px-4 py-1.5 text-left hover:bg-secondary">Select All</button>
          </div>
        </div>
        <div className="relative group">
          <button className="px-3 py-1 rounded-sm hover:bg-secondary">View</button>
          <div className="absolute left-0 top-full hidden group-hover:block bg-card border border-border rounded-md shadow-lg py-1 min-w-[160px] z-50">
            <button onClick={handleZoomIn} className="w-full px-4 py-1.5 text-left hover:bg-secondary">Zoom In</button>
            <button onClick={handleZoomOut} className="w-full px-4 py-1.5 text-left hover:bg-secondary">Zoom Out</button>
            <div className="h-px bg-border my-1" />
            <button 
              onClick={() => setWordWrap(!wordWrap)} 
              className="w-full px-4 py-1.5 text-left hover:bg-secondary flex items-center justify-between"
            >
              Word Wrap
              {wordWrap && <span>✓</span>}
            </button>
            <button 
              onClick={() => setShowStatusBar(!showStatusBar)} 
              className="w-full px-4 py-1.5 text-left hover:bg-secondary flex items-center justify-between"
            >
              Status Bar
              {showStatusBar && <span>✓</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <button onClick={handleNew} className="p-1.5 rounded-md hover:bg-secondary" title="New">
          <FilePlus size={16} />
        </button>
        <button onClick={handleOpen} className="p-1.5 rounded-md hover:bg-secondary" title="Open">
          <FolderOpen size={16} />
        </button>
        <button onClick={handleSave} className="p-1.5 rounded-md hover:bg-secondary" title="Save">
          <Save size={16} />
        </button>
        <div className="h-5 w-px bg-border mx-1" />
        <button className="p-1.5 rounded-md hover:bg-secondary" title="Cut">
          <Scissors size={16} />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary" title="Copy">
          <Copy size={16} />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary" title="Paste">
          <Clipboard size={16} />
        </button>
        <div className="h-5 w-px bg-border mx-1" />
        <button className="p-1.5 rounded-md hover:bg-secondary" title="Undo">
          <Undo2 size={16} />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary" title="Redo">
          <Redo2 size={16} />
        </button>
        <div className="h-5 w-px bg-border mx-1" />
        <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-secondary" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-secondary" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-muted-foreground ml-2">{fontSize}px</span>
        <div className="ml-auto text-xs text-muted-foreground">
          {fileName}{hasUnsavedChanges ? ' •' : ''}
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
        className="flex-1 p-4 resize-none outline-none bg-card font-mono"
        style={{ 
          fontSize: `${fontSize}px`,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
        }}
        spellCheck={false}
      />

      {/* Status Bar */}
      {showStatusBar && (
        <div className="flex items-center justify-between px-4 py-1 border-t border-border text-xs text-muted-foreground">
          <span>Ln 1, Col 1</span>
          <div className="flex items-center gap-4">
            <span>{charCount} characters</span>
            <span>{lineCount} lines</span>
            <span>UTF-8</span>
          </div>
        </div>
      )}

      {/* Save Dialog - Foreground with highest z-index */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent 
          className="sm:max-w-md z-[10000]" 
          style={{ zIndex: 10000 }}
          onOpenAutoFocus={(e) => {
            // Ensure dialog gets focus immediately
            e.preventDefault();
            const input = document.querySelector('[data-save-filename-input]') as HTMLInputElement;
            if (input) {
              setTimeout(() => input.focus(), 0);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Save File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">File name</label>
              <Input
                data-save-filename-input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="my-document.txt"
                className="mt-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFileName.trim()) {
                    confirmSave();
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Save to folder</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmSave} disabled={!newFileName.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Dialog - Foreground with highest z-index */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent 
          className="sm:max-w-md z-[10000]" 
          style={{ zIndex: 10000 }}
        >
          <DialogHeader>
            <DialogTitle>Open File</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {textFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No saved files yet</p>
            ) : (
              textFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => openFile(file.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary text-left"
                >
                  <FileText size={20} className="text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(file.dateModified).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent 
          className="sm:max-w-md z-[10000]" 
          style={{ zIndex: 10000 }}
        >
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Do you want to save changes to "{fileName}"?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your changes will be lost if you don't save them.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscardAndClose}>
              Don't Save
            </Button>
            <Button onClick={handleSaveAndClose}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
