"""
CRUD operations for database models
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from . import models, schemas


# ============= NODE OPERATIONS =============

def create_node(db: Session, node: schemas.NodeCreate) -> models.Node:
    """Create a new sensor node"""
    db_node = models.Node(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node


def get_node(db: Session, node_id: int) -> Optional[models.Node]:
    """Get a single node by ID"""
    return db.query(models.Node).filter(models.Node.id == node_id).first()


def get_nodes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Node]:
    """Get all nodes with pagination"""
    return db.query(models.Node).offset(skip).limit(limit).all()


def get_nodes_by_type(db: Session, node_type: str) -> List[models.Node]:
    """Get all nodes of a specific type"""
    return db.query(models.Node).filter(models.Node.node_type == node_type).all()


def update_node_status(db: Session, node_id: int, status: models.NodeStatus) -> Optional[models.Node]:
    """Update node status"""
    db_node = get_node(db, node_id)
    if db_node:
        db_node.status = status
        db_node.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_node)
    return db_node


# ============= TELEMETRY OPERATIONS =============

def create_telemetry(db: Session, telemetry: schemas.TelemetryCreate) -> models.Telemetry:
    """Create a new telemetry record"""
    db_telemetry = models.Telemetry(**telemetry.model_dump())
    db.add(db_telemetry)
    db.commit()
    db.refresh(db_telemetry)
    return db_telemetry


def get_telemetry_by_node(
    db: Session,
    node_id: int,
    hours: int = 24,
    limit: int = 1000
) -> List[models.Telemetry]:
    """Get recent telemetry data for a specific node"""
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    return (
        db.query(models.Telemetry)
        .filter(
            models.Telemetry.node_id == node_id,
            models.Telemetry.timestamp >= time_threshold
        )
        .order_by(desc(models.Telemetry.timestamp))
        .limit(limit)
        .all()
    )


def get_latest_telemetry(db: Session, node_id: int) -> Optional[models.Telemetry]:
    """Get the most recent telemetry reading for a node"""
    return (
        db.query(models.Telemetry)
        .filter(models.Telemetry.node_id == node_id)
        .order_by(desc(models.Telemetry.timestamp))
        .first()
    )


def get_telemetry_stats(db: Session, node_id: int, hours: int = 24) -> dict:
    """Get aggregate statistics for a node's telemetry data"""
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    
    stats = db.query(
        func.avg(models.Telemetry.flow_rate).label('avg_flow'),
        func.avg(models.Telemetry.pressure).label('avg_pressure'),
        func.avg(models.Telemetry.ph_level).label('avg_ph'),
        func.avg(models.Telemetry.temperature).label('avg_temp'),
        func.avg(models.Telemetry.turbidity).label('avg_turbidity'),
        func.min(models.Telemetry.flow_rate).label('min_flow'),
        func.min(models.Telemetry.pressure).label('min_pressure'),
        func.max(models.Telemetry.flow_rate).label('max_flow'),
        func.max(models.Telemetry.pressure).label('max_pressure')
    ).filter(
        models.Telemetry.node_id == node_id,
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    stations = []
    for node in rural_nodes:
        latest = get_latest_telemetry(db, node.id)
        stations.append({
            "id": node.id,
            "name": node.name,
            "district": node.district,
            "aquifer_depth_m": latest.aquifer_depth_m if latest else node.aquifer_depth_m,
            "water_table_m": latest.water_table_m if latest else node.water_table_m,
            "recharge_rate": latest.recharge_rate if latest else node.recharge_rate,
            "status": node.status,
            "latest_telemetry": {
                "timestamp": latest.timestamp,
                "aquifer_depth_m": latest.aquifer_depth_m,
                "water_table_m": latest.water_table_m,
                "recharge_rate": latest.recharge_rate,
                "flow_rate": latest.flow_rate,
                "pressure": latest.pressure,
                "ph_level": latest.ph_level,
                "temperature": latest.temperature,
                "turbidity": latest.turbidity
            } if latest else None
        })

    return {
        "avg_flow_rate": float(stats.avg_flow) if stats.avg_flow else None,
        "avg_pressure": float(stats.avg_pressure) if stats.avg_pressure else None,
        "avg_ph_level": float(stats.avg_ph) if stats.avg_ph else None,
        "avg_temperature": float(stats.avg_temp) if stats.avg_temp else None,
        "avg_turbidity": float(stats.avg_turbidity) if stats.avg_turbidity else None,
        "min_flow_rate": float(stats.min_flow) if stats.min_flow else None,
        "min_pressure": float(stats.min_pressure) if stats.min_pressure else None,
        "max_flow_rate": float(stats.max_flow) if stats.max_flow else None,
        "max_pressure": float(stats.max_pressure) if stats.max_pressure else None
    }


# ============= REPORT OPERATIONS =============

def create_report(db: Session, report: schemas.ReportCreate) -> models.Report:
    """Create a new citizen report"""
    db_report = models.Report(**report.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_report(db: Session, report_id: int) -> Optional[models.Report]:
    """Get a single report by ID"""
    return db.query(models.Report).filter(models.Report.id == report_id).first()


def get_reports(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category: Optional[str] = None
) -> List[models.Report]:
    """Get reports with optional filtering"""
    query = db.query(models.Report)
    
    if status:
        query = query.filter(models.Report.status == status)
    if category:
        query = query.filter(models.Report.category == category)
    
    return query.order_by(desc(models.Report.created_at)).offset(skip).limit(limit).all()


def update_report_status(
    db: Session,
    report_id: int,
    status: models.ReportStatus
) -> Optional[models.Report]:
    """Update report status"""
    db_report = get_report(db, report_id)
    if db_report:
        db_report.status = status
        db_report.updated_at = datetime.utcnow()
        if status == models.ReportStatus.RESOLVED:
            db_report.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(db_report)
    return db_report


# ============= DASHBOARD STATISTICS =============

def get_dashboard_stats(db: Session, context: Optional[str] = None) -> dict:
    """Get aggregated statistics for the dashboard, optionally filtered by context"""
    
    # Base query for node statistics
    base_query = db.query(func.count(models.Node.id))
    
    # Apply context filter if provided
    if context:
        base_query = base_query.filter(models.Node.node_type == context)
        total_nodes = base_query.scalar()
        active_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.node_type == context,
            models.Node.status == models.NodeStatus.NORMAL
        ).scalar()
        critical_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.node_type == context,
            models.Node.status == models.NodeStatus.CRITICAL
        ).scalar()
        warning_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.node_type == context,
            models.Node.status == models.NodeStatus.WARNING
        ).scalar()
    else:
        # No context filter - get all nodes
        total_nodes = base_query.scalar()
        active_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.status == models.NodeStatus.NORMAL
        ).scalar()
        critical_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.status == models.NodeStatus.CRITICAL
        ).scalar()
        warning_nodes = db.query(func.count(models.Node.id)).filter(
            models.Node.status == models.NodeStatus.WARNING
        ).scalar()
    
    # Report statistics
    total_reports = db.query(func.count(models.Report.id)).scalar()
    pending_reports = db.query(func.count(models.Report.id)).filter(
        models.Report.status == models.ReportStatus.PENDING
    ).scalar()
    resolved_reports = db.query(func.count(models.Report.id)).filter(
        models.Report.status == models.ReportStatus.RESOLVED
    ).scalar()
    
    # Recent telemetry averages (last 24 hours)
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    telemetry_stats = db.query(
        func.avg(models.Telemetry.flow_rate).label('avg_flow'),
        func.avg(models.Telemetry.pressure).label('avg_pressure'),
        func.avg(models.Telemetry.ph_level).label('avg_ph')
    ).filter(
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    return {
        "total_nodes": total_nodes or 0,
        "active_nodes": active_nodes or 0,
        "critical_nodes": critical_nodes or 0,
        "warning_nodes": warning_nodes or 0,
        "total_reports": total_reports or 0,
        "pending_reports": pending_reports or 0,
        "resolved_reports": resolved_reports or 0,
        "avg_flow_rate": float(telemetry_stats.avg_flow) if telemetry_stats.avg_flow else None,
        "avg_pressure": float(telemetry_stats.avg_pressure) if telemetry_stats.avg_pressure else None,
        "avg_ph_level": float(telemetry_stats.avg_ph) if telemetry_stats.avg_ph else None,
        "last_updated": datetime.utcnow()
    }


def get_nodes_with_latest_telemetry(db: Session) -> List[dict]:
    """Get all nodes with their latest telemetry readings"""
    nodes = get_nodes(db)
    result = []
    
    for node in nodes:
        latest_telemetry = get_latest_telemetry(db, node.id)
        node_data = {
            "id": node.id,
            "name": node.name,
            "latitude": node.latitude,
            "longitude": node.longitude,
            "node_type": node.node_type,
            "status": node.status,
            "context_mode": node.context_mode,
                "district": node.district,
            "latest_telemetry": None
        }
        
        if latest_telemetry:
            node_data["latest_telemetry"] = {
                "timestamp": latest_telemetry.timestamp,
                "flow_rate": latest_telemetry.flow_rate,
                "pressure": latest_telemetry.pressure,
                "ph_level": latest_telemetry.ph_level,
                "temperature": latest_telemetry.temperature,
                "turbidity": latest_telemetry.turbidity,
                "aquifer_depth_m": latest_telemetry.aquifer_depth_m,
                "water_table_m": latest_telemetry.water_table_m,
                "recharge_rate": latest_telemetry.recharge_rate
            }
        
        result.append(node_data)
    
    return result


# ============= REGULATORY OPERATIONS =============

def create_regulatory_limit(
    db: Session, limit: schemas.RegulatoryLimitCreate
) -> models.RegulatoryLimit:
    """Create new regulatory limit"""
    db_limit = models.RegulatoryLimit(**limit.model_dump())
    db.add(db_limit)
    db.commit()
    db.refresh(db_limit)
    return db_limit


def get_regulatory_limits(db: Session) -> List[models.RegulatoryLimit]:
    """Get all regulatory limits"""
    return db.query(models.RegulatoryLimit).all()


def get_regulatory_limit_by_facility(
    db: Session, facility_type: str
) -> Optional[models.RegulatoryLimit]:
    """Get regulatory limit for facility type"""
    return db.query(models.RegulatoryLimit).filter(
        models.RegulatoryLimit.facility_type == facility_type
    ).first()


# ============= COMPLIANCE OPERATIONS =============

def create_compliance_violation(
    db: Session, violation: schemas.ComplianceViolationCreate
) -> models.ComplianceViolation:
    """Record a compliance violation"""
    db_violation = models.ComplianceViolation(**violation.model_dump())
    db.add(db_violation)
    db.commit()
    db.refresh(db_violation)
    return db_violation


def get_compliance_violations(
    db: Session,
    node_id: Optional[int] = None,
    resolved: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ComplianceViolation]:
    """Get compliance violations with filtering"""
    query = db.query(models.ComplianceViolation)
    
    if node_id:
        query = query.filter(models.ComplianceViolation.node_id == node_id)
    
    if resolved is not None:
        query = query.filter(models.ComplianceViolation.resolved == resolved)
    
    return query.order_by(
        desc(models.ComplianceViolation.violation_date)
    ).offset(skip).limit(limit).all()


def get_critical_violations(
    db: Session, hours: int = 24
) -> List[models.ComplianceViolation]:
    """Get unresolved violations from recent hours"""
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    return db.query(models.ComplianceViolation).filter(
        models.ComplianceViolation.violation_date >= time_threshold,
        models.ComplianceViolation.resolved == False,
        models.ComplianceViolation.severity == "critical"
    ).order_by(
        desc(models.ComplianceViolation.violation_date)
    ).all()


def resolve_violation(
    db: Session, violation_id: int
) -> Optional[models.ComplianceViolation]:
    """Mark violation as resolved"""
    violation = db.query(models.ComplianceViolation).filter(
        models.ComplianceViolation.id == violation_id
    ).first()
    
    if violation:
        violation.resolved = True
        violation.resolved_date = datetime.utcnow()
        db.commit()
        db.refresh(violation)
    
    return violation


# ============= CONTEXT-SPECIFIC STATISTICS =============

def get_urban_stats(db: Session) -> dict:
    """Get urban context statistics (flow distribution, water loss)"""
    urban_nodes = db.query(models.Node).filter(
        models.Node.node_type == "urban"
    ).all()
    
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    # Calculate averages
    urban_telemetry = db.query(
        func.avg(models.Telemetry.flow_rate).label('avg_flow'),
        func.avg(models.Telemetry.pressure).label('avg_pressure'),
    ).join(models.Node).filter(
        models.Node.node_type == "urban",
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    # Water loss percentage (simulated: avg of water_loss_pct field if exists)
    loss_data = db.query(
        func.avg(models.Telemetry.turbidity).label('avg_loss_proxy')
    ).join(models.Node).filter(
        models.Node.node_type == "urban",
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    districts = {}
    for node in urban_nodes:
        district = node.district or "Unknown"
        if district not in districts:
            districts[district] = {"nodes": 0, "flow": 0}
        districts[district]["nodes"] += 1
        
        latest = get_latest_telemetry(db, node.id)
        if latest and latest.flow_rate:
            districts[district]["flow"] += latest.flow_rate
    
    # Calculate distribution per district
    for district in districts:
        if districts[district]["nodes"] > 0:
            districts[district]["flow"] /= districts[district]["nodes"]
    
    # Get historical flow and pressure trends per node (last 12 months)
    flow_trends = []
    pressure_trends = []
    
    for node in urban_nodes:
        # Get monthly average flow rate and pressure for this node
        monthly_data = db.query(
            func.date_trunc('month', models.Telemetry.timestamp).label('month'),
            func.avg(models.Telemetry.flow_rate).label('avg_flow'),
            func.avg(models.Telemetry.pressure).label('avg_pressure')
        ).filter(
            models.Telemetry.node_id == node.id,
            models.Telemetry.timestamp >= datetime.utcnow() - timedelta(days=365)
        ).group_by(
            func.date_trunc('month', models.Telemetry.timestamp)
        ).order_by(
            func.date_trunc('month', models.Telemetry.timestamp)
        ).all()
        
        if monthly_data:
            for data_point in monthly_data:
                if data_point.avg_flow:
                    flow_trends.append({
                        "node": node.name,
                        "month": data_point.month.strftime('%b'),
                        "flow": float(data_point.avg_flow)
                    })
                if data_point.avg_pressure:
                    pressure_trends.append({
                        "node": node.name,
                        "month": data_point.month.strftime('%b'),
                        "pressure": float(data_point.avg_pressure)
                    })
    
    # Build detailed nodes list with latest telemetry
    nodes_list = []
    for node in urban_nodes:
        latest = get_latest_telemetry(db, node.id)
        nodes_list.append({
            "id": node.id,
            "name": node.name,
            "district": node.district,
            "status": node.status,
            "latest_telemetry": {
                "timestamp": latest.timestamp,
                "flow_rate": latest.flow_rate,
                "pressure": latest.pressure,
                "turbidity": latest.turbidity,
                "temperature": latest.temperature,
                "ph_level": latest.ph_level,
                "aquifer_depth_m": latest.aquifer_depth_m,
                "water_table_m": latest.water_table_m,
                "recharge_rate": latest.recharge_rate
            } if latest else None
        })
    
    return {
        "total_nodes": len(urban_nodes),
        "avg_flow_rate": float(urban_telemetry.avg_flow) if urban_telemetry.avg_flow else 0,
        "avg_pressure": float(urban_telemetry.avg_pressure) if urban_telemetry.avg_pressure else 0,
        "water_loss_percentage": float(loss_data.avg_loss_proxy * 10) if loss_data.avg_loss_proxy else 0,  # Scaled for display
        "districts": districts,
        "flow_trends": flow_trends,
        "pressure_trends": pressure_trends,
        "nodes": nodes_list
    }


def get_rural_stats(db: Session) -> dict:
    """Get rural context statistics (aquifer depth, recharge)"""
    rural_nodes = db.query(models.Node).filter(
        models.Node.node_type == "rural"
    ).all()
    
    time_threshold = datetime.utcnow() - timedelta(days=30)
    
    # Aquifer depth average
    aquifer_stats = db.query(
        func.avg(models.Telemetry.aquifer_depth_m).label('avg_depth'),
        func.max(models.Telemetry.aquifer_depth_m).label('max_depth'),
        func.min(models.Telemetry.aquifer_depth_m).label('min_depth'),
    ).join(models.Node).filter(
        models.Node.node_type == "rural",
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    # Recharge rates from telemetry data
    recharge_data = db.query(
        func.avg(models.Telemetry.recharge_rate).label('avg_recharge')
    ).join(models.Node).filter(
        models.Node.node_type == "rural",
        models.Telemetry.timestamp >= time_threshold
    ).first()
    
    # Get historical water table depth trends per station (last 12 months)
    depth_trends = []
    recharge_trends = []
    
    for node in rural_nodes:  # Include ALL rural stations (not just first 6)
        # Get monthly average water table depth and recharge for this station
        monthly_data = db.query(
            func.date_trunc('month', models.Telemetry.timestamp).label('month'),
            func.avg(models.Telemetry.water_table_m).label('avg_water_table'),
            func.avg(models.Telemetry.recharge_rate).label('avg_recharge')
        ).filter(
            models.Telemetry.node_id == node.id,
            models.Telemetry.timestamp >= datetime.utcnow() - timedelta(days=365)
        ).group_by(
            func.date_trunc('month', models.Telemetry.timestamp)
        ).order_by(
            func.date_trunc('month', models.Telemetry.timestamp)
        ).all()
        
        if monthly_data:
            for data_point in monthly_data:
                if data_point.avg_water_table:
                    depth_trends.append({
                        "station": node.name,
                        "month": data_point.month.strftime('%b'),
                        "depth": float(data_point.avg_water_table)
                    })
                if data_point.avg_recharge:
                    recharge_trends.append({
                        "station": node.name,
                        "month": data_point.month.strftime('%b'),
                        "recharge": float(data_point.avg_recharge)
                    })

    stations = []
    for node in rural_nodes:
        latest = get_latest_telemetry(db, node.id)
        stations.append({
            "id": node.id,
            "name": node.name,
            "district": node.district,
            "aquifer_depth_m": latest.aquifer_depth_m if latest else node.aquifer_depth_m,
            "water_table_m": latest.water_table_m if latest else node.water_table_m,
            "recharge_rate": latest.recharge_rate if latest else node.recharge_rate,
            "status": node.status,
            "latest_telemetry": {
                "timestamp": latest.timestamp,
                "aquifer_depth_m": latest.aquifer_depth_m,
                "water_table_m": latest.water_table_m,
                "recharge_rate": latest.recharge_rate,
                "flow_rate": latest.flow_rate,
                "pressure": latest.pressure,
                "ph_level": latest.ph_level,
                "temperature": latest.temperature,
                "turbidity": latest.turbidity
            } if latest else None
        })
    
    return {
        "total_stations": len(rural_nodes),
        "avg_aquifer_depth_m": float(aquifer_stats.avg_depth) if aquifer_stats.avg_depth else 0,
        "max_aquifer_depth_m": float(aquifer_stats.max_depth) if aquifer_stats.max_depth else 0,
        "min_aquifer_depth_m": float(aquifer_stats.min_depth) if aquifer_stats.min_depth else 0,
        "avg_recharge_rate": float(recharge_data.avg_recharge) if recharge_data.avg_recharge else 0,
        "water_table_trend": "stable",  # Would be calculated from historical data
        "depth_trends": depth_trends,
        "recharge_trends": recharge_trends,
        "stations": stations
    }


def get_industrial_stats(db: Session) -> dict:
    """Get industrial context statistics (compliance, violations)"""
    industrial_nodes = db.query(models.Node).filter(
        models.Node.node_type == "industrial"
    ).all()

    total_violations = 0
    critical_violations = 0
    warning_violations = 0
    ph_values = []
    violations_by_type = {}
    facilities = []

    for node in industrial_nodes:
        latest = get_latest_telemetry(db, node.id)
        ph_level = latest.ph_level if latest else None
        ph_status = "unknown"

        if ph_level is not None:
            ph_values.append(ph_level)
            if ph_level < 6.0 or ph_level > 9.0:
                ph_status = "critical"
                critical_violations += 1
                total_violations += 1
            elif ph_level < 6.5 or ph_level > 8.5:
                ph_status = "warning"
                warning_violations += 1
                total_violations += 1
            else:
                ph_status = "normal"

        facility_type_value = node.facility_type.value if node.facility_type else "unknown"
        if ph_status in {"warning", "critical"}:
            violations_by_type[facility_type_value] = violations_by_type.get(facility_type_value, 0) + 1

        facilities.append({
            "id": node.id,
            "name": node.name,
            "facility_type": facility_type_value,
            "status": node.status,
            "last_inspection": node.last_inspection_date,
            "ph_status": ph_status,
            "latest_telemetry": {
                "timestamp": latest.timestamp,
                "ph_level": latest.ph_level,
                "turbidity": latest.turbidity,
                "temperature": latest.temperature
            } if latest else None
        })

    compliance_score = 100 - (critical_violations * 10) - (warning_violations * 5)
    compliance_score = max(0, min(100, compliance_score))

    avg_ph = sum(ph_values) / len(ph_values) if ph_values else 7.0

    return {
        "total_facilities": len(industrial_nodes),
        "compliance_score": int(compliance_score),
        "total_violations": total_violations,
        "critical_violations": critical_violations,
        "avg_ph": float(avg_ph),
        "violations_by_type": violations_by_type,
        "facilities": facilities
    }
