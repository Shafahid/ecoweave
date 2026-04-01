from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class UserSettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    email_alerts: bool
    weekly_reports: bool
    risk_threshold_alerts: bool
    data_retention_days: int
    two_factor_enabled: bool
    session_timeout_min: int

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    email_alerts: Optional[bool] = None
    weekly_reports: Optional[bool] = None
    risk_threshold_alerts: Optional[bool] = None
    data_retention_days: Optional[int] = None
    two_factor_enabled: Optional[bool] = None
    session_timeout_min: Optional[int] = None
