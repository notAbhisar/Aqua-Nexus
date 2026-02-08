"""
Statistics and Dashboard API endpoints
GET /api/stats - Dashboard statistics
GET /api/nodes - All sensor nodes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, crud, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["Dashboard & Statistics"])


@router.get(
    "/stats",
    response_model=schemas.DashboardStats,
    summary="Get Dashboard Statistics",
    description="Retrieve aggregated statistics for the admin dashboard"
)
async def get_dashboard_stats(
    context: Optional[str] = Query(None, description="Filter by context: urban, rural, industrial"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard statistics
    
    Returns:
    - Total number of nodes and their status breakdown (optionally filtered by context)
    - Total reports and their status breakdown
    - Average telemetry readings across all/filtered nodes
    - Last updated timestamp
    """
    
    stats = crud.get_dashboard_stats(db, context=context)
    return schemas.DashboardStats(**stats)


@router.get(
    "/nodes",
    response_model=List[schemas.NodeResponse],
    summary="Get All Sensor Nodes",
    description="Retrieve all water monitoring sensor nodes"
)
async def get_nodes(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records"),
    node_type: Optional[str] = Query(None, description="Filter by node type (urban, rural, industrial)"),
    db: Session = Depends(get_db)
):
    """
    Get all sensor nodes with optional filtering
    
    - **skip**: Pagination offset
    - **limit**: Maximum number of records
    - **node_type**: Filter by context type
    """
    
    if node_type:
        nodes = crud.get_nodes_by_type(db, node_type)
    else:
        nodes = crud.get_nodes(db, skip=skip, limit=limit)
    
    return nodes


@router.get(
    "/nodes/with-telemetry",
    summary="Get Nodes with Latest Readings",
    description="Get all nodes with their most recent telemetry data"
)
async def get_nodes_with_telemetry(db: Session = Depends(get_db)):
    """
    Get all nodes with their latest telemetry readings
    
    Perfect for map visualizations - provides location, status, and current readings
    """
    
    nodes_data = crud.get_nodes_with_latest_telemetry(db)
    return nodes_data


@router.post(
    "/nodes",
    response_model=schemas.NodeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Sensor Node",
    description="Register a new water monitoring sensor node"
)
async def create_node(
    node: schemas.NodeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new sensor node
    
    - **name**: Unique name for the sensor
    - **latitude**: Geographic latitude
    - **longitude**: Geographic longitude
    - **node_type**: Type of sensor (urban, rural, industrial)
    - **context_mode**: Simulation context mode
    """
    
    db_node = crud.create_node(db, node)
    return db_node


@router.get(
    "/nodes/{node_id}",
    response_model=schemas.NodeResponse,
    summary="Get Single Node",
    description="Retrieve details of a specific sensor node"
)
async def get_node(
    node_id: int,
    db: Session = Depends(get_db)
):
    """Get a single node by ID"""
    
    node = crud.get_node(db, node_id)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {node_id} not found"
        )
    
    return node


@router.patch(
    "/nodes/{node_id}/status",
    response_model=schemas.NodeResponse,
    summary="Update Node Status",
    description="Manually update the operational status of a node"
)
async def update_node_status(
    node_id: int,
    new_status: models.NodeStatus,
    db: Session = Depends(get_db)
):
    """
    Update node status
    
    - **node_id**: ID of the node
    - **new_status**: New status (normal, warning, critical, offline)
    """
    
    updated_node = crud.update_node_status(db, node_id, new_status)
    
    if not updated_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node with ID {node_id} not found"
        )
    
    return updated_node


@router.get(
    "/health",
    summary="API Health Check",
    description="Simple endpoint to check if the API is running"
)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Aqua Nexus API",
        "version": "1.0.0"
    }


# ============= CONTEXT-SPECIFIC STATISTICS =============

@router.get(
    "/stats/urban",
    summary="Get Urban Context Statistics",
    description="Retrieve urban planning focused metrics (flow distribution, water loss)"
)
async def get_urban_stats(db: Session = Depends(get_db)):
    """
    Get urban context statistics
    
    Returns:
    - Average flow rate and pressure
    - Water loss percentage
    - District-wise flow distribution
    - Urban node list with status
    """
    stats = crud.get_urban_stats(db)
    return stats


@router.get(
    "/stats/rural",
    summary="Get Rural Context Statistics",
    description="Retrieve rural planning focused metrics (aquifer depth, recharge rates)"
)
async def get_rural_stats(db: Session = Depends(get_db)):
    """
    Get rural context statistics
    
    Returns:
    - Aquifer depth (average, max, min)
    - Recharge rate
    - Water table trend
    - Groundwater station list with readings
    """
    stats = crud.get_rural_stats(db)
    return stats


@router.get(
    "/stats/industrial",
    summary="Get Industrial Context Statistics",
    description="Retrieve industrial compliance focused metrics (violations, thresholds)"
)
async def get_industrial_stats(db: Session = Depends(get_db)):
    """
    Get industrial context statistics
    
    Returns:
    - Compliance score (0-100%)
    - Total and critical violations
    - Average pH and parameter readings
    - Violations breakdown by facility type
    - Industrial facility list with compliance status
    """
    stats = crud.get_industrial_stats(db)
    return stats


@router.get(
    "/alerts",
    summary="Get Real-Time Alerts",
    description="Retrieve alerts generated from telemetry data based on threshold violations"
)
async def get_alerts(
    context: Optional[str] = Query(None, description="Filter by context: urban, rural, industrial"),
    db: Session = Depends(get_db)
):
    """
    Get real-time alerts from telemetry data
    
    Generates alerts by checking telemetry against thresholds:
    - Urban: Flow rate, pressure
    - Rural: Aquifer depth, recharge rate
    - Industrial: pH levels, temperature, turbidity
    
    Only includes alerts from last 24 hours
    """
    from datetime import datetime, timedelta
    
    alerts = []
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    # Get all nodes with recent telemetry
    nodes = crud.get_nodes_with_latest_telemetry(db)
    
    for node_data in nodes:
        node = node_data
        telemetry = node.get('latest_telemetry')
        
        if not telemetry:
            continue
            
        # Check if telemetry is recent (within 24 hours)
        telemetry_time = telemetry.get('timestamp')
        if not telemetry_time:
            continue
            
        # Handle both datetime objects and strings
        if isinstance(telemetry_time, str):
            try:
                telemetry_time = datetime.fromisoformat(telemetry_time.replace('Z', '+00:00'))
            except:
                continue
        
        # Remove timezone info for comparison if present
        if telemetry_time.tzinfo is not None:
            telemetry_time = telemetry_time.replace(tzinfo=None)
        
        if telemetry_time < time_threshold:
            continue
        
        node_type = node.get('node_type')
        
        # Apply context filter
        if context and node_type != context:
            continue
        
        node_id = node.get('id')
        node_name = node.get('name')
        
        # URBAN ALERTS
        if node_type == 'urban':
            pressure = telemetry.get('pressure')
            if pressure and pressure < 30:  # Critical: < 30 PSI
                alerts.append({
                    'id': f'{node_id}-pressure',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'pressure',
                    'severity': 'critical',
                    'title': 'Low Pressure Detected',
                    'message': f'Water pressure critically low at {node_name}',
                    'value': f'{pressure:.2f} PSI',
                    'threshold': '30 PSI',
                    'timestamp': telemetry_time.isoformat()
                })
            
            flow_rate = telemetry.get('flow_rate')
            if flow_rate and flow_rate < 10:  # Warning: < 10 LPS
                alerts.append({
                    'id': f'{node_id}-flow',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'flow_rate',
                    'severity': 'warning',
                    'title': 'Low Flow Rate',
                    'message': f'Flow rate below normal at {node_name}',
                    'value': f'{flow_rate:.2f} LPS',
                    'threshold': '10 LPS',
                    'timestamp': telemetry_time.isoformat()
                })
        
        # RURAL ALERTS
        elif node_type == 'rural':
            # Check aquifer depth (if available in telemetry or node attributes)
            aquifer_depth = telemetry.get('aquifer_depth_m') or node.get('aquifer_depth_m')
            if aquifer_depth:
                if aquifer_depth < 50:  # Critical
                    alerts.append({
                        'id': f'{node_id}-aquifer',
                        'node_id': node_id,
                        'node_name': node_name,
                        'node_type': node_type,
                        'type': 'aquifer',
                        'severity': 'critical',
                        'title': 'Critical Aquifer Depletion',
                        'message': f'Aquifer depth critically low at {node_name}',
                        'value': f'{aquifer_depth:.1f} m',
                        'threshold': '50 m',
                        'timestamp': telemetry_time.isoformat()
                    })
                elif aquifer_depth < 65:  # Warning
                    alerts.append({
                        'id': f'{node_id}-aquifer',
                        'node_id': node_id,
                        'node_name': node_name,
                        'node_type': node_type,
                        'type': 'aquifer',
                        'severity': 'warning',
                        'title': 'Aquifer Depth Dropping',
                        'message': f'Aquifer depth below normal at {node_name}',
                        'value': f'{aquifer_depth:.1f} m',
                        'threshold': '65 m',
                        'timestamp': telemetry_time.isoformat()
                    })
            
            recharge_rate = telemetry.get('recharge_rate') or node.get('recharge_rate')
            if recharge_rate and recharge_rate < 5:  # Critical
                alerts.append({
                    'id': f'{node_id}-recharge',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'recharge',
                    'severity': 'critical',
                    'title': 'Low Recharge Rate',
                    'message': f'Groundwater recharge critically low at {node_name}',
                    'value': f'{recharge_rate:.2f} mm/month',
                    'threshold': '5 mm/month',
                    'timestamp': telemetry_time.isoformat()
                })
            
            # Check flow rate (matches telemetry WARNING threshold)
            flow_rate = telemetry.get('flow_rate')
            if flow_rate and flow_rate < 10:  # Warning: Low flow
                alerts.append({
                    'id': f'{node_id}-flow',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'flow',
                    'severity': 'warning',
                    'title': 'Low Flow Rate',
                    'message': f'Flow rate below threshold at {node_name}',
                    'value': f'{flow_rate:.1f} LPS',
                    'threshold': '10 LPS',
                    'timestamp': telemetry_time.isoformat()
                })
        
        # INDUSTRIAL ALERTS
        elif node_type == 'industrial':
            ph_level = telemetry.get('ph_level')
            if ph_level:
                if ph_level < 6.0 or ph_level > 9.0:  # Critical
                    alerts.append({
                        'id': f'{node_id}-ph',
                        'node_id': node_id,
                        'node_name': node_name,
                        'node_type': node_type,
                        'type': 'ph',
                        'severity': 'critical',
                        'title': 'pH Out of Range',
                        'message': f'pH level critically out of range at {node_name}',
                        'value': f'{ph_level:.2f}',
                        'threshold': '6.0-9.0',
                        'timestamp': telemetry_time.isoformat()
                    })
                elif ph_level < 6.5 or ph_level > 8.5:  # Warning
                    alerts.append({
                        'id': f'{node_id}-ph',
                        'node_id': node_id,
                        'node_name': node_name,
                        'node_type': node_type,
                        'type': 'ph',
                        'severity': 'warning',
                        'title': 'pH Near Limits',
                        'message': f'pH level approaching limits at {node_name}',
                        'value': f'{ph_level:.2f}',
                        'threshold': '6.5-8.5',
                        'timestamp': telemetry_time.isoformat()
                    })
            
            temperature = telemetry.get('temperature')
            if temperature and temperature > 45:  # Warning: High temperature
                alerts.append({
                    'id': f'{node_id}-temp',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'temperature',
                    'severity': 'warning',
                    'title': 'High Temperature',
                    'message': f'Water temperature elevated at {node_name}',
                    'value': f'{temperature:.1f}°C',
                    'threshold': '45°C',
                    'timestamp': telemetry_time.isoformat()
                })
            
            turbidity = telemetry.get('turbidity')
            if turbidity and turbidity > 20:  # Warning: High turbidity
                alerts.append({
                    'id': f'{node_id}-turbidity',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'turbidity',
                    'severity': 'warning',
                    'title': 'High Turbidity',
                    'message': f'Water turbidity elevated at {node_name}',
                    'value': f'{turbidity:.1f} NTU',
                    'threshold': '20 NTU',
                    'timestamp': telemetry_time.isoformat()
                })
            
            # Check flow rate (matches telemetry WARNING threshold)
            flow_rate = telemetry.get('flow_rate')
            if flow_rate and flow_rate < 10:  # Warning: Low flow
                alerts.append({
                    'id': f'{node_id}-flow',
                    'node_id': node_id,
                    'node_name': node_name,
                    'node_type': node_type,
                    'type': 'flow',
                    'severity': 'warning',
                    'title': 'Low Flow Rate',
                    'message': f'Flow rate below threshold at {node_name}',
                    'value': f'{flow_rate:.1f} LPS',
                    'threshold': '10 LPS',
                    'timestamp': telemetry_time.isoformat()
                })
    
    return {
        'alerts': alerts,
        'count': len(set(alert['node_id'] for alert in alerts)),  # Count unique nodes with alerts
        'alert_violations': len(alerts),  # Total number of alert violations
        'context': context or 'all',
        'generated_at': datetime.utcnow().isoformat()
    }


@router.post("/update-rural-nodes")
async def update_rural_nodes(db: Session = Depends(get_db)):
    """Update old rural nodes with district and aquifer depth data"""
    rural_updates = {
        "Delhi - Najafgarh": {"district": "South West Delhi", "aquifer_depth_m": 82.4},
        "Gurgaon - Sohna": {"district": "South Haryana", "aquifer_depth_m": 78.6},
        "Delhi - Jaffarpur Kalan": {"district": "West Delhi", "aquifer_depth_m": 88.2},
        "Gurgaon - Pataudi": {"district": "North Haryana", "aquifer_depth_m": 91.5},
        "Delhi - Narela": {"district": "North West Delhi", "aquifer_depth_m": 73.8},
        "Gurgaon - Farrukhnagar": {"district": "East Haryana", "aquifer_depth_m": 84.9}
    }
    
    updated = []
    for node_name, data in rural_updates.items():
        node = db.query(models.Node).filter(
            models.Node.name == node_name,
            models.Node.node_type == "rural"
        ).first()
        if node:
            node.district = data["district"]
            node.aquifer_depth_m = data["aquifer_depth_m"]
            node.status = "normal"
            updated.append(node_name)
    
    db.commit()
    return {"updated": len(updated), "nodes": updated}
