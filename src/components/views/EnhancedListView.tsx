"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  GripVertical,
  EyeOff,
  Pin,
  ArrowUpDown,
  Columns,
  AlignJustify,
  AlignCenter,
  AlignLeft,
  Settings,
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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [density, setDensity] = useState<RowDensity>('comfortable');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);

  const baseFields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);
  const [columns, setColumns] = useState<ColumnConfig[]>(() => 
    baseFields.map((f, i) => ({ ...f, width: 150, pinned: false, order: i }))
  );

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

  const toggleColumnPin = (key: string) => {
    setColumns(prev => prev.map(c => 
      c.key === key ? { ...c, pinned: !c.pinned } : c
    ));
  };

  const handleColumnDragStart = (index: number) => {
    setDraggedColumn(index);
  };

  const handleColumnDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColumn === null || draggedColumn === index) return;
    
    const newColumns = [...columns];
    const draggedItem = newColumns[draggedColumn];
    newColumns.splice(draggedColumn, 1);
    newColumns.splice(index, 0, draggedItem);
    
    setColumns(newColumns.map((c, i) => ({ ...c, order: i })));
    setDraggedColumn(index);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleColumnResize = useCallback((key: string, delta: number) => {
    setColumns(prev => prev.map(c => 
      c.key === key ? { ...c, width: Math.max(80, c.width + delta) } : c
    ));
  }, []);

  const startResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    setResizingColumn(key);
    const startX = e.clientX;
    const column = columns.find(c => c.key === key);
    const startWidth = column?.width || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      handleColumnResize(key, delta);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
        return { row: 'h-8', cell: 'py-1 text-xs' };
      case 'spacious':
        return { row: 'h-14', cell: 'py-4 text-sm' };
      default:
        return { row: 'h-11', cell: 'py-2 text-sm' };
    }
  };

  const densityClasses = getDensityClasses();
  const visibleColumns = columns.filter(c => c.visible).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.order - b.order;
  });

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Enhanced Toolbar */}
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
          
          <div className="flex items-center gap-2">
            {/* Density Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  {density === 'compact' && <AlignJustify className="h-4 w-4" />}
                  {density === 'comfortable' && <AlignCenter className="h-4 w-4" />}
                  {density === 'spacious' && <AlignLeft className="h-4 w-4" />}
                  <span className="hidden sm:inline capitalize">{density}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={density} onValueChange={(v) => setDensity(v as RowDensity)}>
                  <DropdownMenuRadioItem value="compact">
                    <AlignJustify className="h-4 w-4 mr-2" />
                    Compact
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comfortable">
                    <AlignCenter className="h-4 w-4 mr-2" />
                    Comfortable
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="spacious">
                    <AlignLeft className="h-4 w-4 mr-2" />
                    Spacious
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  <Columns className="h-4 w-4" />
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
                <div className="h-4 w-px bg-border" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => {
                        if (selectedRecords.length === 1) {
                          const record = paginatedRecords.find(r => r.id === selectedRecords[0]);
                          if (record) openEditDialog(record);
                        }
                      }}
                      disabled={selectedRecords.length !== 1}
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
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
                      className="h-8"
                      onClick={() => {
                        selectedRecords.forEach(id => duplicateRecord(id));
                        toast.success(`${selectedRecords.length} record(s) duplicated`);
                        clearSelection();
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
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
                        className="h-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(selectedRecords)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
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

        {/* Table */}
        <div className="flex-1 overflow-auto" ref={tableRef}>
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {currentTable === 'unified' && (
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    Type
                  </TableHead>
                )}
                {visibleColumns.map((column, index) => (
                  <TableHead 
                    key={column.key}
                    style={{ width: column.width, minWidth: column.width }}
                    className="relative group"
                    draggable
                    onDragStart={() => handleColumnDragStart(index)}
                    onDragOver={(e) => handleColumnDragOver(e, index)}
                    onDragEnd={handleColumnDragEnd}
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {column.pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-micro hover:text-foreground`}
                          >
                            {column.label}
                            {sortField === column.key && (
                              sortOrder === 'asc' 
                                ? <ArrowUp className="h-3.5 w-3.5" />
                                : <ArrowDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {column.sortable && (
                            <>
                              <DropdownMenuItem onClick={() => { setSortField(column.key); setSortOrder('asc'); }}>
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Sort Ascending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSortField(column.key); setSortOrder('desc'); }}>
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Sort Descending
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => toggleColumnPin(column.key)}>
                            <Pin className="h-4 w-4 mr-2" />
                            {column.pinned ? 'Unpin Column' : 'Pin Column'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleColumnVisibility(column.key)}>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Column
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Resize Handle */}
                    <div
                      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 ${
                        resizingColumn === column.key ? 'bg-primary' : ''
                      }`}
                      onMouseDown={(e) => startResize(e, column.key)}
                    />
                  </TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className={`transition-micro ${densityClasses.row} ${
                    selectedRecords.includes(record.id) ? 'bg-primary/5' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(record.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onDoubleClick={() => openViewDialog(record)}
                >
                  <TableCell className={densityClasses.cell} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={() => toggleRecordSelection(record.id)}
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
                            className="h-7 text-sm"
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
                          className={`h-7 w-7 transition-micro ${
                            hoveredRow === record.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openViewDialog(record)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        {currentUser.permissions.canEditRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(record.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          </>
                        )}
                        {currentUser.permissions.canDeleteRecords && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openDeleteDialog([record.id])}
                            >
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
          
          {paginatedRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-base font-medium">No records found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]">
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
            <span className="text-sm text-muted-foreground">
              {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
            </span>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>First page</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous page</TooltipContent>
              </Tooltip>
              
              <span className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next page</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Last page</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}