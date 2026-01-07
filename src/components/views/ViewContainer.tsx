"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { EnhancedListView } from './EnhancedListView';
import { EnhancedKanbanView } from './EnhancedKanbanView';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { EnhancedMapView } from './EnhancedMapView';
import { ViewSelector } from '@/components/ViewSelector';
import { Badge } from '@/components/ui/badge';

export function ViewContainer() {
  const { currentView, currentTable, setCurrentView, getRecordsForCurrentTable } = useApp();
  
  const records = getRecordsForCurrentTable();

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <EnhancedListView />;
      case 'kanban':
        return <EnhancedKanbanView />;
      case 'calendar':
        return <EnhancedCalendarView />;
      case 'map':
        return <EnhancedMapView />;
      default:
        return <EnhancedListView />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#003B5C] capitalize">
            {currentTable}
          </h2>
          <Badge variant="secondary" className="text-xs font-normal">
            {records.length}
          </Badge>
        </div>
        
        <ViewSelector
          currentView={currentView}
          currentTable={currentTable}
          onViewChange={setCurrentView}
        />
      </div>
      
      {/* Main View Content */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}