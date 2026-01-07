"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Save, 
  Share2, 
  Copy, 
  Trash2,
  Settings,
  Columns,
  Filter,
  SortAsc,
  Lock,
  Users,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { ViewConfig, FieldConfig, ViewType } from '@/types';
import { getFieldsForTable } from '@/data/mock-data';

interface ViewConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FieldVisibility extends FieldConfig {
  visible: boolean;
  order: number;
}

export function ViewConfigDialog({ open, onClose }: ViewConfigDialogProps) {
  const { 
    currentTable, 
    currentView, 
    currentUser,
    saveViewConfig,
    activeViewConfig,
  } = useApp();

  const [viewName, setViewName] = useState('');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [fields, setFields] = useState<FieldVisibility[]>([]);
  const [defaultSort, setDefaultSort] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [shareMode, setShareMode] = useState<'private' | 'team' | 'public'>('private');
  const [isDefault, setIsDefault] = useState(false);
  const [draggedField, setDraggedField] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      const tableFields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
      setFields(tableFields.map((f, i) => ({ ...f, visible: f.visible, order: i })));
      setViewType(currentView);
      setViewName(activeViewConfig?.name || `New ${currentView} View`);
      setDefaultSort(activeViewConfig?.sortBy || '');
      setSortOrder(activeViewConfig?.sortOrder || 'asc');
      setIsDefault(activeViewConfig?.isDefault || false);
    }
  }, [open, currentTable, currentView, activeViewConfig]);

  const handleFieldVisibilityToggle = (index: number) => {
    setFields(prev => prev.map((f, i) => 
      i === index ? { ...f, visible: !f.visible } : f
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedField(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedField === null || draggedField === index) return;
    
    const newFields = [...fields];
    const draggedItem = newFields[draggedField];
    newFields.splice(draggedField, 1);
    newFields.splice(index, 0, draggedItem);
    
    setFields(newFields.map((f, i) => ({ ...f, order: i })));
    setDraggedField(index);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleSave = () => {
    const config: ViewConfig = {
      id: activeViewConfig?.id || Math.random().toString(36).substr(2, 9),
      name: viewName,
      type: viewType,
      tableType: currentTable === 'unified' ? 'unified' : currentTable,
      visibleFields: fields.filter(f => f.visible).map(f => f.key),
      sortBy: defaultSort || undefined,
      sortOrder: sortOrder,
      filters: [],
      savedBy: currentUser.id,
      isDefault,
    };
    
    saveViewConfig(config);
    toast.success('View configuration saved');
    onClose();
  };

  const handleDuplicate = () => {
    setViewName(`${viewName} (Copy)`);
    toast.success('View duplicated - make changes and save');
  };

  const visibleCount = fields.filter(f => f.visible).length;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure View
            </DialogTitle>
            <DialogDescription>
              Customize how data is displayed and save your configuration for future use.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="fields" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields" className="gap-2">
                <Columns className="h-4 w-4" />
                Fields
              </TabsTrigger>
              <TabsTrigger value="sorting" className="gap-2">
                <SortAsc className="h-4 w-4" />
                Sorting
              </TabsTrigger>
              <TabsTrigger value="sharing" className="gap-2">
                <Share2 className="h-4 w-4" />
                Sharing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="flex-1 min-h-0 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Visible Fields</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Drag to reorder, toggle to show/hide
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {visibleCount} of {fields.length} visible
                  </Badge>
                </div>

                <ScrollArea className="h-[280px] border rounded-lg">
                  <div className="p-2 space-y-1">
                    {fields.map((field, index) => (
                      <div
                        key={field.key}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-2 rounded-md border bg-background cursor-grab active:cursor-grabbing transition-all ${
                          draggedField === index ? 'opacity-50 scale-[0.98]' : ''
                        } ${!field.visible ? 'opacity-60' : ''}`}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${!field.visible ? 'text-muted-foreground' : ''}`}>
                            {field.label}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {field.type}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {field.sortable && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-[10px] px-1.5">
                                  Sortable
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>This field can be sorted</TooltipContent>
                            </Tooltip>
                          )}
                          {field.filterable && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-[10px] px-1.5">
                                  <Filter className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>This field can be filtered</TooltipContent>
                            </Tooltip>
                          )}
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleFieldVisibilityToggle(index)}
                              >
                                {field.visible ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {field.visible ? 'Hide field' : 'Show field'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFields(prev => prev.map(f => ({ ...f, visible: true })))}
                  >
                    Show All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFields(prev => prev.map(f => ({ ...f, visible: false })))}
                  >
                    Hide All
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sorting" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Default Sort Field</Label>
                <Select value={defaultSort} onValueChange={setDefaultSort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field to sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {fields.filter(f => f.sortable).map(field => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {defaultSort && (
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending (A → Z, 0 → 9)</SelectItem>
                      <SelectItem value="desc">Descending (Z → A, 9 → 0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>View Type</Label>
                <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="kanban">Kanban Board</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="map">Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>View Name</Label>
                <Input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Enter view name"
                />
              </div>

              <div className="space-y-3">
                <Label>Visibility</Label>
                <div className="space-y-2">
                  {[
                    { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can see this view' },
                    { value: 'team', label: 'Team', icon: Users, desc: 'Share with your team members' },
                    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone in the organization can see' },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        shareMode === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setShareMode(option.value as typeof shareMode)}
                    >
                      <option.icon className={`h-5 w-5 ${shareMode === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        shareMode === option.value 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {shareMode === option.value && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Set as Default View</Label>
                  <p className="text-xs text-muted-foreground">
                    This view will load automatically
                  </p>
                </div>
                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-row justify-between sm:justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleDuplicate}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate view</TooltipContent>
              </Tooltip>
              {activeViewConfig && !activeViewConfig.isDefault && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete view</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={!viewName.trim()}>
                <Save className="h-4 w-4 mr-1.5" />
                Save View
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}