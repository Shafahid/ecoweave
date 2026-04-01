from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid

from src.database import get_db
from src.auth.security import get_current_user
from src.models import User, Alert
from src.alerts.schema import (
    AlertResponse,
    AlertListResponse,
    AlertStatsResponse,
    AlertStatusUpdate,
)

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/stats", response_model=AlertStatsResponse)
async def get_alert_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base = db.query(Alert).filter(Alert.user_id == current_user.user_id)
    pending = base.filter(Alert.status == "pending").count()
    acknowledged = base.filter(Alert.status == "acknowledged").count()
    resolved = base.filter(Alert.status == "resolved").count()
    total = base.count()
    avg_risk = base.with_entities(func.coalesce(func.avg(Alert.risk_score), 0)).scalar()

    return AlertStatsResponse(
        pending=pending,
        acknowledged=acknowledged,
        resolved=resolved,
        total=total,
        avg_risk_score=round(float(avg_risk), 1),
    )


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    status_filter: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).filter(Alert.user_id == current_user.user_id)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    total = query.count()
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return AlertListResponse(
        alerts=[AlertResponse.model_validate(a) for a in alerts],
        total=total,
    )


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert_status(
    alert_id: str,
    body: AlertStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(
        Alert.id == uuid.UUID(alert_id),
        Alert.user_id == current_user.user_id,
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    if body.status not in ("pending", "acknowledged", "resolved"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")

    alert.status = body.status
    if body.status == "resolved":
        alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return AlertResponse.model_validate(alert)


@router.delete("")
async def clear_resolved_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.user_id, Alert.status == "resolved")
        .delete()
    )
    db.commit()
    return {"message": f"Cleared {deleted} resolved alerts"}
