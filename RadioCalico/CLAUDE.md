# RadioCalico — Real Application (not a prototype)

This is the actual production build for the Udemy "Claude Code: Prototype to Prod" course
project, distinct from the throwaway `prototype_1/2/3/` folders at the repo root. Built
following the course lesson-by-lesson, so features arrive incrementally as the course
introduces them — don't get ahead of what's been explicitly asked for, even if a working
pattern already exists from an earlier prototype.

## Directory Structure

```text
RadioCalico/
├── CLAUDE.md
├── package.json
├── package-lock.json
├── server.js          # Express app: static file serving, /health, /api/now-playing proxy
└── public/
    ├── index.html      # page markup only, no inline JS
    ├── app.js           # player + now-playing/previous-tracks logic
    ├── styles.css
    └── logo.png
```

`node_modules/hls.js/dist` is served at the `/vendor` route by `server.js` (not committed,
restored via `npm install`) — this is the source of `public`'s `/vendor/hls.min.js` reference
in `index.html`.

## Tech Stack (current)

- Frontend: Express.js (Node.js), serving a static page + proxying the live metadata endpoint
- Player: `hls.js` (npm package, served locally at `/vendor/hls.min.js`, not a CDN)
- **No backend/database yet.** The plan is Docker containers + PostgreSQL, but that's added
  only when the course reaches that lesson — do not add it preemptively.

## Landing Page

Styled to match `calico/RadioCalicoLayout.png` (the instructor-provided wireframe):

- Dark top bar, centered "Radio [logo] Calico" (logo copied from `calico/RadioCalicoLogoTM.png`
  to `public/logo.png`)
- Two-column now-playing area: large square cover art (left), artist/title/album + source/stream
  quality lines + a custom player bar (right)
- Full-width mint-green "Previous tracks" band below, listing `Artist: Title`

Live data (real, not placeholder): HLS playback of the actual RadioCalico stream, and
now-playing/previous-tracks from the live metadata endpoint — same external sources as
`prototype_3`, fetched fresh here (no code copied from the prototype's backend).

The player bar is a **custom UI**, not native `<audio controls>`: play/pause button, elapsed
time (`Xs / Live`, since it's a live stream with no fixed duration), mute button, volume slider
— all built in `public/app.js` against a hidden `<audio>` element.

"Rate this track: 👍 👎" is present in the layout (matching the wireframe) but the buttons are
**disabled** (`title="Ratings coming soon"`) since rating requires the not-yet-built backend.
Wire these up for real once the ratings API exists here.

### Style Guide

A text version of the styling guide for the webpage is:
/home/echeadle/Projects/coding_projects/udemy/claude-code-cain/calico/RadioCalico_Style_Guide.txt

The radio calico logo is at
/home/echeadle/Projects/coding_projects/udemy/claude-code-cain/calico/RadioCalicoLogoTM.png

## Running Locally

```bash
npm start &   # Express server on http://localhost:3000 (npm run dev for auto-reload)
```

Health check: `curl http://localhost:3000/health`. Open `http://localhost:3000/` and press play.
