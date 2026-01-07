"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  BookmarkCheck,
  Filter,
  Sparkles,
  Lock,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Save,
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Filter as FilterType, TableType, ViewType, ViewConfig } from '@/types';
import { getViewAvailability, getAvailableViews } from '@/lib/view-availability';
import { SaveViewDialog } from '@/components/dialogs/SaveViewDialog';
import { toast } from 'sonner';
import { quickSpring, springTransition } from '@/lib/animations';

const listItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const filterBadgeVariants = {
  initial: { opacity: 0, scale: 0.8, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 5 },
};

export function Sidebar() {
  const {
    currentUser,
    currentTable,
    currentView,
    viewConfigs,
    activeViewConfig,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    setActiveViewConfig,
    setCurrentTable,
    setCurrentView,
    setFilters,
    deleteViewConfig,
    duplicateViewConfig,
    setViewAsDefault,
  } = useApp();

  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterType['operator']>('contains');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(true);
  const [viewsOpen, setViewsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<ViewConfig | null>(null);

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

  const myViews = savedViewsForTable.filter(v => v.savedBy === currentUser.id);
  const sharedViews = savedViewsForTable.filter(v => v.savedBy !== currentUser.id && v.isShared);

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

  const handleViewClick = (view: ViewConfig) => {
    const availability = getViewAvailability(currentTable, view.type);
    if (!availability.available) {
      toast.error(`${viewTypeLabels[view.type]} view is not available for ${currentTable}`);
      return;
    }
    
    setActiveViewConfig(view);
    setCurrentView(view.type);
    if (view.filters && view.filters.length > 0) {
      setFilters(view.filters);
    }
    toast.success(`Switched to "${view.name}"`);
  };

  const handleEditView = (view: ViewConfig) => {
    setEditingView(view);
    setSaveDialogOpen(true);
  };

  const handleDuplicateView = (view: ViewConfig) => {
    duplicateViewConfig(view.id);
    toast.success('View duplicated');
  };

  const handleDeleteView = (view: ViewConfig) => {
    if (view.isDefault) {
      toast.error('Cannot delete the default view');
      return;
    }
    deleteViewConfig(view.id);
    toast.success('View deleted');
  };

  const handleSetDefault = (view: ViewConfig) => {
    setViewAsDefault(view.id);
    toast.success(`"${view.name}" set as default`);
  };

  const handleCloseDialog = () => {
    setSaveDialogOpen(false);
    setEditingView(null);
  };

  const renderViewItem = (view: ViewConfig, showOwner = false, index = 0) => {
    const isActive = activeViewConfig?.id === view.id;
    const availability = getViewAvailability(currentTable, view.type);
    const isAvailable = availability.available;
    const isOwner = view.savedBy === currentUser.id;

    return (
      <motion.div
        key={view.id}
        variants={listItemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ ...quickSpring, delay: index * 0.03 }}
        layout
        className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-[#1BA9C4]/10 border border-[#1BA9C4]/30' 
            : isAvailable 
              ? 'hover:bg-muted/50 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => isAvailable && handleViewClick(view)}
        whileHover={isAvailable ? { x: 2 } : undefined}
        whileTap={isAvailable ? { scale: 0.98 } : undefined}
      >
        <motion.div 
          className={`flex-shrink-0 ${isActive ? 'text-[#1BA9C4]' : 'text-muted-foreground'}`}
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={quickSpring}
        >
          {getViewIcon(view.type)}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium truncate ${isActive ? 'text-[#003B5C]' : ''}`}>
              {view.name}
            </span>
            {view.isDefault && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={quickSpring}
              >
                <BookmarkCheck className="h-3 w-3 text-[#1BA9C4] flex-shrink-0" />
              </motion.div>
            )}
          </div>
          {showOwner && !isOwner && (
            <p className="text-xs text-muted-foreground truncate">
              Shared view
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {view.filters && view.filters.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  <Filter className="h-3 w-3 mr-0.5" />
                  {view.filters.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{view.filters.length} saved filter(s)</TooltipContent>
            </Tooltip>
          )}

          {isOwner && currentUser.permissions.canConfigureViews && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditView(view); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateView(view); }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {!view.isDefault && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSetDefault(view); }}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                {!view.isDefault && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDeleteView(view); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <aside className="w-64 flex flex-col h-full bg-sidebar border-r border-sidebar-border">
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {/* Quick Actions */}
            <motion.div 
              className="p-3 mb-2 rounded-lg bg-[#EBF5FA] border border-[#1BA9C4]/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
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
            </motion.div>

            {/* Tables Section */}
            <Collapsible open={tablesOpen} onOpenChange={setTablesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                <span>Tables</span>
                <motion.div
                  animate={{ rotate: tablesOpen ? 0 : -90 }}
                  transition={quickSpring}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-1">
                <AnimatePresence>
                  {tableItems.map((item, index) => {
                    const itemAvailableViews = getAvailableViews(item.key);
                    
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger asChild>
                          <motion.div
                            variants={listItemVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ ...quickSpring, delay: index * 0.03 }}
                          >
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
                              <motion.span 
                                className={currentTable === item.key ? 'text-[#1BA9C4]' : item.color}
                                animate={{ scale: currentTable === item.key ? 1.1 : 1 }}
                                transition={quickSpring}
                              >
                                {item.icon}
                              </motion.span>
                              <span className="flex-1 text-left">{item.label}</span>
                              <div className="flex items-center gap-0.5">
                                {(['list', 'kanban', 'calendar', 'map'] as ViewType[]).map((viewType) => {
                                  const isAvailable = itemAvailableViews.includes(viewType);
                                  return (
                                    <motion.div
                                      key={viewType}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isAvailable 
                                          ? 'bg-[#1BA9C4]' 
                                          : 'bg-muted-foreground/20'
                                      }`}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 + index * 0.02 }}
                                    />
                                  );
                                })}
                              </div>
                            </Button>
                          </motion.div>
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
                </AnimatePresence>
                
                {/* Unified/All Records */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ ...quickSpring, delay: 0.15 }}
                    >
                      <Button
                        variant={currentTable === 'unified' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-3 h-9 ${
                          currentTable === 'unified' 
                            ? 'bg-[#1BA9C4]/10 text-[#003B5C] border border-[#1BA9C4]/20' 
                            : 'text-muted-foreground hover:text-[#003B5C]'
                        }`}
                        onClick={() => setCurrentTable('unified')}
                      >
                        <motion.span 
                          className={currentTable === 'unified' ? 'text-[#1BA9C4]' : 'text-[#003B5C]'}
                          animate={{ scale: currentTable === 'unified' ? 1.1 : 1 }}
                          transition={quickSpring}
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </motion.span>
                        <span className="flex-1 text-left">All Records</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4].map((i) => (
                            <motion.div 
                              key={i} 
                              className="w-1.5 h-1.5 rounded-full bg-[#1BA9C4]"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.02 }}
                            />
                          ))}
                        </div>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium mb-1">All Records</p>
                    <p className="text-xs text-muted-foreground">
                      All views available
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* Saved Views Section */}
            <Collapsible open={viewsOpen} onOpenChange={setViewsOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                  <span>Saved Views</span>
                  <AnimatePresence mode="wait">
                    {savedViewsForTable.length > 0 && (
                      <motion.div
                        key={savedViewsForTable.length}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={quickSpring}
                      >
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          {savedViewsForTable.length}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={{ rotate: viewsOpen ? 0 : -90 }}
                    transition={quickSpring}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </CollapsibleTrigger>
                {currentUser.permissions.canConfigureViews && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-[#1BA9C4]/10 hover:text-[#1BA9C4]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingView(null);
                            setSaveDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Save current view</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <CollapsibleContent className="mt-1 space-y-3">
                {/* My Views */}
                {myViews.length > 0 && (
                  <div>
                    <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      My Views
                    </p>
                    <div className="space-y-0.5">
                      <AnimatePresence>
                        {myViews.map((view, index) => renderViewItem(view, false, index))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Shared Views */}
                {sharedViews.length > 0 && (
                  <div>
                    <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Shared with Me
                    </p>
                    <div className="space-y-0.5">
                      <AnimatePresence>
                        {sharedViews.map((view, index) => renderViewItem(view, true, index))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {savedViewsForTable.length === 0 && (
                  <motion.div 
                    className="text-center py-4 px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Bookmark className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No saved views</p>
                    {currentUser.permissions.canConfigureViews && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 text-xs text-[#1BA9C4] hover:text-[#1BA9C4] hover:bg-[#1BA9C4]/10"
                        onClick={() => setSaveDialogOpen(true)}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save Current View
                      </Button>
                    )}
                  </motion.div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-3" />

            {/* Filters Section */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <div className="flex items-center justify-between w-full px-2 py-1.5">
                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-[#003B5C] transition-micro">
                  <span>Filters</span>
                  <AnimatePresence mode="wait">
                    {filters.length > 0 && (
                      <motion.div
                        key={filters.length}
                        variants={filterBadgeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={quickSpring}
                      >
                        <Badge className="h-5 px-1.5 text-[10px] bg-[#1BA9C4] hover:bg-[#1BA9C4]/90 border-0">
                          {filters.length}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={{ rotate: filtersOpen ? 0 : -90 }}
                    transition={quickSpring}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </CollapsibleTrigger>
                <AnimatePresence>
                  {filters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={quickSpring}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <CollapsibleContent className="mt-1">
                {/* Active Filters */}
                <AnimatePresence>
                  {filters.length > 0 && (
                    <motion.div 
                      className="space-y-1.5 mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {filters.map((filter, index) => (
                        <motion.div
                          key={`${filter.field}-${filter.value}-${index}`}
                          variants={filterBadgeVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ ...quickSpring, delay: index * 0.03 }}
                          layout
                          className="flex items-center gap-2 px-2 py-1.5 text-xs bg-[#1BA9C4]/5 border border-[#1BA9C4]/10 rounded-md group"
                        >
                          <Filter className="h-3 w-3 text-[#1BA9C4] flex-shrink-0" />
                          <span className="flex-1 truncate">
                            <span className="font-medium text-[#1BA9C4]">{filter.field}</span>
                            <span className="text-muted-foreground"> {filter.operator} </span>
                            <span className="font-medium">"{filter.value}"</span>
                          </span>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeFilter(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add Filter */}
                <AnimatePresence mode="wait">
                  {!showFilterForm ? (
                    <motion.div
                      key="add-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={quickSpring}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-[#1BA9C4] hover:bg-[#1BA9C4]/5"
                        onClick={() => setShowFilterForm(true)}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add filter</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="filter-form"
                      className="space-y-3 p-3 bg-background border border-border rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={springTransition}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
        
        {/* Sidebar Footer */}
        <motion.div 
          className="p-3 border-t border-sidebar-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-medium"><span className="text-[#003B5C]">Grid</span><span className="text-[#1BA9C4]">lex</span></span> CRM v1.0
          </div>
        </motion.div>

        {/* Save View Dialog */}
        <SaveViewDialog 
          open={saveDialogOpen} 
          onClose={handleCloseDialog}
          editingView={editingView}
        />
      </aside>
    </TooltipProvider>
  );
}