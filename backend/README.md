# EcoWeave Backend

This backend powers authentication, CSV ingestion, batch scoring, alert generation, reporting, and user settings for EcoWeave. It is implemented with FastAPI, SQLAlchemy, PostgreSQL, Supabase Storage, and an optional ML model with a rule-based fallback.

## What This Service Does

The backend is responsible for:

- authenticating users with custom JWT tokens
- receiving CSV files from the frontend
- storing upload metadata and optionally the raw CSV in Supabase Storage
- parsing each CSV row into a normalized batch record
- scoring each batch with either the trained model or the fallback rules engine
- generating alerts for risky or suspicious batches
- exposing batch, alert, report, ML status, and settings APIs

## Tech Stack

- FastAPI for HTTP APIs
- SQLAlchemy ORM for persistence
- PostgreSQL for relational storage
- Supabase Storage for uploaded CSV files
- Pandas for CSV parsing and export shaping
- joblib, scikit-learn, and xgboost for ML model loading and inference
- bcrypt and python-jose for password hashing and JWT authentication
- fpdf2 and openpyxl for report generation

## High-Level Architecture

```text
frontend
  -> FastAPI routers
    -> auth/security layer
    -> service logic inside route modules
    -> SQLAlchemy models + PostgreSQL
    -> Supabase Storage for raw CSV files
    -> ML predictor or fallback rules engine
```

## Application Entry Point

The backend starts from [main.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/main.py).

On startup it:

1. creates database tables from SQLAlchemy metadata
2. loads the first available compatible ML model from this priority list:

- `backend/models/risk_score_xgboost_pipeline.pkl`
- `backend/models/ecoweave_model.pkl`
- `risk_score_xgboost_pipeline.pkl` (workspace root)

3. registers all routers
4. enables CORS for the frontend

Registered routers:

- `/api/auth`
- `/api/csv-upload`
- `/api/batches`
- `/api/ml`
- `/api/alerts`
- `/api/reports`
- `/api/settings`

## Directory Overview

```text
backend/
  main.py                     FastAPI entrypoint
  requirements.txt           Python dependencies
  alembic.ini                Alembic config
  migrations/                Database migrations
  src/
    database.py              SQLAlchemy engine, session, base
    models.py                ORM entities
    supabase_client.py       Supabase client bootstrap
    auth/                    signup, login, JWT, current-user dependency
    csv_upload/              CSV upload endpoints and schemas
    batch/                   batch list, detail, stats APIs
    ml/                      model loading, scoring, fallback rules, ML APIs
    alerts/                  alert list, stats, state transitions
    reports/                 CSV, Excel, PDF export APIs
    settings/                user preference APIs
```

## Runtime Dependencies and Environment

The backend reads configuration from `.env`.

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key used for storage access
- `JWT_SECRET_KEY`: signing secret for access tokens
- `ACCESS_TOKEN_EXPIRE_MINUTES`: token lifetime in minutes

Notes:

- If `SUPABASE_KEY` is missing, the app still runs but file upload to storage is skipped because the Supabase client is not initialized.
- If no compatible model file is found or model loading fails, scoring automatically falls back to the rule-based engine.

## Persistence Model

The main entities live in [src/models.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/models.py).

### `User`

Stores identity and login data.

- `user_id`
- `full_name`
- `organization`
- `email`
- `password`
- timestamps

### `CSVUpload`

Represents one uploaded source file.

- `id`
- `user_id`
- `file_path`
- `file_name`
- `file_size`
- `uploaded_at`

### `BatchRecord`

Represents one parsed row from a CSV file plus computed risk outputs.

- source fields such as `batch_id`, `shift_date`, `production_volume_kg`, `chemical_usage_kg`, `etp_runtime_min`, `electricity_kwh`, `chemical_invoice_bdt`, `etp_cost_bdt`, `notes`
- computed fields: `risk_score`, `bypass_prediction`, `estimated_loss_bdt`, `flags`
- relational fields: `upload_id`, `user_id`

### `Alert`

Created when a batch is risky enough to require action.

- `batch_record_id`
- `batch_id`
- `risk_score`
- `bypass_prediction`
- `estimated_loss_bdt`
- `etp_cost_bdt`
- `recommendation`
- `flags`
- workflow fields: `status`, `resolved_at`

### `UserSettings`

Per-user app preferences.

- `email_alerts`
- `weekly_reports`
- `risk_threshold_alerts`
- `data_retention_days`
- `two_factor_enabled`
- `session_timeout_min`

## Authentication Flow

Authentication is implemented in [src/auth/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/auth/route.py) and [src/auth/security.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/auth/security.py).

### Signup

1. frontend sends `full_name`, `email`, `password`, `organization`
2. backend checks if the email already exists
3. password is hashed with bcrypt
4. user row is created in PostgreSQL
5. a JWT access token is generated with `sub = user_id`
6. response returns both token and user profile

### Login

1. frontend sends `email` and `password`
2. backend fetches the user by email
3. password hash is verified with bcrypt
4. a signed JWT is returned

### Auth-protected requests

Most feature routes depend on `get_current_user`.

That dependency:

1. reads the `Authorization: Bearer <token>` header
2. decodes the JWT using `JWT_SECRET_KEY`
3. reads `sub` from the token payload
4. loads the user from the database
5. rejects the request if the token is invalid, expired, or the user no longer exists

Public endpoints:

- `GET /`
- `GET /api/ml/status`

## Feature Modules

### 1. CSV Upload Module

Implemented in [src/csv_upload/route/csv_upload.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/csv_upload/route/csv_upload.py).

Responsibilities:

- accept CSV uploads
- validate file extension
- parse CSV content with Pandas
- store the original file in Supabase Storage bucket `ETP_DATA`
- create a `CSVUpload` record
- convert each row into a `BatchRecord`
- score every batch
- create alerts for risky rows
- return a structured summary to the frontend

Supported upload management endpoints:

- `POST /api/csv-upload/upload`
- `GET /api/csv-upload/uploads`
- `GET /api/csv-upload/uploads/{upload_id}`
- `DELETE /api/csv-upload/uploads/{upload_id}`

### 2. Batch Module

Implemented in [src/batch/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/batch/route.py).

Responsibilities:

- list scored batch records
- filter by risk range, date range, and upload id
- return a single batch by business id
- compute dashboard summary metrics

Key endpoints:

- `GET /api/batches`
- `GET /api/batches/{batch_id}`
- `GET /api/batches/stats`

### 3. ML Module

Implemented in [src/ml/predictor.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/ml/predictor.py) and [src/ml/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/ml/route.py).

Responsibilities:

- load the optional `.pkl` model on startup
- expose current model status
- score batches via model or fallback rules
- generate plain-language recommendations from flags

Key endpoints:

- `GET /api/ml/status`
- `POST /api/ml/score`

Current `GET /api/ml/status` response includes:

- `model_loaded`
- `model_version`
- `model_path`
- `expected_features`
- `fallback_active`

### 4. Alerts Module

Implemented in [src/alerts/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/alerts/route.py).

Responsibilities:

- list alerts
- compute alert dashboard counters
- transition alert status through `pending`, `acknowledged`, and `resolved`
- clear resolved alerts

Key endpoints:

- `GET /api/alerts`
- `GET /api/alerts/stats`
- `PATCH /api/alerts/{alert_id}`
- `DELETE /api/alerts`

### 5. Reports Module

Implemented in [src/reports/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/reports/route.py).

Responsibilities:

- query batch records for a period
- stream generated reports in CSV, Excel, or PDF format
- include summary metrics and detailed rows in exports

Key endpoint:

- `POST /api/reports/generate`

### 6. Settings Module

Implemented in [src/settings/route.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/settings/route.py).

Responsibilities:

- lazily create default settings for a user if none exist yet
- return user preferences
- persist settings updates

Key endpoints:

- `GET /api/settings`
- `PUT /api/settings`

## End-to-End Feature Flows

### CSV Upload Flow

This is the most important feature flow in the system because it starts in the frontend upload screen and ends with persisted batches, generated alerts, refreshed dashboards, and downloadable reports.

#### Where the user uploads the file

The user uploads a CSV from the frontend Data Upload page.

Relevant frontend files:

- [frontend/src/components/app/data-upload/DataUploadClient.tsx](e:/Hackathons/EcoWeave_Frontend/EcoWeave/frontend/src/components/app/data-upload/DataUploadClient.tsx)
- [frontend/src/components/app/dashboard/UploadCsvCard.tsx](e:/Hackathons/EcoWeave_Frontend/EcoWeave/frontend/src/components/app/dashboard/UploadCsvCard.tsx)
- [frontend/src/lib/api.ts](e:/Hackathons/EcoWeave_Frontend/EcoWeave/frontend/src/lib/api.ts)

From the user perspective, the upload flow is:

1. user opens the Data Upload page
2. user either drags a `.csv` file into the upload area or clicks `Choose File`
3. `UploadCsvCard` validates that the selected file ends with `.csv`
4. the selected file is passed to `DataUploadClient.handleFileUpload(file)`
5. the frontend checks whether the backend is reachable
6. if the backend is online, the file is uploaded to the API
7. if the backend is offline, the frontend falls back to local parsing and scoring

The same screen also lets the user:

- download a CSV template from `/templates/ecoweave_template.csv`
- load local sample data without calling the backend

#### Frontend-to-backend request path

When the backend is available, the frontend builds a `FormData` object and sends:

`POST /api/csv-upload/upload`

with:

- the CSV file in the `file` field
- the JWT bearer token in the `Authorization` header

This happens through `uploadCsv(file)` in the frontend API layer.

#### Visual flow with data structures

```text
User picks CSV
       |
       v
Frontend POST /api/csv-upload/upload (multipart)
       |
       v
Backend saves file to Supabase Storage
       |
       v
Backend parses CSV with Pandas
       |
       v
For each row -> create BatchRecord input -> predict_batch()
       |                                     |
       |                           +---------+---------+
       |                           |                   |
       |                      .pkl exists          No .pkl
       |                           |                   |
       |                    ML model.predict()   Rule-based scoring
       |                           |                   |
       |                           +---------+---------+
       |                                     |
       |                           risk_score, flags,
       |                           bypass_prediction,
       |                           estimated_loss_bdt
       |
       v
If risk_score >= 75 or any high-severity flag -> create Alert record
       |
       v
Return JSON { upload, batches[], alerts[], summary }
       |
       v
Frontend shows preview and summary
       |
       v
Dashboard / Batches / Alerts / Reports reflect new data
```

Example frontend request shape:

```text
POST /api/csv-upload/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt>

form-data:
   file: ecoweave_shift_data.csv
```

Example CSV row as it exists in the file:

```json
{
  "batch_id": "B-24015",
  "shift_date": "2026-03-15",
  "shift_name": "Night",
  "production_volume_kg": 920,
  "chemical_usage_kg": 88,
  "etp_runtime_min": 12,
  "electricity_kwh": 95,
  "chemical_invoice_bdt": 42000,
  "etp_cost_bdt": 15000,
  "notes": "High load batch"
}
```

Example normalized `batch_data` built by the backend for one row:

```json
{
  "batch_id": "B-24015",
  "shift_date": "2026-03-15",
  "shift_name": "Night",
  "production_volume_kg": 920.0,
  "chemical_usage_kg": 88.0,
  "etp_runtime_min": 12.0,
  "electricity_kwh": 95.0,
  "chemical_invoice_bdt": 42000.0,
  "etp_cost_bdt": 15000.0,
  "notes": "High load batch"
}
```

Example prediction output returned by `predict_batch(batch_data)`:

```json
{
  "risk_score": 92,
  "bypass_prediction": true,
  "estimated_loss_bdt": 780000,
  "flags": [
    {
      "batch_id": "B-24015",
      "type": "probable_bypass",
      "message": "High production volume with zero or near-zero ETP runtime",
      "severity": "high"
    },
    {
      "batch_id": "B-24015",
      "type": "power_anomaly",
      "message": "Electricity consumption unusually low for production volume",
      "severity": "high"
    }
  ]
}
```

Example `BatchRecord`-style data persisted and returned to the frontend:

```json
{
  "id": "0a8b8c6f-9ca8-4c88-b8f8-7db71c62c931",
  "batch_id": "B-24015",
  "shift_date": "2026-03-15",
  "shift_name": "Night",
  "production_volume_kg": 920.0,
  "chemical_usage_kg": 88.0,
  "etp_runtime_min": 12.0,
  "electricity_kwh": 95.0,
  "chemical_invoice_bdt": 42000.0,
  "etp_cost_bdt": 15000.0,
  "notes": "High load batch",
  "risk_score": 92,
  "bypass_prediction": true,
  "estimated_loss_bdt": 780000,
  "flags": [
    {
      "batch_id": "B-24015",
      "type": "probable_bypass",
      "message": "High production volume with zero or near-zero ETP runtime",
      "severity": "high"
    }
  ]
}
```

Example upload response shape:

```json
{
  "upload": {
    "id": "2c8eaef8-f3ed-4e7d-a5f8-95e1d5a501d9",
    "file_name": "ecoweave_shift_data.csv",
    "file_size": 4812,
    "uploaded_at": "2026-03-15T09:24:51.000000+00:00"
  },
  "batches": [
    {
      "id": "0a8b8c6f-9ca8-4c88-b8f8-7db71c62c931",
      "batch_id": "B-24015",
      "shift_date": "2026-03-15",
      "shift_name": "Night",
      "production_volume_kg": 920.0,
      "chemical_usage_kg": 88.0,
      "etp_runtime_min": 12.0,
      "electricity_kwh": 95.0,
      "chemical_invoice_bdt": 42000.0,
      "etp_cost_bdt": 15000.0,
      "notes": "High load batch",
      "risk_score": 92,
      "bypass_prediction": true,
      "estimated_loss_bdt": 780000,
      "flags": []
    }
  ],
  "alerts": [
    {
      "batch_id": "B-24015",
      "risk_score": 92,
      "estimated_loss_bdt": 780000,
      "recommendation": "Critical: Run ETP during this batch and verify operation log. Evidence suggests treatment bypass."
    }
  ],
  "summary": {
    "total_batches": 1,
    "high_risk_count": 1,
    "alerts_generated": 1
  }
}
```

#### End-to-end execution flow

##### Phase 1: frontend upload orchestration

1. `DataUploadClient` receives the selected `File` object from `UploadCsvCard`
2. it sets `isUploading = true` and clears prior errors and summaries
3. it calls `checkBackendHealth()`
4. if the backend is healthy, it calls `uploadCsv(file)`
5. if the backend is not healthy, it falls back to local parsing with `parseCsvToBatches`, validation, and client-side scoring

##### Phase 2: authenticated backend ingestion

1. **Authentication runs first**
   The upload route depends on `get_current_user`, so the request is rejected unless the JWT is valid.

2. **File extension is checked**
   The handler rejects anything that does not end with `.csv`.

3. **Entire file is read into memory**
   `await file.read()` loads the uploaded bytes and computes `file_size`.

4. **CSV is parsed with Pandas**
   The bytes are passed into `pd.read_csv(io.BytesIO(contents))`.
   If parsing fails, the API returns `400 Invalid CSV file`.

5. **A storage path is generated**
   The code builds a path such as:

   ```text
   uploads/<timestamp>-<original_filename>
   ```

6. **Raw file is uploaded to Supabase Storage**
   If the Supabase client is configured, the backend uploads the CSV to bucket `ETP_DATA`.

7. **A `CSVUpload` row is created**
   This row stores file metadata and ties the upload to the authenticated user.

##### Phase 3: row normalization and scoring

8. **The backend iterates over CSV rows**
   For each Pandas row, the handler builds a normalized `batch_data` dictionary. The parser accepts both legacy app-style and dataset-style column names, including:
   - `batch_id`

- `shift_batch_id`
- `shift_date`
- `shift_name`
- `production_volume_kg`
- `chemical_usage_kg`
- `chemical_usage_liters`
- `etp_runtime_min`
- `etp_status`
- `electricity_kwh`
- `electricity_usage_kwh`
- `chemical_invoice_bdt`
- `source_fine_bdt`
- `etp_cost_bdt`
- `etp_capacity_liters`
- `ph`
- `bod_mg_per_l`
- `cod_mg_per_l`
- `notes`

Missing or invalid numeric values are converted to `None` through `_safe_float`. Invalid dates are converted to `None` through `_safe_date`. Where needed, aliases are derived (for example `chemical_usage_liters` <-> `chemical_usage_kg`, `etp_status` <-> `etp_runtime_min`) before scoring.

9. **Each row is scored**
   The route calls:

   ```python
   prediction = predict_batch(batch_data)
   ```

`predict_batch` chooses one of two paths:

- ML path: if a compatible model artifact was loaded successfully
- fallback path: if no model artifact was loaded or prediction fails

10. **A `BatchRecord` row is persisted**
    Each input row becomes a normalized database record with both source fields and computed outputs:
    - `risk_score`
    - `bypass_prediction`
    - `estimated_loss_bdt`
    - `flags`

##### Phase 4: alert generation and commit

11. **Alerts are created for risky rows**
    An alert is created if either of these conditions is true:
    - `risk_score >= 75`
    - at least one returned flag has `severity == high`

    The alert stores the batch id, risk score, estimated financial loss, ETP cost, flags, and a generated recommendation.

12. **Transaction is committed**
    After all rows are processed, the upload metadata, batch records, and alerts are committed in the same database transaction.

13. **Structured response is returned**
    The API responds with:
    - upload metadata
    - scored batch list in `batches`
    - generated alerts in `alerts`
    - a `summary` object containing upload-level counters

##### Phase 5: frontend response handling

14. **Frontend maps the API response into dashboard-friendly objects**
    `DataUploadClient` converts returned rows into `ScoredBatch` objects and flattens all flags into one validation list.

15. **The upload screen updates immediately**
    The page shows:
    - a success summary
    - a data preview table
    - validation flag counts
    - a button to navigate to the dashboard

16. **The rest of the app reads the newly persisted data**
    After a successful backend upload:
    - dashboard pages fetch `GET /api/batches`, `GET /api/batches/stats`, and `GET /api/alerts`
    - the batches page reads persisted `BatchRecord` rows
    - the alerts page reads persisted `Alert` rows
    - the reports page exports from persisted `BatchRecord` rows

#### What the user actually sees during upload

From the user perspective, a successful upload looks like this:

1. the user chooses or drops a CSV file
2. the upload button switches into an uploading state
3. the file is sent to the backend if the backend is reachable
4. the page returns a processed summary and a preview table
5. the user can click `View Dashboard` to see updated charts and metrics based on the uploaded records

If the backend is offline:

1. the same file can still be parsed in the browser
2. validation and scoring happen locally
3. temporary data is written to `localStorage`
4. the dashboard can still render from local fallback data, but no backend persistence, alerts table rows, or server-generated reports are created

#### CSV upload sequence diagram

```text
user
  -> Data Upload page
  -> choose file or drag and drop CSV
  -> UploadCsvCard validates extension
  -> DataUploadClient.handleFileUpload(file)
  -> checkBackendHealth()

if backend online:
  -> uploadCsv(file)
  -> POST /api/csv-upload/upload
  -> auth validation
  -> read file bytes
  -> parse CSV with Pandas
  -> upload raw file to Supabase Storage
  -> create CSVUpload row
  -> for each row:
       -> normalize values
       -> predict_batch(...)
       -> create BatchRecord
       -> maybe create Alert
  -> commit transaction
  -> return upload + batches + alerts + summary
  -> frontend maps response and shows preview
  -> dashboard, batches, alerts, reports read persisted data

if backend offline:
  -> read file text in browser
  -> parseCsvToBatches(...)
  -> validateBatches(...)
  -> scoreBatches(...)
  -> write fallback data to localStorage
  -> frontend shows preview from local data
```

#### Why this flow matters

This single flow feeds the rest of the platform:

- the dashboard reads `BatchRecord` and `Alert`
- the batches page reads `BatchRecord`
- the alerts page reads `Alert`
- reports are generated from `BatchRecord`
- the frontend charts become meaningful only after this pipeline runs successfully
- the upload screen is the bridge between raw factory CSV data and every downstream compliance feature

## Scoring Logic

The scoring engine lives in [src/ml/predictor.py](e:/Hackathons/EcoWeave_Frontend/EcoWeave/backend/src/ml/predictor.py).

### Model loading

At startup, `load_model()` checks the candidate paths in order:

1. `backend/models/risk_score_xgboost_pipeline.pkl`
2. `backend/models/ecoweave_model.pkl`
3. `risk_score_xgboost_pipeline.pkl` (workspace root)

When a model is loaded, the backend extracts expected input features from pipeline metadata (`feature_names_in_` or preprocessor metadata) and exposes them in `GET /api/ml/status`.

### Rule-based scoring

The fallback engine creates:

- a `risk_score` from 0 to 100
- a boolean `bypass_prediction`
- `estimated_loss_bdt`
- a `flags` array used by both the dashboard and the alerts module

Signals considered by the fallback engine include:

- missing mandatory fields
- invalid production volume
- zero ETP runtime during large production
- unusually low power consumption relative to production
- high chemical usage with insufficient treatment time
- invoice mismatch against expected chemical cost
- triangulation mismatch across multiple suspicious signals
- night shift risk

### ML-based scoring

If a model is available, `_ml_based_score()` builds a pandas DataFrame aligned to the model's expected feature names (instead of relying on fixed positional arrays). The mapper supports both legacy and dataset-style payload keys and can derive compatible aliases when needed.

The model returns a risk score and optionally a probability. The backend still reuses fallback-generated flags so the UI continues to receive human-readable anomaly explanations.

## Alerting Flow

Alerts are generated inside the CSV upload transaction, not in a separate job.

That means:

1. a batch is scored immediately after parsing
2. if the batch is risky enough, an `Alert` row is created immediately
3. the alerts page can display the new alert as soon as the upload request completes

Recommendations are generated by `generate_recommendation(flags, risk_score)` and prioritize the most severe anomaly type first.

## Reporting Flow

The reporting endpoint works from already-persisted `BatchRecord` rows.

`POST /api/reports/generate`:

1. filters batches by optional date range
2. converts the result set into a Pandas DataFrame
3. serializes the data into CSV, Excel, or PDF
4. streams the file back to the caller

This means reports are generated from normalized stored data, not directly from the raw CSV.

## Settings Flow

The settings module is intentionally simple.

On first read:

1. backend checks for a `UserSettings` row
2. if missing, it creates one with defaults
3. it returns the settings object

On update:

1. backend loads the same row
2. applies only fields included in the request body
3. commits changes and returns the new state

## Database Migrations

Alembic migration files exist in `backend/migrations/versions`.

Current migration set:

- `001_create_users_and_csv_uploads_tables.py`
- `002_create_batch_alerts_settings_tables.py`

The app also calls `Base.metadata.create_all(bind=engine)` at startup. For development that is convenient, but for controlled production schema management you should rely on Alembic as the source of truth.

## Local Development

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the API

```bash
uvicorn main:app --reload
```

### Default local URL

```text
http://localhost:8000
```

### Quick sanity checks

- `GET /` should return the backend status message
- `GET /api/ml/status` should tell you whether the model loaded or fallback is active
- signing up through `/api/auth/signup` should return a token
- uploading a CSV through `/api/csv-upload/upload` should produce `BatchRecord` rows and optionally `Alert` rows

## Failure Modes and Operational Notes

- If the CSV cannot be parsed, the API returns `400` before any database commit.
- If unexpected processing fails after the upload starts, the transaction is rolled back.
- If the ML model fails during prediction, the backend falls back to the rules engine.
- If the Supabase client is missing, file storage is skipped, but the rest of the ingestion flow can still work if the route reaches the database logic successfully.
- The upload endpoint currently reads the entire file into memory before parsing, so large files should be treated carefully.

## Backend Responsibility Boundary

The backend owns:

- identity and authorization
- durable storage
- normalization of raw CSV input
- scoring and risk explanation
- alert generation
- export generation
- user preferences

The frontend owns:

- file selection and upload UX
- dashboard visualization
- alert management UI
- settings forms
- local fallback rendering behavior if the backend is unavailable
