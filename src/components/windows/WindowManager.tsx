import React from 'react';
import { useWindows } from '@/contexts/WindowContext';
import { Window } from './Window';
import { FileExplorer } from '@/components/apps/FileExplorer';
import { Calculator } from '@/components/apps/Calculator';
import { Notepad } from '@/components/apps/Notepad';
import { Browser } from '@/components/apps/Browser';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { RecycleBin } from '@/components/apps/RecycleBin';
import { TaskManager } from '@/components/apps/TaskManager';
import { Photos } from '@/components/apps/Photos';
import { Terminal } from '@/components/apps/Terminal';
import { MusicPlayer } from '@/components/apps/MusicPlayer';
import { VideoPlayer } from '@/components/apps/VideoPlayer';
import { CalendarApp } from '@/components/apps/CalendarApp';
import { TasksApp } from '@/components/apps/TasksApp';
import { EmailApp } from '@/components/apps/EmailApp';

const componentMap: Record<string, React.ComponentType<any>> = {
  FileExplorer,
  Calculator,
  Notepad,
  Browser,
  SettingsApp,
  RecycleBin,
  TaskManager,
  Photos,
  Terminal,
  MusicPlayer,
  VideoPlayer,
  CalendarApp,
  TasksApp,
  EmailApp,
};

export function WindowManager() {
  const { windows } = useWindows();

  return (
    <>
      {windows.map((win) => {
        const Component = componentMap[win.component];
        if (!Component) return null;

        return (
          <Window key={win.id} window={win}>
            <Component {...(win.props || {})} windowId={win.id} />
          </Window>
        );
      })}
    </>
  );
}
