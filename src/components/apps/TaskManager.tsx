import React from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { X, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskManager() {
  const { windows, closeWindow, focusWindow } = useWindows();

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <button className="px-4 py-2 text-sm rounded-t-md bg-primary/10 text-primary">
          Processes
        </button>
        <button className="px-4 py-2 text-sm rounded-t-md hover:bg-secondary">
          Performance
        </button>
        <button className="px-4 py-2 text-sm rounded-t-md hover:bg-secondary">
          Details
        </button>
      </div>

      {/* Process List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-right px-4 py-2 font-medium">CPU</th>
              <th className="text-right px-4 py-2 font-medium">Memory</th>
              <th className="text-center px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {windows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  No running applications
                </td>
              </tr>
            ) : (
              windows.map((win) => (
                <tr 
                  key={win.id} 
                  className="border-b border-border hover:bg-secondary/30 cursor-pointer"
                  onClick={() => focusWindow(win.id)}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{win.title}</span>
                      {win.isMinimized && (
                        <span className="text-xs text-muted-foreground">(Minimized)</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right px-4 py-2 text-muted-foreground">
                    {(Math.random() * 5).toFixed(1)}%
                  </td>
                  <td className="text-right px-4 py-2 text-muted-foreground">
                    {(Math.random() * 100 + 20).toFixed(0)} MB
                  </td>
                  <td className="text-center px-4 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(win.id);
                      }}
                      className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                    >
                      End task
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Summary */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-primary" />
          <span className="text-xs">CPU: {(Math.random() * 30 + 5).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStick size={16} className="text-primary" />
          <span className="text-xs">Memory: {(Math.random() * 40 + 30).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-primary" />
          <span className="text-xs">Disk: {(Math.random() * 20 + 5).toFixed(0)}%</span>
        </div>
        <div className="flex-1 text-right">
          <span className="text-xs text-muted-foreground">{windows.length} processes</span>
        </div>
      </div>
    </div>
  );
}
