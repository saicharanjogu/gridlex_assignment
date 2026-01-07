"use client";

import React, { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  List,
  LayoutGrid,
  Calendar,
  Map,
  Plus,
  Settings,
  Filter,
  Download,
  X,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { ViewType, TableType } from '@/types';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { ViewConfigDialog } from '@/components/dialogs/ViewConfigDialog';
import { GridlexLogo } from '@/components/GridlexLogo';

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
    openCreateDialog,
  } = useApp();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [viewConfigOpen, setViewConfigOpen] = useState(false);

  const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] = [
    { value: 'list', label: 'Table', icon: <List className="h-4 w-4" /> },
    { value: 'kanban', label: 'Board', icon: <LayoutGrid className="h-4 w-4" /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { value: 'map', label: 'Map', icon: <Map className="h-4 w-4" /> },
  ];

  const tableOptions: { value: TableType | 'unified'; label: string }[] = [
    { value: 'contacts', label: 'Contacts' },
    { value: 'opportunities', label: 'Opportunities' },
    { value: 'organizations', label: 'Organizations' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'unified', label: 'All Records' },
  ];

  return (
    <TooltipProvider>
      <header className="border-b border-border bg-background">
        <div className="h-14 flex items-center justify-between px-4 gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <GridlexLogo />
            
            <Separator orientation="vertical" className="h-6" />
            
            <Select value={currentTable} onValueChange={(v) => setCurrentTable(v as TableType | 'unified')}>
              <SelectTrigger className="w-[160px] h-9 border-0 bg-transparent font-medium hover:bg-muted/50 transition-colors">
                <SelectValue />
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

          {/* Center section - View tabs */}
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ViewType)} className="hidden md:block">
            <TabsList className="bg-muted/50 p-1">
              {viewOptions.map((option) => (
                <TabsTrigger 
                  key={option.value} 
                  value={option.value}
                  className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4"
                >
                  {option.icon}
                  <span className="hidden lg:inline">{option.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] lg:w-[280px] h-9 pl-9 pr-8 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-foreground">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {filters.length > 0 && (
                    <Badge className="ml-1 px-1.5 py-0.5 text-xs gradient-primary border-0">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter records</TooltipContent>
            </Tooltip>

            {currentUser.permissions.canConfigureViews && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setViewConfigOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure view</TooltipContent>
              </Tooltip>
            )}

            {currentUser.permissions.canExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setExportDialogOpen(true)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            {currentUser.permissions.canEditRecords && (
              <Button size="sm" className="h-9 gap-2 gradient-primary border-0 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Record</span>
              </Button>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* User Menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-white shadow-md shadow-primary/25">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <ExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} />
      <ViewConfigDialog open={viewConfigOpen} onClose={() => setViewConfigOpen(false)} />
    </TooltipProvider>
  );
}