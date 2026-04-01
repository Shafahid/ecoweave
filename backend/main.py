from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.csv_upload.route.csv_upload import router as csv_upload_router
from src.auth.route import router as auth_router
from src.batch.route import router as batch_router
from src.ml.route import router as ml_router
from src.alerts.route import router as alerts_router
from src.reports.route import router as reports_router
from src.settings.route import router as settings_router
from src.database import engine, Base
from src.ml.predictor import load_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    load_model()
    yield


app = FastAPI(
    title="EcoWeave API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(csv_upload_router)
app.include_router(batch_router)
app.include_router(ml_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(settings_router)

@app.get('/')
async def root():
    return {
        "message": "EcoWeave Backend is working",
        "version": "1.0.0"
    }
