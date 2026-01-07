"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Eye, GripVertical, Plus } from 'lucide-react';
import { Record, Opportunity, Task } from '@/types';

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

  const records = getRecordsForCurrentTable();

  // Define columns based on table type
  const columns: KanbanColumn[] = useMemo(() => {
    switch (currentTable) {
      case 'opportunities':
        return [
          { id: 'Lead', title: 'Lead', color: 'bg-gray-100' },
          { id: 'Qualified', title: 'Qualified', color: 'bg-blue-100' },
          { id: 'Proposal', title: 'Proposal', color: 'bg-yellow-100' },
          { id: 'Negotiation', title: 'Negotiation', color: 'bg-orange-100' },
          { id: 'Closed Won', title: 'Closed Won', color: 'bg-green-100' },
          { id: 'Closed Lost', title: 'Closed Lost', color: 'bg-red-100' },
        ];
      case 'tasks':
        return [
          { id: 'Pending', title: 'Pending', color: 'bg-gray-100' },
          { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
          { id: 'Completed', title: 'Completed', color: 'bg-green-100' },
          { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-100' },
        ];
      case 'contacts':
      case 'organizations':
        return [
          { id: 'Active', title: 'Active', color: 'bg-green-100' },
          { id: 'Pending', title: 'Pending', color: 'bg-yellow-100' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-gray-100' },
          { id: 'Prospect', title: 'Prospect', color: 'bg-blue-100' },
        ];
      default:
        return [
          { id: 'Active', title: 'Active', color: 'bg-green-100' },
          { id: 'Pending', title: 'Pending', color: 'bg-yellow-100' },
          { id: 'Inactive', title: 'Inactive', color: 'bg-gray-100' },
        ];
    }
  }, [currentTable]);

  const getGroupField = () => {
    switch (currentTable) {
      case 'opportunities':
        return 'stage';
      case 'tasks':
      case 'contacts':
      case 'organizations':
        return 'status';
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
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderCard = (record: Record) => {
    const isOpportunity = record.tableType === 'opportunities';
    const isTask = record.tableType === 'tasks';

    return (
      <Card
        key={record.id}
        className={`mb-3 cursor-grab active:cursor-grabbing transition-all ${
          draggedRecord?.id === record.id ? 'opacity-50 scale-95' : ''
        }`}
        draggable={currentUser.permissions.canEditRecords}
        onDragStart={() => handleDragStart(record)}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {(record as Opportunity | Task).name || (record as Record).name}
                </h4>
                {isOpportunity && (
                  <p className="text-lg font-semibold text-primary mt-1">
                    {formatCurrency((record as Opportunity).value)}
                  </p>
                )}
                {isTask && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(
                        (record as Task).priority
                      )}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {(record as Task).priority}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {(record as Opportunity | Task).assignedTo || 
                     (record as Record).organization || 
                     (record as Record).contactPerson}
                  </Badge>
                </div>
                {(isOpportunity || isTask) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {isOpportunity ? 'Close: ' : 'Due: '}
                    {new Date(
                      (record as Opportunity).closeDate || (record as Task).dueDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {currentUser.permissions.canEditRecords && (
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {currentUser.permissions.canDeleteRecords && (
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex gap-4 p-4 overflow-x-auto flex-1">
        {columns.map((column) => {
          const columnRecords = getRecordsForColumn(column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col w-72 flex-shrink-0 rounded-lg ${column.color} ${
                isOver ? 'ring-2 ring-primary' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="p-3 border-b bg-white/50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnRecords.length}
                  </Badge>
                </div>
              </div>
              <ScrollArea className="flex-1 p-3">
                {columnRecords.map((record) => renderCard(record))}
                {columnRecords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No records
                  </div>
                )}
              </ScrollArea>
              {currentUser.permissions.canEditRecords && (
                <div className="p-3 border-t bg-white/50 rounded-b-lg">
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Record
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}