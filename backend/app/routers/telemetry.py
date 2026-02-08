"""
Telemetry API endpoints
POST /api/telemetry - Receive sensor data
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["Telemetry"])


@router.post(
    "/telemetry",
    response_model=schemas.SuccessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Telemetry Data",
    description="Endpoint for sensors to send real-time monitoring data. Accepts flow rate, pressure, pH, temperature, and turbidity readings."
)
async def create_telemetry(
    telemetry: schemas.TelemetryCreate,
    db: Session = Depends(get_db)
):
    """
    Receive telemetry data from sensor nodes
    
    - **node_id**: ID of the sensor sending the data
    - **flow_rate**: Water flow rate in liters per second
    - **pressure**: Water pressure in PSI
    - **ph_level**: pH level (0-14 scale)
    - **temperature**: Water temperature in Celsius
    - **turbidity**: Water turbidity in NTU
    """
    
    # Verify node exists
    node = crud.get_node(db, telemetry.node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {telemetry.node_id} not found"
        )
    
    # Create telemetry record
    db_telemetry = crud.create_telemetry(db, telemetry)
    
    # Anomaly detection - determine node status based on readings
    new_status = models.NodeStatus.NORMAL
    
    # Check for critical conditions
    if telemetry.pressure and telemetry.pressure < 30:
        new_status = models.NodeStatus.CRITICAL
    elif telemetry.ph_level and (telemetry.ph_level < 6.0 or telemetry.ph_level > 9.0):
        new_status = models.NodeStatus.CRITICAL
    elif telemetry.flow_rate and telemetry.flow_rate < 10:
        new_status = models.NodeStatus.WARNING
    
    # Update node status if it changed
    status_updated = False
    if node.status != new_status:
        crud.update_node_status(db, node.id, new_status)
        status_updated = True
    
    return schemas.SuccessResponse(
        success=True,
        message="Telemetry data recorded successfully",
        data={
            "telemetry_id": db_telemetry.id,
            "node_id": db_telemetry.node_id,
            "timestamp": db_telemetry.timestamp.isoformat(),
            "status_updated": status_updated,
            "new_status": new_status if status_updated else node.status
        }
    )


@router.get(
    "/telemetry/node/{node_id}",
    response_model=List[schemas.TelemetryResponse],
    summary="Get Node Telemetry History",
    description="Retrieve historical telemetry data for a specific sensor node"
)
async def get_node_telemetry(
    node_id: int,
    hours: int = 24,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    """
    Get telemetry history for a specific node
    
    - **node_id**: ID of the sensor node
    - **hours**: Number of hours to look back (default: 24)
    - **limit**: Maximum number of records to return (default: 1000)
    """
    
    # Verify node exists
    node = crud.get_node(db, node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {node_id} not found"
        )
    
    telemetry_data = crud.get_telemetry_by_node(db, node_id, hours, limit)
    return telemetry_data


@router.get(
    "/telemetry/node/{node_id}/latest",
    response_model=schemas.TelemetryResponse,
    summary="Get Latest Reading",
    description="Get the most recent telemetry reading for a node"
)
async def get_latest_reading(
    node_id: int,
    db: Session = Depends(get_db)
):
    """Get the latest telemetry reading for a specific node"""
    
    latest = crud.get_latest_telemetry(db, node_id)
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry data found for node {node_id}"
        )
    
    return latest


@router.get(
    "/telemetry/node/{node_id}/stats",
    summary="Get Node Statistics",
    description="Get aggregated statistics for a node's telemetry data"
)
async def get_node_stats(
    node_id: int,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """
    Get aggregate statistics for a node
    
    Returns averages, minimums, and maximums for all telemetry metrics
    """
    
    # Verify node exists
    node = crud.get_node(db, node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {node_id} not found"
        )
    
    stats = crud.get_telemetry_stats(db, node_id, hours)
    return {
        "node_id": node_id,
        "node_name": node.name,
        "hours": hours,
        "statistics": stats
    }
