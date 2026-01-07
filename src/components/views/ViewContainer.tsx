"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ListView } from './ListView';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';
import { MapView } from './MapView';

export function ViewContainer() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'list':
      return <ListView />;
    case 'kanban':
      return <KanbanView />;
    case 'calendar':
      return <CalendarView />;
    case 'map':
      return <MapView />;
    default:
      return <ListView />;
  }
}