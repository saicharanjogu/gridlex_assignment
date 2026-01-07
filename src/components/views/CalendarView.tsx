"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
  startOfDay,
  endOfDay,
} from 'date-fns';

type CalendarViewMode = 'month' | 'week' | 'day';

export function CalendarView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    currentUser,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Closed Won':
        return 'bg-green-500 text-white';
      case 'Closed Lost':
        return 'bg-red-500 text-white';
      case 'Negotiation':
        return 'bg-orange-500 text-white';
      case 'Proposal':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const renderRecordBadge = (record: Record) => {
    const isTask = record.tableType === 'tasks';
    const isOpportunity = record.tableType === 'opportunities';

    let colorClass = 'bg-primary text-primary-foreground';
    if (isTask) {
      colorClass = getPriorityColor((record as Task).priority);
    } else if (isOpportunity) {
      colorClass = getStageColor((record as Opportunity).stage);
    }

    return (
      <div
        key={record.id}
        className={`text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 ${colorClass}`}
        onClick={() => setSelectedRecord(record)}
      >
        {(record as Task | Opportunity).name || (record as Record).name}
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-border flex-1">
      {weekDays.map((day) => (
        <div
          key={day}
          className="bg-muted p-2 text-center text-sm font-medium"
        >
          {day}
        </div>
      ))}
      {days.map((day) => {
        const dayRecords = getRecordsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            className={`bg-background p-2 min-h-[100px] ${
              !isCurrentMonth ? 'opacity-50' : ''
            }`}
            onClick={() => setSelectedDate(day)}
          >
            <div
              className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                isToday ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayRecords.slice(0, 3).map((record) => renderRecordBadge(record))}
              {dayRecords.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayRecords.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-px bg-border flex-1">
      {days.map((day) => {
        const dayRecords = getRecordsForDate(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={day.toISOString()} className="bg-background flex flex-col">
            <div
              className={`p-2 text-center border-b ${
                isToday ? 'bg-primary/10' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-lg font-medium w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {dayRecords.map((record) => renderRecordBadge(record))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => {
    const dayRecords = getRecordsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto">
        <div className="text-center p-4 border-b">
          <div className="text-2xl font-bold">{format(currentDate, 'EEEE')}</div>
          <div className="text-muted-foreground">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-4">
            Events ({dayRecords.length})
          </h3>
          <div className="space-y-2">
            {dayRecords.map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedRecord(record)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {(record as Task | Opportunity).name || (record as Record).name}
                      </h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {record.tableType}
                      </p>
                    </div>
                    {record.tableType === 'tasks' && (
                      <Badge className={getPriorityColor((record as Task).priority)}>
                        {(record as Task).priority}
                      </Badge>
                    )}
                    {record.tableType === 'opportunities' && (
                      <Badge className={getStageColor((record as Opportunity).stage)}>
                        {(record as Opportunity).stage}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {dayRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events for this day
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {viewMode === 'day'
              ? format(currentDate, 'MMMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          {currentUser.permissions.canEditRecords && (
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord && ((selectedRecord as Task | Opportunity).name || (selectedRecord as Record).name)}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium capitalize">{selectedRecord.tableType}</p>
                </div>
                {selectedRecord.tableType === 'tasks' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Priority</label>
                      <p className="font-medium">{(selectedRecord as Task).priority}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <p className="font-medium">{(selectedRecord as Task).status}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Assigned To</label>
                      <p className="font-medium">{(selectedRecord as Task).assignedTo}</p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'opportunities' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Value</label>
                      <p className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format((selectedRecord as Opportunity).value)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Stage</label>
                      <p className="font-medium">{(selectedRecord as Opportunity).stage}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Assigned To</label>
                      <p className="font-medium">{(selectedRecord as Opportunity).assignedTo}</p>
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