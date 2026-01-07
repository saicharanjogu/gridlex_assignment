"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { EnhancedListView } from './EnhancedListView';
import { EnhancedKanbanView } from './EnhancedKanbanView';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { EnhancedMapView } from './EnhancedMapView';
import { ViewSelector } from '@/components/ViewSelector';

export function ViewContainer() {
  const { currentView, currentTable, setCurrentView } = useApp();

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
      {/* View Selector Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#003B5C] capitalize">
            {currentTable === 'unified' ? 'All Records' : currentTable}
          </h2>
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