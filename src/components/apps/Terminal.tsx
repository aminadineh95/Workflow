import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalProps {
  windowId: string;
}

interface OutputLine {
  id: number;
  content: string;
  type: 'input' | 'output' | 'error';
}

interface FileSystemNode {
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
}

const initialFileSystem: Record<string, FileSystemNode> = {
  home: {
    type: 'directory',
    children: {
      user: {
        type: 'directory',
        children: {
          Documents: {
            type: 'directory',
            children: {
              'readme.txt': { type: 'file', content: 'Welcome to LovableOS!' },
              'notes.txt': { type: 'file', content: 'Remember to explore all the apps.' },
            },
          },
          Downloads: { type: 'directory', children: {} },
          Pictures: { type: 'directory', children: {} },
          Desktop: { type: 'directory', children: {} },
        },
      },
    },
  },
  etc: {
    type: 'directory',
    children: {
      'hostname': { type: 'file', content: 'lovable-os' },
    },
  },
  tmp: { type: 'directory', children: {} },
};

export function Terminal({ windowId }: TerminalProps) {
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 0, content: 'LovableOS Terminal v1.0.0', type: 'output' },
    { id: 1, content: 'Type "help" for available commands.', type: 'output' },
    { id: 2, content: '', type: 'output' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemNode>>(initialFileSystem);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(3);

  const getPrompt = () => `user@lovable:${currentPath}$`;

  const resolvePath = useCallback((path: string): string => {
    if (path.startsWith('/')) {
      return path;
    }
    
    const parts = currentPath.split('/').filter(Boolean);
    const newParts = path.split('/');
    
    for (const part of newParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.' && part !== '') {
        parts.push(part);
      }
    }
    
    return '/' + parts.join('/');
  }, [currentPath]);

  const getNodeAtPath = useCallback((path: string): FileSystemNode | null => {
    const parts = path.split('/').filter(Boolean);
    let current: FileSystemNode | Record<string, FileSystemNode> = fileSystem;
    
    for (const part of parts) {
      if (typeof current === 'object' && 'type' in current) {
        if (current.type !== 'directory' || !current.children) {
          return null;
        }
        current = current.children;
      }
      
      if (!(part in current)) {
        return null;
      }
      current = (current as Record<string, FileSystemNode>)[part];
    }
    
    return current as FileSystemNode;
  }, [fileSystem]);

  const addOutput = useCallback((content: string, type: 'input' | 'output' | 'error' = 'output') => {
    const newLine: OutputLine = { id: lineIdRef.current++, content, type };
    setOutput(prev => [...prev, newLine]);
  }, []);

  const getParentAndName = useCallback((path: string): { parentPath: string; name: string } => {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop() || '';
    return { parentPath: '/' + parts.join('/'), name };
  }, []);

  const setNodeAtPath = useCallback((path: string, node: FileSystemNode | null) => {
    const { parentPath, name } = getParentAndName(path);
    
    setFileSystem(prev => {
      const newFs = JSON.parse(JSON.stringify(prev));
      const parts = parentPath.split('/').filter(Boolean);
      let current: any = newFs;
      
      for (const part of parts) {
        if (!current[part]) return prev;
        if (current[part].type === 'directory') {
          current = current[part].children;
        } else {
          current = current[part];
        }
      }
      
      if (node === null) {
        delete current[name];
      } else {
        current[name] = node;
      }
      
      return newFs;
    });
  }, [getParentAndName]);

  const commands: Record<string, (args: string[]) => void> = {
    help: () => {
      addOutput('Available commands:');
      addOutput('  help           - Show this help message');
      addOutput('  clear          - Clear the terminal');
      addOutput('  echo [text]    - Print text to the terminal');
      addOutput('  date           - Show current date and time');
      addOutput('  whoami         - Show current user');
      addOutput('  hostname       - Show system hostname');
      addOutput('  pwd            - Print working directory');
      addOutput('  ls [path]      - List directory contents');
      addOutput('  cd [path]      - Change directory');
      addOutput('  cat [file]     - Display file contents');
      addOutput('  mkdir [name]   - Create a directory');
      addOutput('  touch [name]   - Create an empty file');
      addOutput('  rm [-r] [path] - Remove file or directory');
      addOutput('  cp [src] [dst] - Copy file or directory');
      addOutput('  mv [src] [dst] - Move/rename file or directory');
      addOutput('  uname [-a]     - Show system information');
      addOutput('  history        - Show command history');
      addOutput('  neofetch       - Display system info');
      addOutput('  uptime         - Show system uptime');
      addOutput('  df             - Show disk space');
      addOutput('  free           - Show memory usage');
      addOutput('  ps             - List processes');
      addOutput('  kill [pid]     - Kill a process');
      addOutput('  grep [pattern] [file] - Search for pattern');
      addOutput('  head [file]    - Show first lines of file');
      addOutput('  tail [file]    - Show last lines of file');
      addOutput('  wc [file]      - Count lines/words/chars');
      addOutput('  find [path]    - Find files');
      addOutput('  env            - Show environment variables');
      addOutput('  export [var]   - Set environment variable');
      addOutput('  alias          - Show command aliases');
      addOutput('  tree [path]    - Show directory tree');
      addOutput('  man [cmd]      - Show command manual');
    },
    clear: () => {
      setOutput([]);
    },
    echo: (args) => {
      addOutput(args.join(' '));
    },
    date: () => {
      addOutput(new Date().toString());
    },
    whoami: () => {
      addOutput('user');
    },
    hostname: () => {
      addOutput('lovable-os');
    },
    pwd: () => {
      addOutput(currentPath);
    },
    ls: (args) => {
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const targetArg = args.filter(a => !a.startsWith('-'))[0];
      const targetPath = targetArg ? resolvePath(targetArg) : currentPath;
      const node = getNodeAtPath(targetPath);
      
      if (!node) {
        addOutput(`ls: cannot access '${targetArg || targetPath}': No such file or directory`, 'error');
        return;
      }
      
      if (node.type !== 'directory') {
        addOutput(targetArg || targetPath.split('/').pop() || '');
        return;
      }
      
      let entries = Object.entries(node.children || {});
      if (showAll) {
        entries = [['..', { type: 'directory' as const, children: {} }], ...entries];
      }
      
      if (entries.length === 0) {
        return;
      }
      
      if (showLong) {
        entries.forEach(([name, child]) => {
          const type = child.type === 'directory' ? 'd' : '-';
          const perms = 'rwxr-xr-x';
          const size = child.content?.length || 4096;
          const date = 'Jan  1 00:00';
          addOutput(`${type}${perms} 1 user user ${String(size).padStart(6)} ${date} ${name}${child.type === 'directory' ? '/' : ''}`);
        });
      } else {
        const formatted = entries.map(([name, child]) => 
          child.type === 'directory' ? `${name}/` : name
        ).join('  ');
        addOutput(formatted);
      }
    },
    cd: (args) => {
      if (!args[0] || args[0] === '~') {
        setCurrentPath('/home/user');
        return;
      }
      
      const newPath = resolvePath(args[0]);
      const node = getNodeAtPath(newPath);
      
      if (!node) {
        addOutput(`cd: ${args[0]}: No such file or directory`, 'error');
        return;
      }
      
      if (node.type !== 'directory') {
        addOutput(`cd: ${args[0]}: Not a directory`, 'error');
        return;
      }
      
      setCurrentPath(newPath || '/');
    },
    cat: (args) => {
      if (!args[0]) {
        addOutput('cat: missing file operand', 'error');
        return;
      }
      
      const filePath = resolvePath(args[0]);
      const node = getNodeAtPath(filePath);
      
      if (!node) {
        addOutput(`cat: ${args[0]}: No such file or directory`, 'error');
        return;
      }
      
      if (node.type === 'directory') {
        addOutput(`cat: ${args[0]}: Is a directory`, 'error');
        return;
      }
      
      addOutput(node.content || '');
    },
    uname: (args) => {
      if (args.includes('-a')) {
        addOutput('LovableOS 1.0.0 lovable-os x86_64 JavaScript/TypeScript');
      } else {
        addOutput('LovableOS');
      }
    },
    history: () => {
      commandHistory.forEach((cmd, i) => {
        addOutput(`  ${i + 1}  ${cmd}`);
      });
    },
    neofetch: () => {
      addOutput('');
      addOutput('       ╭───────────────╮      user@lovable-os');
      addOutput('       │   LOVABLE     │      ─────────────────');
      addOutput('       │      OS       │      OS: LovableOS 1.0.0');
      addOutput('       ╰───────────────╯      Host: Lovable Browser');
      addOutput('                              Kernel: React 18.3.1');
      addOutput('            ♥                 Uptime: Just started');
      addOutput('                              Shell: lovable-term');
      addOutput('                              Terminal: Terminal v1.0');
      addOutput('                              CPU: JavaScript Engine');
      addOutput('                              Memory: Unlimited*');
      addOutput('');
    },
    uptime: () => {
      const now = new Date();
      addOutput(` ${now.toLocaleTimeString()} up 0 days, 0:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}, 1 user, load average: 0.00, 0.01, 0.05`);
    },
    df: () => {
      addOutput('Filesystem     1K-blocks    Used Available Use% Mounted on');
      addOutput('/dev/root       51200000 2048000  49152000   4% /');
      addOutput('tmpfs            8192000       0   8192000   0% /tmp');
      addOutput('/dev/home       25600000  512000  25088000   2% /home');
    },
    free: () => {
      addOutput('              total        used        free      shared  buff/cache   available');
      addOutput('Mem:        8192000     1024000     5120000       64000     2048000     6912000');
      addOutput('Swap:       2048000           0     2048000');
    },
    ps: () => {
      addOutput('  PID TTY          TIME CMD');
      addOutput('    1 ?        00:00:01 init');
      addOutput('   42 pts/0    00:00:00 bash');
      addOutput('  100 pts/0    00:00:00 node');
      addOutput('  101 pts/0    00:00:00 vite');
      addOutput(`  ${Math.floor(Math.random() * 1000) + 200} pts/0    00:00:00 ps`);
    },
    kill: (args) => {
      if (!args[0]) {
        addOutput('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]', 'error');
        return;
      }
      addOutput(`-bash: kill: (${args[0]}) - Operation not permitted`);
    },
    grep: (args) => {
      if (args.length < 2) {
        addOutput('grep: missing pattern or file', 'error');
        return;
      }
      const pattern = args[0];
      const filePath = resolvePath(args[1]);
      const node = getNodeAtPath(filePath);
      
      if (!node) {
        addOutput(`grep: ${args[1]}: No such file or directory`, 'error');
        return;
      }
      
      if (node.type === 'directory') {
        addOutput(`grep: ${args[1]}: Is a directory`, 'error');
        return;
      }
      
      const lines = (node.content || '').split('\n');
      lines.forEach(line => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          addOutput(line);
        }
      });
    },
    head: (args) => {
      if (!args[0]) {
        addOutput('head: missing file operand', 'error');
        return;
      }
      const filePath = resolvePath(args[0]);
      const node = getNodeAtPath(filePath);
      
      if (!node || node.type === 'directory') {
        addOutput(`head: cannot open '${args[0]}' for reading`, 'error');
        return;
      }
      
      const lines = (node.content || '').split('\n').slice(0, 10);
      lines.forEach(line => addOutput(line));
    },
    tail: (args) => {
      if (!args[0]) {
        addOutput('tail: missing file operand', 'error');
        return;
      }
      const filePath = resolvePath(args[0]);
      const node = getNodeAtPath(filePath);
      
      if (!node || node.type === 'directory') {
        addOutput(`tail: cannot open '${args[0]}' for reading`, 'error');
        return;
      }
      
      const lines = (node.content || '').split('\n').slice(-10);
      lines.forEach(line => addOutput(line));
    },
    wc: (args) => {
      if (!args[0]) {
        addOutput('wc: missing file operand', 'error');
        return;
      }
      const filePath = resolvePath(args[0]);
      const node = getNodeAtPath(filePath);
      
      if (!node || node.type === 'directory') {
        addOutput(`wc: ${args[0]}: Is a directory`, 'error');
        return;
      }
      
      const content = node.content || '';
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const chars = content.length;
      addOutput(`  ${lines}   ${words}  ${chars} ${args[0]}`);
    },
    find: (args) => {
      const searchPath = args[0] ? resolvePath(args[0]) : currentPath;
      const node = getNodeAtPath(searchPath);
      
      if (!node || node.type !== 'directory') {
        addOutput(`find: '${args[0] || searchPath}': No such file or directory`, 'error');
        return;
      }
      
      const listRecursive = (path: string, n: FileSystemNode, depth: number = 0) => {
        addOutput(path);
        if (n.type === 'directory' && n.children && depth < 3) {
          Object.entries(n.children).forEach(([name, child]) => {
            listRecursive(`${path}/${name}`, child, depth + 1);
          });
        }
      };
      
      listRecursive(searchPath, node);
    },
    env: () => {
      addOutput('USER=user');
      addOutput('HOME=/home/user');
      addOutput('SHELL=/bin/bash');
      addOutput('PATH=/usr/local/bin:/usr/bin:/bin');
      addOutput('TERM=xterm-256color');
      addOutput('LANG=en_US.UTF-8');
      addOutput('NODE_ENV=development');
    },
    export: (args) => {
      if (!args[0]) {
        addOutput('export: usage: export VAR=value', 'error');
        return;
      }
      addOutput(`export: ${args.join(' ')}`);
    },
    alias: () => {
      addOutput("alias ll='ls -la'");
      addOutput("alias la='ls -a'");
      addOutput("alias ..='cd ..'");
      addOutput("alias cls='clear'");
    },
    tree: (args) => {
      const targetPath = args[0] ? resolvePath(args[0]) : currentPath;
      const node = getNodeAtPath(targetPath);
      
      if (!node || node.type !== 'directory') {
        addOutput(`tree: '${args[0] || targetPath}': Not a directory`, 'error');
        return;
      }
      
      addOutput(targetPath);
      let dirs = 0, files = 0;
      
      const printTree = (n: FileSystemNode, prefix: string = '') => {
        if (n.type !== 'directory' || !n.children) return;
        
        const entries = Object.entries(n.children);
        entries.forEach(([name, child], i) => {
          const isLast = i === entries.length - 1;
          const connector = isLast ? '└── ' : '├── ';
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          
          if (child.type === 'directory') {
            addOutput(`${prefix}${connector}${name}/`);
            dirs++;
            printTree(child, newPrefix);
          } else {
            addOutput(`${prefix}${connector}${name}`);
            files++;
          }
        });
      };
      
      printTree(node);
      addOutput('');
      addOutput(`${dirs} directories, ${files} files`);
    },
    man: (args) => {
      if (!args[0]) {
        addOutput('What manual page do you want?', 'error');
        return;
      }
      
      const manPages: Record<string, string[]> = {
        ls: ['LS(1)', '', 'NAME', '       ls - list directory contents', '', 'SYNOPSIS', '       ls [OPTION]... [FILE]...', '', 'DESCRIPTION', '       List information about the FILEs.', '       -a  do not ignore entries starting with .', '       -l  use a long listing format'],
        cd: ['CD(1)', '', 'NAME', '       cd - change directory', '', 'SYNOPSIS', '       cd [dir]', '', 'DESCRIPTION', '       Change the current directory to dir.'],
        cat: ['CAT(1)', '', 'NAME', '       cat - concatenate files and print on standard output', '', 'SYNOPSIS', '       cat [FILE]...', '', 'DESCRIPTION', '       Concatenate FILE(s) to standard output.'],
      };
      
      const page = manPages[args[0].toLowerCase()];
      if (page) {
        page.forEach(line => addOutput(line));
      } else {
        addOutput(`No manual entry for ${args[0]}`);
      }
    },
    mkdir: (args) => {
      if (!args[0]) {
        addOutput('mkdir: missing operand', 'error');
        return;
      }
      const targetPath = resolvePath(args[0]);
      const existingNode = getNodeAtPath(targetPath);
      if (existingNode) {
        addOutput(`mkdir: cannot create directory '${args[0]}': File exists`, 'error');
        return;
      }
      const { parentPath } = getParentAndName(targetPath);
      const parentNode = getNodeAtPath(parentPath);
      if (!parentNode || parentNode.type !== 'directory') {
        addOutput(`mkdir: cannot create directory '${args[0]}': No such file or directory`, 'error');
        return;
      }
      setNodeAtPath(targetPath, { type: 'directory', children: {} });
    },
    touch: (args) => {
      if (!args[0]) {
        addOutput('touch: missing file operand', 'error');
        return;
      }
      const targetPath = resolvePath(args[0]);
      const existingNode = getNodeAtPath(targetPath);
      if (existingNode) {
        return; // touch just updates timestamp on existing files
      }
      const { parentPath } = getParentAndName(targetPath);
      const parentNode = getNodeAtPath(parentPath);
      if (!parentNode || parentNode.type !== 'directory') {
        addOutput(`touch: cannot touch '${args[0]}': No such file or directory`, 'error');
        return;
      }
      setNodeAtPath(targetPath, { type: 'file', content: '' });
    },
    rm: (args) => {
      const recursive = args.includes('-r') || args.includes('-rf');
      const targetArg = args.filter(a => !a.startsWith('-'))[0];
      if (!targetArg) {
        addOutput('rm: missing operand', 'error');
        return;
      }
      const targetPath = resolvePath(targetArg);
      const node = getNodeAtPath(targetPath);
      if (!node) {
        addOutput(`rm: cannot remove '${targetArg}': No such file or directory`, 'error');
        return;
      }
      if (node.type === 'directory' && !recursive) {
        addOutput(`rm: cannot remove '${targetArg}': Is a directory`, 'error');
        return;
      }
      setNodeAtPath(targetPath, null);
    },
    cp: (args) => {
      if (args.length < 2) {
        addOutput('cp: missing destination file operand', 'error');
        return;
      }
      const srcPath = resolvePath(args[0]);
      const dstPath = resolvePath(args[1]);
      const srcNode = getNodeAtPath(srcPath);
      if (!srcNode) {
        addOutput(`cp: cannot stat '${args[0]}': No such file or directory`, 'error');
        return;
      }
      const { parentPath: dstParent } = getParentAndName(dstPath);
      const dstParentNode = getNodeAtPath(dstParent);
      if (!dstParentNode || dstParentNode.type !== 'directory') {
        addOutput(`cp: cannot create '${args[1]}': No such file or directory`, 'error');
        return;
      }
      setNodeAtPath(dstPath, JSON.parse(JSON.stringify(srcNode)));
    },
    mv: (args) => {
      if (args.length < 2) {
        addOutput('mv: missing destination file operand', 'error');
        return;
      }
      const srcPath = resolvePath(args[0]);
      const dstPath = resolvePath(args[1]);
      const srcNode = getNodeAtPath(srcPath);
      if (!srcNode) {
        addOutput(`mv: cannot stat '${args[0]}': No such file or directory`, 'error');
        return;
      }
      const { parentPath: dstParent } = getParentAndName(dstPath);
      const dstParentNode = getNodeAtPath(dstParent);
      if (!dstParentNode || dstParentNode.type !== 'directory') {
        addOutput(`mv: cannot move '${args[1]}': No such file or directory`, 'error');
        return;
      }
      setNodeAtPath(dstPath, JSON.parse(JSON.stringify(srcNode)));
      setNodeAtPath(srcPath, null);
    },
  };

  const executeCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    addOutput(`${getPrompt()} ${trimmed}`, 'input');
    
    if (!trimmed) return;
    
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    
    const [command, ...args] = trimmed.split(/\s+/);
    const cmd = commands[command.toLowerCase()];
    
    if (cmd) {
      cmd(args);
    } else {
      addOutput(`${command}: command not found. Type "help" for available commands.`, 'error');
    }
  }, [addOutput, commands, currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion for commands
      const partial = currentInput.toLowerCase();
      const matches = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
      if (matches.length === 1) {
        setCurrentInput(matches[0] + ' ');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="h-full bg-[#0c0c0c] text-[#cccccc] font-mono text-sm flex flex-col cursor-text"
      onClick={handleContainerClick}
    >
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="min-h-full">
          {output.map((line) => (
            <div 
              key={line.id} 
              className={`whitespace-pre-wrap break-all ${
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'input' ? 'text-green-400' : ''
              }`}
            >
              {line.content}
            </div>
          ))}
          <div className="flex">
            <span className="text-green-400 shrink-0">{getPrompt()}&nbsp;</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none border-none text-[#cccccc] caret-white"
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
