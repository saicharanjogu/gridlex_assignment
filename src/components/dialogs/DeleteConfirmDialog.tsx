"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  recordIds: string[];
}

export function DeleteConfirmDialog({ open, onClose, recordIds }: DeleteConfirmDialogProps) {
  const { deleteRecords, getRecordById } = useApp();

  const handleDelete = () => {
    deleteRecords(recordIds);
    toast.success(`${recordIds.length} record${recordIds.length > 1 ? 's' : ''} deleted successfully`);
    onClose();
  };

  const recordCount = recordIds.length;
  const firstRecord = recordIds.length === 1 ? getRecordById(recordIds[0]) : null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg">
                Delete {recordCount === 1 ? 'Record' : `${recordCount} Records`}?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-base">
                {recordCount === 1 && firstRecord ? (
                  <>
                    You are about to delete <strong>&quot;{firstRecord.name}&quot;</strong>.
                  </>
                ) : (
                  <>
                    You are about to delete <strong>{recordCount} records</strong>.
                  </>
                )}
                {' '}This action cannot be undone and all associated data will be permanently removed.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="min-w-[100px]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]"
          >
            Delete {recordCount > 1 ? `${recordCount} Records` : 'Record'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}