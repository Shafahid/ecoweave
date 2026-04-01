from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import uuid

from src.database import get_db
from src.auth.security import get_current_user
from src.models import User, BatchRecord
from src.batch.schema import BatchRecordResponse, BatchListResponse, BatchStatsResponse

router = APIRouter(prefix="/api/batches", tags=["Batches"])


@router.get("/stats", response_model=BatchStatsResponse)
async def get_batch_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base = db.query(BatchRecord).filter(BatchRecord.user_id == current_user.user_id)
    total = base.count()
    avg_risk = base.with_entities(func.coalesce(func.avg(BatchRecord.risk_score), 0)).scalar()
    high_risk = base.filter(BatchRecord.risk_score >= 75).count()
    total_loss = base.with_entities(func.coalesce(func.sum(BatchRecord.estimated_loss_bdt), 0)).scalar()
    bypass_count = base.filter(BatchRecord.bypass_prediction == True).count()

    return BatchStatsResponse(
        total_batches=total,
        avg_risk_score=round(float(avg_risk), 1),
        high_risk_count=high_risk,
        total_estimated_loss=float(total_loss),
        bypass_count=bypass_count,
    )


@router.get("", response_model=BatchListResponse)
async def list_batches(
    skip: int = 0,
    limit: int = 100,
    risk_min: Optional[float] = None,
    risk_max: Optional[float] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    upload_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(BatchRecord).filter(BatchRecord.user_id == current_user.user_id)

    if risk_min is not None:
        query = query.filter(BatchRecord.risk_score >= risk_min)
    if risk_max is not None:
        query = query.filter(BatchRecord.risk_score <= risk_max)
    if date_from is not None:
        query = query.filter(BatchRecord.shift_date >= date_from)
    if date_to is not None:
        query = query.filter(BatchRecord.shift_date <= date_to)
    if upload_id is not None:
        query = query.filter(BatchRecord.upload_id == uuid.UUID(upload_id))

    total = query.count()
    batches = query.order_by(BatchRecord.created_at.desc()).offset(skip).limit(limit).all()

    return BatchListResponse(
        batches=[BatchRecordResponse.model_validate(b) for b in batches],
        total=total,
    )


@router.get("/{batch_id}", response_model=BatchRecordResponse)
async def get_batch(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = (
        db.query(BatchRecord)
        .filter(BatchRecord.user_id == current_user.user_id, BatchRecord.batch_id == batch_id)
        .first()
    )
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return BatchRecordResponse.model_validate(batch)
