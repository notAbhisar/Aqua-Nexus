# Quick Start Guide

## 🚀 Start the Simulator in 2 Minutes

### Step 1: Open NEW PowerShell Window

(Keep your backend running in the other window!)

### Step 2: Navigate to Simulator

```powershell
cd "c:\Users\abhis\Desktop\VS CODE WORKSPACE\Aqua Nexus\simulator"
```

### Step 3: Install Requirements (First Time Only)

```powershell
pip install -r requirements.txt
```

### Step 4: Run It!

```powershell
python simulate.py
```

You should see:
```
INFO - Fetched 6 sensor nodes
INFO - Starting simulation with 6 nodes
INFO - Press Ctrl+C to stop
INFO - [Cycle 1] 2024-12-03 20:15:30
INFO - Submitted 6 readings (Failed: 0)
```

## ✅ Verify It's Working

**Open a THIRD PowerShell window:**

```powershell
# Check total node count (should be 6)
curl http://localhost:8000/api/nodes

# Get dashboard stats
curl http://localhost:8000/api/stats

# Get latest readings for Node 1
curl http://localhost:8000/api/telemetry/node/1/latest
```

## 🎯 What's Happening

Every 2 seconds, the simulator:
1. Generates realistic data for all 6 nodes
2. POSTs to `/api/telemetry` endpoint
3. Backend stores in database
4. Dashboard (Part 3) will show it live

## 📊 Common Commands

**Run for 60 cycles (2 minutes):**
```powershell
python simulate.py --cycles 60
```

**Run with 5-second interval:**
```powershell
python simulate.py --interval 5
```

**Stop anytime:**
```
Press Ctrl+C
```

---

**Next**: Part 3 - Admin Dashboard will visualize all this data! 🗺️
