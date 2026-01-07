"use client";

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ViewContainer } from '@/components/views/ViewContainer';
import { Toaster } from '@/components/ui/sonner';
import { RecordFormDialog } from '@/components/dialogs/RecordFormDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { RecordViewDialog } from '@/components/dialogs/RecordViewDialog';
import { OnboardingTour } from '@/components/OnboardingTour';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

function AppContent() {
  const {
    isCreateDialogOpen,
    closeCreateDialog,
    isEditDialogOpen,
    closeEditDialog,
    editingRecord,
    isDeleteDialogOpen,
    closeDeleteDialog,
    deletingRecords,
    isViewDialogOpen,
    closeViewDialog,
    viewingRecord,
    currentTable,
    openCreateDialog,
    setCurrentView,
  } = useApp();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding-completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
    
    // Check for saved sidebar state
    const savedSidebarState = localStorage.getItem('sidebar-collapsed');
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === 'true');
    }
  }, []);

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts with ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      // Command/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            openCreateDialog();
            break;
          case '1':
            e.preventDefault();
            setCurrentView('list');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('kanban');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('calendar');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('map');
            break;
          case 'b':
            e.preventDefault();
            handleToggleSidebar();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateDialog, setCurrentView, sidebarCollapsed]);

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggleCollapse={handleToggleSidebar} 
          />
          <main className="flex-1 overflow-hidden">
            <ViewContainer />
          </main>
        </div>
      </div>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts 
        open={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />

      {/* Create Dialog */}
      <RecordFormDialog
        mode="create"
        open={isCreateDialogOpen}
        onClose={closeCreateDialog}
        tableType={currentTable}
      />

      {/* Edit Dialog */}
      <RecordFormDialog
        mode="edit"
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        record={editingRecord}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        recordIds={deletingRecords}
      />

      {/* View Dialog */}
      <RecordViewDialog
        open={isViewDialogOpen}
        onClose={closeViewDialog}
        record={viewingRecord}
      />

      <Toaster />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}