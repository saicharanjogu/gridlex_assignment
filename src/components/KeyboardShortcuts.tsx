"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
      { keys: ['⌘', '1'], description: 'Switch to List view' },
      { keys: ['⌘', '2'], description: 'Switch to Kanban view' },
      { keys: ['⌘', '3'], description: 'Switch to Calendar view' },
      { keys: ['⌘', '4'], description: 'Switch to Map view' },
    ],
  },
  {
    title: 'Records',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record' },
      { keys: ['⌘', 'E'], description: 'Edit selected record' },
      { keys: ['⌘', 'D'], description: 'Duplicate selected record' },
      { keys: ['Delete'], description: 'Delete selected records' },
      { keys: ['Escape'], description: 'Clear selection' },
    ],
  },
  {
    title: 'Table',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all records' },
      { keys: ['↑', '↓'], description: 'Navigate rows' },
      { keys: ['Enter'], description: 'Open record details' },
      { keys: ['Space'], description: 'Toggle row selection' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save current view' },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export data' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and manage records faster.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group, index) => (
            <div key={group.title}>
              {index > 0 && <Separator className="mb-4" />}
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={key}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}