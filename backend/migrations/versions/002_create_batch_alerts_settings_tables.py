"""Create batch_records, alerts, and user_settings tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-19 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'batch_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('upload_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('batch_id', sa.String(length=100), nullable=False),
        sa.Column('shift_date', sa.Date(), nullable=True),
        sa.Column('shift_name', sa.String(length=255), nullable=True),
        sa.Column('production_volume_kg', sa.Float(), nullable=True),
        sa.Column('chemical_usage_kg', sa.Float(), nullable=True),
        sa.Column('etp_runtime_min', sa.Float(), nullable=True),
        sa.Column('electricity_kwh', sa.Float(), nullable=True),
        sa.Column('chemical_invoice_bdt', sa.Float(), nullable=True),
        sa.Column('etp_cost_bdt', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('bypass_prediction', sa.Boolean(), nullable=True),
        sa.Column('estimated_loss_bdt', sa.Float(), nullable=True),
        sa.Column('flags', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['upload_id'], ['csv_uploads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('batch_record_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('batch_id', sa.String(length=100), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('bypass_prediction', sa.Boolean(), nullable=True),
        sa.Column('estimated_loss_bdt', sa.Float(), nullable=True),
        sa.Column('etp_cost_bdt', sa.Float(), nullable=True),
        sa.Column('recommendation', sa.Text(), nullable=True),
        sa.Column('flags', postgresql.JSONB(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['batch_record_id'], ['batch_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'user_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email_alerts', sa.Boolean(), server_default=sa.text('true'), nullable=True),
        sa.Column('weekly_reports', sa.Boolean(), server_default=sa.text('true'), nullable=True),
        sa.Column('risk_threshold_alerts', sa.Boolean(), server_default=sa.text('true'), nullable=True),
        sa.Column('data_retention_days', sa.Integer(), server_default=sa.text('90'), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), server_default=sa.text('false'), nullable=True),
        sa.Column('session_timeout_min', sa.Integer(), server_default=sa.text('30'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )


def downgrade() -> None:
    op.drop_table('user_settings')
    op.drop_table('alerts')
    op.drop_table('batch_records')
