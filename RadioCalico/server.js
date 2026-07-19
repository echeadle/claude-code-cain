const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const metadataUrl = process.env.METADATA_URL || 'https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json';

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
