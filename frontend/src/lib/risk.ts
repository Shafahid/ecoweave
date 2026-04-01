// Core risk analysis and CSV processing logic

import type { BatchRecord, ValidationFlag, Alert, ScoredBatch } from './types';

/**
 * Parse CSV text into BatchRecord array
 * Basic CSV parser suitable for demo data
 */
export function parseCsvToBatches(csvText: string): BatchRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const batches: BatchRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    const batch: any = {};
    headers.forEach((header, idx) => {
      batch[header] = values[idx] || null;
    });

    // Convert numeric fields
    const toNumber = (val: any) => {
      if (val === null || val === '' || val === undefined) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    batches.push({
      batch_id: batch.batch_id || `B-${Date.now()}-${i}`,
      shift_date: batch.shift_date || '',
      shift_name: batch.shift_name || '',
      production_volume_kg: toNumber(batch.production_volume_kg),
      chemical_usage_kg: toNumber(batch.chemical_usage_kg),
      etp_runtime_min: toNumber(batch.etp_runtime_min),
      electricity_kwh: toNumber(batch.electricity_kwh),
      chemical_invoice_bdt: toNumber(batch.chemical_invoice_bdt),
      etp_cost_bdt: toNumber(batch.etp_cost_bdt),
      notes: batch.notes || '',
    });
  }

  return batches;
}

/**
 * Validate batches and generate flags
 */
export function validateBatches(batches: BatchRecord[]): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  batches.forEach(batch => {
    // Check for missing required fields
    if (!batch.batch_id) {
      flags.push({
        batch_id: batch.batch_id || 'unknown',
        type: 'missing_field',
        message: 'Missing batch ID',
        severity: 'high',
      });
    }

    if (batch.production_volume_kg === null || batch.production_volume_kg === undefined) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'missing_field',
        message: 'Missing production volume',
        severity: 'high',
      });
    }

    if (batch.chemical_usage_kg === null || batch.chemical_usage_kg === undefined) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'missing_field',
        message: 'Missing chemical usage data',
        severity: 'high',
      });
    }

    if (batch.etp_runtime_min === null || batch.etp_runtime_min === undefined) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'missing_field',
        message: 'Missing ETP runtime data',
        severity: 'high',
      });
    }

    if (batch.electricity_kwh === null || batch.electricity_kwh === undefined) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'missing_field',
        message: 'Missing electricity consumption data',
        severity: 'medium',
      });
    }

    // Check for invalid values
    if (batch.production_volume_kg !== null && batch.production_volume_kg <= 0) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'invalid_value',
        message: 'Invalid production volume (must be > 0)',
        severity: 'high',
      });
    }

    // Probable bypass: ETP runtime is 0 but production is high
    if (
      batch.etp_runtime_min !== null &&
      batch.production_volume_kg !== null &&
      batch.etp_runtime_min === 0 &&
      batch.production_volume_kg > 700
    ) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'probable_bypass',
        message: 'High production volume with zero ETP runtime - probable bypass',
        severity: 'high',
      });
    }

    // Power anomaly: electricity usage too low for production
    if (
      batch.electricity_kwh !== null &&
      batch.production_volume_kg !== null &&
      batch.production_volume_kg > 0 &&
      batch.electricity_kwh < batch.production_volume_kg * 0.12
    ) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'power_anomaly',
        message: 'Electricity consumption unusually low for production volume',
        severity: 'high',
      });
    }

    // Treatment inconsistency: high chemical use but low ETP runtime
    if (
      batch.chemical_usage_kg !== null &&
      batch.etp_runtime_min !== null &&
      batch.chemical_usage_kg > 60 &&
      batch.etp_runtime_min < 30
    ) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'treatment_inconsistency',
        message: 'High chemical usage with insufficient treatment time',
        severity: 'high',
      });
    }

    // Invoice mismatch: chemical invoice doesn't match usage
    if (
      batch.chemical_invoice_bdt !== null &&
      batch.chemical_usage_kg !== null &&
      batch.chemical_usage_kg > 0
    ) {
      const expectedCostPerKg = 800; // BDT per kg (demo value)
      const expectedInvoice = batch.chemical_usage_kg * expectedCostPerKg;
      const deviation = Math.abs(batch.chemical_invoice_bdt - expectedInvoice) / expectedInvoice;

      if (deviation > 0.4) { // 40% deviation threshold
        flags.push({
          batch_id: batch.batch_id,
          type: 'invoice_mismatch',
          message: `Chemical invoice (৳${batch.chemical_invoice_bdt.toLocaleString()}) doesn't match usage (expected ~৳${expectedInvoice.toLocaleString()})`,
          severity: 'medium',
        });
      }
    }

    // Triangulation mismatch: multiple inconsistent signals
    const hasLowEtp = batch.etp_runtime_min !== null && batch.etp_runtime_min < 20;
    const hasHighProduction = batch.production_volume_kg !== null && batch.production_volume_kg > 600;
    const hasLowPower = batch.electricity_kwh !== null && batch.production_volume_kg !== null && 
      batch.electricity_kwh < batch.production_volume_kg * 0.15;

    if (hasLowEtp && hasHighProduction && hasLowPower) {
      flags.push({
        batch_id: batch.batch_id,
        type: 'triangulation_mismatch',
        message: 'Multiple indicators suggest treatment bypass or data manipulation',
        severity: 'high',
      });
    }
  });

  return flags;
}

/**
 * Calculate risk score for a batch (0-100)
 */
export function scoreBatch(batch: BatchRecord, flags: ValidationFlag[]): number {
  let score = 10; // Base score

  // Production volume risk
  if (batch.production_volume_kg !== null && batch.production_volume_kg > 700) {
    score += 20;
  }

  // Chemical usage risk
  if (batch.chemical_usage_kg !== null && batch.chemical_usage_kg > 60) {
    score += 20;
  }

  // ETP runtime risk
  if (
    batch.etp_runtime_min !== null &&
    (batch.etp_runtime_min === 0 || batch.etp_runtime_min < 20)
  ) {
    score += 25;
  }

  // Flag-based scoring
  const batchFlags = flags.filter(f => f.batch_id === batch.batch_id);
  
  batchFlags.forEach(flag => {
    switch (flag.type) {
      case 'probable_bypass':
      case 'triangulation_mismatch':
        score += 25;
        break;
      case 'power_anomaly':
      case 'treatment_inconsistency':
        score += 15;
        break;
      case 'invoice_mismatch':
        score += 10;
        break;
      case 'missing_field':
        if (flag.severity === 'high') score += 12;
        else score += 5;
        break;
      default:
        score += 5;
    }
  });

  // Night shift premium risk
  if (batch.shift_name && batch.shift_name.toLowerCase().includes('night')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Estimate financial loss if batch is non-compliant (in BDT)
 */
export function estimateFinancialLoss(
  batch: BatchRecord,
  risk_score: number,
  flags: ValidationFlag[]
): number {
  const baseFine = 200000; // Base regulatory fine
  const inspectionRisk = risk_score * 2500; // Risk-proportional inspection cost
  
  // Shutdown risk if bypass is probable
  const hasBypassFlag = flags.some(f => f.type === 'probable_bypass');
  const shutdownRisk = hasBypassFlag ? 150000 : 0;
  
  // Export/buyer compliance risk
  const exportRisk = risk_score >= 80 ? 200000 : 50000;
  
  const total = baseFine + inspectionRisk + shutdownRisk + exportRisk;
  
  return Math.round(total);
}

/**
 * Generate alerts from scored batches
 */
export function generateAlerts(batches: BatchRecord[], allFlags: ValidationFlag[]): Alert[] {
  const alerts: Alert[] = [];

  batches.forEach(batch => {
    const batchFlags = allFlags.filter(f => f.batch_id === batch.batch_id);
    const risk_score = scoreBatch(batch, allFlags);
    
    // Generate alert if risk is high or severe flags exist
    const hasSevereFlag = batchFlags.some(f => f.severity === 'high');
    const shouldAlert = risk_score >= 75 || hasSevereFlag;

    if (shouldAlert) {
      const estimated_loss_bdt = estimateFinancialLoss(batch, risk_score, batchFlags);
      const etp_cost_bdt = batch.etp_cost_bdt || 15000; // Use actual or default

      // Generate recommendation based on flags
      let recommendation = 'Review batch data and verify compliance measures.';
      
      if (batchFlags.some(f => f.type === 'probable_bypass')) {
        recommendation = 'Critical: Run ETP during this batch and verify operation log. Evidence suggests treatment bypass.';
      } else if (batchFlags.some(f => f.type === 'triangulation_mismatch')) {
        recommendation = 'Run full diagnostic check. Multiple data points indicate potential manipulation.';
      } else if (batchFlags.some(f => f.type === 'power_anomaly')) {
        recommendation = 'Check power meter reading and confirm ETP pump status.';
      } else if (batchFlags.some(f => f.type === 'treatment_inconsistency')) {
        recommendation = 'Split batch or reduce chemical load; re-check treatment runtime.';
      } else if (risk_score >= 85) {
        recommendation = 'High-risk batch: Increase monitoring and verify all treatment equipment is operational.';
      }

      alerts.push({
        id: `alert-${batch.batch_id}-${Date.now()}`,
        batch_id: batch.batch_id,
        risk_score,
        estimated_loss_bdt,
        etp_cost_bdt,
        recommendation,
        flags: batchFlags,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }
  });

  // Sort by risk score descending
  return alerts.sort((a, b) => b.risk_score - a.risk_score);
}

/**
 * Score all batches and return enriched data
 */
export function scoreBatches(batches: BatchRecord[], flags: ValidationFlag[]): ScoredBatch[] {
  return batches.map(batch => {
    const batchFlags = flags.filter(f => f.batch_id === batch.batch_id);
    const risk_score = scoreBatch(batch, flags);
    const estimated_loss_bdt = estimateFinancialLoss(batch, risk_score, batchFlags);

    return {
      ...batch,
      risk_score,
      estimated_loss_bdt,
      flags: batchFlags,
    };
  });
}
