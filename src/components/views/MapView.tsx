"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, List, Search, X } from 'lucide-react';
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
  const [mapLoaded, setMapLoaded] = useState(false);
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
    switch (record.tableType) {
      case 'contacts':
        return (record as Contact).name;
      case 'organizations':
        return (record as Organization).name;
      case 'opportunities':
        return (record as Opportunity).name;
      case 'tasks':
        return (record as Task).name;
      default:
        return 'Unknown';
    }
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
        }).format((record as Opportunity).value);
      case 'tasks':
        return (record as Task).assignedTo;
      default:
        return '';
    }
  };

  const getStatusBadge = (record: Record) => {
    let status = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

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
      variant = 'default';
    } else if (['Pending', 'In Progress', 'Proposal', 'Negotiation'].includes(status)) {
      variant = 'secondary';
    } else if (['Inactive', 'Cancelled', 'Closed Lost'].includes(status)) {
      variant = 'destructive';
    }

    return <Badge variant={variant}>{status}</Badge>;
  };

  // Simple map placeholder - in production, you'd use react-leaflet or similar
  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Map markers */}
      {filteredRecords.map((record, index) => {
        if (!record.location) return null;
        
        // Simple positioning based on lat/lng (normalized for display)
        const left = ((record.location.lng + 130) / 60) * 100;
        const top = ((50 - record.location.lat) / 30) * 100;
        
        return (
          <div
            key={record.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
            style={{
              left: `${Math.min(Math.max(left, 5), 95)}%`,
              top: `${Math.min(Math.max(top, 10), 90)}%`,
            }}
            onClick={() => setSelectedRecord(record)}
          >
            <div className="relative">
              <MapPin
                className={`h-8 w-8 ${
                  selectedRecord?.id === record.id
                    ? 'text-primary fill-primary'
                    : 'text-red-500 fill-red-500'
                }`}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                {index + 1}
              </div>
            </div>
          </div>
        );
      })}
      
      {filteredRecords.length === 0 && (
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No records with location data</p>
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-white shadow-md"
            />
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setLocalSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant={showList ? 'default' : 'outline'}
            size="icon"
            className="bg-white shadow-md"
            onClick={() => setShowList(!showList)}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <h4 className="text-sm font-medium mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500 fill-red-500" />
              <span>Location</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary fill-primary" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Record Count */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-3 py-2">
          <span className="text-sm font-medium">
            {filteredRecords.length} locations
          </span>
        </div>
      </div>

      {/* Side Panel */}
      {showList && (
        <div className="w-80 border-l bg-background flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Locations</h3>
            <p className="text-sm text-muted-foreground">
              {filteredRecords.length} records with location data
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredRecords.map((record, index) => (
                <Card
                  key={record.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {getRecordName(record)}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {getRecordSubtitle(record)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {record.tableType}
                          </Badge>
                          {getStatusBadge(record)}
                        </div>
                      </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord && getRecordName(selectedRecord)}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {selectedRecord.tableType}
                </Badge>
                {getStatusBadge(selectedRecord)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedRecord.tableType === 'contacts' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{(selectedRecord as Contact).email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium">{(selectedRecord as Contact).phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Organization</label>
                      <p className="font-medium">{(selectedRecord as Contact).organization}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Role</label>
                      <p className="font-medium">{(selectedRecord as Contact).role}</p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'organizations' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Industry</label>
                      <p className="font-medium">{(selectedRecord as Organization).industry}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Contact Person</label>
                      <p className="font-medium">{(selectedRecord as Organization).contactPerson}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium">{(selectedRecord as Organization).phone}</p>
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
                      <label className="text-sm text-muted-foreground">Close Date</label>
                      <p className="font-medium">
                        {new Date((selectedRecord as Opportunity).closeDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Assigned To</label>
                      <p className="font-medium">{(selectedRecord as Opportunity).assignedTo}</p>
                    </div>
                  </>
                )}
                {selectedRecord.tableType === 'tasks' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Due Date</label>
                      <p className="font-medium">
                        {new Date((selectedRecord as Task).dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Priority</label>
                      <p className="font-medium">{(selectedRecord as Task).priority}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Assigned To</label>
                      <p className="font-medium">{(selectedRecord as Task).assignedTo}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedRecord.location && (
                <div>
                  <label className="text-sm text-muted-foreground">Coordinates</label>
                  <p className="font-medium">
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