# GoMobility — Live Ride Tracking Website

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000/track/TEST_TOKEN](http://localhost:3000/track/TEST_TOKEN)

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.gomobility.co.in/api/v1
NEXT_PUBLIC_APP_URL=https://track.gomobility.co.in
```

## Deploy to Vercel

```bash
vercel --prod
```

Add domain `track.gomobility.co.in` in Vercel dashboard.