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
import { Badge } from '@/components/ui/badge';
import { 
  Keyboard, 
  Navigation, 
  FileText, 
  Table, 
  Settings,
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  MousePointer,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Save,
  Download,
  HelpCircle,
} from 'lucide-react';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  color: string;
  shortcuts: Shortcut[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    icon: <Navigation className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search', icon: <Search className="h-3.5 w-3.5" /> },
      { keys: ['⌘', '1'], description: 'Switch to List view' },
      { keys: ['⌘', '2'], description: 'Switch to Kanban view' },
      { keys: ['⌘', '3'], description: 'Switch to Calendar view' },
      { keys: ['⌘', '4'], description: 'Switch to Map view' },
    ],
  },
  {
    title: 'Records',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Create new record', icon: <Plus className="h-3.5 w-3.5" /> },
      { keys: ['⌘', 'E'], description: 'Edit selected record', icon: <Edit className="h-3.5 w-3.5" /> },
      { keys: ['⌘', 'D'], description: 'Duplicate selected record', icon: <Copy className="h-3.5 w-3.5" /> },
      { keys: ['Delete'], description: 'Delete selected records', icon: <Trash2 className="h-3.5 w-3.5" /> },
      { keys: ['Escape'], description: 'Clear selection', icon: <MousePointer className="h-3.5 w-3.5" /> },
    ],
  },
  {
    title: 'Table',
    icon: <Table className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all records' },
      { keys: ['↑'], description: 'Navigate up', icon: <ArrowUp className="h-3.5 w-3.5" /> },
      { keys: ['↓'], description: 'Navigate down', icon: <ArrowDown className="h-3.5 w-3.5" /> },
      { keys: ['Enter'], description: 'Open record details', icon: <CornerDownLeft className="h-3.5 w-3.5" /> },
      { keys: ['Space'], description: 'Toggle row selection' },
    ],
  },
  {
    title: 'General',
    icon: <Settings className="h-4 w-4" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save current view', icon: <Save className="h-3.5 w-3.5" /> },
      { keys: ['⌘', 'Shift', 'E'], description: 'Export data', icon: <Download className="h-3.5 w-3.5" /> },
      { keys: ['?'], description: 'Show keyboard shortcuts', icon: <HelpCircle className="h-3.5 w-3.5" /> },
    ],
  },
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-gradient-to-b from-muted/50 to-transparent">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5FA] border border-[#1BA9C4]/20 flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-[#1BA9C4]" />
              </div>
              <div>
                <DialogTitle className="text-lg text-[#003B5C]">Keyboard Shortcuts</DialogTitle>
                <DialogDescription className="text-sm">
                  Navigate and manage records faster with these shortcuts
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcutGroups.map((group) => (
              <div 
                key={group.title} 
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Group Header */}
                <div className={`flex items-center gap-2 px-4 py-3 border-b border-border ${group.color}`}>
                  {group.icon}
                  <span className="font-semibold text-sm">{group.title}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                    {group.shortcuts.length}
                  </Badge>
                </div>
                
                {/* Shortcuts List */}
                <div className="divide-y divide-border/50">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {shortcut.icon && (
                          <span className="text-muted-foreground flex-shrink-0">
                            {shortcut.icon}
                          </span>
                        )}
                        <span className="text-sm text-foreground truncate">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={`${shortcut.description}-${key}-${i}`}>
                            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-medium bg-background border border-border rounded-md shadow-sm text-muted-foreground">
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
          
          {/* Footer Tip */}
          <div className="mt-6 p-4 rounded-xl bg-[#EBF5FA] border border-[#1BA9C4]/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1BA9C4]/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-4 w-4 text-[#1BA9C4]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#003B5C]">Pro Tip</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Press <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border rounded mx-0.5">?</kbd> anytime to open this shortcuts panel. 
                  On Windows, use <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border rounded mx-0.5">Ctrl</kbd> instead of <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border rounded mx-0.5">⌘</kbd>.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}