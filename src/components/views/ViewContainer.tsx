"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { EnhancedListView } from './EnhancedListView';
import { EnhancedKanbanView } from './EnhancedKanbanView';
import { EnhancedCalendarView } from './EnhancedCalendarView';
import { EnhancedMapView } from './EnhancedMapView';

export function ViewContainer() {
  const { currentView } = useApp();

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
}