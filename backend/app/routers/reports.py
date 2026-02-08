"""
Reports API endpoints
POST /api/report - Submit citizen reports
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, crud, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["Reports"])


@router.post(
    "/report",
    response_model=schemas.ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Water Issue Report",
    description="Endpoint for citizens to report water leaks, pollution, or drought conditions"
)
async def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new water issue report
    
    - **latitude**: Geographic latitude of the issue
    - **longitude**: Geographic longitude of the issue
    - **description**: Detailed description of the problem
    - **category**: Type of issue (leak, pollution, drought, other)
    - **photo_url**: Optional URL to uploaded photo
    - **reporter_name**: Optional reporter name
    - **reporter_contact**: Optional contact information
    """
    
    db_report = crud.create_report(db, report)
    
    return db_report


@router.get(
    "/reports",
    response_model=List[schemas.ReportResponse],
    summary="Get All Reports",
    description="Retrieve all citizen reports with optional filtering"
)
async def get_reports(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter by status (pending, investigating, resolved, rejected)"),
    category: Optional[str] = Query(None, description="Filter by category (leak, pollution, drought, other)"),
    db: Session = Depends(get_db)
):
    """
    Get all reports with pagination and optional filtering
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **status**: Filter by report status
    - **category**: Filter by report category
    """
    
    reports = crud.get_reports(db, skip=skip, limit=limit, status=status, category=category)
    return reports


@router.get(
    "/report/{report_id}",
    response_model=schemas.ReportResponse,
    summary="Get Single Report",
    description="Retrieve details of a specific report by ID"
)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Get a single report by ID"""
    
    report = crud.get_report(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    return report


@router.patch(
    "/report/{report_id}/status",
    response_model=schemas.ReportResponse,
    summary="Update Report Status",
    description="Update the status of a citizen report (for admin/government use)"
)
async def update_report_status(
    report_id: int,
    new_status: models.ReportStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of a report
    
    - **report_id**: ID of the report to update
    - **new_status**: New status (pending, investigating, resolved, rejected)
    """
    
    updated_report = crud.update_report_status(db, report_id, new_status)
    
    if not updated_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    
    return updated_report


@router.get(
    "/reports/nearby",
    response_model=List[schemas.ReportResponse],
    summary="Get Nearby Reports",
    description="Find reports near a specific location (for mobile app)"
)
async def get_nearby_reports(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude coordinate"),
    radius_km: float = Query(5.0, ge=0.1, le=100, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """
    Get reports near a specific location
    
    Simple distance calculation for demo purposes
    In production, use PostGIS for proper geographic queries
    """
    
    # For now, return all reports (PostGIS integration later)
    # TODO: Implement actual geographic distance filtering with PostGIS
    all_reports = crud.get_reports(db, limit=100)
    
    return all_reports
