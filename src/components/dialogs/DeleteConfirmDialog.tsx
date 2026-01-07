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
  const count = recordIds.length;
  const firstRecord = count === 1 ? getRecordById(recordIds[0]) : null;

  const handleDelete = () => {
    deleteRecords(recordIds);
    toast.success(`${count} record${count > 1 ? 's' : ''} deleted`);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete {count === 1 ? 'Record' : `${count} Records`}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {count === 1 && firstRecord ? `Delete "${firstRecord.name}"?` : `Delete ${count} records?`} This cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}