import { Contact, Opportunity, Organization, Task, FieldConfig, ViewConfig, User } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Admin User',
  role: 'admin',
  permissions: {
    canConfigureViews: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canExport: true,
  },
};

export const contactFields: FieldConfig[] = [
  { key: 'name', label: 'Name', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'email', label: 'Email', type: 'email', visible: true, sortable: true, filterable: true },
  { key: 'phone', label: 'Phone', type: 'phone', visible: true, sortable: false, filterable: true },
  { key: 'organization', label: 'Organization', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'role', label: 'Role', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'status', label: 'Status', type: 'select', visible: true, sortable: true, filterable: true, options: ['Active', 'Inactive', 'Pending'] },
];

export const opportunityFields: FieldConfig[] = [
  { key: 'name', label: 'Opportunity Name', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'value', label: 'Value', type: 'currency', visible: true, sortable: true, filterable: true },
  { key: 'stage', label: 'Stage', type: 'select', visible: true, sortable: true, filterable: true, options: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
  { key: 'closeDate', label: 'Close Date', type: 'date', visible: true, sortable: true, filterable: true },
  { key: 'assignedTo', label: 'Assigned To', type: 'text', visible: true, sortable: true, filterable: true },
];

export const organizationFields: FieldConfig[] = [
  { key: 'name', label: 'Organization Name', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'industry', label: 'Industry', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'contactPerson', label: 'Contact Person', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'phone', label: 'Phone', type: 'phone', visible: true, sortable: false, filterable: true },
  { key: 'status', label: 'Status', type: 'select', visible: true, sortable: true, filterable: true, options: ['Active', 'Inactive', 'Prospect'] },
];

export const taskFields: FieldConfig[] = [
  { key: 'name', label: 'Task Name', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'dueDate', label: 'Due Date', type: 'date', visible: true, sortable: true, filterable: true },
  { key: 'priority', label: 'Priority', type: 'select', visible: true, sortable: true, filterable: true, options: ['Low', 'Medium', 'High', 'Urgent'] },
  { key: 'assignedTo', label: 'Assigned To', type: 'text', visible: true, sortable: true, filterable: true },
  { key: 'status', label: 'Status', type: 'select', visible: true, sortable: true, filterable: true, options: ['Pending', 'In Progress', 'Completed', 'Cancelled'] },
];

export const mockContacts: Contact[] = [
  { id: '1', tableType: 'contacts', name: 'John Doe', email: 'john.doe@example.com', phone: '+1234567890', organization: 'ACME Corp', role: 'Sales Manager', status: 'Active', createdAt: '2024-01-15', updatedAt: '2024-06-01', location: { lat: 40.7128, lng: -74.0060 } },
  { id: '2', tableType: 'contacts', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1234567891', organization: 'Tech Solutions', role: 'CEO', status: 'Active', createdAt: '2024-02-10', updatedAt: '2024-06-05', location: { lat: 34.0522, lng: -118.2437 } },
  { id: '3', tableType: 'contacts', name: 'Bob Wilson', email: 'bob.wilson@example.com', phone: '+1234567892', organization: 'Global Industries', role: 'CTO', status: 'Pending', createdAt: '2024-03-20', updatedAt: '2024-06-10', location: { lat: 41.8781, lng: -87.6298 } },
  { id: '4', tableType: 'contacts', name: 'Alice Brown', email: 'alice.brown@example.com', phone: '+1234567893', organization: 'StartUp Inc', role: 'Product Manager', status: 'Active', createdAt: '2024-04-05', updatedAt: '2024-06-12', location: { lat: 37.7749, lng: -122.4194 } },
  { id: '5', tableType: 'contacts', name: 'Charlie Davis', email: 'charlie.davis@example.com', phone: '+1234567894', organization: 'ACME Corp', role: 'Developer', status: 'Inactive', createdAt: '2024-05-01', updatedAt: '2024-06-15', location: { lat: 47.6062, lng: -122.3321 } },
];

export const mockOpportunities: Opportunity[] = [
  { id: '1', tableType: 'opportunities', name: 'Enterprise Deal', value: 50000, stage: 'Proposal', closeDate: '2024-07-15', assignedTo: 'Jane Smith', createdAt: '2024-01-10', updatedAt: '2024-06-01', location: { lat: 40.7128, lng: -74.0060 } },
  { id: '2', tableType: 'opportunities', name: 'SMB Package', value: 15000, stage: 'Qualified', closeDate: '2024-07-20', assignedTo: 'John Doe', createdAt: '2024-02-15', updatedAt: '2024-06-05', location: { lat: 34.0522, lng: -118.2437 } },
  { id: '3', tableType: 'opportunities', name: 'Startup Bundle', value: 5000, stage: 'Lead', closeDate: '2024-08-01', assignedTo: 'Bob Wilson', createdAt: '2024-03-01', updatedAt: '2024-06-10', location: { lat: 41.8781, lng: -87.6298 } },
  { id: '4', tableType: 'opportunities', name: 'Consulting Project', value: 25000, stage: 'Negotiation', closeDate: '2024-06-30', assignedTo: 'Jane Smith', createdAt: '2024-04-10', updatedAt: '2024-06-12', location: { lat: 37.7749, lng: -122.4194 } },
  { id: '5', tableType: 'opportunities', name: 'Annual Contract', value: 100000, stage: 'Closed Won', closeDate: '2024-06-15', assignedTo: 'John Doe', createdAt: '2024-05-01', updatedAt: '2024-06-15', location: { lat: 47.6062, lng: -122.3321 } },
];

export const mockOrganizations: Organization[] = [
  { id: '1', tableType: 'organizations', name: 'ACME Corp', industry: 'Manufacturing', contactPerson: 'John Doe', phone: '+1234567890', status: 'Active', createdAt: '2024-01-01', updatedAt: '2024-06-01', location: { lat: 40.7128, lng: -74.0060 } },
  { id: '2', tableType: 'organizations', name: 'Tech Solutions', industry: 'Technology', contactPerson: 'Jane Smith', phone: '+1234567891', status: 'Active', createdAt: '2024-02-01', updatedAt: '2024-06-05', location: { lat: 34.0522, lng: -118.2437 } },
  { id: '3', tableType: 'organizations', name: 'Global Industries', industry: 'Finance', contactPerson: 'Bob Wilson', phone: '+1234567892', status: 'Prospect', createdAt: '2024-03-01', updatedAt: '2024-06-10', location: { lat: 41.8781, lng: -87.6298 } },
  { id: '4', tableType: 'organizations', name: 'StartUp Inc', industry: 'Technology', contactPerson: 'Alice Brown', phone: '+1234567893', status: 'Active', createdAt: '2024-04-01', updatedAt: '2024-06-12', location: { lat: 37.7749, lng: -122.4194 } },
  { id: '5', tableType: 'organizations', name: 'Enterprise Co', industry: 'Healthcare', contactPerson: 'Charlie Davis', phone: '+1234567894', status: 'Inactive', createdAt: '2024-05-01', updatedAt: '2024-06-15', location: { lat: 47.6062, lng: -122.3321 } },
];

export const mockTasks: Task[] = [
  { id: '1', tableType: 'tasks', name: 'Follow-up Call', dueDate: '2024-06-30', priority: 'High', assignedTo: 'John Doe', status: 'Pending', createdAt: '2024-06-01', updatedAt: '2024-06-01', location: { lat: 40.7128, lng: -74.0060 } },
  { id: '2', tableType: 'tasks', name: 'Send Proposal', dueDate: '2024-07-05', priority: 'Medium', assignedTo: 'Jane Smith', status: 'In Progress', createdAt: '2024-06-05', updatedAt: '2024-06-10', location: { lat: 34.0522, lng: -118.2437 } },
  { id: '3', tableType: 'tasks', name: 'Client Meeting', dueDate: '2024-07-10', priority: 'High', assignedTo: 'Bob Wilson', status: 'Pending', createdAt: '2024-06-10', updatedAt: '2024-06-15', location: { lat: 41.8781, lng: -87.6298 } },
  { id: '4', tableType: 'tasks', name: 'Review Contract', dueDate: '2024-06-28', priority: 'Urgent', assignedTo: 'Alice Brown', status: 'In Progress', createdAt: '2024-06-12', updatedAt: '2024-06-20', location: { lat: 37.7749, lng: -122.4194 } },
  { id: '5', tableType: 'tasks', name: 'Update CRM', dueDate: '2024-07-15', priority: 'Low', assignedTo: 'Charlie Davis', status: 'Completed', createdAt: '2024-06-15', updatedAt: '2024-06-25', location: { lat: 47.6062, lng: -122.3321 } },
];

export const defaultViewConfigs: ViewConfig[] = [
  { id: '1', name: 'All Contacts', type: 'list', tableType: 'contacts', visibleFields: ['name', 'email', 'phone', 'organization', 'status'], filters: [], savedBy: '1', isDefault: true },
  { id: '2', name: 'Opportunities Pipeline', type: 'kanban', tableType: 'opportunities', visibleFields: ['name', 'value', 'assignedTo'], groupBy: 'stage', filters: [], savedBy: '1', isDefault: true },
  { id: '3', name: 'Task Calendar', type: 'calendar', tableType: 'tasks', visibleFields: ['name', 'priority', 'assignedTo'], filters: [], savedBy: '1', isDefault: true },
  { id: '4', name: 'Organization Map', type: 'map', tableType: 'organizations', visibleFields: ['name', 'industry', 'status'], filters: [], savedBy: '1', isDefault: true },
];

export const getFieldsForTable = (tableType: string): FieldConfig[] => {
  switch (tableType) {
    case 'contacts':
      return contactFields;
    case 'opportunities':
      return opportunityFields;
    case 'organizations':
      return organizationFields;
    case 'tasks':
      return taskFields;
    default:
      return [];
  }
};