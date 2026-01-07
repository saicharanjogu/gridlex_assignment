"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash2, Eye, Copy, ExternalLink } from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Record } from '@/types';

export function ListView() {
  const {
    currentTable,
    searchQuery,
    filters,
    selectedRecords,
    toggleRecordSelection,
    setSelectedRecords,
    getRecordsForCurrentTable,
    currentUser,
  } = useApp();

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ recordId: string; field: string } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const fields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
  const records = getRecordsForCurrentTable();

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
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = (a as Record)[sortField as keyof Record];
        const bVal = (b as Record)[sortField as keyof Record];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [records, searchQuery, filters, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map((r) => r.id));
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (['active', 'completed', 'closed won'].includes(statusLower)) {
      return 'default';
    }
    if (['inactive', 'cancelled', 'closed lost'].includes(statusLower)) {
      return 'destructive';
    }
    return 'secondary';
  };

  const formatCellValue = (value: unknown, fieldType: string) => {
    if (value === undefined || value === null) return '—';
    
    switch (fieldType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(Number(value));
      case 'date':
        return new Date(String(value)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      default:
        return String(value);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </span>
            {selectedRecords.length > 0 && (
              <Badge variant="secondary">
                {selectedRecords.length} selected
              </Badge>
            )}
          </div>
          {currentUser.permissions.canEditRecords && selectedRecords.length > 0 && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit selected records</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Copy className="h-4 w-4 mr-1.5" />
                    Duplicate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate selected records</TooltipContent>
              </Tooltip>
              {currentUser.permissions.canDeleteRecords && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected records</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {currentTable === 'unified' && (
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Type
                  </TableHead>
                )}
                {fields.filter(f => f.visible).map((field) => (
                  <TableHead key={field.key}>
                    <button
                      onClick={() => field.sortable && handleSort(field.key)}
                      disabled={!field.sortable}
                      className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-micro ${
                        field.sortable 
                          ? 'hover:text-foreground cursor-pointer' 
                          : 'cursor-default'
                      }`}
                    >
                      {field.label}
                      {sortField === field.key && (
                        sortOrder === 'asc' 
                          ? <ArrowUp className="h-3.5 w-3.5" />
                          : <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className={`transition-micro ${
                    selectedRecords.includes(record.id) ? 'bg-primary/5' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(record.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={() => toggleRecordSelection(record.id)}
                    />
                  </TableCell>
                  {currentTable === 'unified' && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize font-normal">
                        {record.tableType}
                      </Badge>
                    </TableCell>
                  )}
                  {fields.filter(f => f.visible).map((field) => {
                    const value = (record as Record)[field.key as keyof Record];
                    const isEditing = editingCell?.recordId === record.id && editingCell?.field === field.key;
                    const isStatusField = ['status', 'stage', 'priority'].includes(field.key);

                    return (
                      <TableCell
                        key={field.key}
                        onDoubleClick={() => {
                          if (currentUser.permissions.canEditRecords && !isStatusField) {
                            setEditingCell({ recordId: record.id, field: field.key });
                          }
                        }}
                      >
                        {isEditing ? (
                          <Input
                            defaultValue={String(value || '')}
                            autoFocus
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            className="h-8 text-sm"
                          />
                        ) : isStatusField ? (
                          <Badge variant={getStatusVariant(String(value))}>
                            {String(value)}
                          </Badge>
                        ) : (
                          <span className="text-sm">
                            {formatCellValue(value, field.type)}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`h-8 w-8 transition-micro ${
                            hoveredRow === record.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in new tab
                        </DropdownMenuItem>
                        {currentUser.permissions.canEditRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          </>
                        )}
                        {currentUser.permissions.canDeleteRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-base font-medium">No records found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}