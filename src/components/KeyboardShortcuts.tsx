"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const shortcutGroups = [
  {
    title: 'Navigation',
    color: 'border-l-blue-500',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['⌘', '1'], description: 'List view' },
      { keys: ['⌘', '2'], description: 'Kanban view' },
      { keys: ['⌘', '3'], description: 'Calendar view' },
      { keys: ['⌘', '4'], description: 'Map view' },
    ],
  },
  {
    title: 'Records',
    color: 'border-l-emerald-500',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record' },
      { keys: ['⌘', 'E'], description: 'Edit selected' },
      { keys: ['⌘', 'D'], description: 'Duplicate selected' },
      { keys: ['Delete'], description: 'Delete selected' },
      { keys: ['Escape'], description: 'Clear selection' },
    ],
  },
  {
    title: 'Table',
    color: 'border-l-amber-500',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all' },
      { keys: ['↑', '↓'], description: 'Navigate rows' },
      { keys: ['Enter'], description: 'Open details' },
      { keys: ['Space'], description: 'Toggle selection' },
    ],
  },
  {
    title: 'General',
    color: 'border-l-purple-500',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save view' },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export data' },
      { keys: ['?'], description: 'Show shortcuts' },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Keyboard Shortcuts</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Press <kbd className="px-1 py-0.5 text-[10px] bg-background border rounded">?</kbd> anytime to open
              </p>
            </div>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="grid grid-cols-2 gap-3">
            {shortcutGroups.map((group) => (
              <div 
                key={group.title} 
                className={`rounded-lg border bg-card border-l-4 ${group.color}`}
              >
                <div className="px-3 py-2 border-b bg-muted/30">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-xs text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={`${shortcut.description}-${key}-${i}`}>
                            <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium bg-background border rounded shadow-sm">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground/50 text-[10px] mx-0.5">+</span>
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
          
          {/* Pro Tip */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground text-center">
              💡 On Windows/Linux, use <kbd className="px-1 py-0.5 text-[10px] bg-background border rounded">Ctrl</kbd> instead of <kbd className="px-1 py-0.5 text-[10px] bg-background border rounded">⌘</kbd>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}