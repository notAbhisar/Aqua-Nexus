"""
SQLAlchemy Database Models
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
import enum
from .database import Base


class NodeType(str, enum.Enum):
    """Node context types"""
    URBAN = "urban"
    RURAL = "rural"
    INDUSTRIAL = "industrial"


class NodeStatus(str, enum.Enum):
    """Node operational status"""
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class ReportCategory(str, enum.Enum):
    """Report categories"""
    LEAK = "leak"
    POLLUTION = "pollution"
    DROUGHT = "drought"
    OTHER = "other"


class ReportStatus(str, enum.Enum):
    """Report processing status"""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DataQualityFlag(str, enum.Enum):
    """Data quality indicators"""
    VALID = "valid"
    STALE = "stale"  # No update for 24+ hours
    OUTLIER = "outlier"  # Statistical anomaly
    MISSING = "missing"  # Sensor malfunction


class FacilityType(str, enum.Enum):
    """Industrial facility types"""
    TEXTILE = "textile"
    PHARMA = "pharma"
    FOOD = "food"
    CHEMICAL = "chemical"
    METAL = "metal"
    OTHER = "other"


class Node(Base):
    """
    Water monitoring sensor nodes
    Stores location and configuration of each sensor
    """
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    node_type = Column(Enum(NodeType), default=NodeType.URBAN)
    status = Column(Enum(NodeStatus), default=NodeStatus.NORMAL)
    context_mode = Column(String, default="urban")  # For simulation context
    
    # Context-specific data
    # Urban
    district = Column(String, nullable=True)  # District / Zone name
    peak_hours = Column(String, nullable=True)  # e.g., "6-9,17-20"
    water_loss_pct = Column(Float, nullable=True)  # Leakage percentage
    supply_demand_ratio = Column(Float, nullable=True)  # Supply vs demand
    
    # Rural
    aquifer_depth_m = Column(Float, nullable=True)  # Current aquifer depth
    water_table_m = Column(Float, nullable=True)  # Water table level
    recharge_rate = Column(Float, nullable=True)  # mm/month
    seasonal_variation = Column(String, nullable=True)  # monsoon/summer/winter
    
    # Industrial
    facility_type = Column(Enum(FacilityType, native_enum=False), nullable=True)
    last_inspection_date = Column(DateTime(timezone=True), nullable=True)
    
    # Alert thresholds (JSON: {"flow_min": 10, "pressure_max": 80, "ph_min": 6.5, ...})
    alert_thresholds = Column(JSON, nullable=True, default={})
    
    # Regulatory limits for industrial (JSON)
    regulatory_limits = Column(JSON, nullable=True, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    telemetry_records = relationship("Telemetry", back_populates="node", cascade="all, delete-orphan")
    compliance_violations = relationship("ComplianceViolation", back_populates="node", cascade="all, delete-orphan")


class Telemetry(Base):
    """
    Time-series sensor data from nodes
    Stores all readings with timestamps
    """
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Sensor readings
    flow_rate = Column(Float)  # Liters per second
    pressure = Column(Float)  # PSI
    ph_level = Column(Float)  # pH scale (0-14)
    temperature = Column(Float)  # Celsius
    turbidity = Column(Float)  # NTU (Nephelometric Turbidity Units)
    
    # Rural-specific readings
    aquifer_depth_m = Column(Float, nullable=True)  # Current depth
    water_table_m = Column(Float, nullable=True)  # Water table level
    recharge_rate = Column(Float, nullable=True)  # mm/month
    
    # Data quality
    data_quality_flag = Column(Enum(DataQualityFlag, native_enum=False), default=DataQualityFlag.VALID)
    
    # Relationship
    node = relationship("Node", back_populates="telemetry_records")


class Report(Base):
    """
    Citizen-submitted water issue reports
    Stores complaints and observations from the public
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(Enum(ReportCategory), default=ReportCategory.OTHER)
    photo_url = Column(String, nullable=True)  # URL to uploaded photo
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    
    # Additional metadata
    reporter_name = Column(String, nullable=True)
    reporter_contact = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class RegulatoryLimit(Base):
    """
    Environmental and regulatory thresholds for industrial compliance
    """
    __tablename__ = "regulatory_limits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "CPCB Schedule VI"
    facility_type = Column(Enum(FacilityType, native_enum=False), nullable=False, index=True)
    
    # Limits (mg/L or appropriate units)
    ph_min = Column(Float)
    ph_max = Column(Float)
    turbidity_max = Column(Float)
    bod_max = Column(Float)  # Biological Oxygen Demand
    cod_max = Column(Float)  # Chemical Oxygen Demand
    tss_max = Column(Float)  # Total Suspended Solids
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ComplianceViolation(Base):
    """
    Tracks when industrial nodes exceed regulatory thresholds
    """
    __tablename__ = "compliance_violations"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False, index=True)
    violation_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # What was violated
    parameter = Column(String, nullable=False)  # pH, turbidity, BOD, etc.
    measured_value = Column(Float, nullable=False)
    limit_value = Column(Float, nullable=False)
    severity = Column(String, default="warning")  # warning, critical
    
    # Status
    resolved = Column(Boolean, default=False)
    resolved_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship
    node = relationship("Node", back_populates="compliance_violations")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
