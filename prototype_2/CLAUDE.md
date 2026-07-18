# prototype_2 — Local Dev Prototype

Second throwaway prototype for the Udemy "Claude Code: Prototype to Prod" course project (an
online radio station web app). Not the final architecture — scoped to this folder only, like
`prototype_1/`.

## Tech Stack

- Frontend / web server: Express.js (Node.js) — serves the frontend and proxies API status checks
- Backend API: Flask (Python)
- Database: SQLite

## Python Convention

Always use `uv` for Python in this folder (and anywhere else Python is used in this project) —
never the system Python. The backend's virtual environment and dependencies are managed via
`uv` (`pyproject.toml` / `uv.lock`), not `pip`/`venv` directly.

## Running Locally

Backend (Flask + SQLite), from `prototype_2/backend/`:
```
uv run python app.py    # runs on http://127.0.0.1:5000
```
Health check: `curl http://127.0.0.1:5000/health`
DB check: `curl http://127.0.0.1:5000/api/db-check`

Frontend (Express), from `prototype_2/frontend/`:
```
npm start                # runs on http://localhost:3000 (npm run dev for auto-reload)
```
Health check: `curl http://localhost:3000/health`
Proxied backend check: `curl http://localhost:3000/api-status`

Start the backend before the frontend so `/api-status` has something to reach.

## Architecture

Express (frontend) is the only server the browser talks to directly for the page itself; it
calls the Flask API server-side (via `/api-status`) rather than the browser calling Flask
directly. Flask owns the SQLite database.
