# TrainAI - AI-Powered Training Optimization

AI-guided training optimization for triathlon and marathon athletes. Analyze Garmin watch data, track performance metrics, and get personalized coaching powered by Claude AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![AI SDK](https://img.shields.io/badge/AI_SDK-v6-blue?logo=vercel)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

## Overview

TrainAI combines sports science with AI to give endurance athletes the kind of data-driven coaching that was previously only available through expensive human coaches. Import your Garmin data, and the app calculates your training load metrics, visualizes your fitness trends, and uses Claude to provide personalized training recommendations.

### Key Features

- **Performance Management Chart (PMC)** — Track Chronic Training Load (CTL/fitness), Acute Training Load (ATL/fatigue), and Training Stress Balance (TSB/form) over time
- **AI Training Coach** — Chat with an AI coach that understands your current fitness state, training history, and race goals
- **Structured Training Plans** — Generate AI-powered weekly training plans with day-by-day workout prescriptions
- **Garmin FIT File Import** — Parse raw Garmin FIT files to extract heart rate, pace, power, cadence, and GPS data
- **Training Load Analytics** — Weekly TSS breakdown by sport (swim/bike/run), heart rate zone distribution analysis
- **Race Countdown & Periodization** — Automatic phase detection (Base → Build → Peak → Taper) based on goal race date

## Screenshots

The app features a dark-mode dashboard with four main sections:

| Dashboard | AI Coach | Training Plan | Import |
|-----------|----------|---------------|--------|
| PMC chart, metrics cards, zone distribution, activity table | Chat interface with streaming AI responses | Structured weekly plan with workout details | Drag & drop FIT file upload |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server Components, streaming, API routes |
| **UI** | shadcn/ui + Tailwind CSS 4 | Component system with dark mode |
| **Charts** | Recharts v3 | PMC, training load, zone distribution |
| **AI** | Vercel AI SDK v6 | Streaming chat, structured output generation |
| **AI Model** | Claude (via AI Gateway) | Training analysis and coaching |
| **Data Parsing** | fit-file-parser | Garmin FIT file decoding |
| **Database** | Drizzle ORM + Neon Postgres | Schema ready for production (demo mode uses in-memory data) |
| **Deployment** | Vercel | Optimized serverless deployment |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- An Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/RPLogic-Inc/Tarin-AI.git
cd Tarin-AI

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Your Anthropic API key |
| `DATABASE_URL` | No (demo mode works without it) | Neon Postgres connection string |

If deploying to Vercel with AI Gateway enabled, no API key is needed — authentication is handled via OIDC automatically.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Architecture

### Training Science Engine

The core training calculations in `src/lib/training.ts` implement established sports science models:

- **TSS (Training Stress Score)** — Quantifies training load from heart rate or power data using intensity factor relative to threshold
- **TRIMP (Training Impulse)** — Banister's formula for HR-based training load calculation
- **CTL/ATL/TSB** — Exponentially weighted moving averages (42-day and 7-day time constants) that model fitness, fatigue, and form
- **Heart Rate Zones** — Coggan zones based on lactate threshold heart rate (LTHR)

```
CTL (Fitness) = yesterday's CTL + (today's TSS - yesterday's CTL) / 42
ATL (Fatigue) = yesterday's ATL + (today's TSS - yesterday's ATL) / 7
TSB (Form)    = CTL - ATL
```

### AI Coaching System

The AI coach receives a dynamically built system prompt (`src/lib/ai-coach.ts`) containing:

1. **Athlete profile** — Age, thresholds (HR, pace, power), VO2max, available hours
2. **Current fitness state** — Today's CTL, ATL, TSB, and ramp rate
3. **Training history** — Last 4 weeks of volume and TSS by sport
4. **Race context** — Goal race, weeks out, and current periodization phase
5. **Coaching guidelines** — Evidence-based rules for polarized training, load management, taper protocols

The structured plan generator uses `generateText` with `Output.object()` to produce typed training plans with per-day workout prescriptions.

### Data Flow

```
Garmin Watch → FIT File Export → Upload to TrainAI
                                       ↓
                               FIT Parser (fit-file-parser)
                                       ↓
                               Activity Records (HR, pace, power, GPS)
                                       ↓
                               Training Calculations (TSS, zones)
                                       ↓
                        ┌──────────────┼──────────────┐
                        ↓              ↓              ↓
                   PMC Engine     Zone Analyzer   AI Context Builder
                   (CTL/ATL/TSB)  (distribution)  (system prompt)
                        ↓              ↓              ↓
                   Dashboard       Zone Chart     Claude AI Coach
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streaming AI chat endpoint
│   │   └── analyze/route.ts       # Structured training plan generation
│   ├── coach/page.tsx             # AI coach chat page
│   ├── import/page.tsx            # FIT file import page
│   ├── plan/page.tsx              # Training plan generator page
│   ├── layout.tsx                 # Root layout with sidebar
│   └── page.tsx                   # Dashboard
├── components/
│   ├── chat/
│   │   └── chat-interface.tsx     # AI chat with streaming
│   ├── dashboard/
│   │   ├── metrics-cards.tsx      # CTL, TSB, weekly TSS, race countdown
│   │   ├── pmc-chart.tsx          # Performance Management Chart
│   │   ├── training-load-chart.tsx # Weekly TSS by sport
│   │   ├── zone-distribution.tsx  # HR zone breakdown
│   │   └── activity-table.tsx     # Recent activities
│   ├── import/
│   │   └── file-upload.tsx        # Drag & drop FIT uploader
│   ├── layout/
│   │   └── sidebar.tsx            # Navigation sidebar
│   └── ui/                        # shadcn/ui components
├── db/
│   └── schema.ts                  # Drizzle ORM schema (Neon Postgres)
└── lib/
    ├── ai-coach.ts                # System prompt builder for Claude
    ├── demo-data.ts               # 90 days of generated training data
    ├── fit-parser-util.ts         # Garmin FIT file parsing
    ├── training-context.tsx       # React context for training state
    ├── training.ts                # TSS, CTL/ATL/TSB, TRIMP, zones
    └── types.ts                   # TypeScript type definitions
```

## Key Metrics Explained

| Metric | What It Measures | Target Range |
|--------|-----------------|--------------|
| **CTL** (Chronic Training Load) | Long-term fitness (42-day average) | Higher = more fit. Ramp 3-7 TSS/week |
| **ATL** (Acute Training Load) | Short-term fatigue (7-day average) | Spikes after hard training blocks |
| **TSB** (Training Stress Balance) | Freshness = CTL - ATL | -10 to -30 = productive; +5 to +25 = race-ready |
| **TSS** (Training Stress Score) | Single-session training load | 50-70/hr easy; 90-110/hr threshold |
| **TRIMP** | HR-based training impulse | Weighted by intensity and duration |

## Importing Garmin Data

### From Garmin Connect Web

1. Go to **Activities → All Activities**
2. Open an activity
3. Click the **gear icon** (top right) → **Export Original**
4. Upload the `.FIT` file in the Import page

### Bulk Export

1. Go to [garmin.com/account](https://www.garmin.com/account) → **Manage Your Data**
2. Request a data export
3. Extract the zip and upload the `.FIT` files from the `Activities` folder

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

For AI features, either:
- Enable **AI Gateway** in your Vercel project settings (recommended — no API key needed)
- Or set `ANTHROPIC_API_KEY` in your Vercel environment variables

### Database Setup

To move beyond demo data, provision a Neon Postgres database:

```bash
vercel integration add neon
vercel env pull .env.local
```

Then uncomment the schema in `src/db/schema.ts` and run migrations with Drizzle Kit.

## Future Roadmap

- [ ] Garmin Connect API integration (OAuth-based automatic sync)
- [ ] Strava API integration
- [ ] Workout push to Garmin calendar via Training API
- [ ] Multi-user authentication with Clerk
- [ ] Persistent training history in Neon Postgres
- [ ] HRV and recovery tracking
- [ ] Race prediction models
- [ ] Nutrition planning integration

## License

MIT

## Acknowledgments

- Training science models based on work by Andrew Coggan (TSS/IF), Eric Banister (TRIMP/impulse-response), and Stephen Seiler (polarized training)
- [Garmin FIT SDK](https://developer.garmin.com/fit) for the activity file format specification
- [Vercel AI SDK](https://ai-sdk.dev) for the streaming AI infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the component system
