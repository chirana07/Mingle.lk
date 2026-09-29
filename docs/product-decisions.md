# Product Decisions Log — Project Katha (Mingle.lk)

This document tracks fundamental product and architectural decisions, including rationale, trade-offs, and future validation criteria, to ensure founder clarity and iterative agility.

---

### Decision 1: Interaction Model — "Understand & Connect" over "Endless Swipe Deck"
* **Decision**: Replace the traditional rapid binary swipe (Tinder/Bumble) with an explainable discovery feed featuring interactive "Connection Cards" and conversational prompts.
* **Reason**: Conventional swiping produces superficial matching, swipe fatigue, conversation anxiety, and high match-to-chat drop-offs. In Sri Lanka, users are culturally more hesitant to meet strangers without a sense of shared intent and baseline respect.
* **Alternatives Considered**: Tinder-style swipe cards, Hinge-style like-any-photo, or matrimonial biodata browsing.
* **Trade-Off**: Lower raw swipe volume per session; higher cognitive engagement required per profile.
* **Future Validation Needed**: Measure connection acceptance rate and conversation start rate (>40% target) compared to industry benchmarks (~10-15%).

---

### Decision 2: Location Granularity — Neighborhood/Area instead of Exact GPS Coordinates
* **Decision**: Show approximate locations (e.g., "Colombo 05", "Kandy City", "Within 5 km") and never store or broadcast precise GPS coordinates publicly.
* **Reason**: Privacy and personal security are paramount in Sri Lanka, where tight-knit communities can lead to stalking or unwanted real-world identification.
* **Alternatives Considered**: Real-time distance in meters, live map view, or city-level only.
* **Trade-Off**: Users cannot find someone who is literally in the same coffee shop right this second.
* **Future Validation Needed**: User sentiment surveys regarding safety, particularly among female users.

---

### Decision 3: Matching Algorithm — Transparent Weighted Scoring over Black-Box AI
* **Decision**: Use a configurable, multi-factor weighted scoring engine with natural-language match explanations ("Strong match because you both value quiet weekends and serious relationships") rather than an opaque neural network.
* **Reason**: Users and investors need to know *why* two people were matched. Explainability builds trust and supplies immediate icebreaker material.
* **Alternatives Considered**: Deep learning collaborative filtering, embedding cosine similarity, or random discovery.
* **Trade-Off**: Requires manual tuning of weight vectors initially.
* **Future Validation Needed**: Correlation between match score tier and date conversion rate.

---

### Decision 4: Date Progression & Safety Layer — Integrated "Date Mode" with Trusted Safety Check-In
* **Decision**: Build an explicit bridge from digital chat to real-world meeting with low-pressure date recommendations and private "Share Date Plan" safety check-ins.
* **Reason**: The greatest bottleneck in online dating is matches that stay trapped in endless texting and never meet. In Sri Lanka, anxiety around public safety and venue suitability is high.
* **Alternatives Considered**: Leaving date coordination entirely to external WhatsApp/Instagram chat.
* **Trade-Off**: Additional product surface area to maintain.
* **Future Validation Needed**: % of matches that generate a date plan and post-date comfort feedback scores.

---

### Decision 5: Technical Stack — FastAPI Modular Monolith + Next.js Mobile-First Responsive App
* **Decision**: Build a clean modular monolith using Python FastAPI with PostgreSQL/SQLAlchemy, paired with Next.js 14 (App Router) and Tailwind CSS.
* **Reason**: Rapid time-to-market, outstanding developer ergonomics, native WebSocket support, Pydantic type safety, and zero microservice overhead for early-stage startup validation.
* **Alternatives Considered**: Microservices architecture, Go backend, or pure React Native app.
* **Trade-Off**: Web PWA requires testing across mobile Safari/Chrome viewports rather than native app store binaries initially.
* **Future Validation Needed**: Performance metrics on lower-bandwidth mobile networks in Sri Lanka.
