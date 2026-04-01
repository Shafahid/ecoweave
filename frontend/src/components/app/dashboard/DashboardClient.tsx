'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ValidationFlag, Alert, ScoredBatch } from '@/lib/types';
import { validateBatches, scoreBatches, generateAlerts } from '@/lib/risk';
import {
  getBatches,
  getBatchStats,
  getAlerts as fetchAlerts,
  updateAlertStatus as patchAlert,
  checkBackendHealth,
} from '@/lib/api';
import ValidationPanel from './ValidationPanel';
import AlertsPanel from './AlertsPanel';
import AnalysisCard from './AnalysisCard';
import TrendChart from './TrendChart';
import BarChart from './BarChart';
import RadarChart from './RadarChart';
import Button from '@/components/ui/Button';
import { Upload, Database, Loader2 } from 'lucide-react';
import Topbar from '../Topbar';

const STORAGE_KEY = 'ecoweave_dashboard_data';
const ALERTS_STORAGE_KEY = 'ecoweave_dashboard_alerts';

interface Stats {
  total_batches: number;
  avg_risk_score: number;
  high_risk_count: number;
  total_estimated_loss: number;
  bypass_count: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const [scoredBatches, setScoredBatches] = useState<ScoredBatch[]>([]);
  const [flags, setFlags] = useState<ValidationFlag[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);

  const loadFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const batches = data.batches || [];
        const newFlags = validateBatches(batches);
        setFlags(newFlags);
        const scored = scoreBatches(batches, newFlags);
        setScoredBatches(scored);
        if (storedAlerts) {
          setAlerts(JSON.parse(storedAlerts));
        } else {
          setAlerts(generateAlerts(batches, newFlags));
        }
      } catch {
        /* empty */
      }
    }
  }, []);

  const loadFromBackend = useCallback(async () => {
    const [batchRes, statsRes, alertRes] = await Promise.all([
      getBatches({ limit: 500 }),
      getBatchStats(),
      fetchAlerts(),
    ]);

    const remoteBatches: ScoredBatch[] = (batchRes.batches || []).map((b: Record<string, unknown>) => ({
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

    const remoteAlerts: Alert[] = (alertRes.alerts || []).map((a: Record<string, unknown>) => ({
      id: String(a.id),
      batch_id: a.batch_id,
      risk_score: a.risk_score,
      estimated_loss_bdt: a.estimated_loss_bdt ?? 0,
      etp_cost_bdt: a.etp_cost_bdt ?? 0,
      recommendation: a.recommendation ?? '',
      flags: a.flags ?? [],
      status: a.status,
      createdAt: a.created_at,
    }));

    const allFlags: ValidationFlag[] = remoteBatches.flatMap(b => (b.flags || []) as ValidationFlag[]);

    setScoredBatches(remoteBatches);
    setFlags(allFlags);
    setAlerts(remoteAlerts);
    setStats(statsRes);
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const alive = await checkBackendHealth();
        if (alive) {
          await loadFromBackend();
          setUseBackend(true);
        } else {
          loadFromLocalStorage();
          setUseBackend(false);
        }
      } catch {
        loadFromLocalStorage();
        setUseBackend(false);
      }
      setIsLoading(false);
    })();
  }, [loadFromBackend, loadFromLocalStorage]);

  const handleAlertStatusChange = async (alertId: string, newStatus: Alert['status']) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
    if (useBackend) {
      try {
        await patchAlert(alertId, newStatus);
      } catch {
        /* keep optimistic update */
      }
    } else {
      const updated = alerts.map(a => a.id === alertId ? { ...a, status: newStatus } : a);
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const avgRiskScore = stats
    ? Math.round(stats.avg_risk_score)
    : scoredBatches.length > 0
      ? Math.round(scoredBatches.reduce((s, b) => s + b.risk_score, 0) / scoredBatches.length)
      : 0;

  const totalBatches = stats?.total_batches ?? scoredBatches.length;

  const highRiskBatches = stats?.high_risk_count ?? scoredBatches.filter(b => b.risk_score >= 75).length;

  const totalAnomalies = flags.length;

  const dataCompleteness = scoredBatches.length > 0
    ? Math.round((scoredBatches.filter(b =>
        b.production_volume_kg !== null &&
        b.chemical_usage_kg !== null &&
        b.etp_runtime_min !== null
      ).length / scoredBatches.length) * 100)
    : 0;

  const buildTrendData = () => {
    if (scoredBatches.length === 0) return [];
    const grouped = new Map<string, number[]>();
    scoredBatches.forEach(b => {
      if (!b.shift_date) return;
      const month = b.shift_date.slice(0, 7);
      const arr = grouped.get(month) || [];
      arr.push(b.risk_score);
      grouped.set(month, arr);
    });
    const sorted = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([month, scores]) => ({
      label: month,
      value: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    }));
  };

  const trendData = buildTrendData();

  const typeData = scoredBatches.length > 0 ? [
    { label: 'Probable Bypass', value: flags.filter(f => f.type === 'probable_bypass').length, color: '#dc2626' },
    { label: 'Missing Fields', value: flags.filter(f => f.type === 'missing_field').length, color: '#ea580c' },
    { label: 'Triangulation', value: flags.filter(f => f.type === 'triangulation_mismatch').length, color: '#f59e0b' },
    { label: 'Invoice Mismatch', value: flags.filter(f => f.type === 'invoice_mismatch').length, color: '#14b8a6' },
    { label: 'Power Anomaly', value: flags.filter(f => f.type === 'power_anomaly').length, color: '#10b981' },
  ].filter(d => d.value > 0) : [];

  const radarData = totalBatches > 0 ? [
    { label: 'Data Quality', value: dataCompleteness },
    { label: 'Compliance', value: Math.max(0, 100 - avgRiskScore) },
    { label: 'Coverage', value: Math.min(100, Math.round((totalBatches / Math.max(totalBatches, 50)) * 100)) },
    { label: 'Validation', value: Math.max(0, 100 - (totalAnomalies / totalBatches) * 50) },
    { label: 'Monitoring', value: alerts.filter(a => a.status !== 'pending').length > 0 ? 90 : 70 },
  ] : [];

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

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
      <div className="px-3 py-3 sm:px-6 sm:py-4 z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight">Risk Analysis Dashboard</h1>
            <p className="text-sm sm:text-base text-foreground/60 mt-1 max-w-xl">
              Real-time compliance monitoring and risk detection for textile manufacturing.
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <Button
              variant="primary"
              className="w-full sm:w-auto justify-center rounded-full bg-gradient-to-b from-[#004737] to-green-700 px-4 py-2.5 text-sm sm:text-base text-white hover:from-green-500 hover:to-green-700"
              onClick={() => router.push('/data-upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {totalBatches > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalysisCard
                title="Average Risk Score"
                value={avgRiskScore}
                percentage={avgRiskScore}
                color={avgRiskScore >= 75 ? 'red' : avgRiskScore >= 50 ? 'orange' : 'green'}
              />
              <AnalysisCard
                title="High Risk Batches"
                value={highRiskBatches}
                percentage={(highRiskBatches / totalBatches) * 100}
                color={highRiskBatches > 0 ? 'red' : 'green'}
              />
              <AnalysisCard
                title="Total Anomalies"
                value={totalAnomalies}
                percentage={Math.min(100, (totalAnomalies / totalBatches) * 20)}
                color={totalAnomalies > 10 ? 'orange' : 'blue'}
              />
              <AnalysisCard
                title="Data Completeness"
                value={`${dataCompleteness}%`}
                percentage={dataCompleteness}
                color={dataCompleteness >= 80 ? 'green' : 'orange'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <TrendChart
                data={trendData}
                title="Risk Score Trend"
                color={avgRiskScore >= 75 ? 'red' : avgRiskScore >= 50 ? 'orange' : 'blue'}
              />
              <BarChart
                data={typeData}
                title="Anomaly Distribution"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-1">
                <RadarChart
                  data={radarData}
                  title="Compliance Metrics"
                  color="#10b981"
                />
              </div>
              <div className="lg:col-span-2">
                <ValidationPanel
                  flags={flags}
                  totalBatches={totalBatches}
                />
              </div>
            </div>

            <AlertsPanel
              alerts={alerts}
              onStatusChange={handleAlertStatusChange}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm/3">
            <Database className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-foreground/60 mb-6">
              Upload your CSV file to see visualizations, risk scores, and alerts.
            </p>
            <Button variant="primary" className="rounded-full bg-gradient-to-b from-[#004737] to-green-700 hover:from-green-500 hover:to-green-700 text-white" onClick={() => router.push('/data-upload')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
