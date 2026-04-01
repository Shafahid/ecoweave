from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import io
import pandas as pd

from src.database import get_db
from src.auth.security import get_current_user
from src.models import User, BatchRecord, Alert
from src.reports.schema import ReportRequest

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def _query_batches(db: Session, user_id, date_from=None, date_to=None):
    query = db.query(BatchRecord).filter(BatchRecord.user_id == user_id)
    if date_from:
        try:
            dt = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(BatchRecord.shift_date >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(BatchRecord.shift_date <= dt)
        except ValueError:
            pass
    return query.order_by(BatchRecord.created_at.desc()).all()


def _batches_to_df(batches):
    rows = []
    for b in batches:
        rows.append({
            "batch_id": b.batch_id,
            "shift_date": str(b.shift_date) if b.shift_date else "",
            "shift_name": b.shift_name or "",
            "production_volume_kg": b.production_volume_kg,
            "chemical_usage_kg": b.chemical_usage_kg,
            "etp_runtime_min": b.etp_runtime_min,
            "electricity_kwh": b.electricity_kwh,
            "chemical_invoice_bdt": b.chemical_invoice_bdt,
            "etp_cost_bdt": b.etp_cost_bdt,
            "risk_score": b.risk_score,
            "bypass_prediction": b.bypass_prediction,
            "estimated_loss_bdt": b.estimated_loss_bdt,
            "notes": b.notes or "",
        })
    return pd.DataFrame(rows)


def _generate_pdf(batches, report_type, user):
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 15, "EcoWeave Compliance Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Report Type: {report_type.replace('_', ' ').title()}", ln=True, align="C")
    pdf.cell(0, 8, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True, align="C")
    pdf.cell(0, 8, f"User: {user.full_name} ({user.email})", ln=True, align="C")
    pdf.ln(10)

    total = len(batches)
    high_risk = sum(1 for b in batches if b.risk_score and b.risk_score >= 75)
    avg_risk = sum(b.risk_score or 0 for b in batches) / total if total > 0 else 0
    total_loss = sum(b.estimated_loss_bdt or 0 for b in batches)

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Summary", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Total Batches: {total}", ln=True)
    pdf.cell(0, 7, f"High Risk Batches: {high_risk}", ln=True)
    pdf.cell(0, 7, f"Average Risk Score: {avg_risk:.1f}", ln=True)
    pdf.cell(0, 7, f"Total Estimated Loss: {total_loss:,.0f} BDT", ln=True)
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Batch Details", ln=True)

    headers = ["Batch ID", "Date", "Shift", "Prod (kg)", "Risk", "Loss (BDT)"]
    col_widths = [25, 25, 30, 25, 20, 35]

    pdf.set_font("Helvetica", "B", 9)
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, h, border=1)
    pdf.ln()

    pdf.set_font("Helvetica", "", 8)
    for b in batches[:50]:
        pdf.cell(col_widths[0], 7, str(b.batch_id)[:12], border=1)
        pdf.cell(col_widths[1], 7, str(b.shift_date) if b.shift_date else "", border=1)
        pdf.cell(col_widths[2], 7, str(b.shift_name or "")[:15], border=1)
        pdf.cell(col_widths[3], 7, f"{b.production_volume_kg or 0:.0f}", border=1)
        pdf.cell(col_widths[4], 7, f"{b.risk_score or 0:.0f}", border=1)
        pdf.cell(col_widths[5], 7, f"{b.estimated_loss_bdt or 0:,.0f}", border=1)
        pdf.ln()

    if len(batches) > 50:
        pdf.ln(5)
        pdf.set_font("Helvetica", "I", 9)
        pdf.cell(0, 7, f"... and {len(batches) - 50} more batches", ln=True)

    return pdf.output()


@router.post("/generate")
async def generate_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batches = _query_batches(db, current_user.user_id, request.date_from, request.date_to)

    if not batches:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No batch data found for the selected period")

    if request.format == "csv":
        df = _batches_to_df(batches)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            io.BytesIO(buffer.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ecoweave_{request.report_type}_report.csv"},
        )

    elif request.format == "excel":
        df = _batches_to_df(batches)
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=ecoweave_{request.report_type}_report.xlsx"},
        )

    elif request.format == "pdf":
        pdf_bytes = _generate_pdf(batches, request.report_type, current_user)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ecoweave_{request.report_type}_report.pdf"},
        )

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid format. Use pdf, csv, or excel.")
