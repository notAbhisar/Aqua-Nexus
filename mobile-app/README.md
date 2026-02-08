# Aqua Nexus Reporter - Mobile PWA

Citizen mobile app for reporting water quality issues.

## Features

- 📱 **Mobile-First Design**: Responsive PWA for iOS and Android browsers
- 📝 **Report Submission**: Describe issues with category and photo upload
- 📍 **GPS Location**: Automatic or manual location capture
- 👁️ **Nearby Reports**: View water issues reported in your area (5km radius)
- 📋 **Track Reports**: Monitor status of your submitted reports
- 🔋 **Offline Support**: Service worker caching for offline access
- 🎯 **Installable**: Install as native app on mobile devices

## Tech Stack

- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (API client)
- Progressive Web App (PWA)
- Geolocation API
- Service Workers

## Installation

```bash
cd mobile-app
npm install
```

## Development

```bash
npm run dev
```

Accessible at: http://localhost:3001

## Build

```bash
npm run build
```

## Usage

### Report an Issue
1. Click "Report Issue" button
2. Describe the problem
3. Select category (Leak, Pollution, Drought, Other)
4. Optionally upload a photo
5. Enable location and submit

### View Nearby Reports
1. Click "Nearby Reports"
2. See water issues in your area
3. Check status and reporter info

### Track Your Reports
1. Click "My Reports"
2. View all submitted reports
3. Check current status

## API Integration

**Endpoints Used:**
- `POST /api/report` - Submit new report
- `GET /api/reports/nearby` - Get nearby reports (5km radius)
- `GET /api/reports` - Get all reports with filters

## PWA Installation

1. Open app in mobile browser
2. Look for "Add to Home Screen" option
3. Install as standalone app
4. Works offline with cached data

## Mobile Optimization

- Touch-friendly buttons and controls
- Optimized forms for mobile keyboards
- Fast loading with Vite
- Minimal data usage
- Responsive grid layouts

## Browser Support

- Chrome 51+
- Firefox 44+
- Safari 11.1+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Android)

---

**Status:** Part 4 of Aqua Nexus - Citizen Reporter Mobile App
