from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Float, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from src.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    csv_uploads = relationship("CSVUpload", back_populates="user")
    batch_records = relationship("BatchRecord", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)


class CSVUpload(Base):
    __tablename__ = "csv_uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)
    file_path = Column(Text, nullable=False)
    file_name = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="csv_uploads")
    batch_records = relationship("BatchRecord", back_populates="upload")


class BatchRecord(Base):
    __tablename__ = "batch_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("csv_uploads.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)
    batch_id = Column(String(100), nullable=False)
    shift_date = Column(Date, nullable=True)
    shift_name = Column(String(255), nullable=True)
    production_volume_kg = Column(Float, nullable=True)
    chemical_usage_kg = Column(Float, nullable=True)
    etp_runtime_min = Column(Float, nullable=True)
    electricity_kwh = Column(Float, nullable=True)
    chemical_invoice_bdt = Column(Float, nullable=True)
    etp_cost_bdt = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)
    bypass_prediction = Column(Boolean, nullable=True)
    estimated_loss_bdt = Column(Float, nullable=True)
    flags = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    upload = relationship("CSVUpload", back_populates="batch_records")
    user = relationship("User", back_populates="batch_records")
    alerts = relationship("Alert", back_populates="batch_record")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    batch_record_id = Column(UUID(as_uuid=True), ForeignKey("batch_records.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    bypass_prediction = Column(Boolean, nullable=True)
    estimated_loss_bdt = Column(Float, nullable=True)
    etp_cost_bdt = Column(Float, nullable=True)
    recommendation = Column(Text, nullable=True)
    flags = Column(JSONB, nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")
    batch_record = relationship("BatchRecord", back_populates="alerts")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    email_alerts = Column(Boolean, default=True)
    weekly_reports = Column(Boolean, default=True)
    risk_threshold_alerts = Column(Boolean, default=True)
    data_retention_days = Column(Integer, default=90)
    two_factor_enabled = Column(Boolean, default=False)
    session_timeout_min = Column(Integer, default=30)

    user = relationship("User", back_populates="settings")
