"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash, Eye, Copy } from 'lucide-react';
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
      return 'text-emerald-600 bg-emerald-50';
    }
    if (['pending', 'in progress', 'proposal', 'negotiation', 'qualified'].includes(statusLower)) {
      return 'text-amber-600 bg-amber-50';
    }
    if (['inactive', 'cancelled', 'closed lost'].includes(statusLower)) {
      return 'text-rose-600 bg-rose-50';
    }
    if (['lead', 'prospect'].includes(statusLower)) {
      return 'text-blue-600 bg-blue-50';
    }
    if (['urgent', 'high'].includes(statusLower)) {
      return 'text-rose-600 bg-rose-50';
    }
    if (['medium'].includes(statusLower)) {
      return 'text-amber-600 bg-amber-50';
    }
    if (['low'].includes(statusLower)) {
      return 'text-slate-600 bg-slate-50';
    }
    return 'text-slate-600 bg-slate-50';
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
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </span>
          {selectedRecords.length > 0 && (
            <span className="text-sm text-foreground font-medium">
              {selectedRecords.length} selected
            </span>
          )}
        </div>
        {currentUser.permissions.canEditRecords && selectedRecords.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Edit className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Copy className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Duplicate
            </Button>
            {currentUser.permissions.canDeleteRecords && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Trash className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border/30">
              <th className="w-12 px-4 py-2">
                <Checkbox
                  checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-muted-foreground/30"
                />
              </th>
              {currentTable === 'unified' && (
                <th className="px-4 py-2 text-left">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </span>
                </th>
              )}
              {fields.filter(f => f.visible).map((field) => (
                <th key={field.key} className="px-4 py-2 text-left">
                  <button
                    onClick={() => field.sortable && handleSort(field.key)}
                    disabled={!field.sortable}
                    className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-micro ${
                      field.sortable 
                        ? 'text-muted-foreground hover:text-foreground cursor-pointer' 
                        : 'text-muted-foreground cursor-default'
                    }`}
                  >
                    {field.label}
                    {sortField === field.key && (
                      sortOrder === 'asc' 
                        ? <ArrowUp className="h-3 w-3" strokeWidth={1.5} />
                        : <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
                    )}
                  </button>
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className={`border-b border-border/20 transition-micro ${
                  selectedRecords.includes(record.id) 
                    ? 'bg-accent/30' 
                    : hoveredRow === record.id 
                      ? 'bg-accent/20' 
                      : ''
                }`}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-2.5">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => toggleRecordSelection(record.id)}
                    className="border-muted-foreground/30"
                  />
                </td>
                {currentTable === 'unified' && (
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-muted-foreground capitalize">
                      {record.tableType}
                    </span>
                  </td>
                )}
                {fields.filter(f => f.visible).map((field) => {
                  const value = (record as Record)[field.key as keyof Record];
                  const isEditing = editingCell?.recordId === record.id && editingCell?.field === field.key;
                  const isStatusField = ['status', 'stage', 'priority'].includes(field.key);

                  return (
                    <td
                      key={field.key}
                      className="px-4 py-2.5"
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
                          className="h-7 text-sm border-0 bg-background shadow-sm"
                        />
                      ) : isStatusField ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(String(value))}`}>
                          {String(value)}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground">
                          {formatCellValue(value, field.type)}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className={`p-1 rounded transition-micro ${
                          hoveredRow === record.id 
                            ? 'opacity-100 text-muted-foreground hover:text-foreground' 
                            : 'opacity-0'
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </button>
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
                        <DropdownMenuItem className="text-sm text-rose-600">
                          <Trash className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No records found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}