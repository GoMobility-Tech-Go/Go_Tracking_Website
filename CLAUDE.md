# CLAUDE.md — GoMobility Live Tracking Website

## Project

**Go-Tracking** — GoMobility ka live ride tracking website. Passenger apni ride ka link share karta hai, koi bhi bina login ke driver ki live location dekh sakta hai.

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (JSX) — `.jsx` files, no TypeScript even though `tsconfig.json` exists
- **Styling:** Tailwind CSS
- **Map:** Leaflet (dynamic import, SSR-disabled) on OpenStreetMap — no API key
- **Routing:** Google Directions API via `@googlemaps/js-api-loader` — pickup→dropoff road geometry, requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
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
- `data.status` → `requested | driver_assigned | driver_arrived | in_progress | completed | cancelled | expired` (canonical DB names — match backend `socket.server.js:414-422`)
- `data.driver` → `{ id, name, phone, rating, vehicle: { number, type, color, image } }`
- `data.passenger` → `{ id, name, phone }`
- `data.location.pickup` → `{ latitude, longitude, address }`
- `data.location.dropoff` → `{ latitude, longitude, address }`
- `data.location.current` → `{ latitude, longitude, timestamp, accuracy, heading, speed }` (nullable; `heading`/`speed` null until driver-app deploys)
- `data.fare` → `{ estimated, final }`
- `data.timestamps` → `{ startedAt, completedAt }`
- `data.route` → array of `{ latitude, longitude, timestamp, accuracy }`
- `data.routeStats` → `{ totalDistance, totalDuration, pointCount, startTime, endTime, plannedDistance (m), plannedDuration (s) }`
- `data.routes.toDropoff` → `{ polyline (Google encoded), distance (m), duration (s), computedAt }` — present in all statuses
- `data.routes.toPickup` → same shape + `computedFrom { latitude, longitude }` — present **only** in `driver_assigned`/`driver_arrived`
- `data.eta` → `{ remainingDistance (m), remainingDuration (s), arrivalTime, updatedAt }` — omitted in `completed`/`cancelled`/`expired`

Errors come back as `{ success: false, statuscode, message, data: {} }`. `lib/api.js` treats messages matching `/not found|tracking disabled|invalid/i` as `NOT_FOUND`.

### REST: Route History
```
GET /tracking/public/:trackingToken/history
```

### Socket.IO Events
- **Client emits:** `tracking:join` `{ trackingToken }` on connect, `tracking:leave` on unmount.
- **Client listens:**
  - `tracking:joined` (confirmation)
  - `tracking:location-updated` `{ rideId, latitude, longitude, accuracy, heading, speed, timestamp }`
  - `tracking:route-updated` `{ rideId, toPickup?, eta? }` — fired when backend recomputes `toPickup` or refreshes ETA (driver moved >300m or cache >60s). Not on every ping.
  - `tracking:error` `{ message }`
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
  EtaRow.jsx        # 3 boxes: ETA/Duration | Fare | Remaining/Distance — prefers data.eta over breadcrumb stats
  LocationRow.jsx   # Pickup & dropoff addresses (reads from object.address)
  ShareButton.jsx   # WhatsApp + Copy link + Native share
  RideCompleted.jsx # Terminal screen — map shows actual route replay + floating receipt panel
  RouteReplayMap.jsx# Static Leaflet map: breadcrumb (gold) + Google planned (dashed blue) + A/B pins
  LoadingScreen.jsx # Skeleton loader

lib/
  status.js         # STATUS constants + isTerminal() + isPreAssignment() — canonical names match backend DB

hooks/
  useTrackingData.js    # Hybrid: REST initial + 30s refresh, merges socket-fed current location
  useTrackingSocket.js  # Socket.IO lifecycle — join/leave/listeners

lib/
  api.js                # fetchTrackingData(), fetchRouteHistory(), exports API_HOST
  directions.js         # decodePolyline(encoded) → [[lat,lng]]; fetchDirections() fallback for missing backend routes
```

## Key Decisions

- **Leaflet SSR:** `TrackingMap` is loaded via `dynamic(() => import(...), { ssr: false })` — Leaflet needs `window`.
- **Realtime first, REST as backup:** Live driver location ab socket se aati hai (`tracking:location-updated`). REST sirf initial snapshot + 30s pe status/route refresh ke liye.
- **Socket disables on terminal:** `useTrackingData` socket ko `enabled: !isTerminal` deta hai — `completed`/`cancelled` pe socket disconnect.
- **Location merge:** Jab REST refresh aata hai, agar prev (socket) ka `current.timestamp` REST ke timestamp se naya hai, prev wala rakhte hain — staleness prevent.
- **Map markers from real coords:** `TrackingMap` ab `pickup.latitude/longitude` aur `dropoff.latitude/longitude` use karta hai (pehle current se fake offsets the).
- **Auto-fit bounds:** First paint pe pickup/dropoff/driver sab fit karne ke liye `map.fitBounds`.
- **Planned route via backend cache (primary), client Google as fallback:** Backend `data.routes.toDropoff.polyline` (Google encoded) primary source — frontend `decodePolyline()` se decode karke draw karta hai. Backend ek baar compute karke Redis me cache karta hai → 100x cost saving vs client direct call. Fallback: `fetchDirections()` client-side call sirf jab backend response me `routes` field absent ho (defensive). Style: white outline + royal-blue stroke. Breadcrumb (`route` prop) gold solid overlay = actual traveled path. **Google API key** HTTP-referrer + API restrict karna zaroori (`track.gomobility.co.in/*`, `localhost:3000/*`, only Directions API + Maps JavaScript API).
- **Driver→Pickup route (driver_assigned/driver_arrived):** `data.routes.toPickup.polyline` available ho to dotted green line dikhati hai TrackingMap me — passenger ko clear ho ki driver kahaan se aa raha. Backend recompute karta hai driver 300m+ move kare ya 60s purana ho jaye. Socket event `tracking:route-updated` smooth refresh karta hai REST polling se pehle.
- **Live ETA:** `data.eta.remainingDuration/arrivalTime` se EtaRow live remaining minutes + "Arrives HH:MM" dikhata hai. `eta` na ho to planned/breadcrumb se fall back.
- **Receipt accuracy:** `RideCompleted` me distance `routeStats.plannedDistance` (Google) se aata hai (breadcrumb sum me GPS jitter rehta hai). Duration `completedAt - startedAt` actual elapsed time se calculate hota hai.
- **Driver heading from device:** `location.current.heading` aaye to car icon rotation me prefer karte hain (device compass = stationary me bhi accurate). Fall back: prev→curr LL se bearing compute.
- **Smooth driver animation:** Marker ko previous → new LL pe `requestAnimationFrame` se ~1.2s ease-in-out interpolate karte hain, aur car emoji ko bearing direction me rotate karte hain (`bearing - 90deg` since 🚗 right-facing default).
- **Auto-follow + Recenter button:** Map ride me driver ko pan-follow karta hai. User drag/zoom kare to follow disable; bottom-right "🎯" button se manually recenter.
- **Completed/cancelled ride = route replay, not just receipt:** `RideCompleted` ab `RouteReplayMap` ko prominently dikhata hai (desktop: full-screen + floating right panel; mobile: 45vh top + scroll below). Breadcrumb gold solid line, planned route blue dashed background (backend `routes.toDropoff.polyline` decoded), A/B pins, start/end dots.

## Environment Variables

`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.gomobility.co.in/api/v1
NEXT_PUBLIC_APP_URL=https://track.gomobility.co.in
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-cloud-console-key>
```

> `API_HOST` is derived by stripping `/api/v1` from `NEXT_PUBLIC_API_BASE_URL` — socket connects to bare host.

## Ride Status Flow

Status names mirror backend DB enum (see `lib/status.js`):

```
requested → driver_assigned → driver_arrived → in_progress → completed
                                                            ↘ cancelled (at any point)
                                                            ↘ expired (link TTL)
```

| status | Navbar pill | StatusBar message | Terminal? |
|---|---|---|---|
| `requested`        | Finding Driver    | "Finding a driver"          | no (no driver yet) |
| `driver_assigned`  | Driver Coming     | "Driver is on the way"      | no |
| `driver_arrived`   | Driver Arrived    | "Driver has arrived!"       | no |
| `in_progress`      | Ride In Progress  | "Ride in progress"          | no |
| `completed`        | Completed (grey)  | Goes to RideCompleted       | yes |
| `cancelled`        | Cancelled (red)   | Goes to RideCompleted       | yes |
| `expired`          | Link Expired      | Goes to RideCompleted       | yes |

**Single source of truth:** `lib/status.js` exports `STATUS` constants + `isTerminal()` + `isPreAssignment()`. Update only there if backend ever changes.

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
→ `lib/status.js` → `STATUS` constants + add to `TERMINAL_STATUSES` if terminal
→ `components/StatusBar.jsx` → `steps`, `statusMessage`, `stepIndex`
→ `components/Navbar.jsx` → `statusConfig`
→ `components/RideCompleted.jsx` → add variant if terminal

**Socket event add karna:**
→ `hooks/useTrackingSocket.js` → naya listener wahan add karo, ref-based callback pattern follow karo

**Map center/zoom change karna:**
→ `components/TrackingMap.jsx` → `map.setView(initialCenter, 15)`

**Share message change karna:**
→ `components/ShareButton.jsx` → `shareWhatsApp` function

**Domain change karna:**
→ `.env.local` → `NEXT_PUBLIC_APP_URL`
