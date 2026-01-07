"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { getFieldsForTable } from '@/data/mock-data';
import { Record as RecordType } from '@/types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { currentTable, getRecordsForCurrentTable, selectedRecords } = useApp();
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exportSelected, setExportSelected] = useState(false);

  const records = getRecordsForCurrentTable();
  const fields = getFieldsForTable(currentTable === 'unified' ? 'contacts' : currentTable);

  const handleExport = () => {
    const data = exportSelected && selectedRecords.length > 0 ? records.filter(r => selectedRecords.includes(r.id)) : records;
    
    if (format === 'json') {
      download(JSON.stringify(data, null, 2), `${currentTable}-export.json`, 'application/json');
    } else {
      const headers = fields.map(f => f.label).join(',');
      const rows = data.map(r => fields.map(f => {
        const v = (r as unknown as Record<string, unknown>)[f.key];
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v ?? '';
      }).join(','));
      download([headers, ...rows].join('\n'), `${currentTable}-export.csv`, 'text/csv');
    }
    toast.success(`Exported ${data.length} records as ${format.toUpperCase()}`);
    onClose();
  };

  const download = (content: string, filename: string, type: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export Records</DialogTitle>
          <DialogDescription>Export your {currentTable} data</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /><div><p className="font-medium">CSV</p><p className="text-xs text-muted-foreground">Comma-separated values</p></div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                <FileJson className="h-4 w-4 text-amber-600" /><div><p className="font-medium">JSON</p><p className="text-xs text-muted-foreground">JavaScript Object Notation</p></div>
              </Label>
            </div>
          </RadioGroup>
          {selectedRecords.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox id="sel" checked={exportSelected} onCheckedChange={(c) => setExportSelected(c as boolean)} />
              <Label htmlFor="sel" className="text-sm cursor-pointer">Export only selected ({selectedRecords.length})</Label>
            </div>
          )}
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            {exportSelected && selectedRecords.length > 0 ? selectedRecords.length : records.length} records will be exported
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}><Download className="h-4 w-4 mr-1.5" />Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}