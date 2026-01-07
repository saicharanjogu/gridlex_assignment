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
  Plus, 
  X, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  ChevronDown,
  Users,
  Building2,
  CheckSquare,
  TrendingUp,
  Bookmark,
  Filter,
  Sparkles,
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Filter as FilterType, TableType } from '@/types';

export function Sidebar() {
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

  const fields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
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
    v => v.tableType === currentTable || v.tableType === 'unified'
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

  return (
    <aside className="w-64 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
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
              {tableItems.map((item) => (
                <Button
                  key={item.key}
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
                  <span>{item.label}</span>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

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
              {savedViewsForTable.map((view) => (
                <Button
                  key={view.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-[#003B5C] hover:bg-[#1BA9C4]/5"
                  onClick={() => {
                    setActiveViewConfig(view);
                    setCurrentView(view.type);
                  }}
                >
                  {getViewIcon(view.type)}
                  <span className="flex-1 text-left truncate">{view.name}</span>
                  {view.isDefault && (
                    <Bookmark className="h-3 w-3 text-[#1BA9C4] fill-[#1BA9C4]" />
                  )}
                </Button>
              ))}
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
  );
}