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
      <DialogContent 
        className="sm:max-w-[550px]"
        aria-describedby="record-details-description"
      >
        <DialogHeader>
          <DialogTitle id="record-title">{record.name}</DialogTitle>
          <DialogDescription id="record-details-description" className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize">{record.tableType.slice(0, -1)}</Badge>
            <Badge variant={getStatusVariant(getStatus())}>{getStatus()}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <Separator aria-hidden="true" />
        
        <div className="space-y-4" role="region" aria-label="Record details">
          <dl className="grid grid-cols-2 gap-4">
            {record.tableType === 'contacts' && (
              <>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="font-medium">
                      <a href={`mailto:${(record as Contact).email}`} className="hover:underline focus:underline">
                        {(record as Contact).email}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="font-medium">
                      <a href={`tel:${(record as Contact).phone}`} className="hover:underline focus:underline">
                        {(record as Contact).phone}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Organization</dt>
                    <dd className="font-medium">{(record as Contact).organization}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Role</dt>
                    <dd className="font-medium">{(record as Contact).role}</dd>
                  </div>
                </div>
              </>
            )}
            {record.tableType === 'opportunities' && (
              <>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Value</dt>
                    <dd className="font-medium text-lg">{formatCurrency((record as Opportunity).value)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flag className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Stage</dt>
                    <dd><Badge variant={getStatusVariant((record as Opportunity).stage)}>{(record as Opportunity).stage}</Badge></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Close Date</dt>
                    <dd className="font-medium"><time dateTime={(record as Opportunity).closeDate}>{formatDate((record as Opportunity).closeDate)}</time></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Assigned To</dt>
                    <dd className="font-medium">{(record as Opportunity).assignedTo}</dd>
                  </div>
                </div>
              </>
            )}
            {record.tableType === 'organizations' && (
              <>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Industry</dt>
                    <dd className="font-medium">{(record as Organization).industry}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Contact Person</dt>
                    <dd className="font-medium">{(record as Organization).contactPerson}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="font-medium">
                      <a href={`tel:${(record as Organization).phone}`} className="hover:underline focus:underline">
                        {(record as Organization).phone}
                      </a>
                    </dd>
                  </div>
                </div>
              </>
            )}
            {record.tableType === 'tasks' && (
              <>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Due Date</dt>
                    <dd className="font-medium"><time dateTime={(record as Task).dueDate}>{formatDate((record as Task).dueDate)}</time></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flag className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Priority</dt>
                    <dd><Badge variant={getStatusVariant((record as Task).priority)}>{(record as Task).priority}</Badge></dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Assigned To</dt>
                    <dd className="font-medium">{(record as Task).assignedTo}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd><Badge variant={getStatusVariant((record as Task).status)}>{(record as Task).status}</Badge></dd>
                  </div>
                </div>
              </>
            )}
          </dl>
        </div>
        
        <Separator aria-hidden="true" />
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created: <time dateTime={record.createdAt}>{formatDate(record.createdAt)}</time></span>
          <span>Updated: <time dateTime={record.updatedAt}>{formatDate(record.updatedAt)}</time></span>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            {currentUser.permissions.canDeleteRecords && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete} 
                className="text-destructive hover:text-destructive"
                aria-label={`Delete ${record.name}`}
              >
                <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDuplicate}
              aria-label={`Duplicate ${record.name}`}
            >
              <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Duplicate
            </Button>
            {currentUser.permissions.canEditRecords && (
              <Button 
                size="sm" 
                onClick={handleEdit}
                aria-label={`Edit ${record.name}`}
              >
                <Edit className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}