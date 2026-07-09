# 🌍 AmazonRoam

**Explore While You Deploy** — A travel companion app for Amazon employees to discover and plan leisure activities during work trips.

Built for Amazonians, by Amazonians. 🧡

---

## Features

- 🗺️ **Smart Itineraries** — Auto-generated personalized plans based on your interests, work schedule, and available time
- 📍 **Location-Based Discovery** — Find places within your preferred radius using Google Places + Yelp
- 🏢 **Amazon Community** — Tips and ratings from fellow Amazonians who've been there before
- 🎮 **Gamification** — Earn badges and achievements as you explore
- 👥 **Networking** — Connect with Amazonians in the same area (Phase 2)
- 📅 **Work-Aware Planning** — Activities planned around your work schedule

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State | Zustand |
| Animation | Framer Motion |
| Data Fetching | TanStack React Query |
| APIs | Google Places, Yelp Fusion |
| Maps | Mapbox GL (planned) |
| Database | PostgreSQL + Prisma (production) |

---

## Quick Start

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- npm or yarn

### Setup

```bash
# Clone and enter the project
cd amazonroam

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env:
# - GOOGLE_PLACES_API_KEY (from Google Cloud Console)
# - YELP_API_KEY (from Yelp Fusion)
# - NEXT_PUBLIC_MAPBOX_TOKEN (from Mapbox)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### API Keys

| Service | Where to Get |
|---------|-------------|
| Google Places | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — Enable "Places API" |
| Yelp Fusion | [Yelp Developer](https://www.yelp.com/developers/v3/manage_app) — Create an App |
| Mapbox | [Mapbox Account](https://account.mapbox.com/access-tokens/) — Default public token |

> **Note:** The app works without API keys — it falls back to curated mock data for Seattle and Austin.

---

## Project Structure

```
amazonroam/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes (server-side)
│   │   │   ├── itinerary/      # Itinerary generation endpoint
│   │   │   └── places/         # Places search endpoint
│   │   ├── trips/              # Trip pages (new, detail)
│   │   ├── explore/            # Discovery/search page
│   │   ├── community/          # Community tips & reviews
│   │   ├── profile/            # User profile & badges
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home/dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # App shell, navigation
│   │   ├── trip-creation/      # Multi-step trip wizard
│   │   ├── ui/                 # Reusable UI components
│   │   └── providers.tsx       # React Query provider
│   ├── lib/
│   │   ├── api/                # External API integrations
│   │   │   ├── google-places.ts
│   │   │   └── yelp.ts
│   │   ├── itinerary-engine.ts # Itinerary generation logic
│   │   └── store.ts            # Zustand state management
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── docs/                       # Project documentation
├── .env.example                # Environment variable template
├── tailwind.config.ts          # Tailwind + Amazon design tokens
├── package.json
└── README.md
```

---

## Design Philosophy

- **Modern & Minimal** — Clean layouts, generous whitespace
- **Playful Accents** — Colorful category badges, smooth animations
- **Amazon DNA** — Ember orange, familiar patterns, professional foundation
- **Mobile-First** — Designed for phones, works everywhere

---

## Roadmap

| Phase | Features | Target |
|-------|----------|--------|
| ✅ Prototype | Itinerary generation, UI, mock data | July 15, 2025 |
| Phase 1 (MVP) | Real API integration, user accounts, persistence | TBD |
| Phase 2 | Community features, networking, Spotnana integration | TBD |
| Phase 3 | Gamification, native mobile, advanced AI | TBD |

---

## Team

- **Alvi** — Development Lead
- **Lucinda** — Product & Research

---

## License

Internal Amazon use only. Not for external distribution.
