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
  shortcuts: { keys: string[]; description: string; ariaLabel: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search', ariaLabel: 'Command or Control plus K' },
      { keys: ['⌘', '1'], description: 'Switch to List view', ariaLabel: 'Command or Control plus 1' },
      { keys: ['⌘', '2'], description: 'Switch to Kanban view', ariaLabel: 'Command or Control plus 2' },
      { keys: ['⌘', '3'], description: 'Switch to Calendar view', ariaLabel: 'Command or Control plus 3' },
      { keys: ['⌘', '4'], description: 'Switch to Map view', ariaLabel: 'Command or Control plus 4' },
    ],
  },
  {
    title: 'Records',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record', ariaLabel: 'Command or Control plus N' },
      { keys: ['⌘', 'E'], description: 'Edit selected record', ariaLabel: 'Command or Control plus E' },
      { keys: ['⌘', 'D'], description: 'Duplicate selected record', ariaLabel: 'Command or Control plus D' },
      { keys: ['Delete'], description: 'Delete selected records', ariaLabel: 'Delete key' },
      { keys: ['Escape'], description: 'Clear selection', ariaLabel: 'Escape key' },
    ],
  },
  {
    title: 'Table',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all records', ariaLabel: 'Command or Control plus A' },
      { keys: ['↑', '↓'], description: 'Navigate rows', ariaLabel: 'Up and Down arrow keys' },
      { keys: ['Enter'], description: 'Open record details', ariaLabel: 'Enter key' },
      { keys: ['Space'], description: 'Toggle row selection', ariaLabel: 'Space key' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save current view', ariaLabel: 'Command or Control plus S' },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export data', ariaLabel: 'Command or Control plus Shift plus E' },
      { keys: ['?'], description: 'Show keyboard shortcuts', ariaLabel: 'Question mark key' },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px] md:max-w-[700px] max-h-[85vh] flex flex-col"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle id="shortcuts-title">Keyboard Shortcuts</DialogTitle>
          <DialogDescription id="shortcuts-description">
            Use these shortcuts to navigate and manage records faster.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {shortcutGroups.map((group, index) => (
              <section key={group.title} aria-labelledby={`group-${index}-title`}>
                {index > 0 && <Separator className="mb-4" aria-hidden="true" />}
                <h3 
                  id={`group-${index}-title`}
                  className="text-sm font-semibold text-muted-foreground mb-3"
                >
                  {group.title}
                </h3>
                <dl className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between"
                    >
                      <dt className="text-sm">{shortcut.description}</dt>
                      <dd className="flex items-center gap-1">
                        <span className="sr-only">{shortcut.ariaLabel}</span>
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={key}>
                            <kbd 
                              className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
                              aria-hidden="true"
                            >
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
      </DialogContent>
    </Dialog>
  );
}