"use client";

import React, { useState, useEffect } from 'react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus,
  Settings,
  Filter,
  Download,
  X,
  Bell,
  Command,
} from 'lucide-react';
import { TableType } from '@/types';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { ViewConfigDialog } from '@/components/dialogs/ViewConfigDialog';
import { GridlexLogo } from '@/components/GridlexLogo';
import { getFirstAvailableView } from '@/lib/view-availability';

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

  // When table changes, check if current view is still available
  useEffect(() => {
    const availableView = getFirstAvailableView(currentTable, currentView);
    if (availableView !== currentView) {
      setCurrentView(availableView);
    }
  }, [currentTable, currentView, setCurrentView]);

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

          {/* Center section - Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-20 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-[#1BA9C4]/50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                ) : (
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <Command className="h-3 w-3" />K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-[#003B5C]">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {filters.length > 0 && (
                    <Badge className="ml-1 px-1.5 py-0.5 text-xs bg-[#1BA9C4] hover:bg-[#1BA9C4]/90 border-0">
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
                    className="h-9 w-9 text-muted-foreground hover:text-[#003B5C]"
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
                    className="h-9 w-9 text-muted-foreground hover:text-[#003B5C]"
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
                  className="h-9 w-9 text-muted-foreground hover:text-[#003B5C] relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1BA9C4] rounded-full" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {currentUser.permissions.canEditRecords && (
              <Button 
                size="sm" 
                className="h-9 gap-2 bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25 hover:shadow-lg hover:shadow-[#003B5C]/30 transition-all" 
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Record</span>
              </Button>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* User Menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-[#003B5C] flex items-center justify-center text-xs font-semibold text-white shadow-md shadow-[#003B5C]/25">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium leading-none text-[#003B5C]">{currentUser.name}</p>
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