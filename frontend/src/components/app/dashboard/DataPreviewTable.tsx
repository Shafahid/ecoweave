'use client';

import { useState } from 'react';
import type { ScoredBatch } from '@/lib/types';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface DataPreviewTableProps {
  batches: ScoredBatch[];
}

export default function DataPreviewTable({ batches }: DataPreviewTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskThreshold, setRiskThreshold] = useState(0);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = batch.risk_score >= riskThreshold;
    const matchesFlagged = !showFlaggedOnly || batch.flags.length > 0;
    
    return matchesSearch && matchesRisk && matchesFlagged;
  });

  const displayedBatches = showAll ? filteredBatches : filteredBatches.slice(0, 20);

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  if (batches.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center text-foreground/60">
          <p className="text-lg font-medium mb-2">No data yet</p>
          <p className="text-sm">Upload a CSV file or load sample data to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
        
        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by Batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Risk Threshold Slider */}
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-2 block">
              Risk Threshold: {riskThreshold}+
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Toggle Flagged Only */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Show flagged batches only</span>
          </label>
        </div>

        <div className="mt-3 text-xs text-foreground/60">
          Showing {displayedBatches.length} of {filteredBatches.length} batches
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Batch ID</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Shift</th>
              <th className="px-4 py-3 text-right font-medium">Production (kg)</th>
              <th className="px-4 py-3 text-right font-medium">ETP Runtime (min)</th>
              <th className="px-4 py-3 text-right font-medium">Risk Score</th>
              <th className="px-4 py-3 text-center font-medium">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedBatches.map((batch) => (
              <tr key={batch.batch_id} className="hover:bg-accent/30">
                <td className="px-4 py-3 font-medium">{batch.batch_id}</td>
                <td className="px-4 py-3">{batch.shift_date}</td>
                <td className="px-4 py-3">{batch.shift_name}</td>
                <td className="px-4 py-3 text-right">
                  {batch.production_volume_kg?.toLocaleString() || 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  {batch.etp_runtime_min !== null ? batch.etp_runtime_min : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block px-2 py-1 rounded font-medium ${getRiskColor(batch.risk_score)}`}>
                    {batch.risk_score}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {batch.flags.length > 0 ? (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      {batch.flags.length}
                    </span>
                  ) : (
                    <span className="text-foreground/40">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {filteredBatches.length > 20 && (
        <div className="p-4 border-t border-border text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All ({filteredBatches.length - 20} more)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
