# 🌊 Aqua Nexus

**Real-time IoT water monitoring platform with intelligent alerts, citizen engagement, and multi-context analytics for urban, rural, and industrial water systems.**

---

## 📋 Overview

Aqua Nexus is a comprehensive water infrastructure monitoring system that combines sensor telemetry, citizen reporting, interactive dashboards, and real-time alerting to enable proactive water management and rapid issue response.

**Key Features:**
- 🔴 Real-time sensor monitoring across 27+ nodes
- 📊 Context-aware dashboards (Urban, Rural, Industrial)
- 🗺️ Interactive map with live node status
- 📱 Mobile citizen reporting interface
- ⚠️ Smart alert system with threshold-based notifications
- 📈 Time-series analytics and data visualization

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL 15+ with PostGIS
- **ORM:** SQLAlchemy
- **API Docs:** Swagger UI / ReDoc
- **Validation:** Pydantic

### Admin Dashboard
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet + React-Leaflet
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Mobile App
- **Framework:** React 18 + Vite (Mobile-first)
- **Styling:** Tailwind CSS
- **Maps:** Leaflet + React-Leaflet
- **HTTP Client:** Axios

### Simulator
- **Language:** Python 3.10+
- **Scheduling:** Time-based loops
- **Data Generation:** Contextual telemetry patterns
- **HTTP Client:** Requests

---

## 📦 Project Structure

```
Aqua Nexus/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   └── routers/
│   ├── requirements.txt
│   └── README.md
│
├── admin-dashboard/      # React admin interface
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
│
├── mobile-app/           # React mobile app
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
│
└── simulator/            # Telemetry simulator
    ├── simulate.py
    ├── requirements.txt
    └── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Admin Dashboard Setup
```powershell
cd admin-dashboard
npm install
npm run dev
```

### Mobile App Setup
```powershell
cd mobile-app
npm install
npm run dev
```

### Simulator Setup
```powershell
cd simulator
python simulate.py --cycles 5
```

---

## 🔗 Access Points

- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Admin Dashboard:** http://localhost:5173
- **Mobile App:** http://localhost:3001

---

## 📚 Documentation

- [Backend README](backend/README.md)
- [Admin Dashboard README](admin-dashboard/README.md)
- [Mobile App README](mobile-app/README.md)
- [Simulator README](simulator/README.md)

---

## 📝 License

MIT License

---

**Built for sustainable water management** 💧
