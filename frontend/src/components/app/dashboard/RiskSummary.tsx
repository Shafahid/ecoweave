'use client';

import type { ScoredBatch } from '@/lib/types';
import { TrendingUp, AlertTriangle, DollarSign, Activity } from 'lucide-react';

interface RiskSummaryProps {
  batches: ScoredBatch[];
}

export default function RiskSummary({ batches }: RiskSummaryProps) {
  // Calculate metrics
  const avgRiskScore = batches.length > 0
    ? Math.round(batches.reduce((sum, b) => sum + b.risk_score, 0) / batches.length)
    : 0;

  const highRiskBatches = batches.filter(b => b.risk_score >= 75).length;

  const totalAnomalies = batches.reduce((sum, b) => sum + b.flags.length, 0);

  const estimatedLossAvoided = batches
    .filter(b => b.risk_score >= 75)
    .reduce((sum, b) => sum + b.estimated_loss_bdt, 0);

  // Simple sparkline data (risk scores over batches)
  const sparklineData = batches.slice(0, 10).map(b => b.risk_score);
  const maxSparkline = Math.max(...sparklineData, 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground/60">Avg Risk Score</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{avgRiskScore}</div>
          <div className="text-xs text-foreground/60 mt-1">out of 100</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground/60">High Risk Batches</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{highRiskBatches}</div>
          <div className="text-xs text-foreground/60 mt-1">risk ≥ 75</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground/60">Anomalies</span>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{totalAnomalies}</div>
          <div className="text-xs text-foreground/60 mt-1">total flags</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground/60">Loss Avoided</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            ৳{(estimatedLossAvoided / 100000).toFixed(1)}L
          </div>
          <div className="text-xs text-foreground/60 mt-1">estimated</div>
        </div>
      </div>

      {/* Risk Trend Sparkline */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Risk Trend (Recent Batches)</h4>
        
        {sparklineData.length > 0 ? (
          <div className="flex items-end gap-1 h-16">
            {sparklineData.map((score, idx) => {
              const height = (score / maxSparkline) * 100;
              const color = score >= 75 ? 'bg-red-500' : score >= 50 ? 'bg-orange-500' : 'bg-green-500';
              
              return (
                <div
                  key={idx}
                  className={`flex-1 ${color} rounded-sm transition-all hover:opacity-70`}
                  style={{ height: `${height}%` }}
                  title={`Batch ${idx + 1}: Risk ${score}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-foreground/60 text-center py-4">
            No data available
          </div>
        )}
        
        <div className="flex justify-between text-xs text-foreground/60 mt-2">
          <span>Oldest</span>
          <span>Recent</span>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Risk Distribution</h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-600 font-medium">Low (0-49)</span>
              <span className="text-foreground/60">
                {batches.filter(b => b.risk_score < 50).length} batches
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${batches.length > 0 ? (batches.filter(b => b.risk_score < 50).length / batches.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-orange-600 font-medium">Medium (50-74)</span>
              <span className="text-foreground/60">
                {batches.filter(b => b.risk_score >= 50 && b.risk_score < 75).length} batches
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{
                  width: `${batches.length > 0 ? (batches.filter(b => b.risk_score >= 50 && b.risk_score < 75).length / batches.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-600 font-medium">High (75-100)</span>
              <span className="text-foreground/60">
                {batches.filter(b => b.risk_score >= 75).length} batches
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${batches.length > 0 ? (batches.filter(b => b.risk_score >= 75).length / batches.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
