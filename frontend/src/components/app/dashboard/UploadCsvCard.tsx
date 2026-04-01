'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface UploadCsvCardProps {
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  isUploading?: boolean;
}

export default function UploadCsvCard({ onFileUpload, onLoadSample, isUploading }: UploadCsvCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Upload CSV Data</h3>
      
      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
        <p className="text-sm font-medium mb-2">
          Drag and drop your CSV file here
        </p>
        <p className="text-xs text-foreground/60 mb-4">
          or click to browse files
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto"
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Choose File'}
        </Button>
      </div>

      <p className="text-xs text-foreground/60 mt-3">
        Use the EcoWeave shift/batch template. CSV should include: batch_id, shift_date, production_volume_kg, chemical_usage_kg, etp_runtime_min, electricity_kwh, and invoicing data.
      </p>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <a
          href="/templates/ecoweave_template.csv"
          download
          className="block"
        >
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </a>
        
        <Button
          variant="primary"
          onClick={onLoadSample}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>
      </div>
    </div>
  );
}
