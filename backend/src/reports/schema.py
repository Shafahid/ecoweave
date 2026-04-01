from pydantic import BaseModel
from typing import Optional


class ReportRequest(BaseModel):
    report_type: str
    format: str
    date_from: Optional[str] = None
    date_to: Optional[str] = None
