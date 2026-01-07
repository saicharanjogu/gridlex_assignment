"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  X, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  CheckSquare,
  TrendingUp,
  Bookmark,
  Filter,
  Sparkles,
  Lock,
  Check,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Filter as FilterType, TableType, ViewType } from '@/types';
import { getViewAvailability, getAvailableViews } from '@/lib/view-availability';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const {
    currentUser,
    currentTable,
    viewConfigs,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    setActiveViewConfig,
    setCurrentTable,
    setCurrentView,
  } = useApp();

  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterType['operator']>('contains');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(true);
  const [viewsOpen, setViewsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const fields = getFieldsForTable(currentTable);
  const filterableFields = fields.filter(f => f.filterable);

  const handleAddFilter = () => {
    if (newFilterField && newFilterValue) {
      addFilter({
        field: newFilterField,
        operator: newFilterOperator,
        value: newFilterValue,
      });
      setNewFilterField('');
      setNewFilterValue('');
      setShowFilterForm(false);
    }
  };

  const tableItems: { key: TableType; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" />, color: 'text-[#1D78C1]' },
    { key: 'opportunities', label: 'Opportunities', icon: <TrendingUp className="h-4 w-4" />, color: 'text-[#388E3C]' },
    { key: 'organizations', label: 'Organizations', icon: <Building2 className="h-4 w-4" />, color: 'text-[#9C27B0]' },
    { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" />, color: 'text-[#FF9800]' },
  ];

  const savedViewsForTable = viewConfigs.filter(
    v => v.tableType === currentTable
  );

  const getViewIcon = (type: string) => {
    switch (type) {
      case 'list': return <List className="h-4 w-4" />;
      case 'kanban': return <LayoutGrid className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'map': return <Map className="h-4 w-4" />;
      default: return <List className="h-4 w-4" />;
    }
  };

  const availableViews = getAvailableViews(currentTable);

  const viewTypeLabels: Record<ViewType, string> = {
    list: 'Table',
    kanban: 'Board',
    calendar: 'Calendar',
    map: 'Map',
  };

  // Collapsed sidebar view
  if (collapsed) {
    return (
      <TooltipProvider>
        <aside className="w-14 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
          {/* Toggle Button */}
          <div className="p-2 border-b border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mx-auto"
                  onClick={onToggleCollapse}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {/* Tables */}
              <div className="space-y-1">
                {tableItems.map((item) => (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentTable === item.key ? 'secondary' : 'ghost'}
                        size="icon"
                        className={`w-10 h-10 ${
                          currentTable === item.key 
                            ? 'bg-[#1BA9C4]/10 text-[#003B5C] border border-[#1BA9C4]/20' 
                            : 'text-muted-foreground hover:text-[#003B5C]'
                        }`}
                        onClick={() => setCurrentTable(item.key)}
                      >
                        <span className={currentTable === item.key ? 'text-[#1BA9C4]' : item.color}>
                          {item.icon}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <Separator className="my-2" />

              {/* Views */}
              <div className="space-y-1">
                {(['list', 'kanban', 'calendar', 'map'] as ViewType[]).map((viewType) => {
                  const availability = getViewAvailability(currentTable, viewType);
                  const isAvailable = availability.available;
                  
                  return (
                    <Tooltip key={viewType}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-10 h-10 ${
                            isAvailable 
                              ? 'text-muted-foreground hover:text-[#003B5C] hover:bg-[#1BA9C4]/5' 
                              : 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                          }`}
                          onClick={() => isAvailable && setCurrentView(viewType)}
                          disabled={!isAvailable}
                        >
                          {getViewIcon(viewType)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {isAvailable ? viewTypeLabels[viewType] : `${viewTypeLabels[viewType]} - Unavailable`}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              <Separator className="my-2" />

              {/* Filters indicator */}
              {filters.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex justify-center">
                      <Filter className="h-4 w-4 text-[#1BA9C4]" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#1BA9C4] hover:bg-[#1BA9C4]/90 border-0">
                        {filters.length}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{filters.length} active filter(s)</TooltipContent>
                </Tooltip>
              )}
            </div>
          </ScrollArea>
          
          {/* Sidebar Footer */}
          <div className="p-2 border-t border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 mx-auto rounded-full bg-[#003B5C] flex items-center justify-center text-xs font-semibold text-white">
                  G
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Gridlex CRM</TooltipContent>
            </Tooltip>
          </div>
        </aside>
      </TooltipProvider>
    );
  }

  // Expanded sidebar view
  return (
    <TooltipProvider>
      <aside className="w-64 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {/* Toggle Button & Quick Actions */}
            <div className="flex items-center justify-between mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggleCollapse}
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            </div>

            {/* Quick Actions */}
            <div className="p-3 mb-2 rounded-lg bg-[#EBF5FA] border border-[#1BA9C4]/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-[#1BA9C4] flex-shrink-0" />
                <span className="text-sm font-medium text-[#003B5C]">Quick Actions</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-background rounded border shrink-0">⌘K</kbd>
                <span>search</span>
                <span className="text-muted-foreground/50">•</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-background rounded border shrink-0">?</kbd>
                <span>shortcuts</span>
              </div>
            </div>

            {/* Tables Section */}
            <Collapsible open={tablesOpen} onOpenChange={setTablesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                <span>Tables</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${tablesOpen ? '' : '-rotate-90'}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-1">
                {tableItems.map((item) => {
                  const itemAvailableViews = getAvailableViews(item.key);
                  
                  return (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentTable === item.key ? 'secondary' : 'ghost'}
                          size="sm"
                          className={`w-full justify-start gap-3 h-9 ${
                            currentTable === item.key 
                              ? 'bg-[#1BA9C4]/10 text-[#003B5C] border border-[#1BA9C4]/20' 
                              : 'text-muted-foreground hover:text-[#003B5C]'
                          }`}
                          onClick={() => setCurrentTable(item.key)}
                        >
                          <span className={currentTable === item.key ? 'text-[#1BA9C4]' : item.color}>
                            {item.icon}
                          </span>
                          <span className="flex-1 text-left">{item.label}</span>
                          {/* View availability indicators */}
                          <div className="flex items-center gap-0.5">
                            {(['list', 'kanban', 'calendar', 'map'] as ViewType[]).map((viewType) => {
                              const isAvailable = itemAvailableViews.includes(viewType);
                              return (
                                <div
                                  key={viewType}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isAvailable 
                                      ? 'bg-[#1BA9C4]' 
                                      : 'bg-muted-foreground/20'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p className="font-medium mb-1">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Available views: {itemAvailableViews.map(v => viewTypeLabels[v]).join(', ')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* Available Views for Current Table */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Available Views
              </p>
              <div className="grid grid-cols-2 gap-1">
                {(['list', 'kanban', 'calendar', 'map'] as ViewType[]).map((viewType) => {
                  const availability = getViewAvailability(currentTable, viewType);
                  const isAvailable = availability.available;
                  
                  return (
                    <Tooltip key={viewType}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 justify-start gap-2 ${
                            isAvailable 
                              ? 'text-muted-foreground hover:text-[#003B5C] hover:bg-[#1BA9C4]/5' 
                              : 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                          }`}
                          onClick={() => isAvailable && setCurrentView(viewType)}
                          disabled={!isAvailable}
                        >
                          {isAvailable ? (
                            <Check className="h-3 w-3 text-[#1BA9C4]" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          <span className="text-xs">{viewTypeLabels[viewType]}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        {isAvailable ? (
                          <p className="text-xs">Click to switch to {viewTypeLabels[viewType]} view</p>
                        ) : (
                          <div>
                            <p className="font-medium text-xs mb-1">{viewTypeLabels[viewType]} - Unavailable</p>
                            <p className="text-xs text-muted-foreground">{availability.reason}</p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Saved Views Section */}
            <Collapsible open={viewsOpen} onOpenChange={setViewsOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                  <span>Saved Views</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${viewsOpen ? '' : '-rotate-90'}`} />
                </CollapsibleTrigger>
                {currentUser.permissions.canConfigureViews && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-[#1BA9C4]/10 hover:text-[#1BA9C4]"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <CollapsibleContent className="space-y-0.5 mt-1">
                {savedViewsForTable.map((view) => {
                  const viewAvailability = getViewAvailability(currentTable, view.type);
                  const isAvailable = viewAvailability.available;
                  
                  return (
                    <Tooltip key={view.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start gap-3 h-9 ${
                            isAvailable 
                              ? 'text-muted-foreground hover:text-[#003B5C] hover:bg-[#1BA9C4]/5'
                              : 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                          }`}
                          onClick={() => {
                            if (isAvailable) {
                              setActiveViewConfig(view);
                              setCurrentView(view.type);
                            }
                          }}
                          disabled={!isAvailable}
                        >
                          <span className={!isAvailable ? 'opacity-40' : ''}>
                            {getViewIcon(view.type)}
                          </span>
                          <span className="flex-1 text-left truncate">{view.name}</span>
                          {!isAvailable && <Lock className="h-3 w-3" />}
                          {view.isDefault && isAvailable && (
                            <Bookmark className="h-3 w-3 text-[#1BA9C4] fill-[#1BA9C4]" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      {!isAvailable && (
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="font-medium text-xs mb-1">View Unavailable</p>
                          <p className="text-xs text-muted-foreground">{viewAvailability.reason}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* Filters Section */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                  <span>Filters</span>
                  {filters.length > 0 && (
                    <Badge className="h-5 px-1.5 text-[10px] bg-[#1BA9C4] hover:bg-[#1BA9C4]/90 border-0">
                      {filters.length}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? '' : '-rotate-90'}`} />
                </CollapsibleTrigger>
                {filters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <CollapsibleContent className="mt-1">
                {/* Active Filters */}
                {filters.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {filters.map((filter, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs bg-[#1BA9C4]/5 border border-[#1BA9C4]/10 rounded-md group"
                      >
                        <Filter className="h-3 w-3 text-[#1BA9C4] flex-shrink-0" />
                        <span className="flex-1 truncate">
                          <span className="font-medium text-[#1BA9C4]">{filter.field}</span>
                          <span className="text-muted-foreground"> {filter.operator} </span>
                          <span className="font-medium">"{filter.value}"</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-micro hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeFilter(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Filter */}
                {!showFilterForm ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-[#1BA9C4] hover:bg-[#1BA9C4]/5"
                    onClick={() => setShowFilterForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add filter</span>
                  </Button>
                ) : (
                  <div className="space-y-3 p-3 bg-background border border-border rounded-lg shadow-sm">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Field</Label>
                      <Select value={newFilterField} onValueChange={setNewFilterField}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterableFields.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Condition</Label>
                      <Select value={newFilterOperator} onValueChange={(v) => setNewFilterOperator(v as FilterType['operator'])}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="gt">greater than</SelectItem>
                          <SelectItem value="lt">less than</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="Enter value"
                        value={newFilterValue}
                        onChange={(e) => setNewFilterValue(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8"
                        onClick={() => setShowFilterForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-8 bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0"
                        onClick={handleAddFilter}
                        disabled={!newFilterField || !newFilterValue}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
        
        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium"><span className="text-[#003B5C]">Grid</span><span className="text-[#1BA9C4]">lex</span></span> CRM v1.0
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}