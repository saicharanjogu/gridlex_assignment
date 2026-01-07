import { TableType, ViewType } from '@/types';

export interface ViewAvailability {
  available: boolean;
  reason?: string;
  suggestion?: string;
}

export const viewConfigs: { type: ViewType; label: string }[] = [
  { type: 'list', label: 'Table' },
  { type: 'kanban', label: 'Board' },
  { type: 'calendar', label: 'Calendar' },
  { type: 'map', label: 'Map' },
];

const availabilityRules: Record<TableType | 'unified', Record<ViewType, ViewAvailability>> = {
  contacts: {
    list: { available: true },
    kanban: { available: false, reason: 'Kanban view works best with workflow stages.', suggestion: 'Consider using List view or switch to Tasks/Opportunities for Kanban.' },
    calendar: { available: false, reason: 'Calendar view requires date-based records.', suggestion: 'Contacts don\'t have a primary date field.' },
    map: { available: true },
  },
  opportunities: {
    list: { available: true },
    kanban: { available: true },
    calendar: { available: true },
    map: { available: false, reason: 'Map view requires location data.', suggestion: 'Add a location field or view the associated Organization on the map.' },
  },
  organizations: {
    list: { available: true },
    kanban: { available: false, reason: 'Kanban view works best with workflow stages.', suggestion: 'Consider using List view for organizations.' },
    calendar: { available: false, reason: 'Calendar view requires date-based records.', suggestion: 'View related Tasks or Opportunities in Calendar view instead.' },
    map: { available: true },
  },
  tasks: {
    list: { available: true },
    kanban: { available: true },
    calendar: { available: true },
    map: { available: false, reason: 'Map view requires location data.', suggestion: 'Consider adding a location field for field tasks.' },
  },
  unified: {
    list: { available: true },
    kanban: { available: true },
    calendar: { available: true },
    map: { available: true },
  },
};

export function getViewAvailability(tableType: TableType | 'unified', viewType: ViewType): ViewAvailability {
  return availabilityRules[tableType][viewType];
}

export function getAvailableViews(tableType: TableType | 'unified'): ViewType[] {
  return viewConfigs.filter(c => getViewAvailability(tableType, c.type).available).map(c => c.type);
}

export function getFirstAvailableView(tableType: TableType | 'unified', currentView: ViewType): ViewType {
  if (getViewAvailability(tableType, currentView).available) return currentView;
  return getAvailableViews(tableType)[0] || 'list';
}