# 🗺️ Project Katha (Mingle.lk) — Engineering & Product Roadmap

This document outlines our technical milestones, feature roadmap, and team task divisions.

---

## 👥 Suggested Team Task Division

| Area | Lead Focus | Key Responsibilities |
|---|---|---|
| **Frontend Engineer** | Next.js 15, TypeScript, Tailwind, Framer Motion | UI/UX fidelity, mobile PWA responsiveness, real-time chat UI, date proposal flow, i18n |
| **Backend Engineer** | FastAPI, PostgreSQL, SQLAlchemy 2.0 Async | API performance, WebSocket state, matching algorithm tuning, safety heuristics, CI/CD |
| **Product & Growth** | Verification, Curated Venues, Security | Date spot vendor curation (Colombo/Kandy/Galle), SMS gateway (Notify.lk), investor metrics |

---

## 🚀 Sprint 1: Polish & Experience Deepening (Weeks 1–2)

### 🎨 Frontend Work Items
- [ ] **Voice Prompt Cards**: Add an interactive audio player component to profiles so users can record/listen to 15-second voice intros in Sinhala, Tamil, or English.
- [ ] **Discovery Filters Drawer**: Allow users to filter discovery feed by:
  - Province / District (`Western`, `Central`, `Southern`, etc.)
  - Relationship Intent (`Long-term with marriage mindset`, `Intentional dating`, etc.)
  - Lifestyle factors (Vegetarian/Vegan, Non-drinker, Pet friendly)
- [ ] **PWA (Progressive Web App)**: Add `manifest.json`, service worker, and an "Add to Home Screen" prompt for native app feel on iOS/Android browsers.
- [ ] **Date Mode Map Embed**: Integrate Leaflet / Mapbox with OpenStreetMap to display vetted date venues visually with Sri Lankan taxi/tuk-tuk estimates.

### ⚙️ Backend Work Items
- [ ] **Redis WebSocket Scalability**: Replace in-memory `ConnectionManager` with Redis Pub/Sub for distributed chat delivery.
- [ ] **Rate Limiting**: Implement token bucket rate limiting on `/connections/request` and `/auth/register` to prevent spam.
- [ ] **S3 / Cloudflare R2 Uploads**: Replace static avatar URLs with pre-signed URL uploads for user profile photos.
- [ ] **Database Migrations with Alembic**: Configure Alembic migration scripts so schema changes run automatically on deployments.

---

## 🔒 Sprint 2: Trust, Safety & Local Integrations (Weeks 3–4)

### 🛡️ Safety & Verification
- [ ] **Sri Lankan NIC / ID Verification**:
  - Secure, privacy-preserving national identity document verification (blurring sensitive numbers, verifying age and name only).
  - Blue "Katha Verified" trust badge on profiles.
- [ ] **Emergency SMS Gateway**:
  - Integrate Sri Lankan SMS providers (Notify.lk or Dialog IdeaMart / Mobitel mCash API) to send automated check-in SMS to emergency contacts when Date Mode begins.
- [ ] **Reputation & Conduct Score**:
  - Calculate dynamic user reputation score based on positive date check-ins, zero reports, and prompt response rates.

---

## 💳 Sprint 3: Monetization & Partner Network (Weeks 5–6)

### 💰 Revenue Engine
- [ ] **Katha Intent Pass (PayHere / Genie Integration)**:
  - Local Sri Lankan payment gateway integration (PayHere, WEBXPAY, or Genie).
  - Premium tiers: 5 extra Connection Cards/week, view who engaged with your cards, prioritized discovery.
- [ ] **Date Spot Partner Portal**:
  - Dedicated vendor dashboard for approved cafes, tea lounges, and galleries in Colombo, Galle Fort, and Kandy.
  - Exclusive Katha couple discounts (e.g., 15% off first date bill at Black Cat Cafe, Barefoot, or The Dutch Hospital).

---

## 📊 Sprint 4: Native Mobile & International Expansion

- [ ] **React Native / Expo Port**: Package the mobile web experience into iOS App Store and Google Play Store builds.
- [ ] **Diaspora Mode**: Enable Sri Lankan diaspora daters in the UK, Australia, Canada, UAE, and US to connect with verified singles back home.
