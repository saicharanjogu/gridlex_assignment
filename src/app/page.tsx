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
    isCreateDialogOpen, closeCreateDialog,
    isEditDialogOpen, closeEditDialog, editingRecord,
    isDeleteDialogOpen, closeDeleteDialog, deletingRecords,
    isViewDialogOpen, closeViewDialog, viewingRecord,
    currentTable, openCreateDialog, setCurrentView,
  } = useApp();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('onboarding-completed')) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setShowShortcuts(true); return; }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'n') { e.preventDefault(); openCreateDialog(); }
        else if (e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          setCurrentView(['list', 'kanban', 'calendar', 'map'][parseInt(e.key) - 1] as 'list' | 'kanban' | 'calendar' | 'map');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCreateDialog, setCurrentView]);

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden"><ViewContainer /></main>
        </div>
      </div>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <RecordFormDialog mode="create" open={isCreateDialogOpen} onClose={closeCreateDialog} tableType={currentTable === 'unified' ? 'contacts' : currentTable} />
      <RecordFormDialog mode="edit" open={isEditDialogOpen} onClose={closeEditDialog} record={editingRecord} />
      <DeleteConfirmDialog open={isDeleteDialogOpen} onClose={closeDeleteDialog} recordIds={deletingRecords} />
      <RecordViewDialog open={isViewDialogOpen} onClose={closeViewDialog} record={viewingRecord} />
      <Toaster />
    </>
  );
}

export default function Home() {
  return <AppProvider><AppContent /></AppProvider>;
}