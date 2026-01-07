"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MapPin, Search, X, List, Layers } from 'lucide-react';
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

  const getStatusColor = (record: Record) => {
    let status = '';
    switch (record.tableType) {
      case 'contacts':
        status = (record as Contact).status;
        break;
      case 'organizations':
        status = (record as Organization).status;
        break;
      case 'opportunities':
        status = (record as Opportunity).stage;
        break;
      case 'tasks':
        status = (record as Task).status;
        break;
    }

    if (['Active', 'Completed', 'Closed Won'].includes(status)) {
      return 'bg-emerald-500';
    }
    if (['Pending', 'In Progress', 'Proposal', 'Negotiation'].includes(status)) {
      return 'bg-amber-500';
    }
    if (['Inactive', 'Cancelled', 'Closed Lost'].includes(status)) {
      return 'bg-red-500';
    }
    return 'bg-primary';
  };

  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.15" className="text-border" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Map markers */}
      {filteredRecords.map((record, index) => {
        if (!record.location) return null;
        
        const left = ((record.location.lng + 130) / 60) * 100;
        const top = ((50 - record.location.lat) / 30) * 100;
        const isSelected = selectedRecord?.id === record.id;
        
        return (
          <button
            key={record.id}
            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 ${
              isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
            }`}
            style={{
              left: `${Math.min(Math.max(left, 5), 95)}%`,
              top: `${Math.min(Math.max(top, 10), 90)}%`,
            }}
            onClick={() => setSelectedRecord(record)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${getStatusColor(record)} flex items-center justify-center shadow-lg border-2 border-background`}>
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
              )}
            </div>
          </button>
        );
      })}
      
      {filteredRecords.length === 0 && (
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">No locations</p>
          <p className="text-sm">No records with location data found</p>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex h-full bg-background">
        {/* Map Area */}
        <div className="flex-1 relative">
          <MapPlaceholder />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 h-10 bg-background shadow-md"
              />
              {localSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setLocalSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showList ? 'default' : 'outline'}
                  size="icon"
                  className="h-10 w-10 shadow-md"
                  onClick={() => setShowList(!showList)}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle list</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shadow-md bg-background">
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Map layers</TooltipContent>
            </Tooltip>
          </div>

          {/* Stats */}
          <Card className="absolute bottom-4 left-4 shadow-md">
            <CardContent className="p-3">
              <span className="text-sm font-medium">
                {filteredRecords.length} locations
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        {showList && (
          <div className="w-80 border-l border-border bg-background flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Locations</h3>
              <p className="text-sm text-muted-foreground">
                {filteredRecords.length} records with location data
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredRecords.map((record, index) => (
                  <Card
                    key={record.id}
                    className={`cursor-pointer transition-all ${
                      selectedRecord?.id === record.id
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full ${getStatusColor(record)} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {record.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {getRecordSubtitle(record)}
                        </p>
                        <Badge variant="outline" className="mt-1.5 text-[10px] capitalize">
                          {record.tableType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

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
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.tableType === 'contacts' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{(selectedRecord as Contact).email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm">{(selectedRecord as Contact).phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Organization</p>
                        <p className="font-medium text-sm">{(selectedRecord as Contact).organization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium text-sm">{(selectedRecord as Contact).role}</p>
                      </div>
                    </>
                  )}
                  {selectedRecord.tableType === 'organizations' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium text-sm">{(selectedRecord as Organization).industry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium text-sm">{(selectedRecord as Organization).contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm">{(selectedRecord as Organization).phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium text-sm">{(selectedRecord as Organization).status}</p>
                      </div>
                    </>
                  )}
                  {selectedRecord.tableType === 'opportunities' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Value</p>
                        <p className="font-medium text-sm">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format((selectedRecord as Opportunity).value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stage</p>
                        <p className="font-medium text-sm">{(selectedRecord as Opportunity).stage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium text-sm">{(selectedRecord as Opportunity).assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Close Date</p>
                        <p className="font-medium text-sm">
                          {new Date((selectedRecord as Opportunity).closeDate).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedRecord.tableType === 'tasks' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium text-sm">
                          {new Date((selectedRecord as Task).dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <p className="font-medium text-sm">{(selectedRecord as Task).priority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium text-sm">{(selectedRecord as Task).assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium text-sm">{(selectedRecord as Task).status}</p>
                      </div>
                    </>
                  )}
                </div>

                {selectedRecord.location && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinates</p>
                      <p className="font-medium text-sm">
                        {selectedRecord.location.lat.toFixed(4)}, {selectedRecord.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}