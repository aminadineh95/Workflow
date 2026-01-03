import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Calendar, 
  Flag, 
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: string;
  starred: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: 'personal', name: 'Personal', color: 'bg-blue-500' },
  { id: 'work', name: 'Work', color: 'bg-purple-500' },
  { id: 'shopping', name: 'Shopping', color: 'bg-green-500' },
  { id: 'health', name: 'Health', color: 'bg-red-500' },
];

const STORAGE_KEY = 'workflow-os-tasks';

export function TasksApp() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [categories] = useState<Category[]>(defaultCategories);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('personal');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      starred: false,
      createdAt: new Date().toISOString(),
      dueDate: newTaskDueDate || undefined,
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowNewTaskForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const toggleStar = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, starred: !t.starred } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskTitle = (id: string, title: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, title } : t
    ));
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }
    switch (filter) {
      case 'active': return !task.completed;
      case 'completed': return task.completed;
      case 'starred': return task.starred;
      default: return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-secondary';
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length,
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 flex flex-col gap-4">
        <div className="space-y-1">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === 'all' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
            )}
          >
            <Circle size={16} />
            <span>All Tasks</span>
            <span className="ml-auto text-xs text-muted-foreground">{stats.total}</span>
          </button>
          <button
            onClick={() => setFilter('active')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === 'active' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
            )}
          >
            <Clock size={16} />
            <span>Active</span>
            <span className="ml-auto text-xs text-muted-foreground">{stats.active}</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === 'completed' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
            )}
          >
            <CheckCircle2 size={16} />
            <span>Completed</span>
            <span className="ml-auto text-xs text-muted-foreground">{stats.completed}</span>
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              filter === 'starred' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
            )}
          >
            <Star size={16} />
            <span>Starred</span>
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">CATEGORIES</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                selectedCategory === 'all' ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              <Tag size={16} />
              <span>All Categories</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedCategory === cat.id ? "bg-secondary" : "hover:bg-secondary/50"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowNewTaskForm(true)}>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* New Task Form */}
        {showNewTaskForm && (
          <div className="p-4 border-b border-border bg-secondary/20">
            <div className="space-y-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-3 py-1.5 text-sm rounded-md border border-border bg-background"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-border bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-40"
                />
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => setShowNewTaskForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={addTask}>
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks found</p>
                <p className="text-sm">Add a new task to get started</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors group",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.completed 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground hover:border-primary"
                    )}
                  >
                    {task.completed && <Check size={12} />}
                  </button>

                  <div className={cn("w-2 h-2 rounded-full", getCategoryColor(task.category))} />

                  <div className="flex-1 min-w-0">
                    {editingTask === task.id ? (
                      <Input
                        defaultValue={task.title}
                        autoFocus
                        onBlur={(e) => updateTaskTitle(task.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateTaskTitle(task.id, e.currentTarget.value);
                          if (e.key === 'Escape') setEditingTask(null);
                        }}
                      />
                    ) : (
                      <span
                        className={cn(
                          "block truncate cursor-pointer",
                          task.completed && "line-through"
                        )}
                        onDoubleClick={() => setEditingTask(task.id)}
                      >
                        {task.title}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={cn(
                        "text-xs",
                        isOverdue(task.dueDate) && !task.completed ? "text-red-500" : "text-muted-foreground"
                      )}>
                        <Calendar size={10} className="inline mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <Flag size={14} className={getPriorityColor(task.priority)} />

                  <button
                    onClick={() => toggleStar(task.id)}
                    className={cn(
                      "p-1 rounded transition-colors",
                      task.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                    )}
                  >
                    <Star size={14} fill={task.starred ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
          <span>{stats.active} active</span>
          <span>{stats.completed} completed</span>
          {stats.overdue > 0 && (
            <span className="text-red-500">{stats.overdue} overdue</span>
          )}
        </div>
      </div>
    </div>
  );
}
