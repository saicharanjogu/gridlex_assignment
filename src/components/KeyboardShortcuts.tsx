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
      { keys: ['⌘', 'K'], description: 'Open search', ariaLabel: 'Command K to open search' },
      { keys: ['⌘', '1'], description: 'Switch to List view', ariaLabel: 'Command 1 to switch to list view' },
      { keys: ['⌘', '2'], description: 'Switch to Kanban view', ariaLabel: 'Command 2 to switch to kanban view' },
      { keys: ['⌘', '3'], description: 'Switch to Calendar view', ariaLabel: 'Command 3 to switch to calendar view' },
      { keys: ['⌘', '4'], description: 'Switch to Map view', ariaLabel: 'Command 4 to switch to map view' },
    ],
  },
  {
    title: 'Records',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record', ariaLabel: 'Command N to create new record' },
      { keys: ['⌘', 'E'], description: 'Edit selected record', ariaLabel: 'Command E to edit selected record' },
      { keys: ['⌘', 'D'], description: 'Duplicate selected record', ariaLabel: 'Command D to duplicate selected record' },
      { keys: ['Delete'], description: 'Delete selected records', ariaLabel: 'Delete key to delete selected records' },
      { keys: ['Escape'], description: 'Clear selection', ariaLabel: 'Escape key to clear selection' },
    ],
  },
  {
    title: 'Table Navigation',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all records', ariaLabel: 'Command A to select all records' },
      { keys: ['↑', '↓'], description: 'Navigate rows', ariaLabel: 'Arrow up and down to navigate rows' },
      { keys: ['Enter'], description: 'Open record details', ariaLabel: 'Enter key to open record details' },
      { keys: ['Space'], description: 'Toggle row selection', ariaLabel: 'Space bar to toggle row selection' },
      { keys: ['Home'], description: 'Go to first row', ariaLabel: 'Home key to go to first row' },
      { keys: ['End'], description: 'Go to last row', ariaLabel: 'End key to go to last row' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save current view', ariaLabel: 'Command S to save current view' },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export data', ariaLabel: 'Command Shift E to export data' },
      { keys: ['?'], description: 'Show keyboard shortcuts', ariaLabel: 'Question mark to show keyboard shortcuts' },
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
            Use these keyboard shortcuts to navigate and manage records more efficiently. 
            On Mac, use Command (⌘). On Windows/Linux, use Control (Ctrl).
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {shortcutGroups.map((group, index) => (
              <section key={group.title} aria-labelledby={`group-${index}-title`}>
                {index > 0 && <Separator className="mb-4" />}
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
                      <dd className="flex items-center gap-1" aria-label={shortcut.ariaLabel}>
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={key}>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border-2 border-border rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
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