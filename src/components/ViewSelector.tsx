"use client";

import React from 'react';
import { motion } from 'framer-motion';
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
import { quickSpring } from '@/lib/animations';

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
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50 relative">
        {viewConfigs.map((config) => {
          const availability = getViewAvailability(currentTable, config.type);
          const isActive = currentView === config.type;
          
          if (availability.available) {
            return (
              <Tooltip key={config.type}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 gap-1.5 rounded-md transition-colors relative z-10 ${
                        isActive 
                          ? 'text-[#003B5C]' 
                          : 'text-muted-foreground hover:text-[#003B5C]'
                      }`}
                      onClick={() => onViewChange(config.type)}
                    >
                      <motion.div
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        transition={quickSpring}
                      >
                        <ViewIcon type={config.type} />
                      </motion.div>
                      <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                    </Button>
                    
                    {/* Active indicator background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeViewIndicator"
                        className="absolute inset-0 bg-background shadow-sm border border-border/50 rounded-md -z-0"
                        transition={quickSpring}
                      />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{config.label} View</TooltipContent>
              </Tooltip>
            );
          }
          
          return (
            <Popover key={config.type}>
              <PopoverTrigger asChild>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 gap-1.5 rounded-md text-muted-foreground/30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/30"
                  >
                    <ViewIcon type={config.type} />
                    <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                    <Lock className="h-3 w-3 ml-0.5" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-64 p-3">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={quickSpring}
                >
                  <p className="text-sm font-medium">{config.label} View Unavailable</p>
                  <p className="text-xs text-muted-foreground">{availability.reason}</p>
                  {availability.suggestion && (
                    <motion.div 
                      className="flex items-start gap-2 p-2 bg-[#EBF5FA] rounded-md"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-[#1BA9C4] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#003B5C]">{availability.suggestion}</p>
                    </motion.div>
                  )}
                </motion.div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </TooltipProvider>
  );
}