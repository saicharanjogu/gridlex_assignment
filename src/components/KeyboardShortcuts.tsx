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
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Search' },
      { keys: ['⌘', '1-4'], description: 'Switch views' },
      { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    ],
  },
  {
    title: 'Records',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'New record' },
      { keys: ['⌘', 'E'], description: 'Edit' },
      { keys: ['⌘', 'D'], description: 'Duplicate' },
      { keys: ['Del'], description: 'Delete' },
    ],
  },
  {
    title: 'Table',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all' },
      { keys: ['↑↓'], description: 'Navigate' },
      { keys: ['Enter'], description: 'Open' },
      { keys: ['Space'], description: 'Select' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save view' },
      { keys: ['?'], description: 'Shortcuts' },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-0.5">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={`${shortcut.description}-${key}-${i}`}>
                          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted border rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground/50 text-xs">+</span>
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
        
        <p className="text-[11px] text-muted-foreground text-center pt-2 border-t">
          Use <kbd className="px-1 py-0.5 text-[10px] bg-muted border rounded">Ctrl</kbd> on Windows/Linux
        </p>
      </DialogContent>
    </Dialog>
  );
}