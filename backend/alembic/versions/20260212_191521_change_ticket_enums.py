"""change ticket enums to strings

Revision ID: 20260212_191521
Revises: 20260212_184522
Create Date: 2026-02-12 19:15:21

"""
from alembic import op
import sqlalchemy as sa

revision = '20260212_191521'
down_revision = '20260212_184522'
branch_labels = None
depends_on = None

def upgrade():
    # Drop the table and recreate with string columns
    op.drop_table('support_tickets')
    
    op.create_table(
        'support_tickets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=True, server_default='medium'),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='open'),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_support_tickets_id'), 'support_tickets', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_support_tickets_id'), table_name='support_tickets')
    op.drop_table('support_tickets')
