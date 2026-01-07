"use client";

import React, { useEffect } from 'react';
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
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
});

const opportunitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  closeDate: z.string().min(1, 'Close date is required'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
});

const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industry: z.string().min(1, 'Industry is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone is required'),
  status: z.enum(['Active', 'Inactive', 'Prospect']),
});

const taskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedTo: z.string().min(1, 'Assigned to is required'),
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
  
  const effectiveTableType = tableType || (record?.tableType) || (currentTable === 'unified' ? 'contacts' : currentTable);

  const getTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const type = effectiveTableType.slice(0, -1);
    return `${action} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getIcon = () => {
    switch (effectiveTableType) {
      case 'contacts': return <Users className="h-5 w-5 text-[#1D78C1]" />;
      case 'opportunities': return <TrendingUp className="h-5 w-5 text-[#388E3C]" />;
      case 'organizations': return <Building2 className="h-5 w-5 text-[#9C27B0]" />;
      case 'tasks': return <CheckSquare className="h-5 w-5 text-[#FF9800]" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EBF5FA] border border-[#1BA9C4]/20 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-[#003B5C]">{getTitle()}</DialogTitle>
              <DialogDescription>
                {mode === 'create' 
                  ? `Fill in the details to create a new ${effectiveTableType.slice(0, -1)}.`
                  : 'Make changes to the record below.'}
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="organization" render={({ field }) => (
          <FormItem>
            <FormLabel>Organization</FormLabel>
            <FormControl><Input placeholder="ACME Corp" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl><Input placeholder="Sales Manager" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25">{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OpportunityForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Opportunity Name</FormLabel>
            <FormControl><Input placeholder="Enterprise Deal" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="value" render={({ field }) => (
          <FormItem>
            <FormLabel>Value ($)</FormLabel>
            <FormControl><Input type="number" placeholder="50000" {...field} value={field.value} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="stage" render={({ field }) => (
          <FormItem>
            <FormLabel>Stage</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger></FormControl>
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
            <FormLabel>Close Date</FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assignedTo" render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned To</FormLabel>
            <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25">{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function OrganizationForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Name</FormLabel>
            <FormControl><Input placeholder="ACME Corp" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="industry" render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <FormControl><Input placeholder="Technology" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="contactPerson" render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Person</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
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
          <Button type="submit" className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25">{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function TaskForm({ mode, record, onClose }: { mode: 'create' | 'edit'; record?: Record | null; onClose: () => void }) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Task Name</FormLabel>
            <FormControl><Input placeholder="Follow-up Call" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
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
            <FormLabel>Assigned To</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
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
          <Button type="submit" className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25">{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}