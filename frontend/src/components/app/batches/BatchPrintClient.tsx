'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BatchRecord, ValidationFlag, Alert } from '@/lib/types';
import { scoreBatch, estimateFinancialLoss, validateBatches } from '@/lib/risk';
import Button from '@/components/ui/Button';
import { Printer, ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './print.module.css';

const STORAGE_KEY = 'ecoweave_dashboard_data';
const ALERTS_STORAGE_KEY = 'ecoweave_dashboard_alerts';

interface BatchPrintClientProps {
  batchId: string;
}

export default function BatchPrintClient({ batchId }: BatchPrintClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batch, setBatch] = useState<BatchRecord | null>(null);
  const [flags, setFlags] = useState<ValidationFlag[]>([]);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [estimatedLoss, setEstimatedLoss] = useState(0);
  const [etpCost, setEtpCost] = useState(15000);
  const [notFound, setNotFound] = useState(false);
  const [relatedBatches, setRelatedBatches] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const foundBatch = data.batches.find((b: any) => b.batch_id === batchId);
        
        if (foundBatch) {
          setBatch(foundBatch);
          
          // Validate and get flags
          const allFlags = validateBatches(data.batches);
          const batchFlags = allFlags.filter(f => f.batch_id === batchId);
          setFlags(batchFlags);
          
          // Calculate risk score
          const score = scoreBatch(foundBatch, allFlags);
          setRiskScore(score);
          
          // Get estimated loss
          const loss = estimateFinancialLoss(foundBatch, score, batchFlags);
          setEstimatedLoss(loss);
          
          // Get ETP cost
          setEtpCost(foundBatch.etp_cost_bdt || 15000);
          
          // Get related high-risk batches (sample)
          const otherBatches = data.batches
            .filter((b: any) => b.batch_id !== batchId)
            .map((b: any) => {
              const bFlags = allFlags.filter((f: ValidationFlag) => f.batch_id === b.batch_id);
              return {
                ...b,
                risk_score: scoreBatch(b, allFlags),
                flags_count: bFlags.length,
              };
            })
            .filter((b: any) => b.risk_score >= 75)
            .slice(0, 5);
          
          setRelatedBatches(otherBatches);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }

    if (storedAlerts) {
      try {
        const alertsData = JSON.parse(storedAlerts);
        const foundAlert = alertsData.find((a: Alert) => a.batch_id === batchId);
        if (foundAlert) {
          setAlert(foundAlert);
        }
      } catch (e) {
        console.error('Failed to parse alerts:', e);
      }
    }
  }, [batchId]);

  // Auto-print if requested
  useEffect(() => {
    const autoprint = searchParams.get('autoprint');
    if (autoprint === '1' && batch) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, batch]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push(`/batches/${batchId}`);
  };

  // Calculate triangulation metrics
  const getTriangulationMetrics = () => {
    if (!batch) return [];
    
    const prod = batch.production_volume_kg || 1;
    const chem = batch.chemical_usage_kg || 0;
    
    return [
      {
        metric: 'Electricity per kg Production',
        value: batch.electricity_kwh !== null ? (batch.electricity_kwh / prod).toFixed(3) : 'N/A',
        unit: 'kWh/kg',
        threshold: '≥ 0.12',
        status: batch.electricity_kwh !== null && batch.electricity_kwh / prod < 0.12 ? 'Low' : 'Normal',
      },
      {
        metric: 'Chemical per kg Production',
        value: (chem / prod).toFixed(3),
        unit: 'kg/kg',
        threshold: '< 0.10',
        status: chem / prod > 0.09 ? 'High' : 'Normal',
      },
      {
        metric: 'Treatment Intensity',
        value: batch.etp_runtime_min !== null ? (batch.etp_runtime_min / prod).toFixed(3) : 'N/A',
        unit: 'min/kg',
        threshold: '≥ 0.03',
        status: batch.etp_runtime_min !== null && batch.etp_runtime_min / prod < 0.03 ? 'Low' : 'Normal',
      },
      {
        metric: 'Invoice per kg Chemical',
        value: batch.chemical_invoice_bdt !== null && chem > 0 
          ? (batch.chemical_invoice_bdt / chem).toFixed(0)
          : 'N/A',
        unit: '৳/kg',
        threshold: '~800',
        status: batch.chemical_invoice_bdt !== null && chem > 0 
          ? Math.abs(batch.chemical_invoice_bdt / chem - 800) > 320 ? 'Mismatch' : 'Normal'
          : 'N/A',
      },
    ];
  };

  // Get risk drivers
  const getRiskDrivers = () => {
    const drivers = [];
    
    if (batch?.production_volume_kg && batch.production_volume_kg > 700) {
      drivers.push('High production volume (> 700 kg)');
    }
    if (batch?.chemical_usage_kg && batch.chemical_usage_kg > 60) {
      drivers.push('High chemical usage (> 60 kg)');
    }
    if (batch && batch.etp_runtime_min !== null && batch.etp_runtime_min < 20) {
      drivers.push('Very low or zero ETP runtime');
    }
    if (batch?.shift_name && batch.shift_name.toLowerCase().includes('night')) {
      drivers.push('Night shift operation (higher risk)');
    }
    
    flags.forEach(flag => {
      if (flag.severity === 'high') {
        drivers.push(`${flag.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);
      }
    });
    
    return drivers.slice(0, 8);
  };

  const triangulationMetrics = getTriangulationMetrics();
  const riskDrivers = getRiskDrivers();

  if (notFound) {
    return (
      <div className={styles.printRoot}>
        <div className="no-print p-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
          <h1 className="text-2xl font-bold mb-2">Batch Not Found</h1>
          <p className="text-foreground/60">
            Batch "{batchId}" could not be found. Please return to the dashboard and load data.
          </p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className={styles.printRoot}>
        <div className="text-center py-12">
          <p className="text-foreground/60">Loading batch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.printRoot}>
      {/* Screen-only controls */}
      <div className="no-print bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batch
        </Button>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Print content */}
      <div className={styles.printContent}>
        {/* Header */}
        <div className={styles.reportHeader}>
          <div>
            <h1 className={styles.reportTitle}>EcoWeave – Batch Evidence Report</h1>
            <div className={styles.reportSubtitle}>Compliance Risk Analysis & Forensic Evidence</div>
          </div>
          <div className={styles.logo}>
            <div className="text-2xl font-bold text-primary">EcoWeave</div>
          </div>
        </div>

        {/* Batch Meta */}
        <div className={styles.metaRow}>
          <div>
            <strong>Batch ID:</strong> {batch.batch_id}
          </div>
          <div>
            <strong>Date:</strong> {batch.shift_date}
          </div>
          <div>
            <strong>Shift:</strong> {batch.shift_name}
          </div>
          <div>
            <strong>Generated:</strong> {new Date().toLocaleString()}
          </div>
        </div>

        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Compliance Risk Score</div>
            <div className={styles.kpiValue} style={{ 
              color: riskScore >= 75 ? '#dc2626' : riskScore >= 50 ? '#ea580c' : '#16a34a' 
            }}>
              {riskScore}/100
            </div>
            <div className={styles.kpiSubtext}>
              {riskScore >= 75 ? 'High Risk' : riskScore >= 50 ? 'Medium Risk' : 'Low Risk'}
            </div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Est. Loss if Bypassed</div>
            <div className={styles.kpiValue} style={{ color: '#dc2626' }}>
              ৳{estimatedLoss.toLocaleString()}
            </div>
            <div className={styles.kpiSubtext}>Potential compliance cost</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Cost to Run ETP</div>
            <div className={styles.kpiValue} style={{ color: '#16a34a' }}>
              ৳{etpCost.toLocaleString()}
            </div>
            <div className={styles.kpiSubtext}>Treatment operation cost</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Net Benefit</div>
            <div className={styles.kpiValue} style={{ color: '#2563eb' }}>
              ৳{(estimatedLoss - etpCost).toLocaleString()}
            </div>
            <div className={styles.kpiSubtext}>
              {etpCost > 0 ? `${((estimatedLoss / etpCost) - 1).toFixed(1)}x ROI` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Executive Summary</h2>
          <p className={styles.paragraph}>
            This report presents a forensic analysis of batch <strong>{batch.batch_id}</strong> processed 
            on {batch.shift_date} during {batch.shift_name}. The batch has been assigned a compliance 
            risk score of <strong>{riskScore}/100</strong>, indicating a{' '}
            <strong>{riskScore >= 75 ? 'high-risk' : riskScore >= 50 ? 'medium-risk' : 'low-risk'}</strong>{' '}
            profile. {flags.length > 0 ? (
              <>Our triangulation analysis detected <strong>{flags.length} validation flag{flags.length !== 1 ? 's' : ''}</strong>, 
              including {flags.filter(f => f.severity === 'high').length} high-severity issue{flags.filter(f => f.severity === 'high').length !== 1 ? 's' : ''}.</>
            ) : (
              <>No compliance issues were detected during validation.</>
            )}
            {' '}The estimated financial exposure from non-compliance is ৳{estimatedLoss.toLocaleString()}, 
            while proper ETP operation costs ৳{etpCost.toLocaleString()}, yielding a net benefit 
            of ৳{(estimatedLoss - etpCost).toLocaleString()}.
          </p>
        </div>

        {/* Section 2: Forensic Evidence */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Forensic Evidence</h2>
          {flags.length === 0 ? (
            <p className={styles.paragraph}>✓ No validation issues detected. Batch data appears consistent.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Severity</th>
                  <th style={{ width: '30%' }}>Type</th>
                  <th style={{ width: '55%' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`${styles.badge} ${
                        flag.severity === 'high' ? styles.badgeHigh :
                        flag.severity === 'medium' ? styles.badgeMedium :
                        styles.badgeLow
                      }`}>
                        {flag.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>{flag.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                    <td>{flag.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Risk Drivers */}
        {riskDrivers.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Risk Score Drivers</h2>
            <p className={styles.paragraph}>
              The following factors contributed to the elevated risk score:
            </p>
            <ul className={styles.list}>
              {riskDrivers.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 4: Triangulation Metrics */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Triangulation Metrics</h2>
          <p className={styles.paragraph}>
            Cross-validation of operational metrics to detect anomalies:
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Metric</th>
                <th style={{ width: '20%' }}>Value</th>
                <th style={{ width: '20%' }}>Expected</th>
                <th style={{ width: '25%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {triangulationMetrics.map((metric, idx) => (
                <tr key={idx}>
                  <td>{metric.metric}</td>
                  <td>{metric.value} {metric.unit}</td>
                  <td>{metric.threshold}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      metric.status === 'Low' || metric.status === 'High' || metric.status === 'Mismatch'
                        ? styles.badgeHigh
                        : styles.badgeNormal
                    }`}>
                      {metric.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Related High-Risk Batches */}
        {relatedBatches.length > 0 && (
          <div className={`${styles.section} page-break`}>
            <h2 className={styles.sectionTitle}>5. Related High-Risk Batches</h2>
            <p className={styles.paragraph}>
              Other recent batches with risk scores ≥ 75:
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Date</th>
                  <th>Risk Score</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {relatedBatches.map((b, idx) => (
                  <tr key={idx}>
                    <td>{b.batch_id}</td>
                    <td>{b.shift_date}</td>
                    <td style={{ color: '#dc2626', fontWeight: 'bold' }}>{b.risk_score}</td>
                    <td>{b.flags_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 6: Raw Data */}
        <div className={`${styles.section} page-break`}>
          <h2 className={styles.sectionTitle}>6. Raw Batch Data</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td style={{ width: '40%', fontWeight: 'bold' }}>Batch ID</td>
                <td>{batch.batch_id}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Shift Date</td>
                <td>{batch.shift_date}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Shift Name</td>
                <td>{batch.shift_name}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Production Volume</td>
                <td>{batch.production_volume_kg !== null ? `${batch.production_volume_kg} kg` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Chemical Usage</td>
                <td>{batch.chemical_usage_kg !== null ? `${batch.chemical_usage_kg} kg` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>ETP Runtime</td>
                <td>{batch.etp_runtime_min !== null ? `${batch.etp_runtime_min} minutes` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Electricity Consumption</td>
                <td>{batch.electricity_kwh !== null ? `${batch.electricity_kwh} kWh` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Chemical Invoice</td>
                <td>{batch.chemical_invoice_bdt !== null ? `৳${batch.chemical_invoice_bdt.toLocaleString()}` : 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>ETP Cost</td>
                <td>৳{etpCost.toLocaleString()}</td>
              </tr>
              {batch.notes && (
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Notes</td>
                  <td>{batch.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recommendation */}
        {alert && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Recommended Action</h2>
            <div className={styles.recommendation}>
              {alert.recommendation}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p>
            <strong>Generated by EcoWeave (Demo Mode)</strong> • {new Date().toLocaleDateString()} • 
            For decision support only. Not a legal compliance document.
          </p>
        </div>
      </div>
    </div>
  );
}
