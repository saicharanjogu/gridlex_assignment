"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, ArrowUpDown, MoreHorizontal, Edit, Trash, Eye, Copy, ExternalLink } from 'lucide-react';
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

  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    if (['active', 'completed', 'closed won'].includes(statusLower)) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'in progress', 'proposal', 'negotiation', 'qualified'].includes(statusLower)) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (['inactive', 'cancelled', 'closed lost'].includes(statusLower)) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (['lead', 'prospect'].includes(statusLower)) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (['urgent', 'high'].includes(statusLower)) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (['medium'].includes(statusLower)) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (['low'].includes(statusLower)) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </span>
          {selectedRecords.length > 0 && (
            <Badge variant="secondary" className="font-medium">
              {selectedRecords.length} selected
            </Badge>
          )}
        </div>
        {currentUser.permissions.canEditRecords && selectedRecords.length > 0 && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-sm gap-1.5">
              <Edit className="h-4 w-4" strokeWidth={1.5} />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-sm gap-1.5">
              <Copy className="h-4 w-4" strokeWidth={1.5} />
              Duplicate
            </Button>
            {currentUser.permissions.canDeleteRecords && (
              <Button variant="ghost" size="sm" className="h-8 text-sm gap-1.5 text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" strokeWidth={1.5} />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 z-10">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              {currentTable === 'unified' && (
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </span>
                </th>
              )}
              {fields.filter(f => f.visible).map((field) => (
                <th key={field.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => field.sortable && handleSort(field.key)}
                    disabled={!field.sortable}
                    className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-micro ${
                      field.sortable 
                        ? 'text-muted-foreground hover:text-foreground cursor-pointer' 
                        : 'text-muted-foreground cursor-default'
                    }`}
                  >
                    {field.label}
                    {field.sortable && (
                      sortField === field.key ? (
                        sortOrder === 'asc' 
                          ? <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                          : <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" strokeWidth={1.5} />
                      )
                    )}
                  </button>
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className={`group transition-micro ${
                  selectedRecords.includes(record.id) 
                    ? 'bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => toggleRecordSelection(record.id)}
                  />
                </td>
                {currentTable === 'unified' && (
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs capitalize font-normal">
                      {record.tableType}
                    </Badge>
                  </td>
                )}
                {fields.filter(f => f.visible).map((field) => {
                  const value = (record as Record)[field.key as keyof Record];
                  const isEditing = editingCell?.recordId === record.id && editingCell?.field === field.key;
                  const isStatusField = ['status', 'stage', 'priority'].includes(field.key);

                  return (
                    <td
                      key={field.key}
                      className="px-4 py-3"
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
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(String(value))}`}>
                          {String(value)}
                        </span>
                      ) : (
                        <span className="text-sm">
                          {formatCellValue(value, field.type)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 transition-micro ${
                          hoveredRow === record.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" strokeWidth={1.5} />
                        Open in new tab
                      </DropdownMenuItem>
                      {currentUser.permissions.canEditRecords && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" strokeWidth={1.5} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" strokeWidth={1.5} />
                            Duplicate
                          </DropdownMenuItem>
                        </>
                      )}
                      {currentUser.permissions.canDeleteRecords && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" strokeWidth={1.5} />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-base font-medium">No records found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}