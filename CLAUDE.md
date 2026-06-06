# CLAUDE.md — GoMobility Live Tracking Website

## Project

**Go-Tracking** — GoMobility ka live ride tracking website. Passenger apni ride ka link share karta hai, koi bhi bina login ke driver ki live location dekh sakta hai.

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Map:** react-leaflet (OpenStreetMap — free, no API key)
- **Deploy:** Vercel → `track.gomobility.co.in`

## Commands

```bash
npm run dev     # localhost:3000 pe start karo
npm run build   # production build
npm start       # production server
```

## Backend API

**Base URL:** `https://api.gomobility.co.in/api/v1`

Both APIs are **public** — no Authorization header needed.

### 1. Live Tracking Data (poll every 5s)
```
GET /tracking/public/:trackingToken
```
Response fields:
- `data.status` → `accepted | driver_arrived | in_progress | completed`
- `data.driver` → `{ name, phone, rating, vehicle: { number, type, color } }`
- `data.passenger` → `{ name, phone }`
- `data.location.current` → `{ latitude, longitude, timestamp }` (driver live location)
- `data.location.pickup` → string address
- `data.location.dropoff` → string address
- `data.fare` → `{ estimated, final }`
- `data.route` → array of `{ latitude, longitude, timestamp }` GPS points
- `data.routeStats` → `{ totalDistance (km), totalDuration (min), pointCount }`

### 2. Route History
```
GET /tracking/public/:trackingToken/history
```

## File Structure

```
app/
  layout.tsx              # Root layout, Inter font, metadata
  page.tsx                # Home — branding page
  globals.css             # Tailwind + Leaflet CSS
  not-found.tsx           # Invalid token error page
  track/[token]/page.tsx  # MAIN PAGE — live tracking

components/
  Navbar.tsx        # Top bar — logo + live status pill
  TrackingMap.tsx   # Leaflet map — driver marker, pickup/dropoff pins, route polyline
  DriverCard.tsx    # Driver avatar, name, vehicle, rating, call button
  StatusBar.tsx     # 4-step progress bar + status message
  EtaRow.tsx        # 3 boxes: Duration | Fare | Distance
  LocationRow.tsx   # Pickup & dropoff addresses
  ShareButton.tsx   # WhatsApp + Copy link + Native share
  RideCompleted.tsx # Ride khatam screen — final fare, route summary
  LoadingScreen.tsx # Skeleton loader

hooks/
  useTrackingData.ts  # Polling hook — fetches every 5s, stops on 'completed'

lib/
  api.ts              # fetchTrackingData(), fetchRouteHistory()

types/
  tracking.ts         # TypeScript interfaces: TrackingData, Driver, Vehicle, etc.
```

## Key Decisions

- **Leaflet SSR issue:** `TrackingMap` is loaded with `dynamic(() => import(...), { ssr: false })` — Leaflet needs `window` object, not available in SSR
- **Polling:** `useTrackingData` hook uses `setInterval(5000)` — auto-stops when `status === 'completed'`
- **Map markers:** Custom `divIcon` with emoji — no external image needed
- **Error handling:** `error === 'NOT_FOUND'` → `notFound()`, other errors → retry button

## Environment Variables

`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.gomobility.co.in/api/v1
NEXT_PUBLIC_APP_URL=https://track.gomobility.co.in
```

## Ride Status Flow

```
accepted → driver_arrived → in_progress → completed
```

Status se UI map:
- `accepted`       → Blue  — "Driver is on the way to you"
- `driver_arrived` → Amber — "Driver has arrived!"
- `in_progress`    → Green — "Ride in progress"
- `completed`      → Grey  — Show RideCompleted screen

## Conventions

- Tailwind only — no inline styles except Leaflet map height
- All components are `default export`
- `'use client'` sirf wahan jahan `useState`/`useEffect`/events use ho
- Colors: primary = `#1565C0` (Tailwind `primary-700`), bg = white, light = `#F0F4FF`
- Rounded corners: `rounded-2xl` cards, `rounded-full` pills/buttons
- No `console.log` in committed code

## Common Tasks

**Polling interval change karna:**
→ `hooks/useTrackingData.ts` line 25 → `setInterval(poll, 5000)` → 5000 = 5 seconds

**Naya status add karna:**
→ `types/tracking.ts` → `RideStatus` type
→ `components/StatusBar.tsx` → `statusMessage` aur `steps` arrays
→ `components/Navbar.tsx` → `statusConfig` object

**Map center/zoom change karna:**
→ `components/TrackingMap.tsx` → `map.setView(defaultCenter, 14)` → 14 = zoom level

**Share message change karna:**
→ `components/ShareButton.tsx` → `shareWhatsApp` function

**Domain change karna:**
→ `.env.local` → `NEXT_PUBLIC_APP_URL`