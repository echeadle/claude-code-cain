# prototype_1 — Local Dev Prototype

Throwaway first-draft prototype for the Udemy "Claude Code: Prototype to Prod" course project
(an online radio station web app). Not the final architecture — the course may explore other
stacks in later lessons before the real project is named, so treat this folder's choices as
scoped to itself, not the whole repo.

## Tech Stack

- Web server: Express.js (Node.js)
- Database: PostgreSQL (via Docker Compose)

## Running Locally

```
docker compose up -d   # starts Postgres
npm start               # starts Express server (npm run dev for auto-reload)
```

Health check: `curl localhost:3000/health`
DB check: `curl localhost:3000/db-check`

## Conventions

- Our default web server for development and testing is Express.js. Start it with `npm start`.
