from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.auth.security import get_current_user
from src.models import User
from src.ml import predictor

router = APIRouter(prefix="/api/ml", tags=["ML Scoring"])


@router.get("/status")
async def ml_status():
    return {
        "model_loaded": predictor.model_loaded,
        "model_version": predictor.model_version,
        "model_path": predictor.model_path_loaded,
        "expected_features": predictor.expected_feature_columns,
        "fallback_active": not predictor.model_loaded,
    }


@router.post("/score")
async def score_batches(
    batches: List[dict],
    current_user: User = Depends(get_current_user),
):
    results = []
    for batch in batches:
        result = predictor.predict_batch(batch)
        result["batch_id"] = batch.get("batch_id", "")
        result["recommendation"] = predictor.generate_recommendation(
            result["flags"], result["risk_score"]
        )
        results.append(result)
    return {"results": results}
