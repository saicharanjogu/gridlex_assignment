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
import { LiveRegion } from '@/components/LiveRegion';

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
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding-completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

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
            setAnnouncement('Create new record dialog opened');
            break;
          case '1':
            e.preventDefault();
            setCurrentView('list');
            setAnnouncement('Switched to table view');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('kanban');
            setAnnouncement('Switched to board view');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('calendar');
            setAnnouncement('Switched to calendar view');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('map');
            setAnnouncement('Switched to map view');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateDialog, setCurrentView]);

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main 
            id="main-content" 
            className="flex-1 overflow-hidden"
            role="main"
            aria-label={`${currentTable} data view`}
          >
            <ViewContainer />
          </main>
        </div>
      </div>

      {/* Live region for screen reader announcements */}
      <LiveRegion message={announcement} />

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
        tableType={currentTable === 'unified' ? 'contacts' : currentTable}
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