"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class NodeType(str, Enum):
    URBAN = "urban"
    RURAL = "rural"
    INDUSTRIAL = "industrial"


class NodeStatus(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class ReportCategory(str, Enum):
    LEAK = "leak"
    POLLUTION = "pollution"
    DROUGHT = "drought"
    OTHER = "other"


class ReportStatus(str, Enum):
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DataQualityFlag(str, Enum):
    VALID = "valid"
    STALE = "stale"
    OUTLIER = "outlier"
    MISSING = "missing"


class FacilityType(str, Enum):
    TEXTILE = "textile"
    PHARMA = "pharma"
    FOOD = "food"
    CHEMICAL = "chemical"
    METAL = "metal"
    OTHER = "other"


# Telemetry Schemas
class TelemetryCreate(BaseModel):
    """Schema for creating telemetry data"""
    node_id: int = Field(..., description="ID of the sensor node")
    flow_rate: Optional[float] = Field(None, description="Flow rate in L/s")
    pressure: Optional[float] = Field(None, description="Pressure in PSI")
    ph_level: Optional[float] = Field(None, ge=0, le=14, description="pH level (0-14)")
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    turbidity: Optional[float] = Field(None, description="Turbidity in NTU")
    aquifer_depth_m: Optional[float] = Field(None, description="Aquifer depth in meters")
    water_table_m: Optional[float] = Field(None, description="Water table level in meters")
    recharge_rate: Optional[float] = Field(None, description="Recharge rate in mm/month")
    data_quality_flag: Optional[DataQualityFlag] = Field(DataQualityFlag.VALID)

    class Config:
        json_schema_extra = {
            "example": {
                "node_id": 1,
                "flow_rate": 45.5,
                "pressure": 65.0,
                "ph_level": 7.2,
                "temperature": 22.5,
                "turbidity": 3.2,
                "data_quality_flag": "valid"
            }
        }


class TelemetryResponse(BaseModel):
    """Schema for telemetry response"""
    id: int
    node_id: int
    timestamp: datetime
    flow_rate: Optional[float]
    pressure: Optional[float]
    ph_level: Optional[float]
    temperature: Optional[float]
    turbidity: Optional[float]
    aquifer_depth_m: Optional[float]
    water_table_m: Optional[float]
    recharge_rate: Optional[float]
    data_quality_flag: Optional[DataQualityFlag]

    class Config:
        from_attributes = True


# Report Schemas
class ReportCreate(BaseModel):
    """Schema for creating citizen reports"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    description: str = Field(..., min_length=10, max_length=1000, description="Issue description")
    category: ReportCategory = Field(..., description="Report category")
    photo_url: Optional[str] = Field(None, description="URL of uploaded photo")
    reporter_name: Optional[str] = Field(None, max_length=100)
    reporter_contact: Optional[str] = Field(None, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "description": "Large water leak observed on Main Street near the park. Water is pooling on the road.",
                "category": "leak",
                "reporter_name": "John Doe",
                "reporter_contact": "john@example.com"
            }
        }


class ReportResponse(BaseModel):
    """Schema for report response"""
    id: int
    latitude: float
    longitude: float
    description: str
    category: ReportCategory
    photo_url: Optional[str]
    status: ReportStatus
    reporter_name: Optional[str]
    reporter_contact: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


# Node Schemas
class NodeCreate(BaseModel):
    """Schema for creating nodes"""
    name: str = Field(..., min_length=3, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    node_type: NodeType = Field(default=NodeType.URBAN)
    context_mode: str = Field(default="urban")
    
    # Urban
    district: Optional[str] = None
    peak_hours: Optional[str] = None
    water_loss_pct: Optional[float] = None
    supply_demand_ratio: Optional[float] = None
    
    # Rural
    aquifer_depth_m: Optional[float] = None
    water_table_m: Optional[float] = None
    recharge_rate: Optional[float] = None
    seasonal_variation: Optional[str] = None
    
    # Industrial
    facility_type: Optional[FacilityType] = None
    alert_thresholds: Optional[Dict[str, Any]] = None
    regulatory_limits: Optional[Dict[str, Any]] = None


class NodeResponse(BaseModel):
    """Schema for node response"""
    id: int
    name: str
    latitude: float
    longitude: float
    node_type: NodeType
    status: NodeStatus
    context_mode: str
    
    # Context-specific
    district: Optional[str]
    peak_hours: Optional[str]
    water_loss_pct: Optional[float]
    supply_demand_ratio: Optional[float]
    aquifer_depth_m: Optional[float]
    water_table_m: Optional[float]
    recharge_rate: Optional[float]
    seasonal_variation: Optional[str]
    facility_type: Optional[FacilityType]
    alert_thresholds: Optional[Dict[str, Any]]
    regulatory_limits: Optional[Dict[str, Any]]
    
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Stats Schemas
class NodeStats(BaseModel):
    """Statistics for a single node"""
    node_id: int
    node_name: str
    node_type: str
    status: str
    latest_reading: Optional[TelemetryResponse]
    avg_flow_rate: Optional[float]
    avg_pressure: Optional[float]
    avg_ph_level: Optional[float]


class DashboardStats(BaseModel):
    """Aggregated statistics for dashboard"""
    total_nodes: int
    active_nodes: int
    critical_nodes: int
    warning_nodes: int
    total_reports: int
    pending_reports: int
    resolved_reports: int
    avg_flow_rate: Optional[float]
    avg_pressure: Optional[float]
    avg_ph_level: Optional[float]
    last_updated: datetime


class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[dict] = None


# Regulatory & Compliance Schemas
class RegulatoryLimitCreate(BaseModel):
    """Schema for creating regulatory limits"""
    name: str = Field(..., description="Name of the regulation")
    facility_type: FacilityType
    ph_min: float
    ph_max: float
    turbidity_max: float
    bod_max: float
    cod_max: float
    tss_max: float


class RegulatoryLimitResponse(BaseModel):
    """Schema for regulatory limit response"""
    id: int
    name: str
    facility_type: FacilityType
    ph_min: float
    ph_max: float
    turbidity_max: float
    bod_max: float
    cod_max: float
    tss_max: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ComplianceViolationCreate(BaseModel):
    """Schema for creating compliance violations"""
    node_id: int
    parameter: str = Field(..., description="pH, turbidity, BOD, etc.")
    measured_value: float
    limit_value: float
    severity: str = Field(default="warning", description="warning or critical")


class ComplianceViolationResponse(BaseModel):
    """Schema for compliance violation response"""
    id: int
    node_id: int
    violation_date: datetime
    parameter: str
    measured_value: float
    limit_value: float
    severity: str
    resolved: bool
    resolved_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
