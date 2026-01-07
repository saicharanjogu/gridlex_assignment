"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Record, Task, Opportunity } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';

type CalendarViewMode = 'month' | 'week' | 'day';

export function CalendarView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    openViewDialog,
    openCreateDialog,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

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

  const getRecordsForDate = (date: Date) => {
    return filteredRecords.filter((record) => {
      const dateField = getDateField(record);
      if (!dateField) return false;
      return isSameDay(new Date(dateField), date);
    });
  };

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
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
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
        return [currentDate];
    }
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
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-b border-r border-border ${
                !isCurrentMonth ? 'bg-muted/30' : 'bg-background'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center text-sm rounded-full font-medium ${
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayRecords.slice(0, 3).map((record) => (
                  <button
                    key={record.id}
                    onClick={() => openViewDialog(record)}
                    className="w-full"
                  >
                    <Badge 
                      variant={getEventVariant(record)} 
                      className="w-full justify-start truncate text-xs font-normal cursor-pointer hover:opacity-80"
                    >
                      {record.name}
                    </Badge>
                  </button>
                ))}
                {dayRecords.length > 3 && (
                  <button className="w-full text-xs text-muted-foreground hover:text-foreground text-left px-2">
                    +{dayRecords.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="px-2 py-3 text-center border-r border-border last:border-r-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {format(day, 'EEE')}
              </div>
              <div
                className={`mt-1 w-10 h-10 mx-auto flex items-center justify-center text-xl font-semibold rounded-full ${
                  isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map((day) => {
          const dayRecords = getRecordsForDate(day);
          return (
            <ScrollArea key={day.toISOString()} className="border-r border-border last:border-r-0 p-2">
              <div className="space-y-1">
                {dayRecords.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => openViewDialog(record)}
                    className="w-full"
                  >
                    <Badge 
                      variant={getEventVariant(record)} 
                      className="w-full justify-start truncate text-xs font-normal cursor-pointer hover:opacity-80"
                    >
                      {record.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayRecords = getRecordsForDate(currentDate);

    return (
      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold">{format(currentDate, 'EEEE')}</div>
          <div className="text-lg text-muted-foreground">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        <div className="max-w-lg mx-auto space-y-3">
          {dayRecords.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => openViewDialog(record)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Badge variant={getEventVariant(record)} className="h-3 w-3 p-0 rounded-full" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{record.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{record.tableType}</p>
                </div>
                {record.tableType === 'tasks' && (
                  <Badge variant="outline">{(record as Task).priority}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {dayRecords.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">No events</p>
              <p className="text-sm">Nothing scheduled for this day</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          )}
        </div>
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
              {viewMode === 'day'
                ? format(currentDate, 'MMMM d, yyyy')
                : format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      </div>
    </TooltipProvider>
  );
}