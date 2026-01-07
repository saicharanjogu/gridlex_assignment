"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewType, TableType, ViewConfig, Filter, User, Record, Contact, Opportunity, Organization, Task } from '@/types';
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
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isViewDialogOpen: boolean;
  editingRecord: Record | null;
  viewingRecord: Record | null;
  deletingRecords: string[];
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
  selectAllRecords: (ids: string[]) => void;
  clearSelection: () => void;
  saveViewConfig: (config: ViewConfig) => void;
  setActiveViewConfig: (config: ViewConfig | null) => void;
  getRecordsForCurrentTable: () => Record[];
  
  // CRUD Operations
  createRecord: (record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (record: Record) => void;
  deleteRecord: (id: string) => void;
  deleteRecords: (ids: string[]) => void;
  duplicateRecord: (id: string) => void;
  
  // Dialog controls
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openEditDialog: (record: Record) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (ids: string[]) => void;
  closeDeleteDialog: () => void;
  openViewDialog: (record: Record) => void;
  closeViewDialog: () => void;
  
  // Get record by ID
  getRecordById: (id: string) => Record | undefined;
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
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Record | null>(null);
  const [deletingRecords, setDeletingRecords] = useState<string[]>([]);
  
  // Data states
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

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

  const selectAllRecords = useCallback((ids: string[]) => {
    setSelectedRecords(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRecords([]);
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

  const getRecordById = useCallback((id: string): Record | undefined => {
    return [...contacts, ...opportunities, ...organizations, ...tasks].find(r => r.id === id);
  }, [contacts, opportunities, organizations, tasks]);

  // CRUD Operations
  const createRecord = useCallback((recordData: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = getCurrentDate();
    const newRecord = {
      ...recordData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as Record;

    switch (newRecord.tableType) {
      case 'contacts':
        setContacts(prev => [...prev, newRecord as Contact]);
        break;
      case 'opportunities':
        setOpportunities(prev => [...prev, newRecord as Opportunity]);
        break;
      case 'organizations':
        setOrganizations(prev => [...prev, newRecord as Organization]);
        break;
      case 'tasks':
        setTasks(prev => [...prev, newRecord as Task]);
        break;
    }
  }, []);

  const updateRecord = useCallback((record: Record) => {
    const updatedRecord = { ...record, updatedAt: getCurrentDate() };
    
    switch (record.tableType) {
      case 'contacts':
        setContacts(prev => prev.map(r => r.id === record.id ? updatedRecord as Contact : r));
        break;
      case 'opportunities':
        setOpportunities(prev => prev.map(r => r.id === record.id ? updatedRecord as Opportunity : r));
        break;
      case 'organizations':
        setOrganizations(prev => prev.map(r => r.id === record.id ? updatedRecord as Organization : r));
        break;
      case 'tasks':
        setTasks(prev => prev.map(r => r.id === record.id ? updatedRecord as Task : r));
        break;
    }
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setContacts(prev => prev.filter(r => r.id !== id));
    setOpportunities(prev => prev.filter(r => r.id !== id));
    setOrganizations(prev => prev.filter(r => r.id !== id));
    setTasks(prev => prev.filter(r => r.id !== id));
    setSelectedRecords(prev => prev.filter(i => i !== id));
  }, []);

  const deleteRecords = useCallback((ids: string[]) => {
    setContacts(prev => prev.filter(r => !ids.includes(r.id)));
    setOpportunities(prev => prev.filter(r => !ids.includes(r.id)));
    setOrganizations(prev => prev.filter(r => !ids.includes(r.id)));
    setTasks(prev => prev.filter(r => !ids.includes(r.id)));
    setSelectedRecords(prev => prev.filter(i => !ids.includes(i)));
  }, []);

  const duplicateRecord = useCallback((id: string) => {
    const record = getRecordById(id);
    if (!record) return;

    const now = getCurrentDate();
    const newRecord = {
      ...record,
      id: generateId(),
      name: `${record.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    } as Record;

    switch (newRecord.tableType) {
      case 'contacts':
        setContacts(prev => [...prev, newRecord as Contact]);
        break;
      case 'opportunities':
        setOpportunities(prev => [...prev, newRecord as Opportunity]);
        break;
      case 'organizations':
        setOrganizations(prev => [...prev, newRecord as Organization]);
        break;
      case 'tasks':
        setTasks(prev => [...prev, newRecord as Task]);
        break;
    }
  }, [getRecordById]);

  // Dialog controls
  const openCreateDialog = useCallback(() => setIsCreateDialogOpen(true), []);
  const closeCreateDialog = useCallback(() => setIsCreateDialogOpen(false), []);
  
  const openEditDialog = useCallback((record: Record) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  }, []);
  const closeEditDialog = useCallback(() => {
    setEditingRecord(null);
    setIsEditDialogOpen(false);
  }, []);
  
  const openDeleteDialog = useCallback((ids: string[]) => {
    setDeletingRecords(ids);
    setIsDeleteDialogOpen(true);
  }, []);
  const closeDeleteDialog = useCallback(() => {
    setDeletingRecords([]);
    setIsDeleteDialogOpen(false);
  }, []);
  
  const openViewDialog = useCallback((record: Record) => {
    setViewingRecord(record);
    setIsViewDialogOpen(true);
  }, []);
  const closeViewDialog = useCallback(() => {
    setViewingRecord(null);
    setIsViewDialogOpen(false);
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
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isViewDialogOpen,
    editingRecord,
    viewingRecord,
    deletingRecords,
    setCurrentView,
    setCurrentTable,
    setSearchQuery,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    setSelectedRecords,
    toggleRecordSelection,
    selectAllRecords,
    clearSelection,
    saveViewConfig,
    setActiveViewConfig,
    getRecordsForCurrentTable,
    createRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    duplicateRecord,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openViewDialog,
    closeViewDialog,
    getRecordById,
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