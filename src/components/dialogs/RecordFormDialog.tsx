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
import { Users, TrendingUp, Building2, CheckSquare, AlertCircle } from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
});

const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required').max(100, 'Name must be less than 100 characters'),
  value: z.coerce.number().min(0, 'Value must be a positive number'),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  closeDate: z.string().min(1, 'Close date is required'),
  assignedTo: z.string().min(1, 'Assignee is required'),
});

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name must be less than 100 characters'),
  industry: z.string().min(1, 'Industry is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone number is required'),
  status: z.enum(['Active', 'Inactive', 'Prospect']),
});

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200, 'Name must be less than 200 characters'),
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
  const { currentTable } = useApp();
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  const effectiveTableType = tableType || (record?.tableType) || (currentTable === 'unified' ? 'contacts' : currentTable);

  // Focus first input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const getTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const type = effectiveTableType.slice(0, -1);
    return `${action} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getDescription = () => {
    if (mode === 'create') {
      return `Fill in the details below to create a new ${effectiveTableType.slice(0, -1)}. Required fields are marked with an asterisk.`;
    }
    return `Update the details below. Required fields are marked with an asterisk.`;
  };

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5", "aria-hidden": true as const };
    switch (effectiveTableType) {
      case 'contacts': return <Users {...iconProps} className="h-5 w-5 text-blue-600" />;
      case 'opportunities': return <TrendingUp {...iconProps} className="h-5 w-5 text-emerald-600" />;
      case 'organizations': return <Building2 {...iconProps} className="h-5 w-5 text-violet-600" />;
      case 'tasks': return <CheckSquare {...iconProps} className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="form-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary-subtle border border-primary/20 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <DialogTitle>{getTitle()}</DialogTitle>
              <DialogDescription id="form-description">
                {getDescription()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {effectiveTableType === 'contacts' && (
          <ContactForm mode={mode} record={record} onClose={onClose} firstInputRef={firstInputRef} />
        )}
        {effectiveTableType === 'opportunities' && (
          <OpportunityForm mode={mode} record={record} onClose={onClose} firstInputRef={firstInputRef} />
        )}
        {effectiveTableType === 'organizations' && (
          <OrganizationForm mode={mode} record={record} onClose={onClose} firstInputRef={firstInputRef} />
        )}
        {effectiveTableType === 'tasks' && (
          <TaskForm mode={mode} record={record} onClose={onClose} firstInputRef={firstInputRef} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FormProps {
  mode: 'create' | 'edit';
  record?: Record | null;
  onClose: () => void;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
}

function ContactForm({ mode, record, onClose, firstInputRef }: FormProps) {
  const { createRecord, updateRecord } = useApp();
  
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {hasErrors && (
          <div 
            className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Please correct the errors below to continue.</span>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Name <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field} 
                ref={firstInputRef}
                aria-required="true"
                aria-invalid={!!form.formState.errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="john@example.com" 
                {...field}
                aria-required="true"
                aria-invalid={!!form.formState.errors.email}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Phone <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </FormLabel>
            <FormControl>
              <Input 
                type="tel"
                placeholder="+1 (555) 123-4567" 
                {...field}
                aria-required="true"
                aria-invalid={!!form.formState.errors.phone}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="organization" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Organization <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="ACME Corp" 
                {...field}
                aria-required="true"
                aria-invalid={!!form.formState.errors.organization}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Role <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Sales Manager" 
                {...field}
                aria-required="true"
                aria-invalid={!!form.formState.errors.role}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="gradient-primary border-0 shadow-md shadow-primary/25"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Contact' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OpportunityForm({ mode, record, onClose, firstInputRef }: FormProps) {
  const { createRecord, updateRecord } = useApp();
  
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {hasErrors && (
          <div 
            className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Please correct the errors below to continue.</span>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Opportunity Name <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enterprise Deal" 
                {...field} 
                ref={firstInputRef}
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="value" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Value (USD) <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="50000" 
                {...field} 
                value={field.value} 
                onChange={e => field.onChange(Number(e.target.value))}
                aria-required="true"
              />
            </FormControl>
            <FormDescription>Enter the deal value in US dollars</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="stage" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Stage <span className="text-destructive" aria-hidden="true">*</span>
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
              Expected Close Date <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedTo" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Assigned To <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Jane Smith" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            className="gradient-primary border-0 shadow-md shadow-primary/25"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Opportunity' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OrganizationForm({ mode, record, onClose, firstInputRef }: FormProps) {
  const { createRecord, updateRecord } = useApp();
  
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {hasErrors && (
          <div 
            className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Please correct the errors below to continue.</span>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Organization Name <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="ACME Corp" {...field} ref={firstInputRef} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="industry" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Industry <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Technology" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="contactPerson" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Primary Contact <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Phone <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+1 (555) 123-4567" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            className="gradient-primary border-0 shadow-md shadow-primary/25"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Organization' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function TaskForm({ mode, record, onClose, firstInputRef }: FormProps) {
  const { createRecord, updateRecord } = useApp();
  
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

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {hasErrors && (
          <div 
            className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Please correct the errors below to continue.</span>
          </div>
        )}
        
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Task Name <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Follow-up Call" {...field} ref={firstInputRef} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Due Date <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Priority <span className="text-destructive" aria-hidden="true">*</span>
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
            <FormDescription>Higher priority tasks appear first in lists</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedTo" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Assigned To <span className="text-destructive" aria-hidden="true">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} aria-required="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>
              Status <span className="text-destructive" aria-hidden="true">*</span>
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            className="gradient-primary border-0 shadow-md shadow-primary/25"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}