"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewType, TableType, ViewConfig, Filter, User, Record } from '@/types';
import { mockUser, mockContacts, mockOpportunities, mockOrganizations, mockTasks, defaultViewConfigs } from '@/data/mock-data';

interface AppState {
  currentUser: User;
  currentView: ViewType;
  currentTable: TableType | 'unified';
  viewConfigs: ViewConfig[];
  activeViewConfig: ViewConfig | null;
  searchQuery: string;
  filters: Filter[];
  selectedRecords: string[];
}

interface AppContextType extends AppState {
  setCurrentView: (view: ViewType) => void;
  setCurrentTable: (table: TableType | 'unified') => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  setSelectedRecords: (ids: string[]) => void;
  toggleRecordSelection: (id: string) => void;
  saveViewConfig: (config: ViewConfig) => void;
  setActiveViewConfig: (config: ViewConfig | null) => void;
  getRecordsForCurrentTable: () => Record[];
  updateRecord: (record: Record) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser] = useState<User>(mockUser);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [currentTable, setCurrentTable] = useState<TableType | 'unified'>('contacts');
  const [viewConfigs, setViewConfigs] = useState<ViewConfig[]>(defaultViewConfigs);
  const [activeViewConfig, setActiveViewConfig] = useState<ViewConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  
  const [contacts, setContacts] = useState(mockContacts);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [tasks, setTasks] = useState(mockTasks);

  const addFilter = useCallback((filter: Filter) => {
    setFilters(prev => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const toggleRecordSelection = useCallback((id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const saveViewConfig = useCallback((config: ViewConfig) => {
    setViewConfigs(prev => {
      const existingIndex = prev.findIndex(v => v.id === config.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      }
      return [...prev, config];
    });
  }, []);

  const getRecordsForCurrentTable = useCallback((): Record[] => {
    switch (currentTable) {
      case 'contacts':
        return contacts;
      case 'opportunities':
        return opportunities;
      case 'organizations':
        return organizations;
      case 'tasks':
        return tasks;
      case 'unified':
        return [...contacts, ...opportunities, ...organizations, ...tasks];
      default:
        return [];
    }
  }, [currentTable, contacts, opportunities, organizations, tasks]);

  const updateRecord = useCallback((record: Record) => {
    switch (record.tableType) {
      case 'contacts':
        setContacts(prev => prev.map(r => r.id === record.id ? record : r));
        break;
      case 'opportunities':
        setOpportunities(prev => prev.map(r => r.id === record.id ? record : r));
        break;
      case 'organizations':
        setOrganizations(prev => prev.map(r => r.id === record.id ? record : r));
        break;
      case 'tasks':
        setTasks(prev => prev.map(r => r.id === record.id ? record : r));
        break;
    }
  }, []);

  const value: AppContextType = {
    currentUser,
    currentView,
    currentTable,
    viewConfigs,
    activeViewConfig,
    searchQuery,
    filters,
    selectedRecords,
    setCurrentView,
    setCurrentTable,
    setSearchQuery,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    setSelectedRecords,
    toggleRecordSelection,
    saveViewConfig,
    setActiveViewConfig,
    getRecordsForCurrentTable,
    updateRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}