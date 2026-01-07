"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  AlignJustify,
  AlignCenter,
  AlignLeft,
} from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Record, FieldConfig } from '@/types';
import { toast } from 'sonner';

type RowDensity = 'compact' | 'comfortable' | 'spacious';

interface ColumnConfig extends FieldConfig {
  width: number;
  pinned: boolean;
  order: number;
}

export function EnhancedListView() {
  const {
    currentTable,
    searchQuery,
    filters,
    selectedRecords,
    toggleRecordSelection,
    selectAllRecords,
    clearSelection,
    getRecordsForCurrentTable,
    currentUser,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    duplicateRecord,
    updateRecord,
  } = useApp();

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ recordId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [density, setDensity] = useState<RowDensity>('comfortable');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const tableRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const baseFields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
  const [columns, setColumns] = useState<ColumnConfig[]>(() => 
    baseFields.map((f, i) => ({ ...f, width: 150, pinned: false, order: i }))
  );

  // Reset state when currentTable changes
  useEffect(() => {
    const newFields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
    setColumns(newFields.map((f, i) => ({ ...f, width: 150, pinned: false, order: i })));
    setCurrentPage(1);
    setSortField(null);
    setSortOrder('asc');
    setEditingCell(null);
    setFocusedRowIndex(-1);
    clearSelection();
  }, [currentTable, clearSelection]);

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

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Reset to page 1 when filtered records change significantly
  useEffect(() => {
    if (currentPage > Math.ceil(filteredRecords.length / pageSize)) {
      setCurrentPage(1);
    }
  }, [filteredRecords.length, pageSize, currentPage]);

  // Keyboard navigation for table rows
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (paginatedRecords.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, paginatedRecords.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedRowIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedRowIndex(paginatedRecords.length - 1);
        break;
      case 'Enter':
        if (focusedRowIndex >= 0) {
          e.preventDefault();
          openViewDialog(paginatedRecords[focusedRowIndex]);
        }
        break;
      case ' ':
        if (focusedRowIndex >= 0) {
          e.preventDefault();
          toggleRecordSelection(paginatedRecords[focusedRowIndex].id);
        }
        break;
    }
  }, [paginatedRecords, focusedRowIndex, openViewDialog, toggleRecordSelection]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (focusedRowIndex >= 0 && rowRefs.current[focusedRowIndex]) {
      rowRefs.current[focusedRowIndex]?.focus();
    }
  }, [focusedRowIndex]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedRecords.length) {
      clearSelection();
    } else {
      selectAllRecords(paginatedRecords.map((r) => r.id));
    }
  };

  const handleInlineEdit = (record: Record, field: string, value: string) => {
    const updatedRecord = { ...record, [field]: value };
    updateRecord(updatedRecord);
    setEditingCell(null);
    toast.success('Record updated');
  };

  const handleDuplicate = (id: string) => {
    duplicateRecord(id);
    toast.success('Record duplicated');
  };

  const toggleColumnVisibility = (key: string) => {
    setColumns(prev => prev.map(c => 
      c.key === key ? { ...c, visible: !c.visible } : c
    ));
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (['active', 'completed', 'closed won'].includes(statusLower)) return 'default';
    if (['inactive', 'cancelled', 'closed lost'].includes(statusLower)) return 'destructive';
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

  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return { row: 'h-10', cell: 'py-2 text-xs' };
      case 'spacious':
        return { row: 'h-16', cell: 'py-4 text-sm' };
      default:
        return { row: 'h-12', cell: 'py-3 text-sm' };
    }
  };

  const densityClasses = getDensityClasses();
  const visibleColumns = columns.filter(c => c.visible).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.order - b.order;
  });

  // Calculate selection state for screen readers
  const selectionSummary = selectedRecords.length > 0 
    ? `${selectedRecords.length} of ${paginatedRecords.length} records selected`
    : 'No records selected';

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b border-border"
          role="toolbar"
          aria-label="Table actions"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </span>
            {selectedRecords.length > 0 && (
              <Badge variant="secondary" aria-live="polite">
                {selectedRecords.length} selected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Density Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2"
                  aria-label={`Row density: ${density}`}
                >
                  {density === 'compact' && <AlignJustify className="h-4 w-4" aria-hidden="true" />}
                  {density === 'comfortable' && <AlignCenter className="h-4 w-4" aria-hidden="true" />}
                  {density === 'spacious' && <AlignLeft className="h-4 w-4" aria-hidden="true" />}
                  <span className="hidden sm:inline capitalize">{density}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={density} onValueChange={(v) => setDensity(v as RowDensity)}>
                  <DropdownMenuRadioItem value="compact">
                    <AlignJustify className="h-4 w-4 mr-2" aria-hidden="true" />
                    Compact
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comfortable">
                    <AlignCenter className="h-4 w-4 mr-2" aria-hidden="true" />
                    Comfortable
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="spacious">
                    <AlignLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                    Spacious
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2"
                  aria-label="Toggle column visibility"
                >
                  <Columns className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk Actions */}
            {currentUser.permissions.canEditRecords && selectedRecords.length > 0 && (
              <>
                <div className="h-4 w-px bg-border" aria-hidden="true" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10"
                      onClick={() => {
                        if (selectedRecords.length === 1) {
                          const record = paginatedRecords.find(r => r.id === selectedRecords[0]);
                          if (record) openEditDialog(record);
                        }
                      }}
                      disabled={selectedRecords.length !== 1}
                      aria-label="Edit selected record"
                    >
                      <Edit className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit selected record</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10"
                      onClick={() => {
                        selectedRecords.forEach(id => duplicateRecord(id));
                        toast.success(`${selectedRecords.length} record(s) duplicated`);
                        clearSelection();
                      }}
                      aria-label={`Duplicate ${selectedRecords.length} selected record${selectedRecords.length !== 1 ? 's' : ''}`}
                    >
                      <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Duplicate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate selected records</TooltipContent>
                </Tooltip>
                {currentUser.permissions.canDeleteRecords && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(selectedRecords)}
                        aria-label={`Delete ${selectedRecords.length} selected record${selectedRecords.length !== 1 ? 's' : ''}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete selected records</TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>

        {/* Screen reader announcement for selection */}
        <VisuallyHidden>
          <div aria-live="polite" aria-atomic="true">
            {selectionSummary}
          </div>
        </VisuallyHidden>

        {/* Table */}
        <div 
          className="flex-1 overflow-auto"
          role="region"
          aria-label="Records table"
          tabIndex={0}
          onKeyDown={handleTableKeyDown}
        >
          <Table ref={tableRef}>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label={selectedRecords.length === paginatedRecords.length ? 'Deselect all records' : 'Select all records'}
                  />
                </TableHead>
                {currentTable === 'unified' && (
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    <span className="sr-only">Record </span>Type
                  </TableHead>
                )}
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key}
                    style={{ width: column.width, minWidth: column.width }}
                    className="relative group"
                  >
                    <button
                      onClick={() => column.sortable && handleSort(column.key)}
                      disabled={!column.sortable}
                      className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-default ${
                        column.sortable 
                          ? 'hover:text-foreground cursor-pointer' 
                          : 'cursor-default'
                      }`}
                      aria-label={`${column.label}${column.sortable ? `, sortable, ${sortField === column.key ? `sorted ${sortOrder}ending` : 'not sorted'}` : ''}`}
                      aria-sort={sortField === column.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {column.label}
                      {sortField === column.key && (
                        sortOrder === 'asc' 
                          ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record, index) => (
                <TableRow
                  key={record.id}
                  ref={(el) => { rowRefs.current[index] = el; }}
                  className={`transition-default ${densityClasses.row} ${
                    selectedRecords.includes(record.id) ? 'bg-primary/5' : ''
                  } ${focusedRowIndex === index ? 'ring-2 ring-inset ring-ring' : ''}`}
                  tabIndex={focusedRowIndex === index ? 0 : -1}
                  onFocus={() => setFocusedRowIndex(index)}
                  onDoubleClick={() => openViewDialog(record)}
                  aria-selected={selectedRecords.includes(record.id)}
                  role="row"
                >
                  <TableCell className={densityClasses.cell} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={() => toggleRecordSelection(record.id)}
                      aria-label={`Select ${record.name}`}
                    />
                  </TableCell>
                  {currentTable === 'unified' && (
                    <TableCell className={densityClasses.cell}>
                      <Badge variant="outline" className="text-xs capitalize font-normal">
                        {record.tableType}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => {
                    const value = (record as Record)[column.key as keyof Record];
                    const isEditing = editingCell?.recordId === record.id && editingCell?.field === column.key;
                    const isStatusField = ['status', 'stage', 'priority'].includes(column.key);

                    return (
                      <TableCell
                        key={column.key}
                        className={densityClasses.cell}
                        style={{ width: column.width, minWidth: column.width }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (currentUser.permissions.canEditRecords && !isStatusField) {
                            setEditingCell({ recordId: record.id, field: column.key });
                            setEditValue(String(value || ''));
                          }
                        }}
                      >
                        {isEditing ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            onBlur={() => handleInlineEdit(record, column.key, editValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineEdit(record, column.key, editValue);
                              } else if (e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            className="h-8 text-sm"
                            aria-label={`Edit ${column.label}`}
                          />
                        ) : isStatusField ? (
                          <Badge variant={getStatusVariant(String(value))}>
                            {String(value)}
                          </Badge>
                        ) : (
                          <span className="truncate block">
                            {formatCellValue(value, column.type)}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className={densityClasses.cell} onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Actions for ${record.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openViewDialog(record)}>
                          <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                          View details
                        </DropdownMenuItem>
                        {currentUser.permissions.canEditRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(record)}>
                              <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(record.id)}>
                              <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                              Duplicate
                            </DropdownMenuItem>
                          </>
                        )}
                        {currentUser.permissions.canDeleteRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog([record.id])}
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
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
          
          {paginatedRecords.length === 0 && (
            <div 
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <p className="text-base font-medium">No records found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <nav 
          className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30"
          aria-label="Table pagination"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="page-size" className="sr-only">Rows per page</label>
            <span aria-hidden="true">Rows per page:</span>
            <Select 
              value={String(pageSize)} 
              onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}
            >
              <SelectTrigger id="page-size" className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {filteredRecords.length > 0 
                ? `${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, filteredRecords.length)} of ${filteredRecords.length}`
                : '0 records'}
            </span>
            
            <div className="flex items-center gap-1" role="group" aria-label="Pagination controls">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    aria-label="Go to first page"
                  >
                    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>First page</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous page</TooltipContent>
              </Tooltip>
              
              <span className="px-2 text-sm" aria-current="page">
                Page {currentPage} of {totalPages || 1}
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Go to next page"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next page</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Go to last page"
                  >
                    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Last page</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}