import React, { useEffect, useRef, useState } from 'react';
import { ContextMenuItem } from '@/types/windows';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let newX = x;
      let newY = y;

      if (x + rect.width > window.innerWidth) {
        newX = window.innerWidth - rect.width - 8;
      }
      if (y + rect.height > window.innerHeight - 48) {
        newY = window.innerHeight - rect.height - 56;
      }

      setPosition({ x: newX, y: newY });
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [x, y, onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed win-window py-2 min-w-[200px] z-[10000] animate-scale-in"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item) => {
        if (item.separator) {
          return <div key={item.id} className="h-px bg-border my-1 mx-3" />;
        }

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => item.submenu && setActiveSubmenu(item.id)}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => item.action?.()}
              disabled={item.disabled}
              className={cn(
                "w-full px-3 py-1.5 text-sm text-left flex items-center justify-between gap-4 win-hover",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>{item.label}</span>
              {item.submenu && <ChevronRight size={14} />}
              {item.shortcut && (
                <span className="text-muted-foreground text-xs">{item.shortcut}</span>
              )}
            </button>

            {item.submenu && activeSubmenu === item.id && (
              <div className="absolute left-full top-0 ml-1 win-window py-2 min-w-[160px]">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => {
                      subItem.action?.();
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left win-hover"
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
