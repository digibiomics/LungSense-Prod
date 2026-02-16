from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.sessions.db import create_local_session
from app.models.support_ticket import SupportTicket
from app.schemas.support_ticket import SupportTicketCreate, SupportTicketResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/support", tags=["support"])

@router.post("/tickets", response_model=APIResponse)
async def create_ticket(ticket: SupportTicketCreate, db: Session = Depends(create_local_session)):
    """Create a new support ticket"""
    try:
        db_ticket = SupportTicket(
            title=ticket.title,
            description=ticket.description,
            category=ticket.category,
            email=ticket.email,
            priority=ticket.priority
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        return APIResponse(
            status="success",
            message="Support ticket created successfully",
            data=SupportTicketResponse.from_orm(db_ticket).dict(),
            id=str(db_ticket.id)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tickets", response_model=APIResponse)
async def get_all_tickets(db: Session = Depends(create_local_session)):
    """Get all support tickets (admin only)"""
    tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    return APIResponse(
        status="success",
        message="Tickets retrieved successfully",
        data=[SupportTicketResponse.from_orm(t).dict() for t in tickets]
    )

@router.get("/tickets/{ticket_id}", response_model=APIResponse)
async def get_ticket(ticket_id: int, db: Session = Depends(create_local_session)):
    """Get a specific ticket by ID"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return APIResponse(
        status="success",
        message="Ticket retrieved successfully",
        data=SupportTicketResponse.from_orm(ticket).dict(),
        id=str(ticket.id)
    )
