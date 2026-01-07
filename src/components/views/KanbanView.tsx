"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Eye, Plus } from 'lucide-react';
import { Record, Opportunity, Task, Contact, Organization } from '@/types';

interface KanbanColumn {
  id: string;
  title: string;
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
          { id: 'Lead', title: 'Lead' },
          { id: 'Qualified', title: 'Qualified' },
          { id: 'Proposal', title: 'Proposal' },
          { id: 'Negotiation', title: 'Negotiation' },
          { id: 'Closed Won', title: 'Won' },
          { id: 'Closed Lost', title: 'Lost' },
        ];
      case 'tasks':
        return [
          { id: 'Pending', title: 'To Do' },
          { id: 'In Progress', title: 'In Progress' },
          { id: 'Completed', title: 'Done' },
          { id: 'Cancelled', title: 'Cancelled' },
        ];
      case 'contacts':
      case 'organizations':
        return [
          { id: 'Active', title: 'Active' },
          { id: 'Pending', title: 'Pending' },
          { id: 'Inactive', title: 'Inactive' },
          { id: 'Prospect', title: 'Prospect' },
        ];
      default:
        return [
          { id: 'Active', title: 'Active' },
          { id: 'Pending', title: 'Pending' },
          { id: 'Inactive', title: 'Inactive' },
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

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500';
      case 'High':
        return 'bg-amber-500';
      case 'Medium':
        return 'bg-blue-500';
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

  const renderCard = (record: Record) => {
    const isOpportunity = record.tableType === 'opportunities';
    const isTask = record.tableType === 'tasks';
    const isHovered = hoveredCard === record.id;

    return (
      <div
        key={record.id}
        className={`group p-3 bg-background rounded-lg border border-border/40 cursor-grab active:cursor-grabbing transition-micro hover:border-border ${
          draggedRecord?.id === record.id ? 'opacity-40 scale-[0.98]' : ''
        }`}
        draggable={currentUser.permissions.canEditRecords}
        onDragStart={() => handleDragStart(record)}
        onMouseEnter={() => setHoveredCard(record.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isTask && (
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot((record as Task).priority)}`} />
              )}
              <h4 className="text-sm font-medium text-foreground truncate">
                {record.name}
              </h4>
            </div>
            
            {isOpportunity && (
              <p className="text-sm font-semibold text-foreground mt-1">
                {formatCurrency((record as Opportunity).value)}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              {getCardSubtitle(record)}
            </p>
            
            {(isOpportunity || isTask) && (
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                {isOpportunity ? 'Close ' : 'Due '}
                {new Date(
                  (record as Opportunity).closeDate || (record as Task).dueDate
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`p-1 rounded transition-micro ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                } text-muted-foreground hover:text-foreground`}
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="text-xs">
                <Eye className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                View
              </DropdownMenuItem>
              {currentUser.permissions.canEditRecords && (
                <DropdownMenuItem className="text-xs">
                  <Edit className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                  Edit
                </DropdownMenuItem>
              )}
              {currentUser.permissions.canDeleteRecords && (
                <DropdownMenuItem className="text-xs text-rose-600">
                  <Trash className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-muted/20">
      <div className="flex gap-4 p-6 overflow-x-auto flex-1">
        {columns.map((column) => {
          const columnRecords = getRecordsForColumn(column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col w-72 flex-shrink-0 rounded-xl transition-micro ${
                isOver ? 'bg-accent/50' : 'bg-transparent'
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between px-2 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {columnRecords.length}
                  </span>
                </div>
                {currentUser.permissions.canEditRecords && (
                  <button className="p-1 text-muted-foreground/50 hover:text-muted-foreground transition-micro rounded">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-2 px-1 pb-4">
                  {columnRecords.map((record) => renderCard(record))}
                  {columnRecords.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground/50 text-xs">
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