"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { group: 'Navigation', items: [
    { keys: ['⌘', 'K'], desc: 'Open search' },
    { keys: ['⌘', '1-4'], desc: 'Switch views' },
  ]},
  { group: 'Records', items: [
    { keys: ['⌘', 'N'], desc: 'Create new' },
    { keys: ['Enter'], desc: 'Open details' },
    { keys: ['Delete'], desc: 'Delete selected' },
  ]},
  { group: 'General', items: [
    { keys: ['⌘', 'A'], desc: 'Select all' },
    { keys: ['Escape'], desc: 'Clear selection' },
    { keys: ['?'], desc: 'Show shortcuts' },
  ]},
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Navigate and manage records faster</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-2">
            {shortcuts.map((group, i) => (
              <div key={group.group}>
                {i > 0 && <Separator className="mb-3" />}
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">{group.group}</h4>
                <div className="space-y-2">
                  {group.items.map((s) => (
                    <div key={s.desc} className="flex items-center justify-between">
                      <span className="text-sm">{s.desc}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k, j) => (
                          <React.Fragment key={k}>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">{k}</kbd>
                            {j < s.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}