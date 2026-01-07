"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Search, X, List } from 'lucide-react';
import { Record, Contact, Organization, Opportunity, Task } from '@/types';

export function MapView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
  } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showList, setShowList] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  const records = getRecordsForCurrentTable();

  const filteredRecords = useMemo(() => {
    let result = records.filter((record) => record.location);

    const query = (searchQuery || localSearch).toLowerCase();
    if (query) {
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
  }, [records, searchQuery, localSearch, filters]);

  const getRecordName = (record: Record): string => {
    return record.name;
  };

  const getRecordSubtitle = (record: Record): string => {
    switch (record.tableType) {
      case 'contacts':
        return (record as Contact).organization;
      case 'organizations':
        return (record as Organization).industry;
      case 'opportunities':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format((record as Opportunity).value);
      case 'tasks':
        return (record as Task).assignedTo;
      default:
        return '';
    }
  };

  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {filteredRecords.map((record, index) => {
        if (!record.location) return null;
        
        const left = ((record.location.lng + 130) / 60) * 100;
        const top = ((50 - record.location.lat) / 30) * 100;
        
        return (
          <button
            key={record.id}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-micro hover:scale-110"
            style={{
              left: `${Math.min(Math.max(left, 5), 95)}%`,
              top: `${Math.min(Math.max(top, 10), 90)}%`,
            }}
            onClick={() => setSelectedRecord(record)}
          >
            <div className="relative">
              <MapPin
                className={`h-6 w-6 ${
                  selectedRecord?.id === record.id
                    ? 'text-foreground'
                    : 'text-rose-500'
                }`}
                strokeWidth={1.5}
                fill={selectedRecord?.id === record.id ? 'currentColor' : '#f43f5e'}
              />
            </div>
          </button>
        );
      })}
      
      {filteredRecords.length === 0 && (
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">No locations</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapPlaceholder />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
            <Input
              placeholder="Search locations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background/95 backdrop-blur border-border/50 shadow-sm"
            />
            {localSearch && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-micro"
                onClick={() => setLocalSearch('')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowList(!showList)}
            className={`p-2 rounded-md transition-micro ${
              showList 
                ? 'bg-foreground text-background' 
                : 'bg-background/95 text-muted-foreground hover:text-foreground border border-border/50'
            } shadow-sm`}
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Record Count */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-background/95 backdrop-blur rounded-md shadow-sm border border-border/50">
          <span className="text-xs font-medium text-muted-foreground">
            {filteredRecords.length} locations
          </span>
        </div>
      </div>

      {/* Side Panel */}
      {showList && (
        <div className="w-72 border-l border-border/30 bg-background flex flex-col">
          <div className="px-4 py-3 border-b border-border/30">
            <h3 className="text-sm font-medium">Locations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredRecords.length} records
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredRecords.map((record, index) => (
                <button
                  key={record.id}
                  className={`w-full flex items-start gap-3 p-2.5 text-left rounded-lg transition-micro ${
                    selectedRecord?.id === record.id
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {getRecordName(record)}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {getRecordSubtitle(record)}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 capitalize">
                      {record.tableType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {selectedRecord && getRecordName(selectedRecord)}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground capitalize">
                {selectedRecord.tableType}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedRecord.tableType === 'contacts' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                      <p className="font-medium">{(selectedRecord as Contact).email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Phone</p>
                      <p className="font-medium">{(selectedRecord as Contact).phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Organization</p>
                      <p className="font-medium">{(selectedRecord as Contact).organization}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Role</p>
                      <p className="font-medium">{(selectedRecord as Contact).role}</p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'organizations' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Industry</p>
                      <p className="font-medium">{(selectedRecord as Organization).industry}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Contact</p>
                      <p className="font-medium">{(selectedRecord as Organization).contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Phone</p>
                      <p className="font-medium">{(selectedRecord as Organization).phone}</p>
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
                  </>
                )}
                {selectedRecord.tableType === 'tasks' && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Due Date</p>
                      <p className="font-medium">
                        {new Date((selectedRecord as Task).dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Priority</p>
                      <p className="font-medium">{(selectedRecord as Task).priority}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Assigned To</p>
                      <p className="font-medium">{(selectedRecord as Task).assignedTo}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedRecord.location && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Coordinates</p>
                  <p className="text-sm font-medium">
                    {selectedRecord.location.lat.toFixed(4)}, {selectedRecord.location.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}