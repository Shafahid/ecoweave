'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadCsvCard from '@/components/app/dashboard/UploadCsvCard';
import DataPreviewTable from '@/components/app/dashboard/DataPreviewTable';
import { parseCsvToBatches, validateBatches, scoreBatches } from '@/lib/risk';
import { seedBatches } from '@/lib/mock';
import type { ScoredBatch, ValidationFlag } from '@/lib/types';
import { uploadCsv, checkBackendHealth } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import Topbar from '../Topbar';

const STORAGE_KEY = 'ecoweave_dashboard_data';
const ALERTS_STORAGE_KEY = 'ecoweave_dashboard_alerts';

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function DataUploadClient() {
  const router = useRouter();
  const [scoredBatches, setScoredBatches] = useState<ScoredBatch[]>([]);
  const [flags, setFlags] = useState<ValidationFlag[]>([]);
  const [hasData, setHasData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSummary, setUploadSummary] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.batches && data.batches.length > 0) {
          const validationFlags = validateBatches(data.batches);
          setFlags(validationFlags);
          setScoredBatches(scoreBatches(data.batches, validationFlags));
          setHasData(true);
        }
      } catch {
        /* empty */
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setError('');
    setIsUploading(true);
    setUploadSummary('');
    try {
      const alive = await checkBackendHealth();
      if (alive) {
        const result = await uploadCsv(file);
        const batches = result.scored_batches || result.batches || [];
        const mapped: ScoredBatch[] = batches.map((b: Record<string, unknown>) => ({
          batch_id: b.batch_id,
          shift_date: b.shift_date,
          shift_name: b.shift_name,
          production_volume_kg: b.production_volume_kg,
          chemical_usage_kg: b.chemical_usage_kg,
          etp_runtime_min: b.etp_runtime_min,
          electricity_kwh: b.electricity_kwh,
          chemical_invoice_bdt: b.chemical_invoice_bdt,
          etp_cost_bdt: b.etp_cost_bdt,
          notes: b.notes,
          risk_score: b.risk_score ?? 0,
          estimated_loss_bdt: b.estimated_loss_bdt ?? 0,
          flags: b.flags ?? [],
        }));
        const allFlags: ValidationFlag[] = mapped.flatMap(b => (b.flags || []) as ValidationFlag[]);
        setScoredBatches(mapped);
        setFlags(allFlags);
        setHasData(true);
        const summary = (result.summary ?? null) as Record<string, unknown> | null;
        const totalRows =
          (summary && (toNumber(summary.total_rows) ?? toNumber(summary.total_batches))) ?? mapped.length;
        const highRiskCount =
          (summary && toNumber(summary.high_risk_count)) ?? mapped.filter(b => (b.risk_score ?? 0) >= 75).length;
        const avgRiskScore =
          (summary && toNumber(summary.avg_risk_score)) ??
          (mapped.length > 0
            ? mapped.reduce((sum, b) => sum + (b.risk_score ?? 0), 0) / mapped.length
            : 0);
        const alertsGenerated = summary ? toNumber(summary.alerts_generated) : null;
        const alertsPart = alertsGenerated !== null ? ` | ${alertsGenerated} alerts` : '';

        setUploadSummary(
          `${totalRows} rows processed | ${highRiskCount} high risk | Avg risk: ${Math.round(avgRiskScore)}${alertsPart}`
        );
      } else {
        const text = await file.text();
        const parsed = parseCsvToBatches(text);
        const validationFlags = validateBatches(parsed);
        setFlags(validationFlags);
        setScoredBatches(scoreBatches(parsed, validationFlags));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ batches: parsed }));
        setHasData(true);
        setUploadSummary('Processed locally (backend offline)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setError('');
    const validationFlags = validateBatches(seedBatches);
    setFlags(validationFlags);
    setScoredBatches(scoreBatches(seedBatches, validationFlags));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ batches: seedBatches }));
    setHasData(true);
    setUploadSummary(`${seedBatches.length} sample batches loaded locally`);
  };

  const handleReset = () => {
    setScoredBatches([]);
    setFlags([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ALERTS_STORAGE_KEY);
    setHasData(false);
    setUploadSummary('');
    setError('');
  };

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        <div className="px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-medium tracking-tight">Data Upload</h1>
              <p className="text-md text-foreground/60 mt-1">
                Upload CSV data or load sample batches to analyze compliance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasData && (
                <>
                  <Button variant="outline" className="rounded-full" onClick={handleReset}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>
                  <Button variant="primary" className="rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white" onClick={() => router.push('/dashboard')}>
                    View Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {uploadSummary && (
            <div className="bg-green-50 text-green-800 rounded-lg p-4 text-sm font-medium">
              {uploadSummary}
            </div>
          )}

          <UploadCsvCard
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
            isUploading={isUploading}
          />

          {scoredBatches.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl tracking-tight font-semibold text-gray-900">Data Preview</h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    {scoredBatches.length} batch{scoredBatches.length !== 1 ? 'es' : ''} loaded | {flags.length} validation flag{flags.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
              <DataPreviewTable batches={scoredBatches} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
