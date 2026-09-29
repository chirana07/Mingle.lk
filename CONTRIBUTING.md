# 🤝 Contributing to Project Katha (Mingle.lk)

Welcome to the team! We are building a genuinely differentiated, intentional relationship discovery platform tailored for the realities of modern Sri Lanka.

Whether you're developing backend APIs, polishing micro-animations, or expanding our curated safe dating network, this guide will get you up and running quickly.

---

## ⚡ 5-Minute Quickstart

### Prerequisites
- **Git**
- **Python 3.10+** (with `pip` and `venv`)
- **Node.js 20+** (or 18+) & **npm**
- **PostgreSQL 14+** (running locally on port 5432) OR **Docker & Docker Compose**

### Setup Option A: One-Command Local Setup (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/chirana07/Mingle.lk.git
cd Mingle.lk

# 2. Run the automated setup script
make setup
# OR: ./setup.sh
```
*This automatically sets up Python virtualenv, installs all backend & frontend dependencies, copies `.env.example` to `.env`, creates the database tables, and seeds 102 realistic Sri Lankan profiles.*

### Setup Option B: Docker Compose
```bash
make docker-up
# OR: docker compose up --build
```

---

## 🏃 Running Development Servers

Once setup is complete, run the two services in separate terminals:

```bash
# Terminal 1 — Backend (FastAPI with hot reload on port 8000)
make dev-backend
# Or: ./venv/bin/uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — Frontend (Next.js 15 on port 3000)
make dev-frontend
# Or: cd frontend && npm run dev -- -p 3000
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🌿 Git & Branching Strategy

We follow a clean, trunk-based feature branch workflow. **Never push directly to `main`**.

### 1. Branch Naming Convention
Create descriptive branches originating from `main`:
- `feat/feature-name` (e.g. `feat/audio-voice-prompts`, `feat/kandy-safe-spots`)
- `fix/bug-name` (e.g. `fix/chat-timestamp-timezone`, `fix/connection-badge-count`)
- `refactor/scope` (e.g. `refactor/matching-weights-cache`)
- `docs/topic` (e.g. `docs/api-contracts`)

```bash
git checkout main
git pull origin main
git checkout -b feat/my-new-feature
```

### 2. Conventional Commit Messages
Write clear, imperative commit messages:
- `feat: add WhatsApp share link for date safety plans`
- `fix: correct Sinhala pluralization on card responses`
- `test: add integration test for date recommendation filter`
- `chore: update tailwind dependencies`

### 3. Submitting a Pull Request
1. Ensure all tests pass:
   ```bash
   make test
   cd frontend && npm run build
   ```
2. Push your branch:
   ```bash
   git push origin feat/my-new-feature
   ```
3. Open a Pull Request on GitHub against `main`. Fill in the PR template.
4. Request review from team members. Once approved and CI checks pass, merge via **Squash and Merge**.

---

## 🏗️ Architecture & Coding Standards

### Backend (FastAPI + SQLAlchemy Async + Pydantic v2)
- **Location**: `backend/app/`
- **Asynchronous throughout**: All database operations and handlers must use `async`/`await` with `AsyncSession`.
- **Timezones**: Always use `DateTime(timezone=True)` and `datetime.now(timezone.utc)`. Never use naive datetimes.
- **Pydantic v2**: Use `model_config = ConfigDict(from_attributes=True)` instead of legacy v1 `class Config:`.
- **Security**: Never commit secrets or raw passwords. Passwords are hash-verified with `bcrypt`.

### Frontend (Next.js 15 + TypeScript + Tailwind CSS)
- **Location**: `frontend/src/`
- **Type Safety**: Strictly define types in `frontend/src/lib/types.ts`. Avoid `any`.
- **Design System**: Mobile-first responsive layout (max-w-md centered on desktop with investor side-panel).
- **Micro-interactions**: Use `framer-motion` for animated transitions and `sonner` for notifications.
- **Sri Lankan Cultural Nuances**:
  - Keep location representations neighborhood-level (e.g., "Kollupitiya, Colombo 03", "Peradeniya, Kandy") to preserve safety.
  - Multilingual support: whenever adding UI text, add corresponding keys to `frontend/src/i18n/en.json`, `si.json`, and `ta.json`.

---

## 🧪 Testing Guidelines

Before opening a PR, always execute the automated test suite:

```bash
# Run backend test suite
make test

# Run frontend build check (validates TypeScript types & builds without errors)
cd frontend && npm run build
```

---

## 🛠️ Useful Make Commands

| Command | Action |
|---|---|
| `make help` | Display available commands |
| `make setup` | Run full one-click local developer environment setup |
| `make dev-backend` | Start FastAPI backend with hot reloading on port 8000 |
| `make dev-frontend` | Start Next.js frontend with hot reloading on port 3000 |
| `make seed` | Re-seed 100+ profiles and demo chat data |
| `make test` | Run pytest automated test suite |
| `make docker-up` | Start all services via Docker |
| `make docker-down` | Stop Docker containers |

---

## 💬 Communication & Questions
- For technical ideas or questions, use GitHub Discussions or open an issue labeled `question`.
- For bug reports, open a bug report issue with reproduction steps.
