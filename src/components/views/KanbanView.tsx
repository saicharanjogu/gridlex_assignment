"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
import { MoreHorizontal, Edit, Trash2, Eye, Plus, Calendar, DollarSign, GripVertical } from 'lucide-react';
import { Record, Opportunity, Task, Contact, Organization } from '@/types';
import { toast } from 'sonner';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export function KanbanView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    updateRecord,
    currentUser,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    openCreateDialog,
    duplicateRecord,
  } = useApp();

  const [draggedRecord, setDraggedRecord] = useState<Record | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const records = getRecordsForCurrentTable();

  const columns: KanbanColumn[] = useMemo(() => {
    switch (currentTable) {
      case 'opportunities':
        return [
          { id: 'Lead', title: 'Lead', color: 'bg-slate-400' },
          { id: 'Qualified', title: 'Qualified', color: 'bg-blue-500' },
          { id: 'Proposal', title: 'Proposal', color: 'bg-amber-500' },
          { id: 'Negotiation', title: 'Negotiation', color: 'bg-orange-500' },
          { id: 'Closed Won', title: 'Won', color: 'bg-emerald-500' },
          { id: 'Closed Lost', title: 'Lost', color: 'bg-red-500' },
        ];
      case 'tasks':
        return [
          { id: 'Pending', title: 'To Do', color: 'bg-slate-400' },
          { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
          { id: 'Completed', title: 'Done', color: 'bg-emerald-500' },
          { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-500' },
        ];
      case 'contacts':
      case 'organizations':
        return [
          { id: 'Active', title: 'Active', color: 'bg-emerald-500' },
          { id: 'Pending', title: 'Pending', color: 'bg-amber-500' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-slate-400' },
          { id: 'Prospect', title: 'Prospect', color: 'bg-blue-500' },
        ];
      default:
        return [
          { id: 'Active', title: 'Active', color: 'bg-emerald-500' },
          { id: 'Pending', title: 'Pending', color: 'bg-amber-500' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-slate-400' },
        ];
    }
  }, [currentTable]);

  const getGroupField = () => {
    switch (currentTable) {
      case 'opportunities':
        return 'stage';
      default:
        return 'status';
    }
  };

  const filteredRecords = useMemo(() => {
    let result = records;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((record) =>
        Object.values(record).some(
          (value) =>
            typeof value === 'string' && value.toLowerCase().includes(query)
        )
      );
    }

    filters.forEach((filter) => {
      result = result.filter((record) => {
        const value = (record as Record)[filter.field as keyof Record];
        if (value === undefined) return true;

        switch (filter.operator) {
          case 'equals':
            return String(value).toLowerCase() === String(filter.value).toLowerCase();
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });

    return result;
  }, [records, searchQuery, filters]);

  const getRecordsForColumn = (columnId: string) => {
    const groupField = getGroupField();
    return filteredRecords.filter(
      (record) => (record as Record)[groupField as keyof Record] === columnId
    );
  };

  const handleDragStart = (e: React.DragEvent, record: Record) => {
    setDraggedRecord(record);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedRecord && currentUser.permissions.canEditRecords) {
      const groupField = getGroupField();
      const currentValue = (draggedRecord as Record)[groupField as keyof Record];
      
      if (currentValue !== columnId) {
        const updatedRecord = { ...draggedRecord, [groupField]: columnId };
        updateRecord(updatedRecord as Record);
        toast.success(`Moved to ${columnId}`);
      }
    }
    setDraggedRecord(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedRecord(null);
    setDragOverColumn(null);
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getCardSubtitle = (record: Record): string => {
    switch (record.tableType) {
      case 'opportunities':
      case 'tasks':
        return (record as Opportunity | Task).assignedTo;
      case 'contacts':
        return (record as Contact).organization;
      case 'organizations':
        return (record as Organization).contactPerson;
      default:
        return '';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDuplicate = (id: string) => {
    duplicateRecord(id);
    toast.success('Record duplicated');
  };

  const renderCard = (record: Record) => {
    const isOpportunity = record.tableType === 'opportunities';
    const isTask = record.tableType === 'tasks';
    const isHovered = hoveredCard === record.id;
    const subtitle = getCardSubtitle(record);
    const isDragging = draggedRecord?.id === record.id;

    return (
      <Card
        key={record.id}
        className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          isDragging ? 'opacity-50 scale-[0.98] rotate-2' : ''
        }`}
        draggable={currentUser.permissions.canEditRecords}
        onDragStart={(e) => handleDragStart(e, record)}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHoveredCard(record.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => openViewDialog(record)}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
              <h4 className="text-sm font-medium text-foreground line-clamp-2">
                {record.name}
              </h4>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`h-6 w-6 flex-shrink-0 transition-micro ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openViewDialog(record); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                {currentUser.permissions.canEditRecords && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(record); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(record.id); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </>
                )}
                {currentUser.permissions.canDeleteRecords && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); openDeleteDialog([record.id]); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isOpportunity && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              {formatCurrency((record as Opportunity).value)}
            </div>
          )}

          {isTask && (
            <div className="mb-2">
              <Badge variant={getPriorityVariant((record as Task).priority)} className="text-xs">
                {(record as Task).priority}
              </Badge>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(subtitle)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {subtitle}
              </span>
            </div>
            
            {(isOpportunity || isTask) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(
                  (record as Opportunity).closeDate || (record as Task).dueDate
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getColumnTotal = (columnId: string) => {
    const columnRecords = getRecordsForColumn(columnId);
    if (currentTable === 'opportunities') {
      return columnRecords.reduce((sum, r) => sum + (r as Opportunity).value, 0);
    }
    return null;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full overflow-hidden bg-muted/30">
        <div className="flex gap-4 p-4 overflow-x-auto flex-1">
          {columns.map((column) => {
            const columnRecords = getRecordsForColumn(column.id);
            const isOver = dragOverColumn === column.id;
            const total = getColumnTotal(column.id);

            return (
              <div
                key={column.id}
                className={`flex flex-col w-80 flex-shrink-0 rounded-xl bg-background border border-border transition-all ${
                  isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between px-3 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                    <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnRecords.length}
                    </Badge>
                  </div>
                  {currentUser.permissions.canEditRecords && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={openCreateDialog}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add new item</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                {total !== null && (
                  <div className="px-3 py-2 border-b border-border bg-muted/30">
                    <span className="text-xs text-muted-foreground">
                      Total: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
                    </span>
                  </div>
                )}
                
                <ScrollArea className="flex-1 px-2 py-2">
                  <div className="space-y-2">
                    {columnRecords.map((record) => renderCard(record))}
                    {columnRecords.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        {isOver ? 'Drop here' : 'No items'}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}