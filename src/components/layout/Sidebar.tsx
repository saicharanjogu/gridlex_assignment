"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  Filter,
  Star,
  Clock,
  Users,
  Building2,
  CheckSquare,
  TrendingUp,
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

  const tableItems: { key: TableType | 'unified'; label: string; icon: React.ReactNode }[] = [
    { key: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" strokeWidth={1.5} /> },
    { key: 'opportunities', label: 'Opportunities', icon: <TrendingUp className="h-4 w-4" strokeWidth={1.5} /> },
    { key: 'organizations', label: 'Organizations', icon: <Building2 className="h-4 w-4" strokeWidth={1.5} /> },
    { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" strokeWidth={1.5} /> },
  ];

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
    <aside className="w-60 flex flex-col h-full bg-muted/30 border-r border-border">
      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Tables Section */}
          <div className="mb-6">
            <div className="px-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tables
              </span>
            </div>
            <div className="space-y-0.5">
              {tableItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentTable(item.key)}
                  className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-micro ${
                    currentTable === item.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Views Section */}
          <div className="mb-6">
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saved Views
              </span>
              {currentUser.permissions.canConfigureViews && (
                <button className="p-1 text-muted-foreground hover:text-foreground transition-micro rounded">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {savedViewsForTable.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveViewConfig(view);
                    setCurrentView(view.type);
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-micro group"
                >
                  <span className="text-muted-foreground/70 group-hover:text-muted-foreground">
                    {getViewIcon(view.type)}
                  </span>
                  <span className="flex-1 text-left truncate">{view.name}</span>
                  {view.isDefault && (
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Section */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Filters
              </span>
              {filters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-micro"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {filters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs bg-background border border-border rounded-md group"
                  >
                    <span className="flex-1 truncate">
                      <span className="font-medium">{filter.field}</span>
                      <span className="text-muted-foreground"> {filter.operator} </span>
                      <span className="font-medium">"{filter.value}"</span>
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
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-micro"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                <span>Add filter</span>
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-background border border-border rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Field</Label>
                  <Select value={newFilterField} onValueChange={setNewFilterField}>
                    <SelectTrigger className="h-8 text-sm mt-1">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableFields.map((field) => (
                        <SelectItem key={field.key} value={field.key} className="text-sm">
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Condition</Label>
                  <Select value={newFilterOperator} onValueChange={(v) => setNewFilterOperator(v as FilterType['operator'])}>
                    <SelectTrigger className="h-8 text-sm mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals" className="text-sm">equals</SelectItem>
                      <SelectItem value="contains" className="text-sm">contains</SelectItem>
                      <SelectItem value="gt" className="text-sm">greater than</SelectItem>
                      <SelectItem value="lt" className="text-sm">less than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    placeholder="Enter value"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    className="h-8 text-sm mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowFilterForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
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