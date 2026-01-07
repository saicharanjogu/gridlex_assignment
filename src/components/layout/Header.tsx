"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Filter,
  Download,
  MoreHorizontal,
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
    filters,
  } = useApp();

  const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] = [
    { value: 'list', label: 'Table', icon: <List className="h-4 w-4" strokeWidth={1.5} /> },
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
    <header className="border-b border-border bg-background">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-base font-semibold">DataView</span>
          </div>
          
          <span className="text-muted-foreground/30 text-lg">/</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-base font-medium hover:text-muted-foreground transition-micro">
                {tableLabels[currentTable]}
                <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
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

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filter
            {filters.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                {filters.length}
              </span>
            )}
          </Button>

          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Record
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white cursor-pointer">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div className="px-4 flex items-center gap-1">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setCurrentView(option.value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-micro ${
              currentView === option.value
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </header>
  );
}