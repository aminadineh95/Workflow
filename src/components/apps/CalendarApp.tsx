import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Clock, CalendarDays, Bell } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  color: string;
  reminder: boolean;
}

interface CalendarAppProps {
  windowId: string;
}

const EVENTS_STORAGE_KEY = 'calendar-events';
const EVENT_COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

export function CalendarApp({ windowId }: CalendarAppProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0].value);
  const [newEventReminder, setNewEventReminder] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addNotification } = useNotifications();

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(event => {
        if (event.reminder && isSameDay(event.date, now)) {
          const [hours, minutes] = event.time.split(':').map(Number);
          const eventTime = new Date(event.date);
          eventTime.setHours(hours, minutes, 0, 0);
          
          const diff = eventTime.getTime() - now.getTime();
          // Notify 15 minutes before
          if (diff > 0 && diff <= 15 * 60 * 1000) {
            addNotification({
              title: 'Event Reminder',
              message: `${event.title} starts at ${event.time}`,
              icon: 'calendar',
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [events, addNotification]);

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      date: selectedDate,
      time: newEventTime,
      color: newEventColor,
      reminder: newEventReminder,
    };

    setEvents(prev => [...prev, newEvent]);
    setNewEventTitle('');
    setNewEventTime('09:00');
    setNewEventColor(EVENT_COLORS[0].value);
    setNewEventReminder(false);
    setIsDialogOpen(false);

    addNotification({
      title: 'Event Created',
      message: `"${newEvent.title}" added for ${format(newEvent.date, 'MMM d, yyyy')}`,
      icon: 'calendar',
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    
    if (event) {
      addNotification({
        title: 'Event Deleted',
        message: `"${event.title}" has been removed`,
        icon: 'trash',
      });
    }
  };

  const selectedDateEvents = events.filter(e => isSameDay(e.date, selectedDate));
  
  // Get dates with events for calendar highlighting
  const datesWithEvents = events.map(e => e.date);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">{format(selectedDate, 'MMMM yyyy')}</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[400px]"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                const input = document.querySelector('[data-event-title-input]') as HTMLInputElement;
                if (input) {
                  setTimeout(() => input.focus(), 0);
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Title</label>
                  <Input
                    data-event-title-input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Enter event title..."
                    className="mt-1"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm mt-1">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <Input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Color</label>
                  <div className="flex gap-2 mt-2">
                    {EVENT_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewEventColor(color.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-transform",
                          color.value,
                          newEventColor === color.value && "ring-2 ring-offset-2 ring-primary scale-110"
                        )}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={newEventReminder}
                    onChange={(e) => setNewEventReminder(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="reminder" className="text-sm flex items-center gap-1">
                    <Bell className="w-4 h-4" />
                    Set reminder (15 min before)
                  </label>
                </div>
                
                <Button onClick={handleAddEvent} className="w-full" disabled={!newEventTitle.trim()}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar */}
        <div className="p-4 border-r border-border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border border-border pointer-events-auto"
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))',
              },
            }}
          />
        </div>

        {/* Events List */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-medium">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No events for this day</p>
                  <p className="text-sm">Click "Add Event" to create one</p>
                </div>
              ) : (
                selectedDateEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors group"
                    >
                      <div className={cn("w-1 h-full min-h-[40px] rounded-full", event.color)} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                          {event.reminder && (
                            <>
                              <Bell className="w-3 h-3 ml-2" />
                              <span>Reminder</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
