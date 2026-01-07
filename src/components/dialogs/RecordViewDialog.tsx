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

  const handleEdit = () => { onClose(); openEditDialog(record); };
  const handleDuplicate = () => { duplicateRecord(record.id); toast.success('Record duplicated'); onClose(); };
  const handleDelete = () => { onClose(); openDeleteDialog([record.id]); };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const s = status.toLowerCase();
    if (['active', 'completed', 'closed won'].includes(s)) return 'default';
    if (['inactive', 'cancelled', 'closed lost'].includes(s)) return 'destructive';
    return 'secondary';
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const getStatus = () => {
    switch (record.tableType) {
      case 'contacts': return (record as Contact).status;
      case 'opportunities': return (record as Opportunity).stage;
      case 'organizations': return (record as Organization).status;
      case 'tasks': return (record as Task).status;
      default: return '';
    }
  };

  const renderField = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
    </div>
  );

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
        <div className="grid grid-cols-2 gap-4">
          {record.tableType === 'contacts' && (
            <>
              {renderField(<Mail className="h-4 w-4" />, 'Email', (record as Contact).email)}
              {renderField(<Phone className="h-4 w-4" />, 'Phone', (record as Contact).phone)}
              {renderField(<Building2 className="h-4 w-4" />, 'Organization', (record as Contact).organization)}
              {renderField(<User className="h-4 w-4" />, 'Role', (record as Contact).role)}
            </>
          )}
          {record.tableType === 'opportunities' && (
            <>
              {renderField(<DollarSign className="h-4 w-4" />, 'Value', <span className="text-lg">{formatCurrency((record as Opportunity).value)}</span>)}
              {renderField(<Flag className="h-4 w-4" />, 'Stage', <Badge variant={getStatusVariant((record as Opportunity).stage)}>{(record as Opportunity).stage}</Badge>)}
              {renderField(<Calendar className="h-4 w-4" />, 'Close Date', formatDate((record as Opportunity).closeDate))}
              {renderField(<User className="h-4 w-4" />, 'Assigned To', (record as Opportunity).assignedTo)}
            </>
          )}
          {record.tableType === 'organizations' && (
            <>
              {renderField(<Building2 className="h-4 w-4" />, 'Industry', (record as Organization).industry)}
              {renderField(<User className="h-4 w-4" />, 'Contact Person', (record as Organization).contactPerson)}
              {renderField(<Phone className="h-4 w-4" />, 'Phone', (record as Organization).phone)}
            </>
          )}
          {record.tableType === 'tasks' && (
            <>
              {renderField(<Calendar className="h-4 w-4" />, 'Due Date', formatDate((record as Task).dueDate))}
              {renderField(<Flag className="h-4 w-4" />, 'Priority', <Badge variant={getStatusVariant((record as Task).priority)}>{(record as Task).priority}</Badge>)}
              {renderField(<User className="h-4 w-4" />, 'Assigned To', (record as Task).assignedTo)}
              {renderField(<Clock className="h-4 w-4" />, 'Status', <Badge variant={getStatusVariant((record as Task).status)}>{(record as Task).status}</Badge>)}
            </>
          )}
        </div>
        <Separator />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(record.createdAt)}</span>
          <span>Updated: {formatDate(record.updatedAt)}</span>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
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