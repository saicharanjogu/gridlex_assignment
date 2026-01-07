"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Plus, 
  X, 
  Save, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  Bookmark
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Filter } from '@/types';

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
  const [newFilterOperator, setNewFilterOperator] = useState<Filter['operator']>('contains');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(true);

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
    }
  };

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
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Saved Views Section */}
          <Collapsible open={isSavedViewsOpen} onOpenChange={setIsSavedViewsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <span className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved Views
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSavedViewsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {savedViewsForTable.length > 0 ? (
                savedViewsForTable.map((view) => (
                  <Button
                    key={view.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => setActiveViewConfig(view)}
                  >
                    {getViewIcon(view.type)}
                    <span className="truncate">{view.name}</span>
                    {view.isDefault && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Default
                      </Badge>
                    )}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-2">No saved views</p>
              )}
              {currentUser.permissions.canConfigureViews && (
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                  <Plus className="h-4 w-4" />
                  Save Current View
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Filters Section */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <span className="flex items-center gap-2">
                  <span>Filters</span>
                  {filters.length > 0 && (
                    <Badge variant="secondary">{filters.length}</Badge>
                  )}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2">
              {/* Active Filters */}
              {filters.length > 0 && (
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-background rounded-md text-sm"
                    >
                      <span className="flex-1 truncate">
                        {filter.field} {filter.operator} "{filter.value}"
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFilter(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Add New Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Add Filter</Label>
                <Select value={newFilterField} onValueChange={setNewFilterField}>
                  <SelectTrigger className="h-8 text-sm">
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

                <Select value={newFilterOperator} onValueChange={(v) => setNewFilterOperator(v as Filter['operator'])}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="gt">Greater than</SelectItem>
                    <SelectItem value="lt">Less than</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  className="h-8 text-sm"
                />

                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddFilter}
                  disabled={!newFilterField || !newFilterValue}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </aside>
  );
}