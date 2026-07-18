const crypto = require('crypto');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const metadataUrl = process.env.METADATA_URL || 'https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5000';
const VISITOR_COOKIE = 'visitor_id';

function parseCookies(header) {
  return Object.fromEntries(
    (header || '')
      .split(';')
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=');
        return [pair.slice(0, idx).trim(), decodeURIComponent(pair.slice(idx + 1).trim())];
      })
  );
}

function getVisitorId(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  let visitorId = cookies[VISITOR_COOKIE];
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookie(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }
  return visitorId;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules/hls.js/dist')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/now-playing', async (req, res) => {
  try {
    const response = await fetch(metadataUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'metadata unreachable' });
  }
});

app.get('/api/rating', async (req, res) => {
  const visitorId = getVisitorId(req, res);
  const artist = req.query.artist || '';
  const title = req.query.title || '';

  try {
    const url = new URL(`${apiBaseUrl}/api/songs/rating`);
    url.searchParams.set('artist', artist);
    url.searchParams.set('title', title);
    url.searchParams.set('visitor_id', visitorId);

    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'rating service unreachable' });
  }
});

app.post('/api/rate', async (req, res) => {
  const visitorId = getVisitorId(req, res);
  const { artist, title, album, rating } = req.body || {};

  try {
    const response = await fetch(`${apiBaseUrl}/api/songs/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, title, album, rating, visitor_id: visitorId }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'rating service unreachable' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
