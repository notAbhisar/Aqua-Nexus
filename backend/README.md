# Aqua Nexus Backend API

**Part 1: Core Infrastructure** - The nervous system of the water monitoring platform.

## 🎯 Overview

FastAPI-based backend that receives real-time sensor data, processes citizen reports, and provides aggregated statistics for the dashboard.

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 15+ with PostGIS extension
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI)

## 📦 Installation

### Prerequisites

1. **Python 3.10+** - [Download](https://www.python.org/downloads/)
2. **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
3. **PostGIS Extension** - [Installation Guide](https://postgis.net/install/)

### Step 1: Install PostgreSQL on Windows

```powershell
# Option 1: Using Chocolatey
choco install postgresql15

# Option 2: Manual download
# Download from: https://www.postgresql.org/download/windows/
# During installation, remember the password you set for 'postgres' user
```

### Step 2: Create Database

```powershell
# Open PostgreSQL command line (psql) or use pgAdmin
# Connect as postgres user
psql -U postgres

# In psql:
CREATE DATABASE aqua_nexus;
\c aqua_nexus
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Step 3: Setup Python Environment

```powershell
# Navigate to backend directory
cd "c:\Users\abhis\Desktop\VS CODE WORKSPACE\Aqua Nexus\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment

```powershell
# Copy the example env file
cp env.example .env

# Edit .env and update database credentials if needed
# Default: postgresql://postgres:postgres@localhost:5432/aqua_nexus
```

## 🚀 Running the API

```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Root**: http://localhost:8000/

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/telemetry` | Submit sensor telemetry data |
| `POST` | `/api/report` | Submit citizen water issue report |
| `GET` | `/api/stats` | Get dashboard statistics |
| `GET` | `/api/nodes` | Get all sensor nodes |
| `GET` | `/api/nodes/with-telemetry` | Get nodes with latest readings |

### Telemetry Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/telemetry/node/{node_id}` | Get telemetry history for a node |
| `GET` | `/api/telemetry/node/{node_id}/latest` | Get latest reading for a node |
| `GET` | `/api/telemetry/node/{node_id}/stats` | Get aggregate statistics |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | Get all reports (with filters) |
| `GET` | `/api/report/{report_id}` | Get single report |
| `PATCH` | `/api/report/{report_id}/status` | Update report status |

### Node Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/nodes` | Create new sensor node |
| `GET` | `/api/nodes/{node_id}` | Get single node |
| `PATCH` | `/api/nodes/{node_id}/status` | Update node status |

## 📊 Database Schema

### Nodes Table
Stores sensor locations and configurations
```sql
- id (PRIMARY KEY)
- name (VARCHAR)
- latitude (FLOAT)
- longitude (FLOAT)
- node_type (ENUM: urban, rural, industrial)
- status (ENUM: normal, warning, critical, offline)
- context_mode (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Telemetry Table
Stores time-series sensor readings
```sql
- id (PRIMARY KEY)
- node_id (FOREIGN KEY -> nodes.id)
- timestamp (TIMESTAMP)
- flow_rate (FLOAT) - L/s
- pressure (FLOAT) - PSI
- ph_level (FLOAT) - pH scale
- temperature (FLOAT) - Celsius
- turbidity (FLOAT) - NTU
```

### Reports Table
Stores citizen-submitted issues
```sql
- id (PRIMARY KEY)
- latitude (FLOAT)
- longitude (FLOAT)
- description (TEXT)
- category (ENUM: leak, pollution, drought, other)
- photo_url (VARCHAR)
- status (ENUM: pending, investigating, resolved, rejected)
- reporter_name (VARCHAR)
- reporter_contact (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- resolved_at (TIMESTAMP)
```

## 🧪 Testing the API

### Using Swagger UI (Easiest)

1. Open http://localhost:8000/docs
2. Click "Try it out" on any endpoint
3. Fill in the request body
4. Click "Execute"

### Example: Create a Node

```bash
curl -X POST "http://localhost:8000/api/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sector 4 Main Pipeline",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "node_type": "urban",
    "context_mode": "urban"
  }'
```

### Example: Submit Telemetry

```bash
curl -X POST "http://localhost:8000/api/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": 1,
    "flow_rate": 45.5,
    "pressure": 65.0,
    "ph_level": 7.2,
    "temperature": 22.5,
    "turbidity": 3.2
  }'
```

### Example: Submit Report

```bash
curl -X POST "http://localhost:8000/api/report" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Large water leak on Main Street",
    "category": "leak",
    "reporter_name": "John Doe",
    "reporter_contact": "john@example.com"
  }'
```

## 🔧 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app and configuration
│   ├── database.py       # Database connection setup
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   └── routers/
│       ├── __init__.py
│       ├── telemetry.py  # Telemetry endpoints
│       ├── reports.py    # Report endpoints
│       └── stats.py      # Statistics endpoints
├── venv/                 # Virtual environment (excluded from git)
├── .env                  # Environment variables (excluded from git)
├── env.example           # Example environment file
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🌟 Features Implemented

✅ **RESTful API** with automatic OpenAPI documentation  
✅ **Database schema** with proper relationships and constraints  
✅ **CORS enabled** for frontend integration  
✅ **Input validation** using Pydantic  
✅ **Automatic status updates** based on telemetry thresholds  
✅ **Aggregated statistics** for dashboard  
✅ **Pagination support** for large datasets  
✅ **Filtering options** for reports and nodes  

## 🔜 Next Steps

After Part 1 is complete, you can proceed with:
- **Part 2**: Data Simulation Engine (generates fake sensor data)
- **Part 3**: Admin Dashboard (React frontend)
- **Part 4**: Mobile Citizen Reporter (React mobile view)
- **Part 5**: AI/ML Intelligence Layer (anomaly detection + chatbot)

## 🐛 Troubleshooting

### Database Connection Error
```
Could not connect to database
```
**Solution**: Check if PostgreSQL is running:
```powershell
# Check service status
Get-Service -Name postgresql*

# If not running, start it
Start-Service -Name postgresql-x64-15
```

### Import Error: No module named 'app'
```
ModuleNotFoundError: No module named 'app'
```
**Solution**: Make sure you're running from the backend directory:
```powershell
cd backend
uvicorn app.main:app --reload
```

### Port Already in Use
```
ERROR: [Errno 10048] error while attempting to bind on address
```
**Solution**: Kill the process using port 8000 or use a different port:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

## 📝 License

MIT License - Built for Aqua Nexus Hackathon Project

---

**Ready for Part 2?** Once this backend is running, we'll build the simulation engine! 🚀
