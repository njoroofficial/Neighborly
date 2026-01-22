# Neighborly - AI Coding Instructions

## Architecture Overview

This is a **neighbor-to-neighbor help platform** with a FastAPI backend and Next.js 16 frontend (App Router).

```
backend/          → FastAPI + SQLModel + SQLite (JWT auth)
frontend/         → Next.js 16 + React 19 + Tailwind + Leaflet maps
```

**Data Flow:** Next.js Server Actions → FastAPI REST API → SQLModel/SQLite

### Key Domain Concepts

- **Users** have lat/lng coordinates and roles ("neighbor")
- **HelpRequests** are geo-located tasks with states: `open` → `in_progress` → `resolved`
- **Messages** enable direct neighbor-to-neighbor chat
- **Reviews** are submitted when resolving a help request (rating 1-5)

## Backend Patterns (FastAPI)

### Model Architecture

- **SQLModel** combines Pydantic + SQLAlchemy in single classes (`models.py`)
- **Schemas** (`schemas.py`) are separate Pydantic models for API input/output validation
- Pattern: `UserCreate` (input) → `User` (DB) → `UserPublic` (response, no password_hash)

### Authentication

- JWT tokens with bcrypt password hashing (`auth/security.py`)
- Protected endpoints use `current_user: User = Depends(get_current_user)`
- Token contains `{"sub": user.email}` and expires in 30 mins

### Geo-filtering Pattern

The codebase uses **Python-side Haversine filtering** (not PostGIS):

```python
# See calculate_distance() in main.py - used for /users/nearby and /requests/nearby
dist = calculate_distance(user1.lat, user1.lon, user2.lat, user2.lon)
if dist <= radius_km:
    nearby.append(user)
```

This works for <1000 users. For scale, migrate to PostGIS.

### Database

- SQLite file: `neighborly.db` (auto-created on startup via lifespan handler)
- Tables created from SQLModel classes in `create_db_and_tables()`
- To reset: delete `neighborly.db` and restart server

## Frontend Patterns (Next.js)

### Server Actions (`app/actions/`)

All API calls go through Server Actions that:

1. Read JWT from `cookies().get("session_token")`
2. Call FastAPI at `http://127.0.0.1:8000`
3. Use `revalidatePath("/dashboard")` to refresh data after mutations

### Map Component (Leaflet)

- `Map.tsx` → dynamic import wrapper (SSR disabled)
- `MapCore.tsx` → actual Leaflet implementation
- Uses external marker icons (CDN) to avoid webpack issues
- Color coding: Blue (user/neighbors), Red (open requests), Orange (in_progress)

### UI Components

Built with **shadcn/ui** pattern (Radix primitives + Tailwind):

```
components/ui/    → Reusable primitives (button, card, dialog, input)
components/       → Feature components (Map, LoginForm, DashboardShell)
```

## Development Workflow

### Starting the Stack

```bash
# Terminal 1: Backend (from /backend)
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Frontend (from /frontend/neighborly-app)
npm install
npm run dev
```

Backend: http://127.0.0.1:8000 | Frontend: http://localhost:3000

### API Documentation

FastAPI auto-generates docs at `/docs` (Swagger) and `/redoc`

## Important Conventions

1. **UUIDs everywhere** - Users and HelpRequests use UUID primary keys
2. **Timestamps as ISO strings** - `datetime.utcnow().isoformat()` stored as `str`
3. **Location denormalization** - HelpRequests copy user's lat/lng at creation time
4. **No password in responses** - Always use `UserPublic` schema, never expose `password_hash`
5. **CORS configured** for localhost:3000 only

## Common Tasks

### Add a new API endpoint

1. Add SQLModel in `models.py` if new table needed
2. Add Pydantic schemas in `schemas.py`
3. Add route in `main.py` with `Depends(get_current_user)` for auth
4. Create matching Server Action in `frontend/.../app/actions/`

### Add a new UI component

1. Check if shadcn/ui primitive exists in `components/ui/`
2. Create feature component in `components/`
3. Use `"use client"` directive only when needed (interactivity, hooks)
