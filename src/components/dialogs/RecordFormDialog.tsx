"use client";

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Record, TableType } from '@/types';
import { Users, TrendingUp, Building2, CheckSquare } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
});

const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required'),
  value: z.coerce.number().min(0, 'Value must be a positive number'),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  closeDate: z.string().min(1, 'Close date is required'),
  assignedTo: z.string().min(1, 'Assignee is required'),
});

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().min(1, 'Industry is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone number is required'),
  status: z.enum(['Active', 'Inactive', 'Prospect']),
});

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedTo: z.string().min(1, 'Assignee is required'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']),
});

type ContactFormData = z.infer<typeof contactSchema>;
type OpportunityFormData = z.infer<typeof opportunitySchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;
type TaskFormData = z.infer<typeof taskSchema>;

interface RecordFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  record?: Record | null;
  tableType?: TableType;
}

export function RecordFormDialog({ mode, open, onClose, record, tableType }: RecordFormDialogProps) {
  const { currentTable, createRecord, updateRecord } = useApp();
  
  const effectiveTableType = tableType || (record?.tableType) || (currentTable === 'unified' ? 'contacts' : currentTable);

  const getTitle = () => {
    const action = mode === 'create' ? 'Create New' : 'Edit';
    const type = effectiveTableType.slice(0, -1);
    return `${action} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getDescription = () => {
    if (mode === 'create') {
      return `Fill in the required fields to create a new ${effectiveTableType.slice(0, -1)}. All fields marked with an asterisk (*) are required.`;
    }
    return `Update the ${effectiveTableType.slice(0, -1)} information below. All fields marked with an asterisk (*) are required.`;
  };

  const getIcon = () => {
    switch (effectiveTableType) {
      case 'contacts': return <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />;
      case 'opportunities': return <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
      case 'organizations': return <Building2 className="h-5 w-5 text-violet-600" aria-hidden="true" />;
      case 'tasks': return <CheckSquare className="h-5 w-5 text-amber-600" aria-hidden="true" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-labelledby="form-dialog-title"
        aria-describedby="form-dialog-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-primary-subtle border-2 border-primary/20 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <DialogTitle id="form-dialog-title" className="text-lg">{getTitle()}</DialogTitle>
              <DialogDescription id="form-dialog-description" className="text-sm">
                {getDescription()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {effectiveTableType === 'contacts' && (
          <ContactForm mode={mode} record={record} onClose={onClose} />
        )}
        {effectiveTableType === 'opportunities' && (
          <OpportunityForm mode={mode} record={record} onClose={onClose} />
        )}
        {effectiveTableType === 'organizations' && (
          <OrganizationForm mode={mode} record={record} onClose={onClose} />
        )}
        {effectiveTableType === 'tasks' && (
          <TaskForm mode={mode} record={record} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
  const { createRecord, updateRecord } = useApp();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: record?.tableType === 'contacts' 
      ? { name: record.name, email: record.email, phone: record.phone, organization: record.organization, role: record.role, status: record.status }
      : { name: '', email: '', phone: '', organization: '', role: '', status: 'Active' },
  });

  useEffect(() => {
    if (record?.tableType === 'contacts') {
      form.reset({ name: record.name, email: record.email, phone: record.phone, organization: record.organization, role: record.role, status: record.status });
    } else {
      form.reset({ name: '', email: '', phone: '', organization: '', role: '', status: 'Active' });
    }
  }, [record, form]);

  // Focus first field on mount
  useEffect(() => {
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  }, []);

  const onSubmit = (data: ContactFormData) => {
    if (mode === 'create') {
      createRecord({ ...data, tableType: 'contacts' });
      toast.success('Contact created successfully');
    } else if (record) {
      updateRecord({ ...record, ...data } as Record);
      toast.success('Contact updated successfully');
    }
    onClose();
  };

  const { errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label="Contact form"
        noValidate
      >
        {errorCount > 0 && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-destructive/10 border-2 border-destructive/20 rounded-md text-sm text-destructive"
          >
            Please correct {errorCount} error{errorCount > 1 ? 's' : ''} in the form below.
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Name <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field} 
                ref={firstFieldRef}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </FormControl>
            <FormMessage id="name-error" />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="john@example.com" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : "email-hint"}
              />
            </FormControl>
            <FormDescription id="email-hint" className="sr-only">
              Enter a valid email address
            </FormDescription>
            <FormMessage id="email-error" />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Phone <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="+1234567890" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.phone}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="organization" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Organization <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="ACME Corp" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.organization}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Role <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Sales Manager" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.role}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger aria-required="true">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button type="submit" className="gradient-primary border-0 shadow-md shadow-primary/25 min-h-[44px]">
            {mode === 'create' ? 'Create Contact' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OpportunityForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
  const { createRecord, updateRecord } = useApp();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: record?.tableType === 'opportunities' 
      ? { name: record.name, value: record.value, stage: record.stage, closeDate: record.closeDate, assignedTo: record.assignedTo }
      : { name: '', value: 0, stage: 'Lead', closeDate: '', assignedTo: '' },
  });

  useEffect(() => {
    if (record?.tableType === 'opportunities') {
      form.reset({ name: record.name, value: record.value, stage: record.stage, closeDate: record.closeDate, assignedTo: record.assignedTo });
    } else {
      form.reset({ name: '', value: 0, stage: 'Lead', closeDate: '', assignedTo: '' });
    }
  }, [record, form]);

  useEffect(() => {
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  }, []);

  const onSubmit = (data: OpportunityFormData) => {
    if (mode === 'create') {
      createRecord({ ...data, tableType: 'opportunities' });
      toast.success('Opportunity created successfully');
    } else if (record) {
      updateRecord({ ...record, ...data } as Record);
      toast.success('Opportunity updated successfully');
    }
    onClose();
  };

  const { errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label="Opportunity form"
        noValidate
      >
        {errorCount > 0 && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-destructive/10 border-2 border-destructive/20 rounded-md text-sm text-destructive"
          >
            Please correct {errorCount} error{errorCount > 1 ? 's' : ''} in the form below.
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Opportunity Name <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enterprise Deal" 
                {...field} 
                ref={firstFieldRef}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="value" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Value (USD) <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="50000" 
                {...field} 
                value={field.value} 
                onChange={e => field.onChange(Number(e.target.value))}
                aria-required="true"
                aria-invalid={!!errors.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="stage" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Stage <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger aria-required="true">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="closeDate" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Close Date <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.closeDate}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedTo" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Assigned To <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Jane Smith" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.assignedTo}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button type="submit" className="gradient-primary border-0 shadow-md shadow-primary/25 min-h-[44px]">
            {mode === 'create' ? 'Create Opportunity' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OrganizationForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
  const { createRecord, updateRecord } = useApp();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: record?.tableType === 'organizations' 
      ? { name: record.name, industry: record.industry, contactPerson: record.contactPerson, phone: record.phone, status: record.status }
      : { name: '', industry: '', contactPerson: '', phone: '', status: 'Active' },
  });

  useEffect(() => {
    if (record?.tableType === 'organizations') {
      form.reset({ name: record.name, industry: record.industry, contactPerson: record.contactPerson, phone: record.phone, status: record.status });
    } else {
      form.reset({ name: '', industry: '', contactPerson: '', phone: '', status: 'Active' });
    }
  }, [record, form]);

  useEffect(() => {
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  }, []);

  const onSubmit = (data: OrganizationFormData) => {
    if (mode === 'create') {
      createRecord({ ...data, tableType: 'organizations' });
      toast.success('Organization created successfully');
    } else if (record) {
      updateRecord({ ...record, ...data } as Record);
      toast.success('Organization updated successfully');
    }
    onClose();
  };

  const { errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label="Organization form"
        noValidate
      >
        {errorCount > 0 && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-destructive/10 border-2 border-destructive/20 rounded-md text-sm text-destructive"
          >
            Please correct {errorCount} error{errorCount > 1 ? 's' : ''} in the form below.
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Organization Name <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="ACME Corp" 
                {...field} 
                ref={firstFieldRef}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="industry" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Industry <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Technology" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.industry}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="contactPerson" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Contact Person <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.contactPerson}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Phone <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="+1234567890" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.phone}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger aria-required="true">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button type="submit" className="gradient-primary border-0 shadow-md shadow-primary/25 min-h-[44px]">
            {mode === 'create' ? 'Create Organization' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function TaskForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
  const { createRecord, updateRecord } = useApp();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: record?.tableType === 'tasks' 
      ? { name: record.name, dueDate: record.dueDate, priority: record.priority, assignedTo: record.assignedTo, status: record.status }
      : { name: '', dueDate: '', priority: 'Medium', assignedTo: '', status: 'Pending' },
  });

  useEffect(() => {
    if (record?.tableType === 'tasks') {
      form.reset({ name: record.name, dueDate: record.dueDate, priority: record.priority, assignedTo: record.assignedTo, status: record.status });
    } else {
      form.reset({ name: '', dueDate: '', priority: 'Medium', assignedTo: '', status: 'Pending' });
    }
  }, [record, form]);

  useEffect(() => {
    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);
  }, []);

  const onSubmit = (data: TaskFormData) => {
    if (mode === 'create') {
      createRecord({ ...data, tableType: 'tasks' });
      toast.success('Task created successfully');
    } else if (record) {
      updateRecord({ ...record, ...data } as Record);
      toast.success('Task updated successfully');
    }
    onClose();
  };

  const { errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label="Task form"
        noValidate
      >
        {errorCount > 0 && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-destructive/10 border-2 border-destructive/20 rounded-md text-sm text-destructive"
          >
            Please correct {errorCount} error{errorCount > 1 ? 's' : ''} in the form below.
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Task Name <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Follow-up Call" 
                {...field} 
                ref={firstFieldRef}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Due Date <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.dueDate}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Priority <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger aria-required="true">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedTo" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Assigned To <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field}
                aria-required="true"
                aria-invalid={!!errors.assignedTo}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger aria-required="true">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button type="submit" className="gradient-primary border-0 shadow-md shadow-primary/25 min-h-[44px]">
            {mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}