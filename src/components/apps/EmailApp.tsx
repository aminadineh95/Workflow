import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Star, 
  Trash2, 
  Edit, 
  Search,
  Paperclip,
  MoreHorizontal,
  Mail,
  Archive,
  RefreshCw,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive';
}

const STORAGE_KEY = 'workflow-os-emails';

const defaultEmails: Email[] = [
  {
    id: '1',
    from: 'welcome@workflow-os.com',
    to: 'user@example.com',
    subject: 'Welcome to Workflow OS Email!',
    body: 'Thank you for using Workflow OS Email client. This is a demonstration of the email functionality.\n\nYou can:\n- Compose new emails\n- Read and reply to messages\n- Star important emails\n- Organize with folders\n\nNote: To send real emails, connect an email service like EmailJS.\n\nBest regards,\nWorkflow OS Team',
    date: new Date().toISOString(),
    read: false,
    starred: true,
    folder: 'inbox',
  },
  {
    id: '2',
    from: 'notifications@workflow-os.com',
    to: 'user@example.com',
    subject: 'Your Daily Summary',
    body: 'Here is your daily productivity summary:\n\n- Tasks completed: 5\n- Calendar events: 3\n- Files created: 2\n\nKeep up the great work!',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
  },
];

export function EmailApp() {
  const [emails, setEmails] = useState<Email[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultEmails;
    } catch {
      return defaultEmails;
    }
  });
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [isSending, setIsSending] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  }, [emails]);

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: emails.filter(e => e.folder === 'inbox' && !e.read).length },
    { id: 'starred', name: 'Starred', icon: Star, count: emails.filter(e => e.starred).length },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'drafts', name: 'Drafts', icon: Edit, count: emails.filter(e => e.folder === 'drafts').length },
    { id: 'archive', name: 'Archive', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: emails.filter(e => e.folder === 'trash').length },
  ];

  const filteredEmails = emails.filter(email => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!email.subject.toLowerCase().includes(query) && 
          !email.from.toLowerCase().includes(query) &&
          !email.body.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedFolder === 'starred') {
      return email.starred;
    }
    return email.folder === selectedFolder;
  });

  const markAsRead = (id: string) => {
    setEmails(prev => prev.map(e => 
      e.id === id ? { ...e, read: true } : e
    ));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const moveToTrash = (id: string) => {
    setEmails(prev => prev.map(e => 
      e.id === id ? { ...e, folder: 'trash' as const } : e
    ));
    setSelectedEmail(null);
    addNotification({
      title: 'Email moved to trash',
      message: 'The email has been moved to trash',
      icon: 'trash',
    });
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    setSelectedEmail(null);
  };

  const archiveEmail = (id: string) => {
    setEmails(prev => prev.map(e => 
      e.id === id ? { ...e, folder: 'archive' as const } : e
    ));
    setSelectedEmail(null);
    addNotification({
      title: 'Email archived',
      message: 'The email has been archived',
      icon: 'info',
    });
  };

  const sendEmail = async () => {
    if (!composeData.to.trim() || !composeData.subject.trim()) {
      addNotification({
        title: 'Missing fields',
        message: 'Please fill in the recipient and subject',
        icon: 'system',
      });
      return;
    }

    setIsSending(true);

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'user@workflow-os.com',
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
    };

    setEmails(prev => [newEmail, ...prev]);
    setIsComposing(false);
    setComposeData({ to: '', subject: '', body: '' });
    setIsSending(false);

    addNotification({
      title: 'Email sent',
      message: `Email sent to ${composeData.to}`,
      icon: 'info',
    });
  };

  const saveDraft = () => {
    const draft: Email = {
      id: Date.now().toString(),
      from: 'user@workflow-os.com',
      to: composeData.to,
      subject: composeData.subject || '(No subject)',
      body: composeData.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'drafts',
    };

    setEmails(prev => [draft, ...prev]);
    setIsComposing(false);
    setComposeData({ to: '', subject: '', body: '' });

    addNotification({
      title: 'Draft saved',
      message: 'Your draft has been saved',
      icon: 'file',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-3 flex flex-col gap-3">
        <Button onClick={() => setIsComposing(true)} className="w-full">
          <Edit size={16} className="mr-2" />
          Compose
        </Button>

        <div className="space-y-1">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => {
                setSelectedFolder(folder.id);
                setSelectedEmail(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                selectedFolder === folder.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary"
              )}
            >
              <folder.icon size={16} />
              <span className="flex-1 text-left">{folder.name}</span>
              {folder.count > 0 && (
                <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border text-xs text-muted-foreground">
          <p className="mb-2">Email Client Demo</p>
          <p>Emails are stored locally. To send real emails, integrate with EmailJS or similar service.</p>
        </div>
      </div>

      {/* Email List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-medium capitalize">{selectedFolder}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw size={14} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No emails</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  markAsRead(email.id);
                }}
                className={cn(
                  "p-3 border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors",
                  selectedEmail?.id === email.id && "bg-secondary/50",
                  !email.read && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={(e) => toggleStar(email.id, e)}
                    className={cn(
                      "p-0.5",
                      email.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                    )}
                  >
                    <Star size={14} fill={email.starred ? "currentColor" : "none"} />
                  </button>
                  <span className={cn(
                    "text-sm truncate flex-1",
                    !email.read && "font-semibold"
                  )}>
                    {email.folder === 'sent' ? email.to : email.from}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(email.date)}</span>
                </div>
                <p className={cn(
                  "text-sm truncate",
                  !email.read && "font-medium"
                )}>
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {email.body.substring(0, 60)}...
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Email View / Compose */}
      <div className="flex-1 flex flex-col">
        {isComposing ? (
          // Compose View
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h2 className="font-medium">New Message</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsComposing(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="p-3 space-y-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">To:</span>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">Subject:</span>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>
              <Textarea
                value={composeData.body}
                onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your message..."
                className="flex-1 min-h-[200px] resize-none"
              />
              <div className="flex items-center gap-2">
                <Button onClick={sendEmail} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
                <Button variant="outline" onClick={saveDraft}>
                  Save Draft
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : selectedEmail ? (
          // Email View
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => archiveEmail(selectedEmail.id)}>
                <Archive size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail.id)}>
                <Trash2 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => toggleStar(selectedEmail.id, e)}
                className={selectedEmail.starred ? "text-yellow-500" : ""}
              >
                <Star size={16} fill={selectedEmail.starred ? "currentColor" : "none"} />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={16} />
              </Button>
            </div>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {selectedEmail.from[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{selectedEmail.from}</p>
                  <p className="text-muted-foreground text-xs">
                    to {selectedEmail.to} • {new Date(selectedEmail.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsComposing(true);
                  setComposeData({
                    to: selectedEmail.from,
                    subject: `Re: ${selectedEmail.subject}`,
                    body: `\n\n---\nOn ${new Date(selectedEmail.date).toLocaleString()}, ${selectedEmail.from} wrote:\n${selectedEmail.body}`,
                  });
                }}
              >
                Reply
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsComposing(true);
                  setComposeData({
                    to: '',
                    subject: `Fwd: ${selectedEmail.subject}`,
                    body: `\n\n---\nForwarded message:\nFrom: ${selectedEmail.from}\nDate: ${new Date(selectedEmail.date).toLocaleString()}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`,
                  });
                }}
              >
                Forward
              </Button>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select an email to read</p>
              <p className="text-sm">or compose a new message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
