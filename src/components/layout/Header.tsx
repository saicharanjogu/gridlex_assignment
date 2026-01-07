"use client";

import React, { useState, useRef, useEffect } from 'react';
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
import { VisuallyHidden } from '@/components/ui/visually-hidden';
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
  User,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const viewOptions: { value: ViewType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'list', label: 'Table', icon: <List className="h-4 w-4" aria-hidden="true" />, description: 'View records in a table format' },
    { value: 'kanban', label: 'Board', icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" />, description: 'View records in a kanban board' },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" aria-hidden="true" />, description: 'View records in a calendar' },
    { value: 'map', label: 'Map', icon: <Map className="h-4 w-4" aria-hidden="true" />, description: 'View records on a map' },
  ];

  const tableOptions: { value: TableType | 'unified'; label: string; description: string }[] = [
    { value: 'contacts', label: 'Contacts', description: 'Manage contact records' },
    { value: 'opportunities', label: 'Opportunities', description: 'Track sales opportunities' },
    { value: 'organizations', label: 'Organizations', description: 'Manage organizations' },
    { value: 'tasks', label: 'Tasks', description: 'Track tasks and to-dos' },
    { value: 'unified', label: 'All Records', description: 'View all record types' },
  ];

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <TooltipProvider>
      <header 
        className="border-b border-border bg-background"
        role="banner"
      >
        <div className="h-16 flex items-center justify-between px-4 gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <GridlexLogo />
            
            <Separator orientation="vertical" className="h-6" aria-hidden="true" />
            
            <div className="flex flex-col">
              <label htmlFor="table-select" className="sr-only">
                Select data table
              </label>
              <Select 
                value={currentTable} 
                onValueChange={(v) => setCurrentTable(v as TableType | 'unified')}
              >
                <SelectTrigger 
                  id="table-select"
                  className="w-[180px] h-10 border-0 bg-transparent font-semibold text-base hover:bg-muted/50 transition-default focus:ring-2 focus:ring-ring"
                  aria-label={`Current table: ${tableOptions.find(t => t.value === currentTable)?.label}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tableOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="py-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Center section - View tabs */}
          <nav aria-label="View type navigation" className="hidden md:block">
            <Tabs 
              value={currentView} 
              onValueChange={(v) => setCurrentView(v as ViewType)}
            >
              <TabsList className="bg-muted/50 p-1" aria-label="Select view type">
                {viewOptions.map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value={option.value}
                        className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 min-h-[44px]"
                        aria-label={option.description}
                      >
                        {option.icon}
                        <span className="hidden lg:inline">{option.label}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{option.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keyboard: ⌘{viewOptions.indexOf(option) + 1}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </Tabs>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" role="search">
              <label htmlFor="global-search" className="sr-only">
                Search records
              </label>
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
                aria-hidden="true" 
              />
              <Input
                ref={searchInputRef}
                id="global-search"
                type="search"
                placeholder="Search records... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] lg:w-[280px] h-10 pl-9 pr-8 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring"
                aria-describedby="search-hint"
              />
              <span id="search-hint" className="sr-only">
                Press Command K or Control K to focus search
              </span>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" aria-hidden="true" />

            {/* Filter button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2 text-muted-foreground hover:text-foreground min-w-[44px]"
                  aria-label={`Filter records${filters.length > 0 ? `, ${filters.length} active filters` : ''}`}
                  aria-expanded="false"
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Filter</span>
                  {filters.length > 0 && (
                    <Badge 
                      className="ml-1 px-1.5 py-0.5 text-xs gradient-primary border-0"
                      aria-label={`${filters.length} active filters`}
                    >
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter records</p>
                {filters.length > 0 && (
                  <p className="text-xs text-muted-foreground">{filters.length} active filter{filters.length !== 1 ? 's' : ''}</p>
                )}
              </TooltipContent>
            </Tooltip>

            {/* Settings button */}
            {currentUser.permissions.canConfigureViews && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setViewConfigOpen(true)}
                    aria-label="Configure view settings"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure view</TooltipContent>
              </Tooltip>
            )}

            {/* Export button */}
            {currentUser.permissions.canExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setExportDialogOpen(true)}
                    aria-label="Export data"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export data</TooltipContent>
              </Tooltip>
            )}

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-muted-foreground hover:text-foreground relative"
                  aria-label="Notifications, 3 unread"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  <span 
                    className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" 
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>3 unread notifications</TooltipContent>
            </Tooltip>

            {/* Create button */}
            {currentUser.permissions.canEditRecords && (
              <Button 
                size="sm" 
                className="h-10 gap-2 gradient-primary border-0 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-default min-w-[44px]" 
                onClick={openCreateDialog}
                aria-label="Create new record"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">New Record</span>
              </Button>
            )}

            <Separator orientation="vertical" className="h-6" aria-hidden="true" />

            {/* User Menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-10 px-2 hover:bg-muted/50"
                  aria-label={`User menu for ${currentUser.name}`}
                  aria-haspopup="menu"
                >
                  <div 
                    className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-white shadow-md shadow-primary/25"
                    aria-hidden="true"
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                </Button>
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