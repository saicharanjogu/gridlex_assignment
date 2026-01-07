import { TableType, ViewType } from '@/types';

export interface ViewAvailability {
  available: boolean;
  reason?: string;
  suggestion?: string;
}

export interface ViewConfig {
  type: ViewType;
  label: string;
  description: string;
}

export const viewConfigs: ViewConfig[] = [
  { type: 'list', label: 'Table', description: 'View records in a spreadsheet-like format' },
  { type: 'kanban', label: 'Board', description: 'Visualize records as cards in columns' },
  { type: 'calendar', label: 'Calendar', description: 'View records on a calendar timeline' },
  { type: 'map', label: 'Map', description: 'Plot records on a geographic map' },
];

export function getViewAvailability(
  tableType: TableType | 'unified',
  viewType: ViewType
): ViewAvailability {
  // List view is always available for all tables
  if (viewType === 'list') {
    return { available: true };
  }

  // Define availability rules for each table type
  const availabilityRules: Record<TableType | 'unified', Record<ViewType, ViewAvailability>> = {
    contacts: {
      list: { available: true },
      kanban: {
        available: false,
        reason: 'Kanban view works best with workflow stages.',
        suggestion: 'Contacts have status but not a typical workflow progression. Consider using List view or switch to Tasks/Opportunities for Kanban.',
      },
      calendar: {
        available: false,
        reason: 'Calendar view requires date-based records.',
        suggestion: 'Contacts don\'t have a primary date field. Add a "Last Contacted" or "Follow-up Date" field to enable Calendar view.',
      },
      map: {
        available: true,
        reason: 'Contacts can be plotted by their location.',
      },
    },
    opportunities: {
      list: { available: true },
      kanban: {
        available: true,
        reason: 'Perfect for visualizing your sales pipeline by stage.',
      },
      calendar: {
        available: true,
        reason: 'View opportunities by their close dates.',
      },
      map: {
        available: false,
        reason: 'Map view requires location data.',
        suggestion: 'Opportunities don\'t have geographic fields. Add a location field or view the associated Organization on the map.',
      },
    },
    organizations: {
      list: { available: true },
      kanban: {
        available: false,
        reason: 'Kanban view works best with workflow stages.',
        suggestion: 'Organizations have status but not a workflow progression. Consider using List view for organizations.',
      },
      calendar: {
        available: false,
        reason: 'Calendar view requires date-based records.',
        suggestion: 'Organizations don\'t have a primary date field. View related Tasks or Opportunities in Calendar view instead.',
      },
      map: {
        available: true,
        reason: 'Great for visualizing organization locations and territories.',
      },
    },
    tasks: {
      list: { available: true },
      kanban: {
        available: true,
        reason: 'Perfect for managing task workflow and progress.',
      },
      calendar: {
        available: true,
        reason: 'Essential for viewing tasks by due dates.',
      },
      map: {
        available: false,
        reason: 'Map view requires location data.',
        suggestion: 'Tasks don\'t have geographic fields. Consider adding a location field for field tasks.',
      },
    },
    unified: {
      list: { available: true },
      kanban: {
        available: true,
        reason: 'View all records with status/stage fields in a board format.',
      },
      calendar: {
        available: true,
        reason: 'View all date-based records on a timeline.',
      },
      map: {
        available: true,
        reason: 'View all records with location data on a map.',
      },
    },
  };

  return availabilityRules[tableType][viewType];
}

export function getAvailableViews(tableType: TableType | 'unified'): ViewType[] {
  return viewConfigs
    .filter(config => getViewAvailability(tableType, config.type).available)
    .map(config => config.type);
}

export function getFirstAvailableView(tableType: TableType | 'unified', currentView: ViewType): ViewType {
  const availability = getViewAvailability(tableType, currentView);
  if (availability.available) {
    return currentView;
  }
  
  // Return the first available view (list is always available)
  const availableViews = getAvailableViews(tableType);
  return availableViews[0] || 'list';
}