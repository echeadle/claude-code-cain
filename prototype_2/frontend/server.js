const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api-status', async (req, res) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/db-check`);
    const data = await response.json();
    res.json({ frontend: 'ok', backend: data });
  } catch (err) {
    res.status(502).json({ frontend: 'ok', backend: 'unreachable' });
  }
});

app.post('/users', async (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();

  try {
    const response = await fetch(`${apiBaseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email }),
    });
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).send(
        `<p>Error: ${escapeHtml(data.message || 'could not create user')}</p><p><a href="/add-user">Back</a></p>`
      );
      return;
    }

    res.send(
      `<p>User created: ${escapeHtml(data.username)} (${escapeHtml(data.email)})</p><p><a href="/add-user">Add another</a></p>`
    );
  } catch (err) {
    res.status(502).send('<p>Error: backend unreachable</p><p><a href="/add-user">Back</a></p>');
  }
});

app.listen(port, () => {
  console.log(`Frontend listening on port ${port}`);
});
