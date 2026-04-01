'use client';

import type { Alert } from '@/lib/types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onStatusChange: (alertId: string, newStatus: Alert['status']) => void;
}

export default function AlertsPanel({ alerts, onStatusChange }: AlertsPanelProps) {
  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 mt-1 text-green-600" />;
      case 'acknowledged':
        return <Clock className="w-5 h-5 mt-1 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 mt-1 text-red-600" />;
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50/60 border-green-200';
      case 'acknowledged':
        return 'bg-orange-50/60 border-orange-200';
      default:
        return 'bg-red-50/60 border-red-200';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm/3 text-center">
        <div className="text-center text-foreground/60">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <p className="text-lg font-medium mb-2">No Alerts</p>
          <p className="text-sm">All batches are within acceptable risk thresholds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm/3">
      <div className="p-4 border-b border-border">
        <h3 className="text-2xl tracking-tight font-semibold">Active Alerts</h3>
        <p className="text-md text-foreground/60 mt-1">
          {alerts.filter(a => a.status === 'pending').length} pending • 
          {' '}{alerts.filter(a => a.status === 'acknowledged').length} acknowledged • 
          {' '}{alerts.filter(a => a.status === 'resolved').length} resolved
        </p>
      </div>

      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border-l-4 ${getStatusColor(alert.status)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex justify-center items-start gap-2">
                {getStatusIcon(alert.status)}
                <div>
                  <h4 className="font-semibold text-lg">
                    Batch {alert.batch_id}
                  </h4>
                  <p className="text-sm text-foreground/60">
                    Risk Score: <span className="font-bold text-red-600">{alert.risk_score}/100</span>
                  </p>
                </div>
              </div>
              
              {/* Status Dropdown */}
              <select
                value={alert.status}
                onChange={(e) => onStatusChange(alert.id, e.target.value as Alert['status'])}
                className="text-sm px-2 py-1 border border-border rounded bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div className="bg-background/80 rounded-lg border border-border p-2">
                <div className="text-foreground/60 mb-1">Est. Loss if Bypassed</div>
                <div className="font-bold text-red-600 text-xl">
                  ৳{alert.estimated_loss_bdt.toLocaleString()}
                </div>
              </div>
              <div className="bg-background/50 rounded-lg border border-border p-2">
                <div className="text-foreground/60 mb-1">Cost to Run ETP</div>
                <div className="font-bold text-green-600 text-xl">
                  ৳{alert.etp_cost_bdt.toLocaleString()}
                </div>
              </div>
            </div>

            {/* ROI Highlight */}
            <div className="bg-green-100 border border-green-300 rounded p-2 mb-3 text-md">
              <span className="font-semibold text-green-900">Net Benefit: </span>
              <span className="text-green-700">
                ৳{(alert.estimated_loss_bdt - alert.etp_cost_bdt).toLocaleString()} saved
              </span>
              <span className="text-green-600 ml-2">
                ({((alert.estimated_loss_bdt / alert.etp_cost_bdt) - 1).toFixed(0)}x ROI)
              </span>
            </div>

            {/* Recommendation */}
            <div className="bg-background/80 border border-border rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-foreground/70 mb-1">Recommended Action:</div>
              <p className="text-sm">{alert.recommendation}</p>
            </div>

            {/* Flags */}
            {alert.flags.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-sm font-medium text-foreground/70 mb-2">
                  Issues Detected ({alert.flags.length}):
                </div>
                <ul className="space-y-1">
                  {alert.flags.slice(0, 3).map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className={`inline-block w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        flag.severity === 'high' ? 'bg-red-500' :
                        flag.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-foreground/80">{flag.message}</span>
                    </li>
                  ))}
                  {alert.flags.length > 3 && (
                    <li className="text-sm text-foreground/60 ml-4">
                      +{alert.flags.length - 3} more issues
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
