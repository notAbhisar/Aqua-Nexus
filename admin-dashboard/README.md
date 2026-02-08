# Aqua Nexus - Admin Dashboard

Modern, responsive admin dashboard for monitoring water quality sensors in real-time.

## Features

### 🗺️ Interactive Map
- Real-time visualization of all sensor nodes
- Color-coded markers (Green=Normal, Yellow=Warning, Red=Critical)
- Click markers for detailed node information
- Context filtering (Urban/Industrial/Rural)

### 📊 Dashboard Statistics
- Total nodes count with status breakdown
- Average flow rate, pressure, and pH level
- Auto-refresh every 10 seconds

### 📈 Time-Series Charts
- Flow rate and pressure trends
- pH level and temperature monitoring
- Turbidity tracking
- 24-hour historical data per node

### 🚨 Alerts Feed
- Real-time system alerts for WARNING/CRITICAL nodes
- Citizen report integration
- Automatic anomaly detection

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React-Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Axios** - API client

## Installation

```bash
# Navigate to dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Dashboard will be available at: http://localhost:3000

## API Integration

The dashboard connects to the FastAPI backend at `http://localhost:8000`:

- **GET /api/stats** - Dashboard statistics
- **GET /api/nodes/latest** - All nodes with latest telemetry
- **GET /api/telemetry/node/{id}** - Node-specific telemetry history
- **GET /api/telemetry/node/{id}/latest** - Latest reading for a node
- **GET /api/reports** - Citizen reports

Vite proxy automatically routes `/api/*` requests to the backend.

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Start Backend**: Ensure FastAPI server is running on port 8000
2. **Start Simulator**: Run `python simulate.py` to generate test data
3. **Launch Dashboard**: Run `npm run dev` in admin-dashboard folder
4. **Monitor**: View real-time updates every 10 seconds

## Context Filtering

Use the context filter dropdown to view specific node types:
- **All Nodes** - Display all 6 sensors
- **Urban** - Downtown + Residential nodes (2 total)
- **Industrial** - Factory + Chemical Plant nodes (2 total)
- **Rural** - Agricultural + Village nodes (2 total)

Map auto-centers based on filtered nodes.

## Color Coding

- 🟢 **Green** - NORMAL status (all parameters within safe range)
- 🟡 **Yellow** - WARNING status (approaching thresholds)
- 🔴 **Red** - CRITICAL status (pressure < 30 PSI or pH outside 6-9 range)
