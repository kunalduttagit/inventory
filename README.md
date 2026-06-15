# Inventory

A small inventory & order management app: track products, customers, and orders, with a dashboard of revenue and stock.

Built with **FastAPI** (Python), **Next.js 14** (TypeScript), **PostgreSQL**, and **Docker**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/kunalduttagit/inventory)

---

## Run with Docker

You'll need [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any Docker engine with the `compose` plugin).

```bash
docker compose up -d --build
```

Then open <http://localhost:3000>.

Three containers come up:

| Service  | Port  | What it does           |
| -------- | ----- | ---------------------- |
| frontend | 3000  | Next.js UI             |
| backend  | 8000  | FastAPI (docs at `/docs`) |
| db       | 5432  | PostgreSQL 16          |

## Load sample data (optional)

```bash
./scripts/seed.sh
```

Adds 5 customers, 12 products, and 14 orders spread across the last 7 days — enough to make the dashboard charts useful.

## Stop / reset

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop and wipe the Postgres volume
```

## Project layout

```
backend/    FastAPI app (SQLAlchemy + Pydantic, multi-stage Dockerfile)
frontend/   Next.js 14 app (Tailwind, framer-motion, recharts)
scripts/    seed.sh — sample data
docker-compose.yml
DEPLOYMENT.md   Railway + Vercel deployment guide
```

## Run from published Docker Hub images (no source clone)

```bash
curl -O https://raw.githubusercontent.com/kunalduttagit/inventory/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up -d
```

Then open <http://localhost:3000>.