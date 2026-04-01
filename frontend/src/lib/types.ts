// Core data types for EcoWeave Dashboard

export interface BatchRecord {
  batch_id: string;
  shift_date: string;
  shift_name: string;
  production_volume_kg: number | null;
  chemical_usage_kg: number | null;
  etp_runtime_min: number | null;
  electricity_kwh: number | null;
  chemical_invoice_bdt: number | null;
  etp_cost_bdt: number | null;
  notes?: string;
}

export interface ValidationFlag {
  batch_id: string;
  type: 'missing_field' | 'invalid_value' | 'triangulation_mismatch' | 'power_anomaly' | 'treatment_inconsistency' | 'invoice_mismatch' | 'probable_bypass';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Alert {
  id: string;
  batch_id: string;
  risk_score: number;
  estimated_loss_bdt: number;
  etp_cost_bdt: number;
  recommendation: string;
  flags: ValidationFlag[];
  status: 'pending' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface ScoredBatch extends BatchRecord {
  risk_score: number;
  estimated_loss_bdt: number;
  flags: ValidationFlag[];
}
