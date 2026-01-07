"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { List, LayoutGrid, Calendar, Map, Search, Settings, User, Filter } from 'lucide-react';
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
    { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
    { value: 'kanban', label: 'Kanban', icon: <LayoutGrid className="h-4 w-4" /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { value: 'map', label: 'Map', icon: <Map className="h-4 w-4" /> },
  ];

  const tableOptions: { value: TableType | 'unified'; label: string }[] = [
    { value: 'contacts', label: 'Contacts' },
    { value: 'opportunities', label: 'Opportunities' },
    { value: 'organizations', label: 'Organizations' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'unified', label: 'Unified View' },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">DataView Pro</h1>
          
          <Select value={currentTable} onValueChange={(value) => setCurrentTable(value as TableType | 'unified')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {tableOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>

          <div className="flex items-center border rounded-lg p-1 bg-muted/50">
            {viewOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentView === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView(option.value)}
                className="gap-2"
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            ))}
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <span className="font-medium">{currentUser.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground capitalize">{currentUser.role}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}