'use client';

import type { ValidationFlag } from '@/lib/types';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationPanelProps {
  flags: ValidationFlag[];
  totalBatches: number;
}

export default function ValidationPanel({ flags, totalBatches }: ValidationPanelProps) {
  const missingFields = flags.filter(f => f.type === 'missing_field').length;
  const inconsistencies = flags.filter(f => 
    f.type !== 'missing_field' && f.type !== 'invalid_value'
  ).length;
  const highRiskFlags = flags.filter(f => f.severity === 'high').length;

  // Calculate data health score (0-100)
  const calculateHealthScore = () => {
    if (totalBatches === 0) return 100;
    
    const flagsPerBatch = flags.length / totalBatches;
    const highRiskPerBatch = highRiskFlags / totalBatches;
    
    let score = 100;
    score -= flagsPerBatch * 10;
    score -= highRiskPerBatch * 15;
    
    return Math.max(0, Math.round(score));
  };

  const healthScore = calculateHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get top issues
  const getTopIssues = () => {
    const issueTypes = new Map<string, number>();
    
    flags.forEach(flag => {
      const count = issueTypes.get(flag.type) || 0;
      issueTypes.set(flag.type, count + 1);
    });

    return Array.from(issueTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({
        type: type.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        count,
      }));
  };

  const topIssues = getTopIssues();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm/3">
      <h3 className="text-2xl tracking-tight font-semibold mb-4">Validation Summary</h3>

      {/* Data Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-md font-medium">Data Health Score</span>
          <span className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}
          </span>
        </div>
        <div className="w-full bg-accent rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              healthScore >= 75 ? 'bg-green-600' :
              healthScore >= 50 ? 'bg-orange-600' : 'bg-red-600'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{missingFields}</div>
          <div className="text-xs text-foreground/60 mt-1">Missing Fields</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{inconsistencies}</div>
          <div className="text-xs text-foreground/60 mt-1">Inconsistencies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-700">{highRiskFlags}</div>
          <div className="text-xs text-foreground/60 mt-1">High Risk Flags</div>
        </div>
      </div>

      {/* Top Issues */}
      <div>
        <h4 className="text-md font-semibold mb-3">Top Issues Detected</h4>
        {topIssues.length > 0 ? (
          <ul className="space-y-2">
            {topIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-md">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="flex-1">
                  <span className="font-medium">{issue.type}</span>
                  <span className="text-foreground/60"> ({issue.count} occurrences)</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-md text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>No issues detected</span>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="mt-3 pt-6 border-t border-border">
        <div className="flex items-start gap-2 text-sm text-foreground/60">
          <AlertCircle className="w-4 h-3 mt-0.5 flex-shrink-0" />
          <p>
            {flags.length === 0 
              ? 'All batches validated successfully. No compliance issues detected.'
              : `${flags.length} validation flag${flags.length !== 1 ? 's' : ''} detected across ${totalBatches} batch${totalBatches !== 1 ? 'es' : ''}. Review high-priority alerts.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
