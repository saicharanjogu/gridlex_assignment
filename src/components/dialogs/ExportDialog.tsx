"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const fields = getFieldsForTable(currentTable);

  const getRecordValue = (record: RecordType, key: string): unknown => {
    return (record as unknown as { [key: string]: unknown })[key];
  };

  const handleExport = () => {
    const dataToExport = exportSelected && selectedRecords.length > 0
      ? records.filter(r => selectedRecords.includes(r.id))
      : records;

    if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, `${currentTable}-export.json`, 'application/json');
    } else if (format === 'csv') {
      const headers = fields.map(f => f.label).join(',');
      const rows = dataToExport.map(record => 
        fields.map(f => {
          const value = getRecordValue(record, f.key);
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value ?? '';
        }).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      downloadFile(csv, `${currentTable}-export.csv`, 'text/csv');
    }

    toast.success(`Exported ${dataToExport.length} records as ${format.toUpperCase()}`);
    onClose();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Records
          </DialogTitle>
          <DialogDescription>
            Export your {currentTable} data to a file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">Comma-separated values</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileJson className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">JavaScript Object Notation</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedRecords.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="exportSelected" 
                checked={exportSelected}
                onCheckedChange={(checked) => setExportSelected(checked as boolean)}
              />
              <Label htmlFor="exportSelected" className="text-sm cursor-pointer">
                Export only selected records ({selectedRecords.length})
              </Label>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {exportSelected && selectedRecords.length > 0 
                ? `${selectedRecords.length} records will be exported`
                : `${records.length} records will be exported`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}