export type TableType = 'contacts' | 'opportunities' | 'organizations' | 'tasks';

export type ViewType = 'list' | 'kanban' | 'calendar' | 'map';

export type UserRole = 'admin' | 'manager' | 'viewer';

export type ShareMode = 'private' | 'team' | 'public';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  permissions: {
    canConfigureViews: boolean;
    canEditRecords: boolean;
    canDeleteRecords: boolean;
    canExport: boolean;
  };
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'currency';
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  required?: boolean;
  options?: string[];
}

export interface ViewConfig {
  id: string;
  name: string;
  type: ViewType;
  tableType: TableType | 'unified';
  visibleFields: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters: Filter[];
  groupBy?: string;
  savedBy: string;
  isDefault: boolean;
  isShared?: boolean;
  shareMode?: ShareMode;
  createdAt?: string;
  updatedAt?: string;
}

export interface Filter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: string | number | [string, string];
}

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact extends BaseRecord {
  tableType: 'contacts';
  name: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  location?: { lat: number; lng: number };
}

export interface Opportunity extends BaseRecord {
  tableType: 'opportunities';
  name: string;
  value: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  closeDate: string;
  assignedTo: string;
  location?: { lat: number; lng: number };
}

export interface Organization extends BaseRecord {
  tableType: 'organizations';
  name: string;
  industry: string;
  contactPerson: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  location?: { lat: number; lng: number };
}

export interface Task extends BaseRecord {
  tableType: 'tasks';
  name: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  location?: { lat: number; lng: number };
}

export type Record = Contact | Opportunity | Organization | Task;

export type RecordFormData = Omit<Record, 'id' | 'createdAt' | 'updatedAt'>;

export interface UnifiedRecord {
  id: string;
  tableType: TableType;
  record: Record;
}