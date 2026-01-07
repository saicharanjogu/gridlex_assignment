"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Eye, Plus, Calendar, DollarSign } from 'lucide-react';
import { Record, Opportunity, Task, Contact, Organization } from '@/types';

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
  } = useApp();

  const [draggedRecord, setDraggedRecord] = useState<Record | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const records = getRecordsForCurrentTable();

  const columns: KanbanColumn[] = useMemo(() => {
    switch (currentTable) {
      case 'opportunities':
        return [
          { id: 'Lead', title: 'Lead', color: 'bg-slate-500' },
          { id: 'Qualified', title: 'Qualified', color: 'bg-blue-500' },
          { id: 'Proposal', title: 'Proposal', color: 'bg-amber-500' },
          { id: 'Negotiation', title: 'Negotiation', color: 'bg-orange-500' },
          { id: 'Closed Won', title: 'Won', color: 'bg-emerald-500' },
          { id: 'Closed Lost', title: 'Lost', color: 'bg-red-500' },
        ];
      case 'tasks':
        return [
          { id: 'Pending', title: 'To Do', color: 'bg-slate-500' },
          { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
          { id: 'Completed', title: 'Done', color: 'bg-emerald-500' },
          { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-500' },
        ];
      case 'contacts':
      case 'organizations':
        return [
          { id: 'Active', title: 'Active', color: 'bg-emerald-500' },
          { id: 'Pending', title: 'Pending', color: 'bg-amber-500' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-slate-500' },
          { id: 'Prospect', title: 'Prospect', color: 'bg-blue-500' },
        ];
      default:
        return [
          { id: 'Active', title: 'Active', color: 'bg-emerald-500' },
          { id: 'Pending', title: 'Pending', color: 'bg-amber-500' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-slate-500' },
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

  const handleDragStart = (record: Record) => {
    setDraggedRecord(record);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (columnId: string) => {
    if (draggedRecord && currentUser.permissions.canEditRecords) {
      const groupField = getGroupField();
      const updatedRecord = { ...draggedRecord, [groupField]: columnId };
      updateRecord(updatedRecord as Record);
    }
    setDraggedRecord(null);
    setDragOverColumn(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500';
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-amber-500';
      case 'Low':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
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

  const renderCard = (record: Record) => {
    const isOpportunity = record.tableType === 'opportunities';
    const isTask = record.tableType === 'tasks';
    const isHovered = hoveredCard === record.id;
    const subtitle = getCardSubtitle(record);

    return (
      <div
        key={record.id}
        className={`group p-3 bg-background rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          draggedRecord?.id === record.id ? 'opacity-50 scale-[0.98]' : ''
        }`}
        draggable={currentUser.permissions.canEditRecords}
        onDragStart={() => handleDragStart(record)}
        onMouseEnter={() => setHoveredCard(record.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2">
            {record.name}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-6 w-6 flex-shrink-0 transition-micro ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-sm">
                <Eye className="h-4 w-4 mr-2" strokeWidth={1.5} />
                View
              </DropdownMenuItem>
              {currentUser.permissions.canEditRecords && (
                <DropdownMenuItem className="text-sm">
                  <Edit className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Edit
                </DropdownMenuItem>
              )}
              {currentUser.permissions.canDeleteRecords && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm text-destructive">
                    <Trash className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isOpportunity && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <DollarSign className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            {formatCurrency((record as Opportunity).value)}
          </div>
        )}

        {isTask && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor((record as Task).priority)}`} />
            <span className="text-xs text-muted-foreground">{(record as Task).priority} priority</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
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
              <Calendar className="h-3 w-3" strokeWidth={1.5} />
              {new Date(
                (record as Opportunity).closeDate || (record as Task).dueDate
              ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
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
    <div className="flex h-full overflow-hidden bg-muted/30">
      <div className="flex gap-4 p-4 overflow-x-auto flex-1">
        {columns.map((column) => {
          const columnRecords = getRecordsForColumn(column.id);
          const isOver = dragOverColumn === column.id;
          const total = getColumnTotal(column.id);

          return (
            <div
              key={column.id}
              className={`flex flex-col w-80 flex-shrink-0 rounded-xl bg-muted/50 transition-micro ${
                isOver ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {columnRecords.length}
                  </Badge>
                </div>
                {currentUser.permissions.canEditRecords && (
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
              </div>
              
              {total !== null && (
                <div className="px-3 pb-2">
                  <span className="text-xs text-muted-foreground">
                    Total: {formatCurrency(total)}
                  </span>
                </div>
              )}
              
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-2 pb-4">
                  {columnRecords.map((record) => renderCard(record))}
                  {columnRecords.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No items
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}