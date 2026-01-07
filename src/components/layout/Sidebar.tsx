"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  Filter,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Filter as FilterType } from '@/types';

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
  } = useApp();

  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterType['operator']>('contains');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [showFilterForm, setShowFilterForm] = useState(false);

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

  const savedViewsForTable = viewConfigs.filter(
    v => v.tableType === currentTable || v.tableType === 'unified'
  );

  const getViewIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 };
    switch (type) {
      case 'list': return <List {...iconProps} />;
      case 'kanban': return <LayoutGrid {...iconProps} />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'map': return <Map {...iconProps} />;
      default: return <List {...iconProps} />;
    }
  };

  return (
    <aside className="w-56 flex flex-col h-full bg-sidebar border-r border-border/30">
      <ScrollArea className="flex-1">
        <div className="py-4">
          {/* Views Section */}
          <div className="px-3 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Views
              </span>
            </div>
            <div className="space-y-0.5">
              {savedViewsForTable.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveViewConfig(view)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-micro group"
                >
                  <span className="text-muted-foreground/70 group-hover:text-muted-foreground">
                    {getViewIcon(view.type)}
                  </span>
                  <span className="flex-1 text-left truncate">{view.name}</span>
                  {view.isDefault && (
                    <span className="text-[10px] text-muted-foreground/50">Default</span>
                  )}
                </button>
              ))}
              {currentUser.permissions.canConfigureViews && (
                <button className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50 rounded-md transition-micro">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  <span>New view</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Filters
              </span>
              {filters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-micro"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="space-y-1 mb-3">
                {filters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs bg-accent/50 rounded-md group"
                  >
                    <span className="flex-1 truncate text-muted-foreground">
                      <span className="text-foreground font-medium">{filter.field}</span>
                      {' '}{filter.operator}{' '}
                      <span className="text-foreground">"{filter.value}"</span>
                    </span>
                    <button
                      onClick={() => removeFilter(index)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-micro"
                    >
                      <X className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Filter */}
            {!showFilterForm ? (
              <button
                onClick={() => setShowFilterForm(true)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50 rounded-md transition-micro"
              >
                <Filter className="h-4 w-4" strokeWidth={1.5} />
                <span>Add filter</span>
              </button>
            ) : (
              <div className="space-y-2 p-2 bg-accent/30 rounded-md">
                <Select value={newFilterField} onValueChange={setNewFilterField}>
                  <SelectTrigger className="h-7 text-xs border-0 bg-background">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableFields.map((field) => (
                      <SelectItem key={field.key} value={field.key} className="text-xs">
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={newFilterOperator} onValueChange={(v) => setNewFilterOperator(v as FilterType['operator'])}>
                  <SelectTrigger className="h-7 text-xs border-0 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals" className="text-xs">equals</SelectItem>
                    <SelectItem value="contains" className="text-xs">contains</SelectItem>
                    <SelectItem value="gt" className="text-xs">greater than</SelectItem>
                    <SelectItem value="lt" className="text-xs">less than</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  className="h-7 text-xs border-0 bg-background"
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-7 text-xs"
                    onClick={() => setShowFilterForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleAddFilter}
                    disabled={!newFilterField || !newFilterValue}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}