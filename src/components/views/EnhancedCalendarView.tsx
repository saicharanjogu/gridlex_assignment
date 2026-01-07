"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus,
  Clock,
  List,
  LayoutGrid,
  GripVertical,
} from 'lucide-react';
import { Record, Task, Opportunity } from '@/types';
import { toast } from 'sonner';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setHours,
  startOfDay,
  isToday,
  parseISO,
} from 'date-fns';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export function EnhancedCalendarView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    updateRecord,
    openViewDialog,
    openCreateDialog,
    openEditDialog,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [draggedEvent, setDraggedEvent] = useState<Record | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [showMiniCalendar, setShowMiniCalendar] = useState(true);

  // Reset state when currentTable changes
  useEffect(() => {
    setCurrentDate(new Date());
    setDraggedEvent(null);
    setDragOverDate(null);
  }, [currentTable]);

  const records = getRecordsForCurrentTable();

  const getDateField = (record: Record): string | null => {
    if (record.tableType === 'tasks') {
      return (record as Task).dueDate;
    }
    if (record.tableType === 'opportunities') {
      return (record as Opportunity).closeDate;
    }
    return record.createdAt;
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

  const getRecordsForDate = useCallback((date: Date) => {
    return filteredRecords.filter((record) => {
      const dateField = getDateField(record);
      if (!dateField) return false;
      return isSameDay(parseISO(dateField), date);
    });
  }, [filteredRecords]);

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
      case 'agenda':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
      case 'agenda':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (e: React.DragEvent, record: Record) => {
    setDraggedEvent(record);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      const dateField = draggedEvent.tableType === 'tasks' ? 'dueDate' : 
                        draggedEvent.tableType === 'opportunities' ? 'closeDate' : 'createdAt';
      
      const updatedRecord = { 
        ...draggedEvent, 
        [dateField]: format(date, 'yyyy-MM-dd')
      };
      updateRecord(updatedRecord as Record);
      toast.success(`Rescheduled to ${format(date, 'MMM d, yyyy')}`);
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const getDateRange = () => {
    switch (viewMode) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({
          start: startOfWeek(monthStart),
          end: endOfWeek(monthEnd),
        });
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        });
      case 'day':
      case 'agenda':
        return [currentDate];
    }
  };

  const getHoursOfDay = () => {
    return eachHourOfInterval({
      start: setHours(startOfDay(currentDate), 8),
      end: setHours(startOfDay(currentDate), 20),
    });
  };

  const days = getDateRange();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventVariant = (record: Record): "default" | "secondary" | "destructive" | "outline" => {
    if (record.tableType === 'tasks') {
      const priority = (record as Task).priority;
      if (['Urgent', 'High'].includes(priority)) return 'destructive';
      if (priority === 'Medium') return 'default';
      return 'secondary';
    }
    if (record.tableType === 'opportunities') {
      const stage = (record as Opportunity).stage;
      if (stage === 'Closed Won') return 'default';
      if (stage === 'Closed Lost') return 'destructive';
      return 'secondary';
    }
    return 'secondary';
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return filteredRecords
      .filter(record => {
        const dateField = getDateField(record);
        if (!dateField) return false;
        return parseISO(dateField) >= today;
      })
      .sort((a, b) => {
        const dateA = getDateField(a);
        const dateB = getDateField(b);
        if (!dateA || !dateB) return 0;
        return parseISO(dateA).getTime() - parseISO(dateB).getTime();
      })
      .slice(0, 10);
  };

  const renderEventBadge = (record: Record, compact = false) => (
    <div
      key={record.id}
      draggable
      onDragStart={(e) => handleDragStart(e, record)}
      onDragEnd={handleDragEnd}
      onClick={(e) => { e.stopPropagation(); openViewDialog(record); }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Badge 
        variant={getEventVariant(record)} 
        className={`w-full justify-start truncate font-normal cursor-pointer hover:opacity-80 ${
          compact ? 'text-[10px] px-1 py-0' : 'text-xs'
        }`}
      >
        {!compact && <GripVertical className="h-3 w-3 mr-1 opacity-50" />}
        {record.name}
      </Badge>
    </div>
  );

  const renderMonthView = () => (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayRecords = getRecordsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const isDropTarget = dragOverDate && isSameDay(day, dragOverDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-b border-r border-border transition-colors ${
                !isCurrentMonth ? 'bg-muted/30' : 'bg-background'
              } ${isDropTarget ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              onDoubleClick={() => {
                setCurrentDate(day);
                openCreateDialog();
              }}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center text-sm rounded-full font-medium transition-colors ${
                    isDayToday
                      ? 'bg-primary text-primary-foreground'
                      : isCurrentMonth
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayRecords.slice(0, 3).map((record) => renderEventBadge(record, true))}
                {dayRecords.length > 3 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full text-xs text-muted-foreground hover:text-foreground text-left px-1">
                        +{dayRecords.length - 3} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="space-y-1">
                        {dayRecords.map((record) => renderEventBadge(record))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const hours = getHoursOfDay();
    
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-border">
          <div className="w-16" /> {/* Time column spacer */}
          {days.map((day) => {
            const isDayToday = isToday(day);
            return (
              <div key={day.toISOString()} className="px-2 py-3 text-center border-l border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`mt-1 w-10 h-10 mx-auto flex items-center justify-center text-xl font-semibold rounded-full ${
                    isDayToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-8">
            {/* Time Labels */}
            <div className="w-16">
              {hours.map((hour) => (
                <div key={hour.toISOString()} className="h-16 pr-2 text-right">
                  <span className="text-xs text-muted-foreground">
                    {format(hour, 'h a')}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Day Columns */}
            {days.map((day) => {
              const dayRecords = getRecordsForDate(day);
              const isDropTarget = dragOverDate && isSameDay(day, dragOverDate);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`border-l border-border relative ${
                    isDropTarget ? 'bg-primary/10' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  {hours.map((hour) => (
                    <div 
                      key={hour.toISOString()} 
                      className="h-16 border-b border-border/50 hover:bg-muted/30"
                      onDoubleClick={() => {
                        setCurrentDate(day);
                        openCreateDialog();
                      }}
                    />
                  ))}
                  
                  {/* Events */}
                  <div className="absolute top-0 left-1 right-1 space-y-1 pt-1">
                    {dayRecords.map((record) => renderEventBadge(record))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getHoursOfDay();
    const dayRecords = getRecordsForDate(currentDate);

    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Time Grid */}
        <ScrollArea className="flex-1">
          <div className="min-w-[600px]">
            {hours.map((hour) => {
              const isDropTarget = dragOverDate && isSameDay(currentDate, dragOverDate);
              
              return (
                <div 
                  key={hour.toISOString()} 
                  className={`flex border-b border-border/50 ${
                    isDropTarget ? 'bg-primary/10' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, currentDate)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, currentDate)}
                >
                  <div className="w-20 py-4 pr-4 text-right flex-shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {format(hour, 'h:mm a')}
                    </span>
                  </div>
                  <div 
                    className="flex-1 py-2 px-2 min-h-[60px] hover:bg-muted/30"
                    onDoubleClick={() => openCreateDialog()}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Day Events Sidebar */}
        <div className="w-80 border-l border-border bg-muted/30 p-4">
          <h3 className="font-semibold mb-4">
            {format(currentDate, 'EEEE, MMMM d')}
          </h3>
          <div className="space-y-2">
            {dayRecords.length > 0 ? (
              dayRecords.map((record) => (
                <Card 
                  key={record.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openViewDialog(record)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, record)}
                  onDragEnd={handleDragEnd}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{record.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{record.tableType}</p>
                      </div>
                      <Badge variant={getEventVariant(record)} className="text-[10px]">
                        {record.tableType === 'tasks' ? (record as Task).priority : 
                         record.tableType === 'opportunities' ? (record as Opportunity).stage : 'Event'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = getUpcomingEvents();
    
    // Group events by date
    const groupedEvents: { [key: string]: Record[] } = {};
    upcomingEvents.forEach(record => {
      const dateField = getDateField(record);
      if (dateField) {
        const dateKey = format(parseISO(dateField), 'yyyy-MM-dd');
        if (!groupedEvents[dateKey]) {
          groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(record);
      }
    });

    return (
      <div className="flex-1 flex overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {Object.entries(groupedEvents).map(([dateKey, events]) => {
              const date = parseISO(dateKey);
              const isDayToday = isToday(date);
              
              return (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                      isDayToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <span className="text-[10px] font-semibold uppercase">
                        {format(date, 'MMM')}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {format(date, 'd')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{format(date, 'EEEE')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isDayToday ? 'Today' : format(date, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-[60px]">
                    {events.map((record) => (
                      <Card 
                        key={record.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openViewDialog(record)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, record)}
                        onDragEnd={handleDragEnd}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                          <div className={`w-1 h-10 rounded-full ${
                            getEventVariant(record) === 'destructive' ? 'bg-destructive' :
                            getEventVariant(record) === 'default' ? 'bg-primary' : 'bg-muted-foreground'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{record.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {record.tableType}
                              </Badge>
                              {record.tableType === 'tasks' && (
                                <Badge variant={getEventVariant(record)} className="text-xs">
                                  {(record as Task).priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); openEditDialog(record); }}
                          >
                            Edit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {Object.keys(groupedEvents).length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-base font-medium">No upcoming events</p>
                <p className="text-sm">Create a new event to get started</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Mini Calendar Sidebar */}
        {showMiniCalendar && (
          <div className="w-72 border-l border-border bg-muted/30 p-4">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
              className="rounded-md border"
            />
            
            <div className="my-4 border-t border-border" />
            
            <h4 className="font-semibold text-sm mb-3">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Events</span>
                <span className="font-medium">{filteredRecords.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">
                  {filteredRecords.filter(r => {
                    const dateField = getDateField(r);
                    if (!dateField) return false;
                    const date = parseISO(dateField);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return date >= weekStart && date <= weekEnd;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-medium text-destructive">
                  {filteredRecords.filter(r => {
                    const dateField = getDateField(r);
                    if (!dateField) return false;
                    return parseISO(dateField) < new Date();
                  }).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
            </div>
            <h2 className="text-lg font-semibold">
              {viewMode === 'day' || viewMode === 'agenda'
                ? format(currentDate, 'MMMM d, yyyy')
                : format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
            
            {viewMode === 'agenda' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={showMiniCalendar ? 'default' : 'outline'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowMiniCalendar(!showMiniCalendar)}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle mini calendar</TooltipContent>
              </Tooltip>
            )}
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
              <TabsList>
                <TabsTrigger value="month" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Month</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Week</span>
                </TabsTrigger>
                <TabsTrigger value="day" className="gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Day</span>
                </TabsTrigger>
                <TabsTrigger value="agenda" className="gap-1.5">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Agenda</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'agenda' && renderAgendaView()}
        </div>
      </div>
    </TooltipProvider>
  );
}