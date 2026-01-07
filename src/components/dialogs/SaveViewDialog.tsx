"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  List, 
  LayoutGrid, 
  Calendar, 
  Map,
  Lock,
  Users,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { ViewConfig, ViewType } from '@/types';

interface SaveViewDialogProps {
  open: boolean;
  onClose: () => void;
  editingView?: ViewConfig | null;
}

type ShareMode = 'private' | 'team' | 'public';

export function SaveViewDialog({ open, onClose, editingView }: SaveViewDialogProps) {
  const { 
    currentTable, 
    currentView, 
    currentUser,
    filters,
    saveViewConfig,
    deleteViewConfig,
  } = useApp();

  const [viewName, setViewName] = useState('');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [shareMode, setShareMode] = useState<ShareMode>('private');
  const [isDefault, setIsDefault] = useState(false);
  const [includeFilters, setIncludeFilters] = useState(true);

  useEffect(() => {
    if (open) {
      if (editingView) {
        setViewName(editingView.name);
        setViewType(editingView.type);
        setIsDefault(editingView.isDefault);
        setIncludeFilters(editingView.filters.length > 0);
      } else {
        setViewName('');
        setViewType(currentView);
        setIsDefault(false);
        setIncludeFilters(filters.length > 0);
      }
    }
  }, [open, editingView, currentView, filters]);

  const handleSave = () => {
    if (!viewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    const config: ViewConfig = {
      id: editingView?.id || Math.random().toString(36).substr(2, 9),
      name: viewName.trim(),
      type: viewType,
      tableType: currentTable === 'unified' ? 'unified' : currentTable,
      visibleFields: editingView?.visibleFields || [],
      filters: includeFilters ? filters : [],
      savedBy: currentUser.id,
      isDefault,
      isShared: shareMode !== 'private',
      shareMode,
    };
    
    saveViewConfig(config);
    toast.success(editingView ? 'View updated' : 'View saved');
    onClose();
  };

  const handleDelete = () => {
    if (editingView) {
      deleteViewConfig(editingView.id);
      toast.success('View deleted');
      onClose();
    }
  };

  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'list': return <List className="h-4 w-4" />;
      case 'kanban': return <LayoutGrid className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'map': return <Map className="h-4 w-4" />;
    }
  };

  const shareModeOptions = [
    { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can see this view' },
    { value: 'team', label: 'Team', icon: Users, desc: 'Share with your team members' },
    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone in the organization can see' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003B5C]">
            <Save className="h-5 w-5" />
            {editingView ? 'Edit View' : 'Save View'}
          </DialogTitle>
          <DialogDescription>
            {editingView 
              ? 'Update your saved view settings.'
              : 'Save your current view configuration for quick access later.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* View Name */}
          <div className="space-y-2">
            <Label htmlFor="viewName">View Name</Label>
            <Input
              id="viewName"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="e.g., My Active Contacts"
              autoFocus
            />
          </div>

          {/* View Type */}
          <div className="space-y-2">
            <Label>View Type</Label>
            <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Table View
                  </div>
                </SelectItem>
                <SelectItem value="kanban">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Board View
                  </div>
                </SelectItem>
                <SelectItem value="calendar">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </div>
                </SelectItem>
                <SelectItem value="map">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Filters */}
          {filters.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Include Current Filters</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filters.length} active filter{filters.length > 1 ? 's' : ''}
                </p>
              </div>
              <Switch checked={includeFilters} onCheckedChange={setIncludeFilters} />
            </div>
          )}

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <div className="space-y-2">
              {shareModeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    shareMode === option.value 
                      ? 'border-[#1BA9C4] bg-[#EBF5FA]' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setShareMode(option.value as ShareMode)}
                >
                  <option.icon className={`h-4 w-4 ${shareMode === option.value ? 'text-[#1BA9C4]' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    shareMode === option.value 
                      ? 'border-[#1BA9C4] bg-[#1BA9C4]' 
                      : 'border-muted-foreground'
                  }`}>
                    {shareMode === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Set as Default */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Set as Default View</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                This view will load automatically for {currentTable}
              </p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {editingView && !editingView.isDefault && (
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Delete View
            </Button>
          )}
          {!editingView && <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={!viewName.trim()}
              className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {editingView ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}