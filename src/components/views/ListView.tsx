"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
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

  const fields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
  const records = getRecordsForCurrentTable();

  const filteredRecords = useMemo(() => {
    let result = records;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((record) =>
        Object.values(record).some(
          (value) =>
            typeof value === 'string' && value.toLowerCase().includes(query)
        )
      );
    }

    // Apply filters
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

    // Apply sorting
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'closed won':
        return 'default';
      case 'pending':
      case 'in progress':
      case 'proposal':
      case 'negotiation':
        return 'secondary';
      case 'inactive':
      case 'cancelled':
      case 'closed lost':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCellValue = (value: unknown, fieldType: string) => {
    if (value === undefined || value === null) return '-';
    
    switch (fieldType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(value));
      case 'date':
        return new Date(String(value)).toLocaleDateString();
      default:
        return String(value);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} records
          </span>
          {selectedRecords.length > 0 && (
            <Badge variant="secondary">
              {selectedRecords.length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentUser.permissions.canEditRecords && selectedRecords.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bulk Edit
              </Button>
              {currentUser.permissions.canDeleteRecords && (
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {currentTable === 'unified' && (
                <TableHead className="w-32">Type</TableHead>
              )}
              {fields.filter(f => f.visible).map((field) => (
                <TableHead key={field.key}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => field.sortable && handleSort(field.key)}
                    disabled={!field.sortable}
                  >
                    {field.label}
                    {field.sortable && (
                      sortField === field.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )
                    )}
                  </Button>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow
                key={record.id}
                className={selectedRecords.includes(record.id) ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => toggleRecordSelection(record.id)}
                  />
                </TableCell>
                {currentTable === 'unified' && (
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {record.tableType}
                    </Badge>
                  </TableCell>
                )}
                {fields.filter(f => f.visible).map((field) => {
                  const value = (record as Record)[field.key as keyof Record];
                  const isEditing = editingCell?.recordId === record.id && editingCell?.field === field.key;

                  return (
                    <TableCell
                      key={field.key}
                      className="cursor-pointer"
                      onDoubleClick={() => {
                        if (currentUser.permissions.canEditRecords) {
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
                          className="h-8"
                        />
                      ) : field.key === 'status' || field.key === 'stage' || field.key === 'priority' ? (
                        <Badge variant={getStatusBadgeVariant(String(value))}>
                          {String(value)}
                        </Badge>
                      ) : (
                        formatCellValue(value, field.type)
                      )}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}