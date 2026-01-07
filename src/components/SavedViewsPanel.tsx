"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Bookmark,
  BookmarkCheck,
  Filter,
  Lock,
  Users,
  Globe,
  Check,
} from 'lucide-react';
import { ViewConfig, ViewType } from '@/types';
import { SaveViewDialog } from '@/components/dialogs/SaveViewDialog';
import { toast } from 'sonner';
import { getViewAvailability } from '@/lib/view-availability';

export function SavedViewsPanel() {
  const {
    currentUser,
    currentTable,
    currentView,
    viewConfigs,
    activeViewConfig,
    setActiveViewConfig,
    setCurrentView,
    deleteViewConfig,
    duplicateViewConfig,
    setViewAsDefault,
  } = useApp();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<ViewConfig | null>(null);

  const savedViewsForTable = viewConfigs.filter(
    v => v.tableType === currentTable || v.tableType === 'unified'
  );

  const myViews = savedViewsForTable.filter(v => v.savedBy === currentUser.id);
  const sharedViews = savedViewsForTable.filter(v => v.savedBy !== currentUser.id && v.isShared);

  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'list': return <List className="h-4 w-4" />;
      case 'kanban': return <LayoutGrid className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'map': return <Map className="h-4 w-4" />;
    }
  };

  const getShareIcon = (view: ViewConfig) => {
    if (!view.isShared) return <Lock className="h-3 w-3" />;
    if (view.shareMode === 'team') return <Users className="h-3 w-3" />;
    return <Globe className="h-3 w-3" />;
  };

  const handleViewClick = (view: ViewConfig) => {
    const availability = getViewAvailability(currentTable, view.type);
    if (!availability.available) {
      toast.error(`${view.type} view is not available for ${currentTable}`);
      return;
    }
    
    setActiveViewConfig(view);
    setCurrentView(view.type);
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

  const renderViewItem = (view: ViewConfig, showOwner = false) => {
    const isActive = activeViewConfig?.id === view.id;
    const availability = getViewAvailability(currentTable, view.type);
    const isAvailable = availability.available;
    const isOwner = view.savedBy === currentUser.id;

    return (
      <div
        key={view.id}
        className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
          isActive 
            ? 'bg-[#1BA9C4]/10 border border-[#1BA9C4]/30' 
            : isAvailable 
              ? 'hover:bg-muted/50' 
              : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => isAvailable && handleViewClick(view)}
      >
        <div className={`flex-shrink-0 ${isActive ? 'text-[#1BA9C4]' : 'text-muted-foreground'}`}>
          {getViewIcon(view.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium truncate ${isActive ? 'text-[#003B5C]' : ''}`}>
              {view.name}
            </span>
            {view.isDefault && (
              <BookmarkCheck className="h-3 w-3 text-[#1BA9C4] flex-shrink-0" />
            )}
          </div>
          {showOwner && !isOwner && (
            <p className="text-xs text-muted-foreground truncate">
              Shared view
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {view.filters.length > 0 && (
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
          
          <Tooltip>
            <TooltipTrigger>
              <div className="text-muted-foreground">
                {getShareIcon(view)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {!view.isShared ? 'Private' : view.shareMode === 'team' ? 'Team' : 'Public'}
            </TooltipContent>
          </Tooltip>

          {isOwner && (
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
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-sm font-semibold text-[#003B5C]">Saved Views</h3>
          {currentUser.permissions.canConfigureViews && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-[#1BA9C4]/10 hover:text-[#1BA9C4]"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current view</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Views List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {/* My Views */}
            {myViews.length > 0 && (
              <div>
                <p className="px-2 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  My Views
                </p>
                <div className="space-y-0.5">
                  {myViews.map((view) => renderViewItem(view))}
                </div>
              </div>
            )}

            {/* Shared Views */}
            {sharedViews.length > 0 && (
              <div>
                <p className="px-2 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Shared with Me
                </p>
                <div className="space-y-0.5">
                  {sharedViews.map((view) => renderViewItem(view, true))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {savedViewsForTable.length === 0 && (
              <div className="text-center py-8 px-4">
                <Bookmark className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No saved views</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your current view configuration for quick access
                </p>
                {currentUser.permissions.canConfigureViews && (
                  <Button
                    size="sm"
                    className="mt-4 bg-[#0A3E6B] hover:bg-[#003B5C] text-white"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Save View
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Save View Dialog */}
        <SaveViewDialog 
          open={saveDialogOpen} 
          onClose={handleCloseDialog}
          editingView={editingView}
        />
      </div>
    </TooltipProvider>
  );
}