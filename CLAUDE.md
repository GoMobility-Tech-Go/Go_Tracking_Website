# CLAUDE.md — GoMobility Live Tracking Website

## Project

**Go-Tracking** — GoMobility ka live ride tracking website. Passenger apni ride ka link share karta hai, koi bhi bina login ke driver ki live location dekh sakta hai.

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (JSX) — `.jsx` files, no TypeScript even though `tsconfig.json` exists
- **Styling:** Tailwind CSS
- **Map:** Leaflet (dynamic import, SSR-disabled) on OpenStreetMap — no API key
- **Realtime:** Socket.IO client (`socket.io-client`)
- **Deploy:** Vercel → `track.gomobility.co.in`

## Commands

```bash
npm run dev     # localhost:3000 pe start karo
npm run build   # production build
npm start       # production server
```

## Backend API

**REST base URL:** `https://api.gomobility.co.in/api/v1`
**Socket host:** `https://api.gomobility.co.in` (same host, default namespace `/`)

Sab public — no Authorization header. Sirf `trackingToken` valid hona chahiye.

### REST: Live Tracking Snapshot
```
GET /tracking/public/:trackingToken
```
Response shape (envelope: `{ success, statuscode, message, data }`):
- `data.status` → `assigned | arrived | started | completed | cancelled`
- `data.driver` → `{ id, name, phone, rating, vehicle: { number, type, color, image } }`
- `data.passenger` → `{ id, name, phone }`
- `data.location.pickup` → `{ latitude, longitude, address }`
- `data.location.dropoff` → `{ latitude, longitude, address }`
- `data.location.current` → `{ latitude, longitude, timestamp, accuracy }` (nullable)
- `data.fare` → `{ estimated, final }`
- `data.timestamps` → `{ startedAt, completedAt }`
- `data.route` → array of `{ latitude, longitude, timestamp, accuracy }`
- `data.routeStats` → `{ totalDistance, totalDuration, pointCount, startTime, endTime }`

Errors come back as `{ success: false, statuscode, message, data: {} }`. `lib/api.js` treats messages matching `/not found|tracking disabled|invalid/i` as `NOT_FOUND`.

### REST: Route History
```
GET /tracking/public/:trackingToken/history
```

### Socket.IO Events
- **Client emits:** `tracking:join` `{ trackingToken }` on connect, `tracking:leave` on unmount.
- **Client listens:** `tracking:joined` (confirmation), `tracking:location-updated` `{ rideId, latitude, longitude, accuracy, timestamp }`, `tracking:error` `{ message }`.
- **Do NOT emit** `tracking:update-location` — driver app only.

## File Structure

```
app/
  layout.jsx              # Root layout, Inter font, metadata
  page.jsx                # Home — branding page
  globals.css             # Tailwind + Leaflet CSS
  not-found.jsx           # Invalid token error page
  demo/page.jsx           # Mock demo with status switcher
  track/[token]/page.jsx  # MAIN PAGE — live tracking

components/
  Navbar.jsx        # Top bar — logo + status pill + Reconnecting badge
  TrackingMap.jsx   # Leaflet map — driver marker (animated), pickup/dropoff pins, polyline
  DriverCard.jsx    # Driver avatar, name, vehicle, rating, call button
  StatusBar.jsx     # 4-step progress + status message (cancelled = step -1)
  EtaRow.jsx        # 3 boxes: Duration | Fare | Distance
  LocationRow.jsx   # Pickup & dropoff addresses (reads from object.address)
  ShareButton.jsx   # WhatsApp + Copy link + Native share
  RideCompleted.jsx # Terminal screen — handles both 'completed' and 'cancelled' variants
  LoadingScreen.jsx # Skeleton loader

hooks/
  useTrackingData.js    # Hybrid: REST initial + 30s refresh, merges socket-fed current location
  useTrackingSocket.js  # Socket.IO lifecycle — join/leave/listeners

lib/
  api.js                # fetchTrackingData(), fetchRouteHistory(), exports API_HOST
```

## Key Decisions

- **Leaflet SSR:** `TrackingMap` is loaded via `dynamic(() => import(...), { ssr: false })` — Leaflet needs `window`.
- **Realtime first, REST as backup:** Live driver location ab socket se aati hai (`tracking:location-updated`). REST sirf initial snapshot + 30s pe status/route refresh ke liye.
- **Socket disables on terminal:** `useTrackingData` socket ko `enabled: !isTerminal` deta hai — `completed`/`cancelled` pe socket disconnect.
- **Location merge:** Jab REST refresh aata hai, agar prev (socket) ka `current.timestamp` REST ke timestamp se naya hai, prev wala rakhte hain — staleness prevent.
- **Map markers from real coords:** `TrackingMap` ab `pickup.latitude/longitude` aur `dropoff.latitude/longitude` use karta hai (pehle current se fake offsets the).
- **Auto-fit bounds:** First paint pe pickup/dropoff/driver sab fit karne ke liye `map.fitBounds`.

## Environment Variables

`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.gomobility.co.in/api/v1
NEXT_PUBLIC_APP_URL=https://track.gomobility.co.in
```

> `API_HOST` is derived by stripping `/api/v1` from `NEXT_PUBLIC_API_BASE_URL` — socket connects to bare host.

## Ride Status Flow

```
assigned → arrived → started → completed
                              ↘ cancelled (at any point)
```

| status | Navbar pill | StatusBar message | Terminal? |
|---|---|---|---|
| `assigned`  | Driver Coming    | "Driver is on the way"  | no |
| `arrived`   | Driver Arrived   | "Driver has arrived!"   | no |
| `started`   | Ride In Progress | "Ride in progress"      | no |
| `completed` | Completed (grey) | Goes to RideCompleted   | yes |
| `cancelled` | Cancelled (red)  | Goes to RideCompleted   | yes |

## Conventions

- Tailwind only — no inline styles except Leaflet map height
- All components are `default export`
- `'use client'` sirf wahan jahan `useState`/`useEffect`/events use ho
- Colors: royal blue `#0E1B55` + gold `#D4AF37` theme
- Rounded corners: `rounded-2xl` cards, `rounded-full` pills/buttons
- No `console.log` in committed code

## Common Tasks

**REST refresh interval change karna:**
→ `hooks/useTrackingData.js` → `REFRESH_MS = 30000`

**Naya status add karna:**
→ `components/StatusBar.jsx` → `steps`, `statusMessage`, `stepIndex`
→ `components/Navbar.jsx` → `statusConfig`
→ `hooks/useTrackingData.js` → `TERMINAL` set agar new status terminal hai

**Socket event add karna:**
→ `hooks/useTrackingSocket.js` → naya listener wahan add karo, ref-based callback pattern follow karo

**Map center/zoom change karna:**
→ `components/TrackingMap.jsx` → `map.setView(initialCenter, 15)`

**Share message change karna:**
→ `components/ShareButton.jsx` → `shareWhatsApp` function

**Domain change karna:**
→ `.env.local` → `NEXT_PUBLIC_APP_URL`
