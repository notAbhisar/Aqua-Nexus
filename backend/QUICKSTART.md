# Aqua Nexus - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install PostgreSQL

**Option A - Using Chocolatey (Recommended):**
```powershell
choco install postgresql15
```

**Option B - Manual Installation:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and remember the password for 'postgres' user
3. Default port: 5432

### Step 2: Create Database

Open PowerShell as Administrator:

```powershell
# Set password environment variable (replace 'postgres' with your password)
$env:PGPASSWORD='postgres'

# Create database
& 'C:\Program Files\PostgreSQL\15\bin\psql.exe' -U postgres -c "CREATE DATABASE aqua_nexus;"

# Verify creation
& 'C:\Program Files\PostgreSQL\15\bin\psql.exe' -U postgres -c "\l"
```

### Step 3: Setup Backend (Already Done!)

The virtual environment and dependencies are already installed. Just verify:

```powershell
cd "c:\Users\abhis\Desktop\VS CODE WORKSPACE\Aqua Nexus\backend"

# Check if venv exists
Test-Path .\venv

# Activate if needed
.\venv\Scripts\Activate.ps1
```

### Step 4: Update Database Connection (If Needed)

Edit `.env` file if your PostgreSQL password is different:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aqua_nexus
```

### Step 5: Start the API

```powershell
# Make sure you're in the backend directory with venv activated
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 6: Initialize Sample Data

**Open a NEW PowerShell window:**

```powershell
cd "c:\Users\abhis\Desktop\VS CODE WORKSPACE\Aqua Nexus\backend"
.\venv\Scripts\Activate.ps1
python init_db.py
```

### Step 7: Test the API

Open your browser and visit:

🌐 **Swagger UI**: http://localhost:8000/docs

Try this:
1. Click on "GET /api/nodes" 
2. Click "Try it out"
3. Click "Execute"
4. You should see 6 sample sensor nodes!

## 🎯 Quick API Test

### Test 1: Create a Telemetry Record

```bash
curl -X POST "http://localhost:8000/api/telemetry" ^
  -H "Content-Type: application/json" ^
  -d "{\"node_id\": 1, \"flow_rate\": 45.5, \"pressure\": 65.0, \"ph_level\": 7.2, \"temperature\": 22.5, \"turbidity\": 3.2}"
```

### Test 2: Submit a Citizen Report

```bash
curl -X POST "http://localhost:8000/api/report" ^
  -H "Content-Type: application/json" ^
  -d "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"description\": \"Water leak on Main Street\", \"category\": \"leak\", \"reporter_name\": \"John Doe\"}"
```

### Test 3: Get Dashboard Stats

```bash
curl "http://localhost:8000/api/stats"
```

## 🐛 Common Issues

### Issue: Port 8000 already in use

**Solution:**
```powershell
# Find the process
netstat -ano | findstr :8000

# Kill it (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

### Issue: Cannot connect to PostgreSQL

**Solution:**
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# If not running, start it
Start-Service -Name postgresql-x64-15
```

### Issue: Database 'aqua_nexus' does not exist

**Solution:**
```powershell
$env:PGPASSWORD='postgres'
& 'C:\Program Files\PostgreSQL\15\bin\psql.exe' -U postgres -c "CREATE DATABASE aqua_nexus;"
```

## ✅ Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] Database 'aqua_nexus' is created
- [ ] Virtual environment is activated (you see `(venv)` in terminal)
- [ ] Dependencies are installed (`pip list` shows fastapi, uvicorn, etc.)
- [ ] API is running on http://localhost:8000
- [ ] Swagger UI loads at http://localhost:8000/docs
- [ ] Sample nodes are created (GET /api/nodes returns 6 nodes)

## 🎉 Success!

If all checkmarks are complete, **Part 1 is DONE!** 🚀

**Next:** Part 2 - Data Simulation Engine

---

## 📚 Additional Resources

- **Full Documentation**: See [README.md](README.md)
- **API Reference**: http://localhost:8000/docs
- **Database Schema**: See [README.md](README.md#-database-schema)
- **Troubleshooting**: See [README.md](README.md#-troubleshooting)
