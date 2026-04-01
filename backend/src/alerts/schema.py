from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class AlertResponse(BaseModel):
    id: UUID
    user_id: UUID
    batch_record_id: UUID
    batch_id: str
    risk_score: float
    bypass_prediction: Optional[bool] = None
    estimated_loss_bdt: Optional[float] = None
    etp_cost_bdt: Optional[float] = None
    recommendation: Optional[str] = None
    flags: Optional[List[Any]] = None
    status: str
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int


class AlertStatsResponse(BaseModel):
    pending: int
    acknowledged: int
    resolved: int
    total: int
    avg_risk_score: float


class AlertStatusUpdate(BaseModel):
    status: str
