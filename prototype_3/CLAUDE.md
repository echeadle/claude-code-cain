# prototype_3 — Local Dev Prototype

Third throwaway prototype for the Udemy "Claude Code: Prototype to Prod" course project. Scoped
to this folder only, like `prototype_1/` and `prototype_2/`. The real project is confirmed named
RadioCalico (see `calico/` at the repo root for brand assets and the stream URL).

## Tech Stack

- Web server: Express.js (Node.js)
- Player: `hls.js` (npm package, served locally at `/vendor/hls.min.js` — not a CDN)

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

## Design

Page is styled per `calico/RadioCalico_Style_Guide.txt`: CSS variables for the brand palette
(Mint/Forest Green/Teal/Calico Orange/Charcoal/Cream), Montserrat for headings + Open Sans for
body text (Google Fonts), and a blurred/darkened backdrop built from the current track's album
art (`#backdrop`, updates alongside the Now Playing widget). Structure: `public/index.html`
(markup), `public/styles.css` (styling), `public/app.js` (player + widget behavior).

## Running Locally

```
npm start    # Express server on http://localhost:3000 (npm run dev for auto-reload)
```
Health check: `curl http://localhost:3000/health`

Open `http://localhost:3000/` in a browser and press play to hear the live stream.
