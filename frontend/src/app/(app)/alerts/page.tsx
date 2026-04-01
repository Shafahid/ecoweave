'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Alert, ValidationFlag } from '@/lib/types';
import {
  getAlerts as fetchAlerts,
  getAlertStats,
  updateAlertStatus as patchAlert,
  clearResolvedAlerts,
  checkBackendHealth,
} from '@/lib/api';
import Button from '@/components/ui/Button';
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, Filter, FileText, Trash2, Loader2 } from 'lucide-react';
import Topbar from '@/components/app/Topbar';

const ALERTS_STORAGE_KEY = 'ecoweave_dashboard_alerts';

interface AlertStats {
  pending: number;
  acknowledged: number;
  resolved: number;
  total: number;
}

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<Alert['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'date'>('risk');
  const [isLoading, setIsLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);

  const loadFromLocalStorage = useCallback(() => {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
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
          setUseBackend(true);
          const [alertRes, statsRes] = await Promise.all([fetchAlerts(), getAlertStats()]);
          const mapped: Alert[] = (alertRes.alerts || []).map((a: Record<string, unknown>) => ({
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
          setAlerts(mapped);
          setStats(statsRes);
        } else {
          setUseBackend(false);
          loadFromLocalStorage();
        }
      } catch {
        setUseBackend(false);
        loadFromLocalStorage();
      }
      setIsLoading(false);
    })();
  }, [loadFromLocalStorage]);

  const handleStatusChange = async (alertId: string, newStatus: Alert['status']) => {
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

  const handleClearResolved = async () => {
    if (useBackend) {
      try {
        await clearResolvedAlerts();
        setAlerts(prev => prev.filter(a => a.status !== 'resolved'));
      } catch {
        /* empty */
      }
    } else {
      const remaining = alerts.filter(a => a.status !== 'resolved');
      setAlerts(remaining);
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(remaining));
    }
  };

  // Filter and sort
  const filteredAlerts = alerts.filter(alert =>
    filterStatus === 'all' || alert.status === filterStatus
  );

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'risk') {
      return b.risk_score - a.risk_score;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'acknowledged':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    const styles = {
      pending: 'bg-red-100 text-red-700 border-red-200',
      acknowledged: 'bg-orange-100 text-orange-700 border-orange-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${styles[status]}`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">High Risk</span>;
    } else if (score >= 50) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">Medium Risk</span>;
    } else {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">Low Risk</span>;
    }
  };

  return (
    <div className="min-h-full bg-background p-4">
      <Topbar />
      <div className="min-h-full bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        {/* Header with actions */}
        <div className="px-3 py-3 z-10 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight leading-tight sm:text-4xl">Compliance Alerts</h1>
              <p className="text-sm sm:text-base text-foreground/60 mt-1">
                Monitor and manage high-risk batches and compliance issues
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              {alerts.length > 0 && (
                <Button variant="outline" className="w-full sm:w-auto justify-center rounded-full" onClick={handleClearResolved}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Resolved
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
          ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Total Alerts</div>
              <div className="text-2xl font-bold">{stats?.total ?? alerts.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Pending</div>
              <div className="text-2xl font-bold text-red-600">
                {stats?.pending ?? alerts.filter(a => a.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Acknowledged</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.acknowledged ?? alerts.filter(a => a.status === 'acknowledged').length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm/3">
              <div className="text-sm text-foreground/60 mb-1">Resolved</div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.resolved ?? alerts.filter(a => a.status === 'resolved').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm/3">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-foreground/60" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs text-foreground/60 mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-foreground/60 mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="risk">Risk Score (High to Low)</option>
                  <option value="date">Date (Newest First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {sortedAlerts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm/3">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl tracking-tight font-semibold text-gray-900 mb-2">No Alerts Found</h3>
              <p className="text-foreground/60">
                {alerts.length === 0
                  ? 'Upload data to generate alerts.'
                  : 'No alerts match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-xl p-6 shadow-sm/3 hover:shadow-md transition-shadow"
                >
                  {/* Header Row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">Batch {alert.batch_id}</h3>
                        {getRiskBadge(alert.risk_score)}
                      </div>
                      <div className="text-sm text-foreground/60">
                        Risk Score: <span className="font-bold text-red-600">{alert.risk_score}/100</span>
                        {' • '}
                        Created: {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                      {getStatusBadge(alert.status)}
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <button
                          onClick={() => router.push(`/batches/${alert.batch_id}/print?autoprint=1`)}
                          className="w-full sm:w-auto text-xs px-3 py-1 border border-primary text-primary rounded-full bg-[#F7F7F7] hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-1"
                          title="Export Evidence PDF"
                        >
                          <FileText className="w-3 h-3" />
                          Export
                        </button>
                        <select
                          value={alert.status}
                          onChange={(e) => handleStatusChange(alert.id, e.target.value as Alert['status'])}
                          className="w-full sm:w-auto text-xs px-3 py-1 border border-border rounded-full bg-[#F7F7F7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="pending">Mark as Pending</option>
                          <option value="acknowledged">Mark as Acknowledged</option>
                          <option value="resolved">Mark as Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Financial Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-xs text-red-600 mb-1 font-medium">Est. Loss if Bypassed</div>
                      <div className="text-2xl font-bold text-red-700">
                        ৳{alert.estimated_loss_bdt.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-xs text-green-600 mb-1 font-medium">Cost to Run ETP</div>
                      <div className="text-2xl font-bold text-green-700">
                        ৳{alert.etp_cost_bdt.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-xs text-blue-600 mb-1 font-medium">Net Benefit</div>
                      <div className="text-2xl font-bold text-blue-700">
                        ৳{(alert.estimated_loss_bdt - alert.etp_cost_bdt).toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {((alert.estimated_loss_bdt / alert.etp_cost_bdt) - 1).toFixed(1)}x ROI
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-accent/50 rounded-lg p-4 mb-4">
                    <div className="text-sm font-semibold mb-2 text-foreground/80">
                      🎯 Recommended Action:
                    </div>
                    <p className="text-sm text-foreground">{alert.recommendation}</p>
                  </div>

                  {/* Flags */}
                  {alert.flags.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2 text-foreground/80">
                        Issues Detected ({alert.flags.length}):
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {alert.flags.map((flag, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm bg-[#F7F7F7] rounded p-2"
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                flag.severity === 'high' ? 'bg-red-500' :
                                flag.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                              }`}
                            />
                            <span className="text-foreground/80">{flag.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
