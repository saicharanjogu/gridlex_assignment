"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Info,
  Lock,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { ViewType, TableType } from '@/types';
import { getViewAvailability, viewConfigs } from '@/lib/view-availability';

interface ViewSelectorProps {
  currentView: ViewType;
  currentTable: TableType | 'unified';
  onViewChange: (view: ViewType) => void;
}

const viewIcons: Record<ViewType, React.ReactNode> = {
  list: <List className="h-4 w-4" />,
  kanban: <LayoutGrid className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  map: <Map className="h-4 w-4" />,
};

export function ViewSelector({ currentView, currentTable, onViewChange }: ViewSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
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
                    className={`gap-2 h-8 px-3 ${
                      isActive 
                        ? 'bg-background shadow-sm text-[#003B5C]' 
                        : 'text-muted-foreground hover:text-[#003B5C]'
                    }`}
                    onClick={() => onViewChange(config.type)}
                  >
                    {viewIcons[config.type]}
                    <span className="hidden lg:inline">{config.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium">{config.label} View</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          // Disabled view with popover explanation
          return (
            <DisabledViewButton
              key={config.type}
              config={config}
              availability={availability}
              icon={viewIcons[config.type]}
            />
          );
        })}
      </div>
    </TooltipProvider>
  );
}

interface DisabledViewButtonProps {
  config: typeof viewConfigs[0];
  availability: ReturnType<typeof getViewAvailability>;
  icon: React.ReactNode;
}

function DisabledViewButton({ config, availability, icon }: DisabledViewButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-8 px-3 text-muted-foreground/50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/50 relative"
        >
          {icon}
          <span className="hidden lg:inline">{config.label}</span>
          <Lock className="h-3 w-3 absolute -top-0.5 -right-0.5 text-muted-foreground/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className="w-80">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <div className="text-muted-foreground">{icon}</div>
            </div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2">
                {config.label} View
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Unavailable
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
          
          {/* Reason */}
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {availability.reason}
            </p>
          </div>
          
          {/* Suggestion */}
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

// Compact version for mobile or smaller spaces
export function ViewSelectorCompact({ currentView, currentTable, onViewChange }: ViewSelectorProps) {
  const availableViews = viewConfigs.filter(
    config => getViewAvailability(currentTable, config.type).available
  );
  
  return (
    <TooltipProvider>
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
                    size="icon"
                    className={`h-8 w-8 ${
                      isActive 
                        ? 'bg-[#0A3E6B] text-white' 
                        : 'text-muted-foreground hover:text-[#003B5C]'
                    }`}
                    onClick={() => onViewChange(config.type)}
                  >
                    {viewIcons[config.type]}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{config.label}</TooltipContent>
              </Tooltip>
            );
          }
          
          return (
            <Tooltip key={config.type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground/30 cursor-not-allowed hover:bg-transparent"
                  disabled
                >
                  {viewIcons[config.type]}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{config.label} - Unavailable</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">{availability.reason}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}