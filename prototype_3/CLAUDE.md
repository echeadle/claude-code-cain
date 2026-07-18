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

## Running Locally

```
npm start    # Express server on http://localhost:3000 (npm run dev for auto-reload)
```
Health check: `curl http://localhost:3000/health`

Open `http://localhost:3000/` in a browser and press play to hear the live stream.
