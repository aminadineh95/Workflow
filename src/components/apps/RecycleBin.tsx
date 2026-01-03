import React, { useState } from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { Trash2, RotateCcw, FileText, Folder, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecycleBin() {
  const { recycledFiles, restoreFromRecycleBin, emptyRecycleBin } = useWindows();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleRestore = () => {
    if (selectedItem) {
      restoreFromRecycleBin(selectedItem);
      setSelectedItem(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <button
          onClick={handleRestore}
          disabled={!selectedItem}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md win-hover disabled:opacity-50"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Restore</span>
        </button>
        <button
          onClick={emptyRecycleBin}
          disabled={recycledFiles.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md win-hover disabled:opacity-50"
        >
          <Trash size={16} />
          <span className="hidden sm:inline">Empty Recycle Bin</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {recycledFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Trash2 size={64} className="mb-4 opacity-50" />
            <p>Recycle Bin is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {recycledFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedItem(file.id)}
                onDoubleClick={handleRestore}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-md win-hover",
                  selectedItem === file.id && "bg-primary/10"
                )}
              >
                {file.type === 'folder' ? (
                  <Folder size={40} className="text-primary opacity-50" />
                ) : (
                  <FileText size={40} className="text-muted-foreground opacity-50" />
                )}
                <span className="text-xs text-center truncate w-full">{file.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-border bg-card text-xs text-muted-foreground">
        <span>{recycledFiles.length} items</span>
        {selectedItem && <span>1 item selected</span>}
      </div>
    </div>
  );
}
