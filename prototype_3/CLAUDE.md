# prototype_3 — Local Dev Prototype

Third throwaway prototype for the Udemy "Claude Code: Prototype to Prod" course project. Scoped
to this folder only, like `prototype_1/` and `prototype_2/`. The real project is confirmed named
RadioCalico (see `calico/` at the repo root for brand assets and the stream URL).

## Tech Stack

- Web server: Express.js (Node.js)
- Player: `hls.js` (npm package, served locally at `/vendor/hls.min.js` — not a CDN)
- Backend API: Flask (Python, via `uv`) + SQLite — same Express+Flask+SQLite split as
  `prototype_2`, added specifically for song ratings (a separate DB from `prototype_2`'s)

## Purpose

A single page (`public/index.html`) embedding an `<audio>` element that plays the live HLS
stream at `https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8` (from `calico/stream_URL.txt`).
Uses native HLS support where available (Safari), falls back to `hls.js` elsewhere. The stream's
master playlist offers a lossless FLAC variant and an AAC fallback variant.

Also includes a "Now Playing" widget (current artist/title/album + album art) and a "Recently
Played" widget (last 5 tracks), polling `GET /api/now-playing` every 15s. That route is an
Express server-side proxy to `https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json` — the
metadata host doesn't send CORS headers, so the browser can't fetch it directly; Express
fetches it server-side and forwards the JSON.

Album art is loaded client-side directly from `https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg`
(cache-busted with a `?t=` timestamp query param, refreshed only when the track actually
changes) — no proxy needed since plain `<img>`/`background-image` loads don't require CORS.

## Song Ratings

Thumbs up/down on the currently playing song, with running totals from all listeners. No login
system exists yet, so "one rating per user" is enforced against an anonymous `visitor_id`
cookie (random UUID, httpOnly, set by Express on first visit) rather than a real account —
revisit this once the real app has auth.

- Flask (`prototype_3/backend/app.py`): `songs` table keyed by `UNIQUE(artist, title)` with
  running `thumbs_up`/`thumbs_down` counters; `ratings` table with `UNIQUE(song_id, visitor_id)`
  to reject a second vote from the same visitor (409 on retry, message + current tally returned).
  `GET /api/songs/rating?artist=&title=&visitor_id=` returns counts + this visitor's existing
  vote (if any); `POST /api/songs/rate` casts a vote.
- Express proxies both (`GET /api/rating`, `POST /api/rate`), attaching/creating the
  `visitor_id` cookie so the browser never talks to Flask directly — same pattern as the
  now-playing metadata proxy.
- Frontend: thumbs buttons in the Now Playing widget, disabled once voted, re-synced on every
  15s now-playing poll (so counts reflect other listeners' votes too, and the buttons reset —
  enabled, unselected — as soon as the track changes).

## Design

Page is styled per `calico/RadioCalico_Style_Guide.txt`: CSS variables for the brand palette
(Mint/Forest Green/Teal/Calico Orange/Charcoal/Cream), Montserrat for headings + Open Sans for
body text (Google Fonts), and a blurred/darkened backdrop built from the current track's album
art (`#backdrop`, updates alongside the Now Playing widget). Structure: `public/index.html`
(markup), `public/styles.css` (styling), `public/app.js` (player + widget behavior).

## Running Locally

Backend (Flask + SQLite), from `prototype_3/backend/`:
```
uv run python app.py    # runs on http://127.0.0.1:5000
```

Frontend (Express), from `prototype_3/`:
```
npm start    # Express server on http://localhost:3000 (npm run dev for auto-reload)
```
Health check: `curl http://localhost:3000/health`. Start the backend before the frontend.

Open `http://localhost:3000/` in a browser and press play to hear the live stream.
