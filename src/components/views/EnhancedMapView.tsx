"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MapPin, 
  Search, 
  X, 
  List, 
  Plus,
  Circle,
  Eye,
  ZoomIn,
  ZoomOut,
  Locate,
  Map as MapIcon,
} from 'lucide-react';
import { Record, Contact, Organization, Opportunity, Task } from '@/types';

type MapStyle = 'streets' | 'satellite' | 'terrain';

interface RadiusSearch {
  enabled: boolean;
  center: { lat: number; lng: number } | null;
  radius: number;
}

// Separate component for the actual map to handle dynamic import properly
function LeafletMap({ 
  filteredRecords, 
  radiusSearch, 
  mapBounds, 
  mapStyle,
  onMarkerClick,
  getRecordSubtitle,
  openViewDialog,
  openEditDialog,
}: {
  filteredRecords: Record[];
  radiusSearch: RadiusSearch;
  mapBounds: { center: [number, number]; zoom: number };
  mapStyle: MapStyle;
  onMarkerClick: (record: Record) => void;
  getRecordSubtitle: (record: Record) => string;
  openViewDialog: (record: Record) => void;
  openEditDialog: (record: Record) => void;
}) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<{ center: [number, number]; zoom: number; className: string; children: React.ReactNode }>;
    TileLayer: React.ComponentType<{ url: string; attribution: string }>;
    Marker: React.ComponentType<{ position: [number, number]; eventHandlers: { click: () => void }; children: React.ReactNode }>;
    Popup: React.ComponentType<{ children: React.ReactNode }>;
    Circle: React.ComponentType<{ center: [number, number]; radius: number; pathOptions: { color: string; fillColor: string; fillOpacity: number } }>;
  } | null>(null);

  useEffect(() => {
    // Load Leaflet CSS via link element
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    // Import Leaflet and fix default marker icons
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });

    // Import react-leaflet components
    import('react-leaflet').then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer as React.ComponentType<{ center: [number, number]; zoom: number; className: string; children: React.ReactNode }>,
        TileLayer: mod.TileLayer as React.ComponentType<{ url: string; attribution: string }>,
        Marker: mod.Marker as React.ComponentType<{ position: [number, number]; eventHandlers: { click: () => void }; children: React.ReactNode }>,
        Popup: mod.Popup as React.ComponentType<{ children: React.ReactNode }>,
        Circle: mod.Circle as React.ComponentType<{ center: [number, number]; radius: number; pathOptions: { color: string; fillColor: string; fillOpacity: number } }>,
      });
      setLeafletLoaded(true);
    });
  }, []);

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  if (!leafletLoaded || !MapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <MapIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle: CircleComponent } = MapComponents;

  return (
    <MapContainer
      center={mapBounds.center}
      zoom={mapBounds.zoom}
      className="w-full h-full z-0"
    >
      <TileLayer
        url={getTileLayerUrl()}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {radiusSearch.enabled && radiusSearch.center && (
        <CircleComponent
          center={[radiusSearch.center.lat, radiusSearch.center.lng]}
          radius={radiusSearch.radius * 1609.34}
          pathOptions={{ 
            color: '#3b82f6', 
            fillColor: '#3b82f6', 
            fillOpacity: 0.1 
          }}
        />
      )}
      
      {filteredRecords.map((record) => {
        if (!record.location) return null;
        
        return (
          <Marker
            key={record.id}
            position={[record.location.lat, record.location.lng]}
            eventHandlers={{
              click: () => onMarkerClick(record),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold">{record.name}</h4>
                <p className="text-sm text-muted-foreground">{getRecordSubtitle(record)}</p>
                <Badge variant="outline" className="mt-2 capitalize text-xs">
                  {record.tableType}
                </Badge>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openViewDialog(record)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" onClick={() => openEditDialog(record)}>
                    Edit
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export function EnhancedMapView() {
  const {
    currentTable,
    searchQuery,
    filters,
    getRecordsForCurrentTable,
    openViewDialog,
    openCreateDialog,
    openEditDialog,
  } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showList, setShowList] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [radiusSearch, setRadiusSearch] = useState<RadiusSearch>({
    enabled: false,
    center: null,
    radius: 10,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredRecord, setHoveredRecord] = useState<string | null>(null);

  const records = getRecordsForCurrentTable();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset state when currentTable changes
  useEffect(() => {
    setSelectedRecord(null);
    setLocalSearch('');
    setRadiusSearch({
      enabled: false,
      center: null,
      radius: 10,
    });
  }, [currentTable]);

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

    if (radiusSearch.enabled && radiusSearch.center) {
      result = result.filter(record => {
        if (!record.location) return false;
        const distance = calculateDistance(
          radiusSearch.center!.lat,
          radiusSearch.center!.lng,
          record.location.lat,
          record.location.lng
        );
        return distance <= radiusSearch.radius;
      });
    }

    return result;
  }, [records, searchQuery, localSearch, filters, radiusSearch]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
      return { bg: 'bg-emerald-500', border: 'border-emerald-600' };
    }
    if (['Pending', 'In Progress', 'Proposal', 'Negotiation'].includes(status)) {
      return { bg: 'bg-amber-500', border: 'border-amber-600' };
    }
    if (['Inactive', 'Cancelled', 'Closed Lost'].includes(status)) {
      return { bg: 'bg-red-500', border: 'border-red-600' };
    }
    return { bg: 'bg-primary', border: 'border-primary' };
  };

  const handleMarkerClick = (record: Record) => {
    setSelectedRecord(record);
  };

  const handleCardClick = (record: Record) => {
    setSelectedRecord(record);
  };

  const mapBounds = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { center: [39.8283, -98.5795] as [number, number], zoom: 4 };
    }
    
    const lats = filteredRecords.map(r => r.location!.lat);
    const lngs = filteredRecords.map(r => r.location!.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return { center: [centerLat, centerLng] as [number, number], zoom: 5 };
  }, [filteredRecords]);

  return (
    <TooltipProvider>
      <div className="flex h-full bg-background">
        {/* Map Area */}
        <div className="flex-1 relative">
          {isMounted ? (
            <LeafletMap
              filteredRecords={filteredRecords}
              radiusSearch={radiusSearch}
              mapBounds={mapBounds}
              mapStyle={mapStyle}
              onMarkerClick={handleMarkerClick}
              getRecordSubtitle={getRecordSubtitle}
              openViewDialog={openViewDialog}
              openEditDialog={openEditDialog}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <MapIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-[1000]">
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
            
            {/* Radius Search */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant={radiusSearch.enabled ? 'default' : 'outline'} 
                  size="icon" 
                  className="h-10 w-10 shadow-md bg-background"
                >
                  <Circle className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Radius Search</SheetTitle>
                  <SheetDescription>
                    Find records within a specific distance
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <Label>Enable Radius Search</Label>
                    <Button
                      variant={radiusSearch.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRadiusSearch(prev => ({
                        ...prev,
                        enabled: !prev.enabled,
                        center: prev.enabled ? null : prev.center
                      }))}
                    >
                      {radiusSearch.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  {radiusSearch.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Radius: {radiusSearch.radius} miles</Label>
                        <Slider
                          value={[radiusSearch.radius]}
                          onValueChange={([value]) => setRadiusSearch(prev => ({ ...prev, radius: value }))}
                          min={1}
                          max={100}
                          step={1}
                        />
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        {radiusSearch.center ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Center Point</p>
                            <p className="text-xs text-muted-foreground">
                              {radiusSearch.center.lat.toFixed(4)}, {radiusSearch.center.lng.toFixed(4)}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setRadiusSearch(prev => ({ ...prev, center: null }))}
                            >
                              Clear Center
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground text-center">
                              Click a marker to set as center point
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setRadiusSearch(prev => ({ 
                                ...prev, 
                                center: { lat: mapBounds.center[0], lng: mapBounds.center[1] }
                              }))}
                            >
                              Use Map Center
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {filteredRecords.length} records found within radius
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Map Style */}
            <Select value={mapStyle} onValueChange={(v) => setMapStyle(v as MapStyle)}>
              <SelectTrigger className="w-[120px] h-10 shadow-md bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streets">Streets</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Card */}
          <Card className="absolute bottom-4 left-4 shadow-md z-[1000]">
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">{filteredRecords.length}</p>
                  <p className="text-xs text-muted-foreground">locations</p>
                </div>
                {radiusSearch.enabled && radiusSearch.center && (
                  <>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="text-sm font-medium">{radiusSearch.radius} mi</p>
                      <p className="text-xs text-muted-foreground">radius</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-[1000]">
            <Button variant="outline" size="icon" className="h-8 w-8 shadow-md bg-background">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 shadow-md bg-background">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 shadow-md bg-background">
              <Locate className="h-4 w-4" />
            </Button>
          </div>
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
                {filteredRecords.map((record, index) => {
                  const colors = getStatusColor(record);
                  const isSelected = selectedRecord?.id === record.id;
                  
                  return (
                    <Card
                      key={record.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleCardClick(record)}
                      onMouseEnter={() => setHoveredRecord(record.id)}
                      onMouseLeave={() => setHoveredRecord(null)}
                      onDoubleClick={() => openViewDialog(record)}
                    >
                      <CardContent className="p-3 flex items-start gap-3">
                        <div 
                          className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {record.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {getRecordSubtitle(record)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {record.tableType}
                            </Badge>
                            {radiusSearch.enabled && radiusSearch.center && record.location && (
                              <span className="text-[10px] text-muted-foreground">
                                {calculateDistance(
                                  radiusSearch.center.lat,
                                  radiusSearch.center.lng,
                                  record.location.lat,
                                  record.location.lng
                                ).toFixed(1)} mi
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No locations found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}