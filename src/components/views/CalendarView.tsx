"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

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

  const getEventColor = (record: Record) => {
    if (record.tableType === 'tasks') {
      const priority = (record as Task).priority;
      switch (priority) {
        case 'Urgent':
          return 'bg-red-500 text-white';
        case 'High':
          return 'bg-orange-500 text-white';
        case 'Medium':
          return 'bg-amber-500 text-white';
        default:
          return 'bg-slate-500 text-white';
      }
    }
    if (record.tableType === 'opportunities') {
      const stage = (record as Opportunity).stage;
      if (stage === 'Closed Won') return 'bg-emerald-500 text-white';
      if (stage === 'Closed Lost') return 'bg-red-500 text-white';
      return 'bg-blue-500 text-white';
    }
    return 'bg-primary text-primary-foreground';
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
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full px-2 py-1 text-xs text-left rounded truncate transition-micro hover:opacity-80 ${getEventColor(record)}`}
                  >
                    {record.name}
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
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full px-2 py-1.5 text-xs text-left rounded transition-micro hover:opacity-80 ${getEventColor(record)}`}
                  >
                    {record.name}
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
            <button
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="w-full flex items-center gap-4 p-4 text-left rounded-xl border border-border bg-background hover:bg-muted/50 transition-micro"
            >
              <div className={`w-3 h-3 rounded-full ${getEventColor(record).split(' ')[0]}`} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{record.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">{record.tableType}</p>
              </div>
              {record.tableType === 'tasks' && (
                <Badge variant="outline">{(record as Task).priority}</Badge>
              )}
            </button>
          ))}
          {dayRecords.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" strokeWidth={1} />
              <p className="text-base font-medium">No events</p>
              <p className="text-sm">Nothing scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">
            {viewMode === 'day'
              ? format(currentDate, 'MMMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-micro capitalize ${
                viewMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.name}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <Badge variant="outline" className="capitalize">
                {selectedRecord.tableType}
              </Badge>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedRecord.tableType === 'tasks' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <p className="font-medium">{(selectedRecord as Task).priority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{(selectedRecord as Task).status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{(selectedRecord as Task).assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {new Date((selectedRecord as Task).dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'opportunities' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format((selectedRecord as Opportunity).value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stage</p>
                      <p className="font-medium">{(selectedRecord as Opportunity).stage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{(selectedRecord as Opportunity).assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Close Date</p>
                      <p className="font-medium">
                        {new Date((selectedRecord as Opportunity).closeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}