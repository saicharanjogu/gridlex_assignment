"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Copy, Trash2, Mail, Phone, Building2, User, Calendar, DollarSign, Flag, Clock } from 'lucide-react';
import { Record, Contact, Opportunity, Organization, Task } from '@/types';
import { toast } from 'sonner';

interface RecordViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Record | null;
}

export function RecordViewDialog({ open, onClose, record }: RecordViewDialogProps) {
  const { openEditDialog, openDeleteDialog, duplicateRecord, currentUser } = useApp();

  if (!record) return null;

  const handleEdit = () => {
    onClose();
    openEditDialog(record);
  };

  const handleDuplicate = () => {
    duplicateRecord(record.id);
    toast.success('Record duplicated successfully');
    onClose();
  };

  const handleDelete = () => {
    onClose();
    openDeleteDialog([record.id]);
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (['active', 'completed', 'closed won'].includes(statusLower)) return 'default';
    if (['inactive', 'cancelled', 'closed lost'].includes(statusLower)) return 'destructive';
    return 'secondary';
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const getStatus = () => {
    switch (record.tableType) {
      case 'contacts': return (record as Contact).status;
      case 'opportunities': return (record as Opportunity).stage;
      case 'organizations': return (record as Organization).status;
      case 'tasks': return (record as Task).status;
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{record.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize">{record.tableType.slice(0, -1)}</Badge>
            <Badge variant={getStatusVariant(getStatus())}>{getStatus()}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {record.tableType === 'contacts' && (
              <>
                <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{(record as Contact).email}</p></div></div>
                <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{(record as Contact).phone}</p></div></div>
                <div className="flex items-start gap-3"><Building2 className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Organization</p><p className="font-medium">{(record as Contact).organization}</p></div></div>
                <div className="flex items-start gap-3"><User className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Role</p><p className="font-medium">{(record as Contact).role}</p></div></div>
              </>
            )}
            {record.tableType === 'opportunities' && (
              <>
                <div className="flex items-start gap-3"><DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Value</p><p className="font-medium text-lg">{formatCurrency((record as Opportunity).value)}</p></div></div>
                <div className="flex items-start gap-3"><Flag className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Stage</p><Badge variant={getStatusVariant((record as Opportunity).stage)}>{(record as Opportunity).stage}</Badge></div></div>
                <div className="flex items-start gap-3"><Calendar className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Close Date</p><p className="font-medium">{formatDate((record as Opportunity).closeDate)}</p></div></div>
                <div className="flex items-start gap-3"><User className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Assigned To</p><p className="font-medium">{(record as Opportunity).assignedTo}</p></div></div>
              </>
            )}
            {record.tableType === 'organizations' && (
              <>
                <div className="flex items-start gap-3"><Building2 className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Industry</p><p className="font-medium">{(record as Organization).industry}</p></div></div>
                <div className="flex items-start gap-3"><User className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Contact Person</p><p className="font-medium">{(record as Organization).contactPerson}</p></div></div>
                <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{(record as Organization).phone}</p></div></div>
              </>
            )}
            {record.tableType === 'tasks' && (
              <>
                <div className="flex items-start gap-3"><Calendar className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Due Date</p><p className="font-medium">{formatDate((record as Task).dueDate)}</p></div></div>
                <div className="flex items-start gap-3"><Flag className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Priority</p><Badge variant={getStatusVariant((record as Task).priority)}>{(record as Task).priority}</Badge></div></div>
                <div className="flex items-start gap-3"><User className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Assigned To</p><p className="font-medium">{(record as Task).assignedTo}</p></div></div>
                <div className="flex items-start gap-3"><Clock className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="text-sm text-muted-foreground">Status</p><Badge variant={getStatusVariant((record as Task).status)}>{(record as Task).status}</Badge></div></div>
              </>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(record.createdAt)}</span>
          <span>Updated: {formatDate(record.updatedAt)}</span>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            {currentUser.permissions.canDeleteRecords && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1.5" />Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}><Copy className="h-4 w-4 mr-1.5" />Duplicate</Button>
            {currentUser.permissions.canEditRecords && (
              <Button size="sm" onClick={handleEdit}><Edit className="h-4 w-4 mr-1.5" />Edit</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}