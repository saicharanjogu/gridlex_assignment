"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MapPin, Search, X, List, Layers, Plus } from 'lucide-react';
import { Record, Contact, Organization, Opportunity, Task } from '@/types';

export function MapView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    openViewDialog,
    openCreateDialog,
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

  const handleMarkerClick = (record: Record) => {
    setSelectedRecord(record);
  };

  const handleCardClick = (record: Record) => {
    setSelectedRecord(record);
    openViewDialog(record);
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
            onClick={() => handleMarkerClick(record)}
            onDoubleClick={() => openViewDialog(record)}
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
          <Button className="mt-4" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
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
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Locations</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredRecords.length} records
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
              </Button>
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
                    onClick={() => handleCardClick(record)}
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
      </div>
    </TooltipProvider>
  );
}