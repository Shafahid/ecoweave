from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime, date
import uuid

from src.database import get_db
from src.supabase_client import supabase
from src.models import CSVUpload, BatchRecord, Alert, User
from src.csv_upload.schema.csv_upload import CSVUploadResponse, CSVUploadListResponse
from src.auth.security import get_current_user
from src.ml.predictor import predict_batch, generate_recommendation

router = APIRouter(prefix="/api/csv-upload", tags=["CSV Upload"])


def _safe_float(val):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _safe_date(val):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        return datetime.strptime(str(val).strip(), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )

    try:
        contents = await file.read()
        file_size = len(contents)

        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid CSV file: {str(e)}"
            )

        timestamp = int(datetime.now().timestamp() * 1000)
        storage_path = f"uploads/{timestamp}-{file.filename}"

        if supabase:
            try:
                supabase.storage.from_('ETP_DATA').upload(
                    path=storage_path,
                    file=contents,
                    file_options={"content-type": "text/csv", "upsert": "false"}
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload to Supabase Storage: {str(e)}"
                )

        csv_upload = CSVUpload(
            file_name=file.filename,
            file_path=storage_path,
            file_size=file_size,
            user_id=current_user.user_id,
        )
        db.add(csv_upload)
        db.flush()

        scored_batches = []
        new_alerts = []

        for _, row in df.iterrows():
            row_batch_id = row.get("batch_id")
            if row_batch_id is None or (isinstance(row_batch_id, float) and pd.isna(row_batch_id)):
                row_batch_id = row.get("shift_batch_id")

            production_volume_kg = _safe_float(row.get("production_volume_kg"))

            chemical_usage_kg = _safe_float(row.get("chemical_usage_kg"))
            chemical_usage_liters = _safe_float(row.get("chemical_usage_liters"))
            if chemical_usage_kg is None and chemical_usage_liters is not None:
                chemical_usage_kg = chemical_usage_liters

            etp_runtime_min = _safe_float(row.get("etp_runtime_min"))
            etp_status = _safe_float(row.get("etp_status"))
            if etp_runtime_min is None and etp_status is not None:
                etp_runtime_min = 480.0 if etp_status >= 0.5 else 0.0

            electricity_kwh = _safe_float(row.get("electricity_kwh"))
            electricity_usage_kwh = _safe_float(row.get("electricity_usage_kwh"))
            if electricity_kwh is None:
                electricity_kwh = electricity_usage_kwh

            chemical_invoice_bdt = _safe_float(row.get("chemical_invoice_bdt"))
            source_fine_bdt = _safe_float(row.get("source_fine_bdt"))
            if chemical_invoice_bdt is None:
                chemical_invoice_bdt = source_fine_bdt

            batch_data = {
                "batch_id": str(row_batch_id) if row_batch_id is not None else f"B-{uuid.uuid4().hex[:6]}",
                "shift_batch_id": str(row_batch_id) if row_batch_id is not None else "",
                "shift_date": str(row.get("shift_date", "")),
                "shift_name": str(row.get("shift_name", "")) if pd.notna(row.get("shift_name")) else "",
                "production_volume_kg": production_volume_kg,
                "chemical_usage_kg": chemical_usage_kg,
                "etp_runtime_min": etp_runtime_min,
                "electricity_kwh": electricity_kwh,
                "chemical_invoice_bdt": chemical_invoice_bdt,
                "etp_cost_bdt": _safe_float(row.get("etp_cost_bdt")),
                "chemical_usage_liters": chemical_usage_liters if chemical_usage_liters is not None else chemical_usage_kg,
                "etp_status": etp_status if etp_status is not None else (1.0 if etp_runtime_min and etp_runtime_min > 0 else 0.0 if etp_runtime_min is not None else None),
                "electricity_usage_kwh": electricity_usage_kwh if electricity_usage_kwh is not None else electricity_kwh,
                "source_fine_bdt": source_fine_bdt if source_fine_bdt is not None else chemical_invoice_bdt,
                "etp_capacity_liters": _safe_float(row.get("etp_capacity_liters")),
                "ph": _safe_float(row.get("ph")),
                "bod_mg_per_l": _safe_float(row.get("bod_mg_per_l")),
                "cod_mg_per_l": _safe_float(row.get("cod_mg_per_l")),
                "notes": str(row.get("notes", "")) if pd.notna(row.get("notes")) else "",
            }

            prediction = predict_batch(batch_data)

            batch_record = BatchRecord(
                upload_id=csv_upload.id,
                user_id=current_user.user_id,
                batch_id=batch_data["batch_id"],
                shift_date=_safe_date(batch_data["shift_date"]),
                shift_name=batch_data["shift_name"],
                production_volume_kg=batch_data["production_volume_kg"],
                chemical_usage_kg=batch_data["chemical_usage_kg"],
                etp_runtime_min=batch_data["etp_runtime_min"],
                electricity_kwh=batch_data["electricity_kwh"],
                chemical_invoice_bdt=batch_data["chemical_invoice_bdt"],
                etp_cost_bdt=batch_data["etp_cost_bdt"],
                notes=batch_data["notes"],
                risk_score=prediction["risk_score"],
                bypass_prediction=prediction["bypass_prediction"],
                estimated_loss_bdt=prediction["estimated_loss_bdt"],
                flags=prediction["flags"],
            )
            db.add(batch_record)
            db.flush()

            scored_batches.append({
                "id": str(batch_record.id),
                "batch_id": batch_data["batch_id"],
                "shift_date": batch_data["shift_date"],
                "shift_name": batch_data["shift_name"],
                "production_volume_kg": batch_data["production_volume_kg"],
                "chemical_usage_kg": batch_data["chemical_usage_kg"],
                "etp_runtime_min": batch_data["etp_runtime_min"],
                "electricity_kwh": batch_data["electricity_kwh"],
                "chemical_invoice_bdt": batch_data["chemical_invoice_bdt"],
                "etp_cost_bdt": batch_data["etp_cost_bdt"],
                "notes": batch_data["notes"],
                "risk_score": prediction["risk_score"],
                "bypass_prediction": prediction["bypass_prediction"],
                "estimated_loss_bdt": prediction["estimated_loss_bdt"],
                "flags": prediction["flags"],
            })

            has_severe = any(f.get("severity") == "high" for f in prediction["flags"])
            if prediction["risk_score"] >= 75 or has_severe:
                recommendation = generate_recommendation(prediction["flags"], prediction["risk_score"])
                alert = Alert(
                    user_id=current_user.user_id,
                    batch_record_id=batch_record.id,
                    batch_id=batch_data["batch_id"],
                    risk_score=prediction["risk_score"],
                    bypass_prediction=prediction["bypass_prediction"],
                    estimated_loss_bdt=prediction["estimated_loss_bdt"],
                    etp_cost_bdt=batch_data["etp_cost_bdt"] or 15000,
                    recommendation=recommendation,
                    flags=prediction["flags"],
                )
                db.add(alert)
                new_alerts.append({
                    "batch_id": batch_data["batch_id"],
                    "risk_score": prediction["risk_score"],
                    "estimated_loss_bdt": prediction["estimated_loss_bdt"],
                    "recommendation": recommendation,
                })

        db.commit()

        return {
            "upload": {
                "id": str(csv_upload.id),
                "file_name": csv_upload.file_name,
                "file_size": csv_upload.file_size,
                "uploaded_at": csv_upload.uploaded_at.isoformat() if csv_upload.uploaded_at else None,
            },
            "batches": scored_batches,
            "alerts": new_alerts,
            "summary": {
                "total_batches": len(scored_batches),
                "high_risk_count": sum(1 for b in scored_batches if b["risk_score"] >= 75),
                "alerts_generated": len(new_alerts),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during upload: {str(e)}"
        )
    finally:
        await file.close()


@router.get("/uploads", response_model=CSVUploadListResponse)
async def get_all_uploads(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(CSVUpload).filter(CSVUpload.user_id == current_user.user_id)
    uploads = query.offset(skip).limit(limit).all()
    total = query.count()
    return CSVUploadListResponse(uploads=uploads, total=total)


@router.get("/uploads/{upload_id}", response_model=CSVUploadResponse)
async def get_upload_by_id(
    upload_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = db.query(CSVUpload).filter(
        CSVUpload.id == uuid.UUID(upload_id),
        CSVUpload.user_id == current_user.user_id,
    ).first()
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSV upload not found"
        )
    return upload


@router.delete("/uploads/{upload_id}")
async def delete_upload(
    upload_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = db.query(CSVUpload).filter(
        CSVUpload.id == uuid.UUID(upload_id),
        CSVUpload.user_id == current_user.user_id,
    ).first()
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSV upload not found"
        )
    if supabase:
        try:
            supabase.storage.from_('ETP_DATA').remove([upload.file_path])
        except Exception:
            pass
    db.delete(upload)
    db.commit()
    return {"message": "Upload deleted successfully"}
#     """
#     Get download URL for a CSV file
#     """
#     upload = db.query(CSVUpload).filter(CSVUpload.id == upload_id).first()
    
#     if not upload:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="CSV upload not found"
#         )
    
#     if supabase:
#         download_url = supabase.storage.from_('csv-uploads').get_public_url(upload.file_path)
#         return {"download_url": download_url}
#     else:
#         raise HTTPException(
#             status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#             detail="Supabase Storage not configured"
#         )
