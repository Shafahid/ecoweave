from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class CSVUploadBase(BaseModel):
    file_name: str
    file_path: str
    file_size: Optional[int] = None

class CSVUploadResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class CSVUploadListResponse(BaseModel):
    uploads: list[CSVUploadResponse]
    total: int
