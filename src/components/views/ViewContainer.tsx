"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { EnhancedListView } from './EnhancedListView';
import { EnhancedKanbanView } from './EnhancedKanbanView';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { EnhancedMapView } from './EnhancedMapView';
import { ViewSelector } from '@/components/ViewSelector';
import { Badge } from '@/components/ui/badge';
import { springTransition } from '@/lib/animations';

export function ViewContainer() {
  const { currentView, currentTable, setCurrentView, getRecordsForCurrentTable } = useApp();
  const records = getRecordsForCurrentTable();

  const renderView = () => {
    switch (currentView) {
      case 'kanban': return <EnhancedKanbanView />;
      case 'calendar': return <EnhancedCalendarView />;
      case 'map': return <EnhancedMapView />;
      default: return <EnhancedListView />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <motion.div 
        className="flex items-center justify-between px-4 py-2 border-b border-border bg-background"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#003B5C] capitalize">
            {currentTable === 'unified' ? 'All Records' : currentTable}
          </h2>
          <motion.div
            key={records.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springTransition}
          >
            <Badge variant="secondary" className="text-xs font-normal">{records.length}</Badge>
          </motion.div>
        </div>
        <ViewSelector currentView={currentView} currentTable={currentTable} onViewChange={setCurrentView} />
      </motion.div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentTable}-${currentView}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springTransition}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}