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
    { key: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" aria-hidden="true" />, color: 'text-blue-600' },
    { key: 'opportunities', label: 'Opportunities', icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />, color: 'text-emerald-600' },
    { key: 'organizations', label: 'Organizations', icon: <Building2 className="h-4 w-4" aria-hidden="true" />, color: 'text-violet-600' },
    { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" aria-hidden="true" />, color: 'text-amber-600' },
  ];

  const savedViewsForTable = viewConfigs.filter(
    v => v.tableType === currentTable || v.tableType === 'unified'
  );

  const getViewIcon = (type: string) => {
    switch (type) {
      case 'list': return <List className="h-4 w-4" aria-hidden="true" />;
      case 'kanban': return <LayoutGrid className="h-4 w-4" aria-hidden="true" />;
      case 'calendar': return <Calendar className="h-4 w-4" aria-hidden="true" />;
      case 'map': return <Map className="h-4 w-4" aria-hidden="true" />;
      default: return <List className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <aside 
      className="w-64 flex flex-col h-full bg-sidebar border-r border-sidebar-border"
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Quick Actions */}
          <div 
            className="p-3 mb-2 rounded-lg gradient-primary-subtle border border-primary/10"
            role="region"
            aria-label="Quick actions"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-primary">Quick Actions</span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-background rounded border shrink-0" aria-label="Command K">⌘K</kbd>
              <span>search</span>
              <span className="text-muted-foreground/50" aria-hidden="true">•</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-background rounded border shrink-0" aria-label="Question mark">?</kbd>
              <span>shortcuts</span>
            </div>
          </div>

          {/* Tables Section */}
          <nav aria-label="Data tables">
            <Collapsible open={tablesOpen} onOpenChange={setTablesOpen}>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-micro min-h-[44px]"
                aria-expanded={tablesOpen}
                aria-controls="tables-content"
              >
                <span>Tables</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${tablesOpen ? '' : '-rotate-90'}`} 
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent id="tables-content" className="space-y-0.5 mt-1">
                <ul role="list" className="space-y-0.5">
                  {tableItems.map((item) => (
                    <li key={item.key}>
                      <Button
                        variant={currentTable === item.key ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-3 h-11 ${
                          currentTable === item.key 
                            ? 'bg-primary/10 text-primary border-2 border-primary/20' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setCurrentTable(item.key)}
                        aria-current={currentTable === item.key ? 'page' : undefined}
                        aria-label={`View ${item.label} table`}
                      >
                        <span className={currentTable === item.key ? 'text-primary' : item.color}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </nav>

          <Separator className="my-3" aria-hidden="true" />

          {/* Saved Views Section */}
          <nav aria-label="Saved views">
            <Collapsible open={viewsOpen} onOpenChange={setViewsOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger 
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-micro min-h-[44px]"
                  aria-expanded={viewsOpen}
                  aria-controls="views-content"
                >
                  <span>Saved Views</span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${viewsOpen ? '' : '-rotate-90'}`} 
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                {currentUser.permissions.canConfigureViews && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Create new saved view"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  </Button>
                )}
              </div>
              <CollapsibleContent id="views-content" className="space-y-0.5 mt-1">
                <ul role="list" className="space-y-0.5">
                  {savedViewsForTable.map((view) => (
                    <li key={view.id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground hover:bg-primary/5"
                        onClick={() => {
                          setActiveViewConfig(view);
                          setCurrentView(view.type);
                        }}
                        aria-label={`${view.name} view${view.isDefault ? ', default view' : ''}`}
                      >
                        {getViewIcon(view.type)}
                        <span className="flex-1 text-left truncate">{view.name}</span>
                        {view.isDefault && (
                          <Bookmark 
                            className="h-3 w-3 text-primary fill-primary" 
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </nav>

          <Separator className="my-3" aria-hidden="true" />

          {/* Filters Section */}
          <section aria-label="Filters">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger 
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-micro min-h-[44px]"
                  aria-expanded={filtersOpen}
                  aria-controls="filters-content"
                >
                  <span>Filters</span>
                  {filters.length > 0 && (
                    <Badge 
                      className="h-5 px-1.5 text-[10px] gradient-primary border-0"
                      aria-label={`${filters.length} active filters`}
                    >
                      {filters.length}
                    </Badge>
                  )}
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${filtersOpen ? '' : '-rotate-90'}`} 
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                {filters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    aria-label="Clear all filters"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <CollapsibleContent id="filters-content" className="mt-1">
                {/* Active Filters */}
                {filters.length > 0 && (
                  <ul 
                    className="space-y-1.5 mb-3" 
                    role="list" 
                    aria-label="Active filters"
                  >
                    {filters.map((filter, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs bg-primary/5 border-2 border-primary/10 rounded-md group"
                      >
                        <Filter className="h-3 w-3 text-primary flex-shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">
                          <span className="font-medium text-primary">{filter.field}</span>
                          <span className="text-muted-foreground"> {filter.operator} </span>
                          <span className="font-medium">"{filter.value}"</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-micro hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeFilter(index)}
                          aria-label={`Remove filter: ${filter.field} ${filter.operator} ${filter.value}`}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add Filter */}
                {!showFilterForm ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-11 text-muted-foreground hover:text-primary hover:bg-primary/5"
                    onClick={() => setShowFilterForm(true)}
                    aria-label="Add new filter"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add filter</span>
                  </Button>
                ) : (
                  <form 
                    className="space-y-3 p-3 bg-background border-2 border-border rounded-lg shadow-sm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddFilter();
                    }}
                    aria-label="Add filter form"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="filter-field" className="text-xs">Field</Label>
                      <Select value={newFilterField} onValueChange={setNewFilterField}>
                        <SelectTrigger id="filter-field" className="h-11">
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
                      <Label htmlFor="filter-operator" className="text-xs">Condition</Label>
                      <Select value={newFilterOperator} onValueChange={(v) => setNewFilterOperator(v as FilterType['operator'])}>
                        <SelectTrigger id="filter-operator" className="h-11">
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
                      <Label htmlFor="filter-value" className="text-xs">Value</Label>
                      <Input
                        id="filter-value"
                        placeholder="Enter value"
                        value={newFilterValue}
                        onChange={(e) => setNewFilterValue(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={() => setShowFilterForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="flex-1 h-11 gradient-primary border-0"
                        disabled={!newFilterField || !newFilterValue}
                      >
                        Apply
                      </Button>
                    </div>
                  </form>
                )}
              </CollapsibleContent>
            </Collapsible>
          </section>
        </div>
      </ScrollArea>
      
      {/* Sidebar Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center">
          <span className="text-gradient-primary font-medium">Gridlex</span> CRM v1.0
        </div>
      </div>
    </aside>
  );
}