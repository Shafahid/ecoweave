'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScoredBatch, Alert, ValidationFlag } from '@/lib/types';
import { scoreBatches, validateBatches } from '@/lib/risk';
import { getBatchById, getAlerts, checkBackendHealth } from '@/lib/api';
import Topbar from '@/components/app/Topbar';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  AlertTriangle,
  Printer,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const STORAGE_KEY = 'ecoweave_dashboard_data';
const ALERTS_STORAGE_KEY = 'ecoweave_dashboard_alerts';

interface BatchDetailsClientProps {
  batchId: string;
}

export default function BatchDetailsClient({ batchId }: BatchDetailsClientProps) {
  const router = useRouter();
  const [batch, setBatch] = useState<ScoredBatch | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const alive = await checkBackendHealth();
        if (alive) {
          const b = await getBatchById(batchId);
          setBatch({
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
          });
          try {
            const alertRes = await getAlerts();
            const match = (alertRes.alerts || []).find(
              (a: Record<string, unknown>) => a.batch_id === batchId
            );
            if (match) {
              setAlert({
                id: String(match.id),
                batch_id: match.batch_id as string,
                risk_score: match.risk_score as number,
                estimated_loss_bdt: (match.estimated_loss_bdt ?? 0) as number,
                etp_cost_bdt: (match.etp_cost_bdt ?? 0) as number,
                recommendation: (match.recommendation ?? '') as string,
                flags: (match.flags ?? []) as ValidationFlag[],
                status: match.status as Alert['status'],
                createdAt: match.created_at as string,
              });
            }
          } catch {
            /* alerts optional */
          }
        } else {
          loadFromLocalStorage();
        }
      } catch {
        loadFromLocalStorage();
      }
      setIsLoading(false);
    })();
  }, [batchId]);

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const flags = validateBatches(data.batches);
        const scored = scoreBatches(data.batches, flags);
        const found = scored.find((b: ScoredBatch) => b.batch_id === batchId);
        if (found) {
          setBatch(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
    if (storedAlerts) {
      try {
        const alertsData = JSON.parse(storedAlerts);
        const foundAlert = alertsData.find((a: Alert) => a.batch_id === batchId);
        if (foundAlert) setAlert(foundAlert);
      } catch {
        /* empty */
      }
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleExportPDF = () => {
    window.open(`/batches/${batchId}/print?autoprint=1`, '_blank');
  };

  const handleOpenPrintPreview = () => {
    window.open(`/batches/${batchId}/print`, '_blank');
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const getSeverityColor = (severity: ValidationFlag['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      default: return 'bg-yellow-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background p-4">
        <Topbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-full bg-background p-4">
        <Topbar />
        <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-12 text-center shadow-sm/3">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-2">Batch Not Found</h2>
            <p className="text-foreground/60 mb-6">
              The batch "{batchId}" could not be found. It may not exist or data may not be loaded.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="rounded-full" onClick={() => router.push('/batches')}>
                View All Batches
              </Button>
              <Button variant="primary" className="rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-full bg-background p-4">
        <Topbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
        </div>
      </div>
    );
  }

  const riskScore = batch.risk_score;
  const estimatedLoss = alert?.estimated_loss_bdt || batch.estimated_loss_bdt || 0;
  const etpCost = batch.etp_cost_bdt || 15000;

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />

      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        <div className="px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/batches')}
            className="mb-4 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batches
          </Button>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-medium tracking-tight mb-2">Batch {batch.batch_id}</h1>
              <p className="text-md text-foreground/60">{batch.shift_date} • {batch.shift_name}</p>
            </div>

            <div className={`px-4 py-2 rounded-lg border-2 font-bold ${getRiskColor(riskScore)}`}>
              <div className="text-2xl">{riskScore}</div>
              <div className="text-xs">{getRiskLabel(riskScore)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white"
            >
              <Printer className="w-4 h-4" />
              Export Evidence PDF (Mock)
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenPrintPreview}
              className="flex items-center gap-2 rounded-full"
            >
              <ExternalLink className="w-4 h-4" />
              Open Print Preview
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-full"
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Share Link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Key Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial KPIs */}
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Financial Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-xs text-red-600 mb-1 font-medium">Est. Loss if Bypassed</div>
                  <div className="text-2xl font-bold text-red-700">
                    ৳{estimatedLoss.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs text-green-600 mb-1 font-medium">Cost to Run ETP</div>
                  <div className="text-2xl font-bold text-green-700">
                    ৳{etpCost.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 mb-1 font-medium">Net Benefit</div>
                  <div className="text-2xl font-bold text-blue-700">
                    ৳{(estimatedLoss - etpCost).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {etpCost > 0 ? `${((estimatedLoss / etpCost) - 1).toFixed(1)}x ROI` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Batch Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Batch ID</div>
                  <div className="font-medium">{batch.batch_id}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Shift Date</div>
                  <div className="font-medium">{batch.shift_date}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Shift Name</div>
                  <div className="font-medium">{batch.shift_name}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Production Volume</div>
                  <div className="font-medium">
                    {batch.production_volume_kg !== null 
                      ? `${batch.production_volume_kg.toLocaleString()} kg`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Chemical Usage</div>
                  <div className="font-medium">
                    {batch.chemical_usage_kg !== null 
                      ? `${batch.chemical_usage_kg.toLocaleString()} kg`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">ETP Runtime</div>
                  <div className="font-medium">
                    {batch.etp_runtime_min !== null 
                      ? `${batch.etp_runtime_min} minutes`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Electricity Usage</div>
                  <div className="font-medium">
                    {batch.electricity_kwh !== null 
                      ? `${batch.electricity_kwh.toLocaleString()} kWh`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Chemical Invoice</div>
                  <div className="font-medium">
                    {batch.chemical_invoice_bdt !== null 
                      ? `৳${batch.chemical_invoice_bdt.toLocaleString()}`
                      : 'N/A'}
                  </div>
                </div>
              </div>
              {batch.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-foreground/60 mb-1">Notes</div>
                  <div className="text-sm">{batch.notes}</div>
                </div>
              )}
            </div>

            {/* Alert Recommendation */}
            {alert && (
              <div className="bg-white rounded-xl p-6 shadow-sm/3">
                <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Recommended Action
                </h2>
                <p className="text-foreground">{alert.recommendation}</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-foreground/60">Alert Status: <span className="font-semibold capitalize">{alert.status}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Evidence Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <h2 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">Forensic Evidence</h2>
              
              {batch.flags.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <p className="text-sm text-foreground/60">No issues detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batch.flags.map((flag, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-border">
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(flag.severity)}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize mb-1">
                            {flag.type.split('_').join(' ')}
                          </div>
                          <div className="text-xs text-foreground/70">
                            {flag.message}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-foreground/60 capitalize pl-4">
                        Severity: {flag.severity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <h3 className="text-xl tracking-tight font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Total Flags:</span>
                  <span className="font-bold">{batch.flags.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">High Severity:</span>
                  <span className="font-bold text-red-600">
                    {batch.flags.filter(f => f.severity === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Medium Severity:</span>
                  <span className="font-bold text-orange-600">
                    {batch.flags.filter(f => f.severity === 'medium').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
