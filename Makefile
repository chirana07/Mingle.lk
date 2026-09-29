.PHONY: help setup dev-backend dev-frontend seed test docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make setup         - Run full one-click local developer environment setup"
	@echo "  make dev-backend   - Start FastAPI backend with hot reloading on port 8000"
	@echo "  make dev-frontend  - Start Next.js frontend with hot reloading on port 3000"
	@echo "  make seed          - Seed 100+ realistic Sri Lankan profiles and demo matches"
	@echo "  make test          - Run full backend test suite"
	@echo "  make docker-up     - Start all services (PostgreSQL, Backend, Frontend) with Docker"
	@echo "  make docker-down   - Stop Docker containers"

setup:
	./setup.sh

dev-backend:
	./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev -- -p 3000

seed:
	PYTHONPATH=. ./venv/bin/python3 -m backend.seed.seed_data

test:
	./venv/bin/pytest backend/tests -v

docker-up:
	docker compose up --build

docker-down:
	docker compose down
