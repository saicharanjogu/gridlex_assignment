"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const getEventDot = (record: Record) => {
    if (record.tableType === 'tasks') {
      const priority = (record as Task).priority;
      switch (priority) {
        case 'Urgent':
          return 'bg-rose-500';
        case 'High':
          return 'bg-amber-500';
        case 'Medium':
          return 'bg-blue-500';
        default:
          return 'bg-slate-400';
      }
    }
    if (record.tableType === 'opportunities') {
      const stage = (record as Opportunity).stage;
      if (stage === 'Closed Won') return 'bg-emerald-500';
      if (stage === 'Closed Lost') return 'bg-rose-500';
      return 'bg-violet-500';
    }
    return 'bg-slate-400';
  };

  const renderMonthView = () => (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-7 border-b border-border/30">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => {
          const dayRecords = getRecordsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 border-b border-r border-border/20 ${
                !isCurrentMonth ? 'bg-muted/20' : ''
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center text-sm rounded-full ${
                    isToday
                      ? 'bg-foreground text-background font-medium'
                      : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayRecords.slice(0, 3).map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="w-full flex items-center gap-1.5 px-1.5 py-0.5 text-xs text-left rounded hover:bg-accent/50 transition-micro truncate"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getEventDot(record)}`} />
                    <span className="truncate">{record.name}</span>
                  </button>
                ))}
                {dayRecords.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1.5">
                    +{dayRecords.length - 3} more
                  </span>
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
      <div className="grid grid-cols-7 border-b border-border/30">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="px-3 py-3 text-center">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {format(day, 'EEE')}
              </div>
              <div
                className={`mt-1 w-8 h-8 mx-auto flex items-center justify-center text-lg rounded-full ${
                  isToday ? 'bg-foreground text-background font-medium' : ''
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
            <ScrollArea key={day.toISOString()} className="border-r border-border/20 p-2">
              <div className="space-y-1">
                {dayRecords.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-left rounded hover:bg-accent/50 transition-micro"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getEventDot(record)}`} />
                    <span className="truncate">{record.name}</span>
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
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold">{format(currentDate, 'EEEE')}</div>
          <div className="text-muted-foreground">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        <div className="max-w-md mx-auto space-y-2">
          {dayRecords.map((record) => (
            <button
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-border/40 hover:border-border transition-micro"
            >
              <div className={`w-2 h-2 rounded-full ${getEventDot(record)}`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{record.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">{record.tableType}</p>
              </div>
            </button>
          ))}
          {dayRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No events</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {viewMode === 'day'
              ? format(currentDate, 'MMMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrevious}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-micro"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-micro"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-micro"
          >
            Today
          </button>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50">
            {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-micro capitalize ${
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
            <DialogTitle className="text-base font-semibold">
              {selectedRecord?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getEventDot(selectedRecord)}`} />
                <span className="text-sm text-muted-foreground capitalize">
                  {selectedRecord.tableType}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedRecord.tableType === 'tasks' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Priority</p>
                      <p className="font-medium">{(selectedRecord as Task).priority}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Status</p>
                      <p className="font-medium">{(selectedRecord as Task).status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Assigned To</p>
                      <p className="font-medium">{(selectedRecord as Task).assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Due Date</p>
                      <p className="font-medium">
                        {new Date((selectedRecord as Task).dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'opportunities' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Value</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format((selectedRecord as Opportunity).value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Stage</p>
                      <p className="font-medium">{(selectedRecord as Opportunity).stage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Assigned To</p>
                      <p className="font-medium">{(selectedRecord as Opportunity).assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Close Date</p>
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