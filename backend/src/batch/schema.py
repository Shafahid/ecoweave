from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, datetime


class BatchRecordResponse(BaseModel):
    id: UUID
    upload_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    batch_id: str
    shift_date: Optional[date] = None
    shift_name: Optional[str] = None
    production_volume_kg: Optional[float] = None
    chemical_usage_kg: Optional[float] = None
    etp_runtime_min: Optional[float] = None
    electricity_kwh: Optional[float] = None
    chemical_invoice_bdt: Optional[float] = None
    etp_cost_bdt: Optional[float] = None
    notes: Optional[str] = None
    risk_score: Optional[float] = None
    bypass_prediction: Optional[bool] = None
    estimated_loss_bdt: Optional[float] = None
    flags: Optional[List[Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BatchListResponse(BaseModel):
    batches: List[BatchRecordResponse]
    total: int


class BatchStatsResponse(BaseModel):
    total_batches: int
    avg_risk_score: float
    high_risk_count: int
    total_estimated_loss: float
    bypass_count: int
