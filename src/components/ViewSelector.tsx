"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  List,
  LayoutGrid,
  Calendar,
  Map,
  Lock,
  Lightbulb,
  Check,
  Sparkles,
} from 'lucide-react';
import { ViewType, TableType } from '@/types';
import { getViewAvailability, viewConfigs } from '@/lib/view-availability';

interface ViewSelectorProps {
  currentView: ViewType;
  currentTable: TableType | 'unified';
  onViewChange: (view: ViewType) => void;
}

const viewLabels: Record<ViewType, string> = {
  list: 'Table',
  kanban: 'Board',
  calendar: 'Calendar',
  map: 'Map',
};

const viewDescriptions: Record<ViewType, string> = {
  list: 'Spreadsheet view',
  kanban: 'Card columns',
  calendar: 'Timeline view',
  map: 'Geographic view',
};

function ViewIcon({ type, className = "h-5 w-5" }: { type: ViewType; className?: string }) {
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
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center gap-1">
            {viewConfigs.map((config) => {
              const availability = getViewAvailability(currentTable, config.type);
              const isActive = currentView === config.type;
              
              if (availability.available) {
                return (
                  <Tooltip key={config.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className={`relative h-12 w-14 flex-col gap-0.5 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-gradient-to-br from-[#0A3E6B] to-[#003B5C] text-white shadow-md shadow-[#003B5C]/25 hover:from-[#003B5C] hover:to-[#002A42]' 
                            : 'text-muted-foreground hover:text-[#003B5C] hover:bg-[#EBF5FA]'
                        }`}
                        onClick={() => onViewChange(config.type)}
                      >
                        <ViewIcon type={config.type} />
                        <span className="text-[10px] font-medium leading-none">
                          {viewLabels[config.type]}
                        </span>
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#1BA9C4] rounded-full flex items-center justify-center shadow-sm">
                            <Check className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[180px]">
                      <p className="font-medium">{viewLabels[config.type]} View</p>
                      <p className="text-xs text-muted-foreground">{viewDescriptions[config.type]}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
              return (
                <DisabledViewButton
                  key={config.type}
                  config={config}
                  availability={availability}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

interface DisabledViewButtonProps {
  config: typeof viewConfigs[0];
  availability: ReturnType<typeof getViewAvailability>;
}

function DisabledViewButton({ config, availability }: DisabledViewButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-12 w-14 flex-col gap-0.5 rounded-lg text-muted-foreground/40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/40"
        >
          <ViewIcon type={config.type} />
          <span className="text-[10px] font-medium leading-none">
            {viewLabels[config.type]}
          </span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center border border-border">
            <Lock className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className="w-72">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <ViewIcon type={config.type} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">
                {viewLabels[config.type]} View
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
                  Unavailable
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewDescriptions[config.type]}
              </p>
            </div>
          </div>
          
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {availability.reason}
            </p>
          </div>
          
          {availability.suggestion && (
            <div className="flex items-start gap-2 p-2.5 bg-[#EBF5FA] dark:bg-[#003B5C]/20 border border-[#1BA9C4]/20 rounded-lg">
              <Lightbulb className="h-4 w-4 text-[#1BA9C4] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#003B5C] dark:text-[#1BA9C4]">
                {availability.suggestion}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Vertical version for sidebar or right panel
export function ViewSelectorVertical({ currentView, currentTable, onViewChange }: ViewSelectorProps) {
  return (
    <TooltipProvider>
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#1BA9C4]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Views</span>
        </div>
        {viewConfigs.map((config) => {
          const availability = getViewAvailability(currentTable, config.type);
          const isActive = currentView === config.type;
          
          if (availability.available) {
            return (
              <Button
                key={config.type}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full justify-start gap-3 h-10 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#1BA9C4]/10 to-[#0A3E6B]/10 text-[#003B5C] border border-[#1BA9C4]/20 shadow-sm' 
                    : 'text-muted-foreground hover:text-[#003B5C] hover:bg-[#EBF5FA]'
                }`}
                onClick={() => onViewChange(config.type)}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#0A3E6B] to-[#003B5C] text-white shadow-sm' 
                    : 'bg-muted/50'
                }`}>
                  <ViewIcon type={config.type} className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{viewLabels[config.type]}</p>
                  <p className="text-[10px] text-muted-foreground">{viewDescriptions[config.type]}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[#1BA9C4]" />
                )}
              </Button>
            );
          }
          
          return (
            <Popover key={config.type}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 h-10 rounded-lg text-muted-foreground/40 cursor-not-allowed hover:bg-transparent"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-muted/30 relative">
                    <ViewIcon type={config.type} className="h-4 w-4" />
                    <Lock className="h-2.5 w-2.5 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{viewLabels[config.type]}</p>
                    <p className="text-[10px]">{viewDescriptions[config.type]}</p>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-72">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <ViewIcon type={config.type} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{viewLabels[config.type]} View</h4>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1 bg-amber-100 text-amber-700">
                        Unavailable
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{availability.reason}</p>
                  
                  {availability.suggestion && (
                    <div className="flex items-start gap-2 p-2 bg-[#EBF5FA] rounded-lg">
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

// Compact horizontal version for toolbar
export function ViewSelectorCompact({ currentView, currentTable, onViewChange }: ViewSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 p-1 bg-muted/50 rounded-lg">
        {viewConfigs.map((config) => {
          const availability = getViewAvailability(currentTable, config.type);
          const isActive = currentView === config.type;
          
          if (availability.available) {
            return (
              <Tooltip key={config.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-md transition-all ${
                      isActive 
                        ? 'bg-background text-[#003B5C] shadow-sm' 
                        : 'text-muted-foreground hover:text-[#003B5C] hover:bg-background/50'
                    }`}
                    onClick={() => onViewChange(config.type)}
                  >
                    <ViewIcon type={config.type} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{viewLabels[config.type]}</p>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          return (
            <Tooltip key={config.type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-muted-foreground/30 cursor-not-allowed hover:bg-transparent"
                  disabled
                >
                  <ViewIcon type={config.type} className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-medium">{viewLabels[config.type]} - Unavailable</p>
                <p className="text-xs text-muted-foreground">{availability.reason}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}