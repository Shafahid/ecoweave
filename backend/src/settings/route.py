from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.auth.security import get_current_user
from src.models import User, UserSettings
from src.settings.schema import UserSettingsResponse, UserSettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


def _get_or_create_settings(db: Session, user_id) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=UserSettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = _get_or_create_settings(db, current_user.user_id)
    return UserSettingsResponse.model_validate(settings)


@router.put("", response_model=UserSettingsResponse)
async def update_settings(
    body: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = _get_or_create_settings(db, current_user.user_id)

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return UserSettingsResponse.model_validate(settings)
