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
import { Trash2 } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>
                Delete {recordCount === 1 ? 'Record' : `${recordCount} Records`}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {recordCount === 1 && firstRecord
                  ? `Are you sure you want to delete "${firstRecord.name}"?`
                  : `Are you sure you want to delete ${recordCount} records?`}
                {' '}This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}