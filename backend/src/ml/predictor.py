import logging
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

model = None
model_loaded = False
model_version = "none"
model_path_loaded = None
expected_feature_columns: list[str] = []

BACKEND_ROOT = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = BACKEND_ROOT.parent
MODEL_CANDIDATE_PATHS = [
    BACKEND_ROOT / "models" / "risk_score_xgboost_pipeline.pkl",
    BACKEND_ROOT / "models" / "ecoweave_model.pkl",
    WORKSPACE_ROOT / "risk_score_xgboost_pipeline.pkl",
]

DEFAULT_FEATURE_COLUMNS = [
    "production_volume_kg",
    "chemical_usage_liters",
    "etp_status",
    "electricity_usage_kwh",
    "source_fine_bdt",
    "etp_cost_bdt",
    "etp_capacity_liters",
    "ph",
    "bod_mg_per_l",
    "cod_mg_per_l",
]


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _derive_etp_runtime_min(batch: dict) -> float | None:
    runtime = _safe_float(batch.get("etp_runtime_min"))
    if runtime is not None:
        return runtime

    etp_status = _safe_float(batch.get("etp_status"))
    if etp_status is None:
        return None

    if etp_status <= 0:
        return 0.0

    # For status-based payloads, use one full-shift proxy runtime.
    return 480.0 * min(etp_status, 1.0)


def _derive_etp_status(batch: dict) -> float | None:
    etp_status = _safe_float(batch.get("etp_status"))
    if etp_status is not None:
        return 1.0 if etp_status >= 0.5 else 0.0

    runtime = _safe_float(batch.get("etp_runtime_min"))
    if runtime is None:
        return None
    return 1.0 if runtime > 0 else 0.0


def _extract_expected_features(loaded_model: Any) -> list[str]:
    if hasattr(loaded_model, "feature_names_in_"):
        features = [str(c) for c in list(loaded_model.feature_names_in_)]
        if features:
            return features

    preprocessor = None
    if hasattr(loaded_model, "named_steps"):
        preprocessor = loaded_model.named_steps.get("preprocessor")

    if preprocessor is not None and hasattr(preprocessor, "feature_names_in_"):
        features = [str(c) for c in list(preprocessor.feature_names_in_)]
        if features:
            return features

    return DEFAULT_FEATURE_COLUMNS.copy()


def load_model():
    global model, model_loaded, model_version, model_path_loaded, expected_feature_columns
    try:
        import joblib

        for candidate in MODEL_CANDIDATE_PATHS:
            if not candidate.exists():
                continue

            try:
                model = joblib.load(candidate)
                expected_feature_columns = _extract_expected_features(model)
                model_loaded = True
                model_version = candidate.stem
                model_path_loaded = str(candidate)
                logger.info(
                    "ML model loaded from %s with %d expected features",
                    model_path_loaded,
                    len(expected_feature_columns),
                )
                return
            except Exception as inner_exc:
                logger.error("Failed to load model from %s: %s", candidate, str(inner_exc))

        model = None
        model_loaded = False
        model_version = "none"
        model_path_loaded = None
        expected_feature_columns = []
        logger.warning("No compatible ML model file found, using rule-based fallback")
    except Exception as e:
        model = None
        model_loaded = False
        model_version = "none"
        model_path_loaded = None
        expected_feature_columns = []
        logger.error("Failed to load ML model: %s", str(e))


def _rule_based_score(batch: dict) -> dict:
    score = 10
    flags = []

    production = _safe_float(batch.get("production_volume_kg"))
    chemical = _safe_float(batch.get("chemical_usage_kg"))
    if chemical is None:
        chemical = _safe_float(batch.get("chemical_usage_liters"))

    etp = _derive_etp_runtime_min(batch)

    electricity = _safe_float(batch.get("electricity_kwh"))
    if electricity is None:
        electricity = _safe_float(batch.get("electricity_usage_kwh"))

    invoice = _safe_float(batch.get("chemical_invoice_bdt"))
    if invoice is None:
        invoice = _safe_float(batch.get("source_fine_bdt"))

    shift = batch.get("shift_name", "")

    if production is None:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "missing_field", "message": "Missing production volume", "severity": "high"})
    if chemical is None:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "missing_field", "message": "Missing chemical usage data", "severity": "high"})
    if etp is None:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "missing_field", "message": "Missing ETP runtime data", "severity": "high"})
    if electricity is None:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "missing_field", "message": "Missing electricity consumption data", "severity": "medium"})

    if production is not None and production <= 0:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "invalid_value", "message": "Invalid production volume (must be > 0)", "severity": "high"})

    if etp is not None and production is not None and etp == 0 and production > 700:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "probable_bypass", "message": "High production volume with zero ETP runtime - probable bypass", "severity": "high"})

    if electricity is not None and production is not None and production > 0 and electricity < production * 0.12:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "power_anomaly", "message": "Electricity consumption unusually low for production volume", "severity": "high"})

    if chemical is not None and etp is not None and chemical > 60 and etp < 30:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "treatment_inconsistency", "message": "High chemical usage with insufficient treatment time", "severity": "high"})

    if invoice is not None and chemical is not None and chemical > 0:
        expected_cost_per_kg = 800
        expected_invoice = chemical * expected_cost_per_kg
        deviation = abs(invoice - expected_invoice) / expected_invoice if expected_invoice > 0 else 0
        if deviation > 0.4:
            flags.append({"batch_id": batch.get("batch_id", ""), "type": "invoice_mismatch", "message": f"Chemical invoice doesn't match usage (deviation: {deviation:.0%})", "severity": "medium"})

    has_low_etp = etp is not None and etp < 20
    has_high_production = production is not None and production > 600
    has_low_power = electricity is not None and production is not None and electricity < production * 0.15
    if has_low_etp and has_high_production and has_low_power:
        flags.append({"batch_id": batch.get("batch_id", ""), "type": "triangulation_mismatch", "message": "Multiple indicators suggest treatment bypass or data manipulation", "severity": "high"})

    if production is not None and production > 700:
        score += 20
    if chemical is not None and chemical > 60:
        score += 20
    if etp is not None and (etp == 0 or etp < 20):
        score += 25

    for flag in flags:
        ft = flag["type"]
        if ft in ("probable_bypass", "triangulation_mismatch"):
            score += 25
        elif ft in ("power_anomaly", "treatment_inconsistency"):
            score += 15
        elif ft == "invoice_mismatch":
            score += 10
        elif ft == "missing_field":
            score += 12 if flag["severity"] == "high" else 5

    if shift and "night" in shift.lower():
        score += 10

    score = min(100, score)
    bypass = score >= 75

    base_fine = 200000
    inspection_risk = score * 2500
    shutdown_risk = 150000 if any(f["type"] == "probable_bypass" for f in flags) else 0
    export_risk = 200000 if score >= 80 else 50000
    estimated_loss = round(base_fine + inspection_risk + shutdown_risk + export_risk)

    return {
        "risk_score": score,
        "bypass_prediction": bypass,
        "estimated_loss_bdt": estimated_loss,
        "flags": flags,
    }


def _build_model_input(batch: dict) -> pd.DataFrame:
    features = expected_feature_columns or DEFAULT_FEATURE_COLUMNS

    production = _safe_float(batch.get("production_volume_kg"))
    chemical_usage_liters = _safe_float(batch.get("chemical_usage_liters"))
    if chemical_usage_liters is None:
        chemical_usage_liters = _safe_float(batch.get("chemical_usage_kg"))

    etp_status = _derive_etp_status(batch)

    electricity_usage_kwh = _safe_float(batch.get("electricity_usage_kwh"))
    if electricity_usage_kwh is None:
        electricity_usage_kwh = _safe_float(batch.get("electricity_kwh"))

    source_fine_bdt = _safe_float(batch.get("source_fine_bdt"))
    if source_fine_bdt is None:
        source_fine_bdt = _safe_float(batch.get("chemical_invoice_bdt"))

    canonical_values = {
        "production_volume_kg": production,
        "chemical_usage_liters": chemical_usage_liters,
        "etp_status": etp_status,
        "electricity_usage_kwh": electricity_usage_kwh,
        "source_fine_bdt": source_fine_bdt,
        "etp_cost_bdt": _safe_float(batch.get("etp_cost_bdt")),
        "etp_capacity_liters": _safe_float(batch.get("etp_capacity_liters")),
        "ph": _safe_float(batch.get("ph")),
        "bod_mg_per_l": _safe_float(batch.get("bod_mg_per_l")),
        "cod_mg_per_l": _safe_float(batch.get("cod_mg_per_l")),
        "shift_batch_id": batch.get("shift_batch_id") or batch.get("batch_id"),
    }

    row: dict[str, Any] = {}
    for feature in features:
        if feature in canonical_values:
            row[feature] = canonical_values[feature]
        elif feature in batch:
            row[feature] = batch.get(feature)
        elif feature == "chemical_usage_kg":
            row[feature] = canonical_values["chemical_usage_liters"]
        elif feature == "etp_runtime_min":
            row[feature] = _derive_etp_runtime_min(batch)
        elif feature == "electricity_kwh":
            row[feature] = canonical_values["electricity_usage_kwh"]
        elif feature == "chemical_invoice_bdt":
            row[feature] = canonical_values["source_fine_bdt"]
        else:
            row[feature] = np.nan

    return pd.DataFrame([row])


def _ml_based_score(batch: dict) -> dict:
    try:
        model_input = _build_model_input(batch)
        prediction = model.predict(model_input)
        risk_score = float(np.asarray(prediction).reshape(-1)[0])
        risk_score = max(0, min(100, risk_score))

        bypass_prob = risk_score / 100.0
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(model_input)
            bypass_prob = float(proba[0][1]) if len(proba[0]) > 1 else float(proba[0][0])

        bypass = bypass_prob >= 0.5

        fallback = _rule_based_score(batch)
        flags = fallback["flags"]

        base_fine = 200000
        inspection_risk = risk_score * 2500
        shutdown_risk = 150000 if bypass else 0
        export_risk = 200000 if risk_score >= 80 else 50000
        estimated_loss = round(base_fine + inspection_risk + shutdown_risk + export_risk)

        return {
            "risk_score": risk_score,
            "bypass_prediction": bypass,
            "estimated_loss_bdt": estimated_loss,
            "flags": flags,
        }
    except Exception as e:
        logger.error("ML prediction failed, falling back to rules: %s", str(e))
        return _rule_based_score(batch)


def predict_batch(batch_data: dict) -> dict:
    if model_loaded and model is not None:
        return _ml_based_score(batch_data)
    return _rule_based_score(batch_data)


def generate_recommendation(flags: list, risk_score: float) -> str:
    if any(f["type"] == "probable_bypass" for f in flags):
        return "Critical: Run ETP during this batch and verify operation log. Evidence suggests treatment bypass."
    if any(f["type"] == "triangulation_mismatch" for f in flags):
        return "Run full diagnostic check. Multiple data points indicate potential manipulation."
    if any(f["type"] == "power_anomaly" for f in flags):
        return "Check power meter reading and confirm ETP pump status."
    if any(f["type"] == "treatment_inconsistency" for f in flags):
        return "Split batch or reduce chemical load; re-check treatment runtime."
    if risk_score >= 85:
        return "High-risk batch: Increase monitoring and verify all treatment equipment is operational."
    return "Review batch data and verify compliance measures."
