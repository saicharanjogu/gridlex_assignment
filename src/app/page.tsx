"use client";

import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ViewContainer } from '@/components/views/ViewContainer';
import { Toaster } from '@/components/ui/sonner';
import { RecordFormDialog } from '@/components/dialogs/RecordFormDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { RecordViewDialog } from '@/components/dialogs/RecordViewDialog';

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
  } = useApp();

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <ViewContainer />
          </main>
        </div>
      </div>

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