'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ScoredBatch } from '@/lib/types';
import { scoreBatches, validateBatches } from '@/lib/risk';
import { getBatches, checkBackendHealth } from '@/lib/api';
import { ArrowLeft, Search, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Topbar from '@/components/app/Topbar';

const STORAGE_KEY = 'ecoweave_dashboard_data';

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ScoredBatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const flags = validateBatches(data.batches);
        setBatches(scoreBatches(data.batches, flags));
      } catch {
        /* empty */
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const alive = await checkBackendHealth();
        if (alive) {
          const res = await getBatches({ limit: 500 });
          const mapped: ScoredBatch[] = (res.batches || []).map((b: Record<string, unknown>) => ({
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
          setBatches(mapped);
        } else {
          loadFromLocalStorage();
        }
      } catch {
        loadFromLocalStorage();
      }
      setIsLoading(false);
    })();
  }, [loadFromLocalStorage]);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = 
      filterRisk === 'all' ? true :
      filterRisk === 'high' ? batch.risk_score >= 75 :
      filterRisk === 'medium' ? batch.risk_score >= 50 && batch.risk_score < 75 :
      batch.risk_score < 50;
    
    return matchesSearch && matchesRisk;
  });

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

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        <div className="px-3 py-3 z-10 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight leading-tight sm:text-4xl">All Batches</h1>
              <p className="text-sm sm:text-base text-foreground/60 mt-1">
                View and analyze all batch records
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-center rounded-full"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
          </div>
        ) : (
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm/3">
              <div className="text-lg text-[#004737] mb-1">Total Batches</div>
              <div className="text-3xl font-bold">{batches.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-lg text-[#004737] mb-1">High Risk</div>
              <div className="text-3xl font-bold text-red-600">
                {batches.filter(b => b.risk_score >= 75).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-lg text-[#004737] mb-1">Medium Risk</div>
              <div className="text-3xl font-bold text-orange-600">
                {batches.filter(b => b.risk_score >= 50 && b.risk_score < 75).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-lg text-[#004737] mb-1">Low Risk</div>
              <div className="text-3xl font-bold text-green-600">
                {batches.filter(b => b.risk_score < 50).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search by Batch ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-white border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
                className="w-full sm:w-auto px-6 py-4 border border-border rounded-full text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
              </select>
            </div>
          </div>
          </div>

          {/* Batches List */}
          {filteredBatches.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm/3">
              <p className="text-xl tracking-tight font-semibold text-gray-900 mb-2">No batches found</p>
              <p className="text-foreground/60 text-sm">
                {batches.length === 0 
                  ? 'Upload data from the dashboard to see batches.'
                  : 'No batches match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBatches.map((batch) => {
                return (
                    <button
                    key={batch.batch_id}
                    onClick={() => router.push(`/batches/${batch.batch_id}`)}
                    className="w-full bg-gradient-to-bl border border-border from-white to-gray-400/10 rounded-xl p-6 shadow-sm/3 hover:shadow-md transition-shadow text-left"
                    >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-4 flex-1">
                      {/* Batch ID & Date */}
                      <div className="md:min-w-[150px]">
                        <div className="font-bold text-lg">{batch.batch_id}</div>
                        <div className="text-sm text-foreground/60">{batch.shift_date}</div>
                      </div>

                      {/* Shift */}
                      <div className="md:min-w-[120px]">
                        <div className="text-xs text-foreground/60">Shift</div>
                        <div className="text-sm font-medium">{batch.shift_name}</div>
                      </div>

                      {/* Production */}
                      <div className="md:min-w-[100px]">
                        <div className="text-xs text-foreground/60">Production</div>
                        <div className="text-sm font-medium">
                        {batch.production_volume_kg?.toLocaleString() || 'N/A'} kg
                        </div>
                      </div>

                      {/* ETP Runtime */}
                      <div className="md:min-w-[100px]">
                        <div className="text-xs text-foreground/60">ETP Runtime</div>
                        <div className="text-sm font-medium">
                        {batch.etp_runtime_min !== null ? `${batch.etp_runtime_min} min` : 'N/A'}
                        </div>
                      </div>

                      {/* Risk Score */}
                      <div className="md:min-w-[120px]">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-semibold ${getRiskColor(batch.risk_score)}`}>
                        {batch.risk_score >= 75 && <AlertTriangle className="w-4 h-4" />}
                        {batch.risk_score}
                        </div>
                        <div className="text-xs text-foreground/60 mt-1">
                        {getRiskLabel(batch.risk_score)}
                        </div>
                      </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-foreground/40 self-end md:self-center" />
                    </div>

                    {/* Flags indicator */}
                    {batch.flags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-foreground/60">
                        <span className="font-medium text-red-600">{batch.flags.length} issue{batch.flags.length !== 1 ? 's' : ''}</span>
                        {' '}detected • {batch.flags.filter(f => f.severity === 'high').length} high severity
                      </div>
                      </div>
                    )}
                    </button>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
