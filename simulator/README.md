# Part 2: Simulation Engine

**The "Fake Reality" - Making Your Demo Alive**

## Overview

The Aqua Nexus Simulation Engine generates realistic sensor telemetry data and streams it to your backend API. This creates a living, breathing water monitoring system perfect for demos and hackathons.

## 🎯 What It Does

### Three Context Modes

#### 1. **Urban Water Distribution** 🏙️
Simulates municipal water systems:
- **Flow Rate**: 40-60 L/s during peak hours (6-9 AM, 5-8 PM), 15-25 L/s otherwise
- **Pressure**: Stable 60-70 PSI, occasional drops (5% chance) to simulate leaks
- **pH**: Neutral 7.0-7.5 (clean drinking water)
- **Temperature**: 20-23°C
- **Turbidity**: Low 2-5 NTU

**Real scenario**: Water usage spikes in morning (showers) and evening (cooking), pressure drops when leaks occur.

#### 2. **Industrial Water Use** 🏭
Simulates factory/plant water systems:
- **Flow Rate**: Stable 95-105 L/s (consistent factory demand)
- **Pressure**: High 80-90 PSI (industrial systems)
- **pH**: Normally 6.5-8.5, **spikes to 11.0** (10% chance) simulating chemical dumps
- **Temperature**: High 35-45°C (heat from industrial processes)
- **Turbidity**: Variable 10-20 NTU

**Real scenario**: Illegal chemical dumping is detected via pH anomaly → auto-alerts.

#### 3. **Rural/Agricultural** 🌾
Simulates groundwater and agricultural systems:
- **Flow Rate**: Low but steady 5-15 L/s
- **Pressure**: Tank system 40-50 PSI
- **pH**: Natural groundwater 7.5-8.0
- **Temperature**: Ground temperature 15-18°C
- **Turbidity**: Variable 5-15 NTU (natural variation)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd simulator
pip install -r requirements.txt
```

### 2. Run the Simulator

**Infinite simulation (ctrl+c to stop):**
```powershell
python simulate.py
```

**Run for 60 cycles (2 minutes):**
```powershell
python simulate.py --cycles 60
```

**Custom interval (5 seconds between readings):**
```powershell
python simulate.py --interval 5
```

**Connect to different API:**
```powershell
python simulate.py --url http://192.168.1.100:8000
```

## 📊 Expected Output

```
2024-12-03 20:15:30 - INFO - Fetched 6 sensor nodes
2024-12-03 20:15:30 - INFO - Starting simulation with 6 nodes
2024-12-03 20:15:30 - INFO - Interval: 2 seconds, Cycles: infinite
2024-12-03 20:15:30 - INFO - Press Ctrl+C to stop
2024-12-03 20:15:30 - INFO - [Cycle 1] 2024-12-03 20:15:30
2024-12-03 20:15:31 - INFO - Submitted 6 readings (Failed: 0)
2024-12-03 20:15:33 - INFO - [Cycle 2] 2024-12-03 20:15:33
2024-12-03 20:15:34 - INFO - Submitted 6 readings (Failed: 0)
2024-12-03 20:15:36 - WARNING - 🚨 INDUSTRIAL ANOMALY: Node 3 pH spike detected!
2024-12-03 20:15:36 - INFO - [Cycle 3] 2024-12-03 20:15:36
2024-12-03 20:15:37 - INFO - Submitted 6 readings (Failed: 0)
```

## 🧠 Smart Features

### Context-Aware Patterns
- **Time-based**: Urban flow rates vary by hour (morning/evening peaks)
- **Random anomalies**: Leaks, contamination spikes, equipment failures
- **Realistic constraints**: Values stay within physically possible ranges

### Error Handling
- Retries on connection failures
- Graceful degradation if API is unavailable
- Detailed logging for debugging

### Performance
- 6 nodes × 2 second interval = 3 submissions per second
- Lightweight (~2% CPU usage)
- Memory efficient

## 📈 Data Flow

```
┌─────────────────────┐
│   Simulator Script  │
│  (simulate.py)      │
└──────────┬──────────┘
           │ (POST telemetry every 2s)
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│  (/api/telemetry)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL Database│
│  (telemetry table)  │
└─────────────────────┘
```

## 🎨 Use Cases

### Demo Scenario 1: "Live Leak Detection"
1. Start simulator
2. Open dashboard (Part 3)
3. Watch urban nodes - pressure drops randomly
4. Backend auto-detects critical pressure → Red alert!

### Demo Scenario 2: "Pollution Alert"
1. Start simulator
2. Watch industrial nodes
3. Occasionally pH spikes to 11.0
4. System flags as "INDUSTRIAL ANOMALY"
5. Dashboard shows red pin

### Demo Scenario 3: "24-Hour Pattern"
1. Run simulator with `--cycles 1440` (24 hours at 1s interval = 24 min real time)
2. Watch flow rates rise/fall with time of day
3. Show time-series chart (Part 3) - beautiful sine wave pattern!

## 🔧 Customization

### Modify Urban Patterns

Edit `simulate.py`, `generate_urban_telemetry()` method:

```python
# Change peak hours
is_peak = (6 <= hour < 9) or (17 <= hour < 20)

# Change flow rates
flow_rate = random.uniform(40, 60)  # Peak
flow_rate = random.uniform(15, 25)  # Off-peak

# Change leak probability
if random.random() < 0.05:  # 5% chance
    flow_rate = random.uniform(5, 15)
```

### Add New Context Types

Duplicate `generate_urban_telemetry()` and modify for your custom scenario:

```python
def generate_custom_telemetry(self, node_id: int) -> Dict:
    """Your custom simulation logic"""
    return {
        "node_id": node_id,
        "flow_rate": ...,
        "pressure": ...,
        # ... other fields
    }
```

Then call it from `generate_telemetry()`:

```python
if node_type == "custom":
    return self.generate_custom_telemetry(node_id)
```

## 🐛 Troubleshooting

### "Cannot connect to API"
- Ensure backend is running: `uvicorn app.main:app --reload`
- Check URL: `--url http://localhost:8000`
- Verify firewall isn't blocking

### "No nodes available"
- Run `python init_db.py` in backend directory
- Verify nodes exist: `curl http://localhost:8000/api/nodes`

### "Connection timeout"
- Backend might be slow
- Increase timeout in code: `timeout=10` (line ~100)
- Check system resources

## 📝 Command Reference

```bash
# Basic run
python simulate.py

# Custom configurations
python simulate.py --url http://api:8000 --interval 1 --cycles 100

# With Python 3.13
C:\Python313\python.exe simulate.py

# From venv
.\venv\Scripts\python.exe simulate.py
```

## ✨ What's Next?

After running the simulator:
1. **Part 3**: Dashboard will visualize this data in real-time
2. **Part 5**: AI will detect anomalies automatically
3. **Advanced**: Add predictive models, ML scheduling, etc.

---

**🌊 Happy Simulating!** Watch your water system come alive! 💧
