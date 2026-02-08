# 🚀 Aqua Nexus Dashboard - Quick Start

## Current Status
✅ **Backend API** - Running on http://localhost:8000
✅ **PostgreSQL Database** - 6 nodes with live telemetry data
✅ **Admin Dashboard** - Running on http://localhost:3000

## Dashboard Features Implemented

### 📊 **Real-Time Statistics Panel**
- Total nodes count (6 active sensors)
- Average flow rate, pressure, and pH level
- Live breakdown: Active/Warning/Critical status
- Auto-refresh every 10 seconds

### 🗺️ **Interactive Map**
- Color-coded node markers:
  - 🟢 Green = NORMAL
  - 🟡 Yellow = WARNING  
  - 🔴 Red = CRITICAL
- Click any marker to see node details
- Context filter dropdown (All/Urban/Industrial/Rural)
- Auto-centering based on filter selection

### 📈 **Time-Series Charts** (appears when node selected)
- **Flow Rate & Pressure**: Dual-axis line chart
- **pH Level & Temperature**: Area charts
- **Turbidity**: Water quality monitoring
- Last 50 readings over 24 hours

### 🔍 **Node Detail Sidebar**
- Current status badge
- Node type and context mode
- GPS coordinates
- Latest telemetry readings (flow, pressure, pH, temp, turbidity)
- Timestamp of last reading

### 🚨 **Alerts Feed**
- Real-time alerts for WARNING/CRITICAL nodes
- Displays problematic readings
- Citizen reports integration (when available)
- Shows "All systems normal" when no issues

## How to Use

### 1. View Dashboard
Open in your browser:
```
http://localhost:3000
```

### 2. Explore Nodes
- **Click any pin** on the map to see detailed information
- **Use context filter** dropdown to view specific node types:
  - Urban (2 nodes)
  - Industrial (2 nodes)
  - Rural (2 nodes)

### 3. Analyze Trends
- Select a node to display time-series charts below the map
- Charts show last 24 hours of data
- Hover over chart lines for exact values

### 4. Monitor Alerts
- Alerts feed on right sidebar shows current issues
- WARNING nodes (yellow) = Low flow or pressure concerns
- CRITICAL nodes (red) = Pressure < 30 PSI or pH outside 6-9 range

## Testing the Dashboard

### Generate More Data
Run the simulator to create fresh telemetry:
```bash
cd simulator
python simulate.py --cycles 10
```

### Check Different Contexts
1. Set filter to **Urban** - See peak hour patterns (6-9 AM, 5-8 PM)
2. Set filter to **Industrial** - High flow rates (~100 L/s)
3. Set filter to **Rural** - Low flow groundwater patterns (~10 L/s)

### Verify Real-Time Updates
- Dashboard auto-refreshes every 10 seconds
- Run simulator in another terminal
- Watch stats panel and map markers update live

## Architecture

```
Browser (http://localhost:3000)
    ↓
Vite Dev Server (React + Tailwind)
    ↓
Proxy: /api/* → Backend
    ↓
FastAPI (http://localhost:8000)
    ↓
PostgreSQL Database
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `Map.jsx` | React-Leaflet map with custom markers |
| `StatsPanel.jsx` | Dashboard statistics cards |
| `Charts.jsx` | Recharts time-series visualization |
| `NodeDetail.jsx` | Selected node information |
| `AlertsFeed.jsx` | System alerts and citizen reports |
| `App.jsx` | Main application with state management |

## API Endpoints Used

- `GET /api/stats` - Dashboard aggregated statistics
- `GET /api/nodes/latest` - All nodes with latest telemetry
- `GET /api/telemetry/node/{id}` - Historical data for charts
- `GET /api/telemetry/node/{id}/latest` - Current node readings
- `GET /api/reports` - Citizen reports (Part 4 integration)

## Next: Part 4

Once you're satisfied with the dashboard, we'll build:

**📱 Citizen Reporter Mobile App**
- React Native (iOS + Android)
- Photo upload for water quality issues
- GPS-based report submission
- Push notifications for updates
- Integration with dashboard alerts feed

---

**Need Help?**
- Dashboard not loading? Check backend is running: `http://localhost:8000/docs`
- No data showing? Run simulator: `python simulator/simulate.py`
- Map not displaying? Check browser console for Leaflet errors
