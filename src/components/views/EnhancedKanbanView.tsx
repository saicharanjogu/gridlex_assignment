"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Calendar, 
  DollarSign, 
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  Users,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Record, Opportunity, Task, Contact, Organization } from '@/types';
import { toast } from 'sonner';
import { quickSpring, springTransition } from '@/lib/animations';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit?: number;
}

interface CardField {
  key: string;
  label: string;
  visible: boolean;
}

type SwimlaneOption = 'none' | 'assignedTo' | 'priority' | 'organization';

const cardVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -20 },
  hover: { scale: 1.02, y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
  tap: { scale: 0.98 },
  drag: { scale: 1.05, boxShadow: '0 15px 35px rgba(0,0,0,0.15)', zIndex: 50 },
};

const columnVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function EnhancedKanbanView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    updateRecord,
    createRecord,
    currentUser,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    duplicateRecord,
  } = useApp();

  const [draggedRecord, setDraggedRecord] = useState<Record | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(new Set());
  const [swimlaneBy, setSwimlaneBy] = useState<SwimlaneOption>('none');
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [cardFields, setCardFields] = useState<CardField[]>([
    { key: 'name', label: 'Name', visible: true },
    { key: 'value', label: 'Value', visible: true },
    { key: 'assignedTo', label: 'Assigned To', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
  ]);
  const [wipLimits, setWipLimits] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setDraggedRecord(null);
    setDragOverColumn(null);
    setHoveredCard(null);
    setCollapsedColumns(new Set());
    setCollapsedSwimlanes(new Set());
    setSwimlaneBy('none');
    setQuickAddColumn(null);
    setQuickAddValue('');
  }, [currentTable]);

  const records = getRecordsForCurrentTable();

  const columns: KanbanColumn[] = useMemo(() => {
    switch (currentTable) {
      case 'opportunities':
        return [
          { id: 'Lead', title: 'Lead', color: 'bg-slate-400', wipLimit: wipLimits['Lead'] },
          { id: 'Qualified', title: 'Qualified', color: 'bg-blue-500', wipLimit: wipLimits['Qualified'] },
          { id: 'Proposal', title: 'Proposal', color: 'bg-amber-500', wipLimit: wipLimits['Proposal'] },
          { id: 'Negotiation', title: 'Negotiation', color: 'bg-orange-500', wipLimit: wipLimits['Negotiation'] },
          { id: 'Closed Won', title: 'Won', color: 'bg-emerald-500', wipLimit: wipLimits['Closed Won'] },
          { id: 'Closed Lost', title: 'Lost', color: 'bg-red-500', wipLimit: wipLimits['Closed Lost'] },
        ];
      case 'tasks':
        return [
          { id: 'Pending', title: 'To Do', color: 'bg-slate-400', wipLimit: wipLimits['Pending'] },
          { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500', wipLimit: wipLimits['In Progress'] },
          { id: 'Completed', title: 'Done', color: 'bg-emerald-500', wipLimit: wipLimits['Completed'] },
          { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-500', wipLimit: wipLimits['Cancelled'] },
        ];
      default:
        return [
          { id: 'Active', title: 'Active', color: 'bg-emerald-500', wipLimit: wipLimits['Active'] },
          { id: 'Pending', title: 'Pending', color: 'bg-amber-500', wipLimit: wipLimits['Pending'] },
          { id: 'Inactive', title: 'Inactive', color: 'bg-slate-400', wipLimit: wipLimits['Inactive'] },
          { id: 'Prospect', title: 'Prospect', color: 'bg-blue-500', wipLimit: wipLimits['Prospect'] },
        ];
    }
  }, [currentTable, wipLimits]);

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

  const getSwimlanes = (): string[] => {
    if (swimlaneBy === 'none') return ['all'];
    
    const values = new Set<string>();
    filteredRecords.forEach(record => {
      let value = '';
      switch (swimlaneBy) {
        case 'assignedTo':
          value = (record as Opportunity | Task).assignedTo || 'Unassigned';
          break;
        case 'priority':
          value = (record as Task).priority || 'No Priority';
          break;
        case 'organization':
          value = (record as Contact).organization || 'No Organization';
          break;
      }
      if (value) values.add(value);
    });
    
    return Array.from(values).sort();
  };

  const getRecordsForColumnAndSwimlane = (columnId: string, swimlane: string) => {
    const groupField = getGroupField();
    return filteredRecords.filter((record) => {
      const matchesColumn = (record as Record)[groupField as keyof Record] === columnId;
      
      if (swimlaneBy === 'none' || swimlane === 'all') return matchesColumn;
      
      let swimlaneValue = '';
      switch (swimlaneBy) {
        case 'assignedTo':
          swimlaneValue = (record as Opportunity | Task).assignedTo || 'Unassigned';
          break;
        case 'priority':
          swimlaneValue = (record as Task).priority || 'No Priority';
          break;
        case 'organization':
          swimlaneValue = (record as Contact).organization || 'No Organization';
          break;
      }
      
      return matchesColumn && swimlaneValue === swimlane;
    });
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
      
      const column = columns.find(c => c.id === columnId);
      if (column?.wipLimit) {
        const currentCount = getRecordsForColumnAndSwimlane(columnId, 'all').length;
        if (currentValue !== columnId && currentCount >= column.wipLimit) {
          toast.error(`WIP limit reached for ${column.title}`);
          setDraggedRecord(null);
          setDragOverColumn(null);
          return;
        }
      }
      
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

  const handleQuickAdd = (columnId: string) => {
    if (!quickAddValue.trim()) return;
    
    const groupField = getGroupField();
    const newRecord: Partial<Record> = {
      name: quickAddValue,
      tableType: currentTable === 'unified' ? 'tasks' : currentTable,
      [groupField]: columnId,
    };
    
    if (currentTable === 'tasks') {
      Object.assign(newRecord, {
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        assignedTo: currentUser.name,
      });
    } else if (currentTable === 'opportunities') {
      Object.assign(newRecord, {
        value: 0,
        closeDate: new Date().toISOString().split('T')[0],
        assignedTo: currentUser.name,
      });
    }
    
    createRecord(newRecord as Omit<Record, 'id' | 'createdAt' | 'updatedAt'>);
    setQuickAddValue('');
    setQuickAddColumn(null);
    toast.success('Record created');
  };

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const toggleSwimlaneCollapse = (swimlane: string) => {
    setCollapsedSwimlanes(prev => {
      const next = new Set(prev);
      if (next.has(swimlane)) {
        next.delete(swimlane);
      } else {
        next.add(swimlane);
      }
      return next;
    });
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

  const getColumnTotal = (columnId: string) => {
    const columnRecords = getRecordsForColumnAndSwimlane(columnId, 'all');
    if (currentTable === 'opportunities') {
      return columnRecords.reduce((sum, r) => sum + (r as Opportunity).value, 0);
    }
    return null;
  };

  const swimlanes = getSwimlanes();

  const renderCard = (record: Record, index: number) => {
    const isOpportunity = record.tableType === 'opportunities';
    const isTask = record.tableType === 'tasks';
    const isHovered = hoveredCard === record.id;
    const subtitle = getCardSubtitle(record);
    const isDragging = draggedRecord?.id === record.id;

    return (
      <motion.div
        key={record.id}
        layout
        variants={cardVariants}
        initial="initial"
        animate={isDragging ? "drag" : "animate"}
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        transition={{ ...quickSpring, delay: index * 0.03 }}
        className="cursor-grab active:cursor-grabbing"
        draggable={currentUser.permissions.canEditRecords}
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, record)}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHoveredCard(record.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => openViewDialog(record)}
      >
        <Card className={`transition-colors ${isDragging ? 'opacity-50' : ''}`}>
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
                    className={`h-6 w-6 flex-shrink-0 transition-all duration-150 ${
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

            {isOpportunity && cardFields.find(f => f.key === 'value')?.visible && (
              <motion.div 
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DollarSign className="h-4 w-4 text-emerald-600" />
                {formatCurrency((record as Opportunity).value)}
              </motion.div>
            )}

            {isTask && cardFields.find(f => f.key === 'priority')?.visible && (
              <motion.div 
                className="mb-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant={getPriorityVariant((record as Task).priority)} className="text-xs">
                  {(record as Task).priority}
                </Badge>
              </motion.div>
            )}

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              {cardFields.find(f => f.key === 'assignedTo')?.visible && (
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
              )}
              
              {(isOpportunity || isTask) && cardFields.find(f => f.key === 'dueDate')?.visible && (
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
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden bg-muted/30">
        {/* Toolbar */}
        <motion.div 
          className="flex items-center justify-between px-4 py-3 border-b border-border bg-background"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-sm text-muted-foreground"
              key={filteredRecords.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredRecords.length} {filteredRecords.length === 1 ? 'card' : 'cards'}
            </motion.span>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={swimlaneBy} onValueChange={(v) => setSwimlaneBy(v as SwimlaneOption)}>
              <SelectTrigger className="h-8 w-[160px]">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Swimlanes</SelectItem>
                <SelectItem value="assignedTo">By Assignee</SelectItem>
                {currentTable === 'tasks' && (
                  <SelectItem value="priority">By Priority</SelectItem>
                )}
                {currentTable === 'contacts' && (
                  <SelectItem value="organization">By Organization</SelectItem>
                )}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Card Fields</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {cardFields.map((field) => (
                  <DropdownMenuCheckboxItem
                    key={field.key}
                    checked={field.visible}
                    onCheckedChange={() => {
                      setCardFields(prev => prev.map(f => 
                        f.key === field.key ? { ...f, visible: !f.visible } : f
                      ));
                    }}
                  >
                    {field.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Board */}
        <div className="flex-1 overflow-auto">
          {swimlanes.map((swimlane) => (
            <div key={swimlane} className="min-w-max">
              {/* Swimlane Header */}
              {swimlaneBy !== 'none' && (
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border cursor-pointer hover:bg-muted/70"
                  onClick={() => toggleSwimlaneCollapse(swimlane)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={springTransition}
                >
                  <motion.div
                    animate={{ rotate: collapsedSwimlanes.has(swimlane) ? -90 : 0 }}
                    transition={quickSpring}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{swimlane}</span>
                  <Badge variant="secondary" className="text-xs">
                    {columns.reduce((sum, col) => sum + getRecordsForColumnAndSwimlane(col.id, swimlane).length, 0)}
                  </Badge>
                </motion.div>
              )}

              {/* Columns */}
              <AnimatePresence>
                {!collapsedSwimlanes.has(swimlane) && (
                  <motion.div 
                    className="flex gap-4 p-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={springTransition}
                  >
                    {columns.map((column, columnIndex) => {
                      const columnRecords = getRecordsForColumnAndSwimlane(column.id, swimlane);
                      const isOver = dragOverColumn === column.id;
                      const total = swimlane === 'all' || swimlaneBy === 'none' ? getColumnTotal(column.id) : null;
                      const isCollapsed = collapsedColumns.has(column.id);
                      const isOverWipLimit = column.wipLimit && columnRecords.length > column.wipLimit;
                      const wipProgress = column.wipLimit ? (columnRecords.length / column.wipLimit) * 100 : 0;

                      if (isCollapsed) {
                        return (
                          <motion.div
                            key={column.id}
                            variants={columnVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ ...springTransition, delay: columnIndex * 0.05 }}
                            className="w-10 flex-shrink-0 rounded-xl bg-background border border-border cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleColumnCollapse(column.id)}
                          >
                            <div className="flex flex-col items-center py-3 gap-2">
                              <div className={`w-2 h-2 rounded-full ${column.color}`} />
                              <span className="text-xs font-semibold writing-mode-vertical transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                {column.title}
                              </span>
                              <Badge variant="secondary" className="text-[10px] px-1">
                                {columnRecords.length}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={column.id}
                          variants={columnVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ ...springTransition, delay: columnIndex * 0.05 }}
                          className={`flex flex-col w-80 flex-shrink-0 rounded-xl bg-background border transition-all ${
                            isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : 'border-border'
                          } ${isOverWipLimit ? 'border-destructive' : ''}`}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, column.id)}
                        >
                          <div className="flex items-center justify-between px-3 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleColumnCollapse(column.id)}>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              <motion.div 
                                className={`w-2 h-2 rounded-full ${column.color}`}
                                layoutId={`column-dot-${column.id}`}
                              />
                              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                              <motion.div
                                key={columnRecords.length}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={quickSpring}
                              >
                                <Badge variant={isOverWipLimit ? 'destructive' : 'secondary'} className="text-xs">
                                  {columnRecords.length}
                                  {column.wipLimit && `/${column.wipLimit}`}
                                </Badge>
                              </motion.div>
                              {isOverWipLimit && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={quickSpring}
                                    >
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent>WIP limit exceeded</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            {currentUser.permissions.canEditRecords && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => setQuickAddColumn(column.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add new item</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          
                          {/* WIP Progress */}
                          {column.wipLimit && (
                            <div className="px-3 py-1">
                              <Progress 
                                value={Math.min(wipProgress, 100)} 
                                className={`h-1 ${isOverWipLimit ? '[&>div]:bg-destructive' : ''}`}
                              />
                            </div>
                          )}
                          
                          {total !== null && (
                            <motion.div 
                              className="px-3 py-2 border-b border-border bg-muted/30"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <span className="text-xs text-muted-foreground">
                                Total: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
                              </span>
                            </motion.div>
                          )}
                          
                          <ScrollArea className="flex-1 px-2 py-2">
                            <div className="space-y-2">
                              {/* Quick Add Input */}
                              <AnimatePresence>
                                {quickAddColumn === column.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={springTransition}
                                  >
                                    <Card className="border-primary">
                                      <CardContent className="p-2">
                                        <Input
                                          placeholder="Enter title..."
                                          value={quickAddValue}
                                          onChange={(e) => setQuickAddValue(e.target.value)}
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleQuickAdd(column.id);
                                            } else if (e.key === 'Escape') {
                                              setQuickAddColumn(null);
                                              setQuickAddValue('');
                                            }
                                          }}
                                          onBlur={() => {
                                            if (!quickAddValue.trim()) {
                                              setQuickAddColumn(null);
                                            }
                                          }}
                                          className="h-8"
                                        />
                                        <div className="flex gap-2 mt-2">
                                          <Button 
                                            size="sm" 
                                            className="flex-1 h-7"
                                            onClick={() => handleQuickAdd(column.id)}
                                            disabled={!quickAddValue.trim()}
                                          >
                                            Add
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7"
                                            onClick={() => {
                                              setQuickAddColumn(null);
                                              setQuickAddValue('');
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              <AnimatePresence mode="popLayout">
                                {columnRecords.map((record, index) => renderCard(record, index))}
                              </AnimatePresence>
                              
                              {columnRecords.length === 0 && !quickAddColumn && (
                                <motion.div 
                                  className="text-center py-8 text-muted-foreground text-sm"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  {isOver ? 'Drop here' : 'No items'}
                                </motion.div>
                              )}
                            </div>
                          </ScrollArea>
                          
                          {/* Quick Add Button at Bottom */}
                          {currentUser.permissions.canEditRecords && quickAddColumn !== column.id && (
                            <motion.button
                              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 border-t border-border transition-colors"
                              onClick={() => setQuickAddColumn(column.id)}
                              whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Plus className="h-4 w-4" />
                              Add item
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}