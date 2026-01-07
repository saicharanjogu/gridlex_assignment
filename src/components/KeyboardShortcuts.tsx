"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['⌘', '1'], description: 'Switch to Table view' },
      { keys: ['⌘', '2'], description: 'Switch to Board view' },
      { keys: ['⌘', '3'], description: 'Switch to Calendar view' },
      { keys: ['⌘', '4'], description: 'Switch to Map view' },
    ],
  },
  {
    title: 'Records',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record' },
      { keys: ['Enter'], description: 'Open selected record' },
      { keys: ['Space'], description: 'Toggle row selection' },
      { keys: ['Escape'], description: 'Clear selection / Close dialog' },
    ],
  },
  {
    title: 'Table Navigation',
    shortcuts: [
      { keys: ['↑'], description: 'Move to previous row' },
      { keys: ['↓'], description: 'Move to next row' },
      { keys: ['Home'], description: 'Go to first row' },
      { keys: ['End'], description: 'Go to last row' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and manage records more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {shortcutGroups.map((group, index) => (
              <section key={group.title} aria-labelledby={`shortcut-group-${index}`}>
                {index > 0 && <Separator className="mb-4" />}
                <h3 
                  id={`shortcut-group-${index}`}
                  className="text-sm font-semibold text-muted-foreground mb-3"
                >
                  {group.title}
                </h3>
                <dl className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-1"
                    >
                      <dt className="text-sm">{shortcut.description}</dt>
                      <dd className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={`${key}-${i}`}>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded min-w-[28px] text-center">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground" aria-hidden="true">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </ScrollArea>
        
        <div className="pt-4 border-t border-border text-xs text-muted-foreground text-center">
          <p>On Windows, use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl</kbd> instead of <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘</kbd></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}