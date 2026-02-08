"""
Main FastAPI application entry point
Aqua Nexus - Water Monitoring System Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import init_db
from .routers import telemetry, reports, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup/shutdown
    Initialize database on startup
    """
    # Startup: Initialize database tables
    print("🚀 Starting Aqua Nexus API...")
    print("📊 Initializing database...")
    init_db()
    print("✅ Database initialized successfully")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Aqua Nexus API...")


# Create FastAPI application
app = FastAPI(
    title="Aqua Nexus API",
    description="""
    **Aqua Nexus** - Intelligent Water Monitoring System
    
    ## Features
    
    * 💧 **Real-time Telemetry**: Receive and process sensor data from water monitoring nodes
    * 📍 **Citizen Reports**: Allow public to report water issues (leaks, pollution, drought)
    * 📊 **Dashboard Statistics**: Aggregated data for administrative oversight
    * 🗺️ **Geographic Data**: Location-based tracking of sensors and reports
    
    ## Contexts
    
    * **Urban**: Flow rate and pressure monitoring for municipal water systems
    * **Rural**: Water availability and quality tracking for remote areas
    * **Industrial**: pH and contamination monitoring for factory water usage
    
    ## Integration
    
    This API is designed to work with:
    - Data Simulation Engine (Part 2)
    - Admin Dashboard Frontend (Part 3)
    - Mobile Citizen Reporter (Part 4)
    - AI/ML Intelligence Layer (Part 5)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration - Allow all origins for hackathon demo
# In production, restrict this to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(telemetry.router)
app.include_router(reports.router)
app.include_router(stats.router)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "Welcome to Aqua Nexus API",
        "version": "1.0.0",
        "documentation": "/docs",
        "status": "operational",
        "endpoints": {
            "telemetry": "/api/telemetry",
            "reports": "/api/report",
            "statistics": "/api/stats",
            "nodes": "/api/nodes",
            "health": "/api/health"
        }
    }
