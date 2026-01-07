"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { List, LayoutGrid, Calendar, Map, Lock, Lightbulb } from 'lucide-react';
import { ViewType, TableType } from '@/types';
import { getViewAvailability } from '@/lib/view-availability';

interface ViewSelectorProps {
  currentView: ViewType;
  currentTable: TableType | 'unified';
  onViewChange: (view: ViewType) => void;
}

const viewConfigs: { type: ViewType; label: string }[] = [
  { type: 'list', label: 'Table' },
  { type: 'kanban', label: 'Board' },
  { type: 'calendar', label: 'Calendar' },
  { type: 'map', label: 'Map' },
];

function ViewIcon({ type, className = "h-4 w-4" }: { type: ViewType; className?: string }) {
  switch (type) {
    case 'list': return <List className={className} />;
    case 'kanban': return <LayoutGrid className={className} />;
    case 'calendar': return <Calendar className={className} />;
    case 'map': return <Map className={className} />;
  }
}

export function ViewSelector({ currentView, currentTable, onViewChange }: ViewSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
        {viewConfigs.map((config) => {
          const availability = getViewAvailability(currentTable, config.type);
          const isActive = currentView === config.type;
          
          if (availability.available) {
            return (
              <Tooltip key={config.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 gap-1.5 rounded-md transition-all ${
                      isActive 
                        ? 'bg-background text-[#003B5C] shadow-sm border border-border/50' 
                        : 'text-muted-foreground hover:text-[#003B5C] hover:bg-background/50'
                    }`}
                    onClick={() => onViewChange(config.type)}
                  >
                    <ViewIcon type={config.type} />
                    <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{config.label} View</TooltipContent>
              </Tooltip>
            );
          }
          
          return (
            <Popover key={config.type}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-1.5 rounded-md text-muted-foreground/30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/30"
                >
                  <ViewIcon type={config.type} />
                  <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                  <Lock className="h-3 w-3 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-64 p-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{config.label} View Unavailable</p>
                  <p className="text-xs text-muted-foreground">{availability.reason}</p>
                  {availability.suggestion && (
                    <div className="flex items-start gap-2 p-2 bg-[#EBF5FA] rounded-md">
                      <Lightbulb className="h-3.5 w-3.5 text-[#1BA9C4] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#003B5C]">{availability.suggestion}</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </TooltipProvider>
  );
}