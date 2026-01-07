"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  ChevronDown,
  List,
  LayoutGrid,
  Calendar,
  Map,
  Plus,
  Settings,
} from 'lucide-react';
import { ViewType, TableType } from '@/types';

export function Header() {
  const {
    currentUser,
    currentView,
    currentTable,
    searchQuery,
    setCurrentView,
    setCurrentTable,
    setSearchQuery,
  } = useApp();

  const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] = [
    { value: 'list', label: 'List', icon: <List className="h-4 w-4" strokeWidth={1.5} /> },
    { value: 'kanban', label: 'Board', icon: <LayoutGrid className="h-4 w-4" strokeWidth={1.5} /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" strokeWidth={1.5} /> },
    { value: 'map', label: 'Map', icon: <Map className="h-4 w-4" strokeWidth={1.5} /> },
  ];

  const tableLabels: Record<TableType | 'unified', string> = {
    contacts: 'Contacts',
    opportunities: 'Opportunities',
    organizations: 'Organizations',
    tasks: 'Tasks',
    unified: 'All Records',
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border/50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">DataView</span>
          <span className="text-muted-foreground/40">/</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground/80 transition-micro">
                {tableLabels[currentTable]}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {(Object.keys(tableLabels) as (TableType | 'unified')[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setCurrentTable(key)}
                  className={currentTable === key ? 'bg-accent' : ''}
                >
                  {tableLabels[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCurrentView(option.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-micro ${
                currentView === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 pl-9 text-sm bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-border placeholder:text-muted-foreground/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-medium">
            ⌘K
          </kbd>
        </div>

        <Button 
          size="sm" 
          className="h-8 px-3 text-xs font-medium gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New
        </Button>

        <button className="p-2 text-muted-foreground hover:text-foreground transition-micro rounded-md hover:bg-muted/50">
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-semibold text-white">
          {currentUser.name.charAt(0)}
        </div>
      </div>
    </header>
  );
}