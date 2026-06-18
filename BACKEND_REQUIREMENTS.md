# Backend Requirements — Go-Tracking Website

> **Reader:** Backend team
> **Source:** Frontend (`track.gomobility.co.in` — Next.js)
> **Goal:** Existing tracking endpoint me thode additions chahiye. **Koi naya endpoint nahi banana**, koi existing field rename nahi karna. Sirf 4-5 naye fields add karne hain. Pura context isi doc me hai — kuch bhi guess mat karo, pucho.

---

## 1. TL;DR — Bas itna karna hai

1. **`GET /tracking/public/:trackingToken` response me 3 naye fields add karo:**
   - `routes.toDropoff` — Google Directions se pickup→dropoff ka cached route
   - `routes.toPickup` — driver→pickup ka cached route (sirf `assigned`/`arrived` me)
   - `eta` — remaining distance/duration/arrival time
2. **`routeStats` me 2 naye fields add karo:** `plannedDistance`, `plannedDuration`
3. **`location.current` me 2 naye fields forward karo:** `heading`, `speed` (driver-app se aane chahiye)
4. **Optional but recommended:** Socket event `tracking:route-updated` jab `toPickup` recompute ho

**Existing kuch nahi badalna.** Sab additive changes hain. Frontend `routes` na ho to gracefully degrade karta hai (Google se khud fetch kar leta hai client-side — but ye **mahanga** padta hai, isliye ye changes priority hain).

---

## 2. Current state — frontend abhi kya consume karta hai

### 2.1 REST endpoint (existing — DO NOT CHANGE)

```
GET https://api.gomobility.co.in/api/v1/tracking/public/:trackingToken
```

Sample current response (real data, ride completed):

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Tracking data retrieved successfully",
  "data": {
    "rideId": 189,
    "status": "completed",
    "trackingToken": "WpHdNJZJEDZo",
    "driver": {
      "id": 1,
      "name": "Akash Gupta",
      "phone": "9540594976",
      "rating": "3.50",
      "vehicle": {
        "number": "HR01AB1234",
        "type": "auto",
        "color": "Yellow",
        "model": "HR01AB1234"
      }
    },
    "passenger": {
      "id": "918337c4-...",
      "name": "Akash Gupta",
      "phone": "8307017909"
    },
    "location": {
      "pickup":  { "latitude": "30.11751400", "longitude": "77.27923000", "address": "...", "name": null },
      "dropoff": { "latitude": "30.37520110", "longitude": "76.78212200", "address": "...", "name": null },
      "current": { "latitude": "30.11760890", "longitude": "77.27926780", "timestamp": "...", "accuracy": null }
    },
    "fare": { "estimated": "1075.91", "final": "1075.91" },
    "timestamps": { "startedAt": "...", "completedAt": "..." },
    "route": [ /* breadcrumb array of {latitude, longitude, timestamp, accuracy} */ ],
    "routeStats": {
      "totalDistance": 0.02,
      "totalDuration": 0,
      "pointCount": 13,
      "startTime": "...",
      "endTime": "..."
    }
  }
}
```

### 2.2 Status flow

```
assigned → arrived → started → completed
                              ↘ cancelled (any time)
```

### 2.3 Socket.IO events (existing — DO NOT CHANGE)

- Client emits: `tracking:join { trackingToken }`, `tracking:leave`
- Client listens to:
  - `tracking:joined` (ack)
  - `tracking:location-updated { rideId, latitude, longitude, accuracy, timestamp }`
  - `tracking:error { message }`

---

## 3. Frontend kaise display karta hai (context for backend)

| Component | Data uses |
|---|---|
| **TrackingMap** (live) | `location.pickup/dropoff/current`, `route`, `status`. **Currently** Google Directions API ko client-side hit karke pickup→dropoff polyline draw karta hai. |
| **RouteReplayMap** (completed) | Wahi as above, par static replay |
| **Navbar** | `status` |
| **DriverCard** | `driver` |
| **EtaRow** | `fare`, `routeStats.totalDistance/totalDuration` |
| **LocationRow** | `location.pickup.address`, `location.dropoff.address` |

**Cost problem:** Har page load pe frontend Google Directions API hit karta hai. 1 ride link 5 logon ne open kiya → 5 API calls → paise.

**Backend caching karega to:** Backend ek baar compute karega, response me bhej dega, frontend zero API calls karega. **~100x cost saving.**

---

## 4. Required additions — exact spec

### 4.1 `data.routes` (NEW)

```typescript
routes: {
  toDropoff: {
    polyline: string,                // Google encoded polyline (PRIMARY format)
    coords?: [number, number][],     // [[lat, lng], ...] (OPTIONAL fallback)
    distance: number,                // meters
    duration: number,                // seconds
    computedAt: string,              // ISO timestamp
  },
  toPickup?: {                       // OMIT if status is started/completed/cancelled
    polyline: string,
    coords?: [number, number][],
    distance: number,
    duration: number,
    computedAt: string,
    computedFrom: {                  // driver location at compute time
      latitude: string,
      longitude: string
    }
  }
}
```

**Backend compute rules:**

| Field | When to compute | When to recompute | Cache |
|---|---|---|---|
| `toDropoff` | Ride creation (status becomes `assigned`) | **Never** — pickup/dropoff fixed hain | Persistent (DB column ya Redis no-TTL) |
| `toPickup` | Driver assigned hone pe | (a) Driver `computedFrom` se **>300m** door, OR (b) **>60 seconds** purana | Replace previous |

**Status-wise inclusion:**

| status | `toDropoff` | `toPickup` |
|---|---|---|
| `assigned`  | ✅ | ✅ |
| `arrived`   | ✅ | ✅ |
| `started`   | ✅ | ❌ omit |
| `completed` | ✅ | ❌ omit |
| `cancelled` | ✅ (so replay map can still show planned) | ❌ omit |

**Polyline format:** Google Directions API ka response `routes[0].overview_polyline.points` field deta hai — bas wahi string pass kar do. Frontend `google.maps.geometry.encoding.decodePath()` se decode kar lega (SDK already loaded hai).

**Why encoded polyline:** Coords array 500-2000 points × 16 chars per number = ~20-30 KB. Encoded polyline = ~500-1000 bytes. **40x smaller**, mobile data bachta hai.

### 4.2 `data.eta` (NEW)

```typescript
eta?: {
  remainingDistance: number,    // meters from current → next-target
  remainingDuration: number,    // seconds
  arrivalTime: string,          // ISO timestamp
  updatedAt: string             // ISO timestamp
}
```

**Compute logic:**
- `assigned`/`arrived` — `next-target = pickup`
- `started` — `next-target = dropoff`
- `completed`/`cancelled` — `eta` field **omit** karo
- Same refresh trigger as `toPickup` (driver move >300m or 60s)
- Google Directions response ka `routes[0].legs[0].distance/duration` use kar lo — separate API call mat karo

### 4.3 `data.routeStats` me additions

Existing fields **rakho jaise hain** (`totalDistance`, `totalDuration`, etc.), bas ye 2 add karo:

```typescript
routeStats: {
  // existing...
  plannedDistance?: number,     // meters — from Google planned route (one-time)
  plannedDuration?: number,     // seconds — from Google planned route (one-time)
}
```

**Kyu:** Abhi `totalDistance` breadcrumb sum hai → GPS jitter ki wajah se inaccurate. Receipt me Google ka planned distance dikhana zyada accurate.

### 4.4 `data.location.current` me additions

Driver-app se aaye to forward karo:

```typescript
location.current: {
  latitude: string,
  longitude: string,
  timestamp: string,
  accuracy: number | null,
  heading?: number,    // NEW — compass bearing 0-360 (null if unknown)
  speed?: number       // NEW — m/s (null if unknown)
}
```

**Same fields socket event me bhi:**
```
tracking:location-updated {
  rideId, latitude, longitude, accuracy, timestamp,
  heading?, speed?            // NEW
}
```

**Why heading needed:** Frontend abhi previous→current se bearing calculate karta hai for car icon rotation. Driver ruka ho to GPS jitter random hota hai → car icon ghoomta rehta hai. Device compass se accurate hai.

**Driver-app team ko bhi alag ticket banao** — unhe location ping me ye 2 fields add karne hain. Ye sirf forward karna hai.

### 4.5 Socket event (OPTIONAL but nice)

```
tracking:route-updated {
  rideId,
  toPickup?: { polyline, coords?, distance, duration, computedAt, computedFrom },
  eta?: { remainingDistance, remainingDuration, arrivalTime, updatedAt }
}
```

Backend jab `toPickup` recompute kare, emit kare. Frontend immediate update kar dega. **Optional** — REST polling (5s) se bhi mil jayega.

---

## 5. Storage / caching recommendation

### Option A — Redis (recommended)
```
Key: ride:{rideId}:routes
Value: { toDropoff: {...}, toPickup: {...}, etaComputedAt: "..." }
TTL: 24 hours (ya ride completion ke 1 hour baad)
```

### Option B — DB column
```sql
ALTER TABLE rides ADD COLUMN cached_routes JSONB;
ALTER TABLE rides ADD COLUMN routes_updated_at TIMESTAMP;
```

Redis prefer karo — agar bahut sare rides ek saath chal rahe hain to DB queries cheap rehngi.

---

## 6. Google Directions API call (backend ko karna hai)

```
GET https://maps.googleapis.com/maps/api/directions/json
  ?origin=LAT,LNG
  &destination=LAT,LNG
  &mode=driving
  &key=YOUR_SERVER_SIDE_KEY
```

**Important:** Backend ka API key **alag** rakho frontend wale se. Backend key ko **HTTP referrer restriction nahi**, balki **IP restriction** lagao (sirf tumhare AWS backend IPs se kaam kare). Otherwise leak hone pe misuse hoga.

**Response se chahiye:**
```js
const route = response.routes[0];
const polyline = route.overview_polyline.points;     // → routes.toX.polyline
const coords = decodePolyline(polyline);             // optional — frontend decode kar sakta hai
const distance = route.legs[0].distance.value;       // meters
const duration = route.legs[0].duration.value;       // seconds
```

**Pricing:** $5 per 1000 calls. With backend caching (1 call per ride for toDropoff + ~5-10 for toPickup recomputes):
- 1000 rides/day × 11 calls = 11,000 calls = **$55/day = ~₹4,500/day = ₹1.35L/month**
- Without caching (frontend direct): **₹15L+/month**

Sirf ye 1 change = ~₹13L/month savings.

---

## 7. Existing me kya **nahi** badalna (DO NOT TOUCH)

- ❌ Existing field names rename mat karo (`location.pickup`, `route`, `fare.estimated`, etc.)
- ❌ Existing field types mat badlo (`latitude/longitude` strings hain, strings hi rahein)
- ❌ Existing socket event names mat badlo
- ❌ Naya endpoint mat banao — sab kuch existing `GET /tracking/public/:trackingToken` me hi add ho
- ❌ Response envelope ( `{ success, statuscode, message, data }` ) mat badlo
- ❌ Public access pattern (no Authorization header) mat badlo

---

## 8. Priority + estimated effort

| # | Task | Priority | Effort | Saves |
|---|---|---|---|---|
| 1 | `routes.toDropoff` cached in response | **P0** | 1 day | ~80% Google API cost |
| 2 | `routes.toPickup` recompute logic | **P0** | 1.5 days | Driver-coming UX + cost |
| 3 | `location.current.heading/speed` forward (driver-app dependency) | **P0** | 0.5 day backend + 1 day driver-app | Accurate car rotation |
| 4 | `eta` field | **P1** | 0.5 day | Real-time arrival display |
| 5 | `routeStats.plannedDistance/Duration` | **P1** | 0.5 day | Receipt accuracy |
| 6 | Socket `tracking:route-updated` event | **P2** | 0.5 day | Smoother UX (no polling lag) |

**Total backend effort: ~4-5 days** (1 backend dev). Driver-app: separate ticket, 1-2 days.

---

## 9. Acceptance criteria (frontend se confirm hoga)

- [ ] `GET /tracking/public/:trackingToken` response me `data.routes.toDropoff` present in **all** statuses
- [ ] `data.routes.toPickup` present only in `assigned` aur `arrived` statuses
- [ ] `data.routes.toPickup.computedFrom` driver ke pichle location se match karta hai (>300m bhag ho gaya to)
- [ ] Polyline `string` format me hai (encoded), `coords` array optional
- [ ] `data.eta.arrivalTime` ISO timestamp, `assigned/arrived/started` me present
- [ ] `data.location.current.heading` aur `speed` driver-app se aate hi forward ho rahe (null acceptable jab tak driver-app deploy nahi hua)
- [ ] **Existing fields me koi change nahi** — frontend bina kisi modification ke kaam kare additions ke saath

---

## 10. Sample expected response (after all changes)

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Tracking data retrieved successfully",
  "data": {
    "rideId": 189,
    "status": "driver_assigned",
    "trackingToken": "WpHdNJZJEDZo",
    "driver": { "...": "..." },
    "passenger": { "...": "..." },
    "location": {
      "pickup":  { "latitude": "30.11751", "longitude": "77.27923", "address": "..." },
      "dropoff": { "latitude": "30.37520", "longitude": "76.78212", "address": "..." },
      "current": {
        "latitude": "30.11760",
        "longitude": "77.27926",
        "timestamp": "2026-06-19T10:30:00.000Z",
        "accuracy": 5,
        "heading": 142.5,
        "speed": 8.2
      }
    },
    "fare": { "estimated": "1075.91", "final": null },
    "timestamps": { "startedAt": null, "completedAt": null },
    "route": [ /* breadcrumb */ ],
    "routeStats": {
      "totalDistance": 0.02,
      "totalDuration": 0,
      "pointCount": 13,
      "plannedDistance": 35000,
      "plannedDuration": 2400,
      "startTime": "...",
      "endTime": null
    },
    "routes": {
      "toDropoff": {
        "polyline": "ynr_DwwapMrCqAhEoBlD...",
        "distance": 35000,
        "duration": 2400,
        "computedAt": "2026-06-17T20:55:00.000Z"
      },
      "toPickup": {
        "polyline": "ynr_DwwapMxC...",
        "distance": 2400,
        "duration": 480,
        "computedAt": "2026-06-19T10:29:30.000Z",
        "computedFrom": { "latitude": "30.11650", "longitude": "77.27800" }
      }
    },
    "eta": {
      "remainingDistance": 2400,
      "remainingDuration": 480,
      "arrivalTime": "2026-06-19T10:38:00.000Z",
      "updatedAt": "2026-06-19T10:30:00.000Z"
    }
  }
}
```

---

## 11. Open questions for backend team

Agar in me kuch unclear hai to frontend (Akash) se confirm karo **before** development start:

1. Redis available hai cluster me ya naya provision karna padega?
2. Google Directions API key kis env var me rakhe (`GOOGLE_DIRECTIONS_API_KEY` suggest)?
3. Cron/worker hai jo driver location updates pe `toPickup` recompute trigger karega, ya request-time pe lazy compute (cache check + refresh if stale)? **Recommendation: lazy compute on REST hit** — simpler, no extra infra.
4. Socket `tracking:route-updated` event — abhi worth karna ya P2 me chhodna?

---

**Last updated:** 2026-06-19
**Frontend repo:** `Go_Tracking_Website` (Next.js, branch `irshad`)
**Frontend lead:** Akash (akashgupta@gomobility.co.in)
