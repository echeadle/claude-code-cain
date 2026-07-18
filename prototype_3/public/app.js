const STREAM_URL = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';
const COVER_URL = 'https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg';

const audio = document.getElementById('player');
const status = document.getElementById('status');
const listenBtn = document.getElementById('listen-btn');
const backdrop = document.getElementById('backdrop');

if (audio.canPlayType('application/vnd.apple.mpegurl')) {
  // Native HLS support (e.g. Safari)
  audio.src = STREAM_URL;
  status.textContent = 'Ready (native HLS).';
} else if (window.Hls && Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(STREAM_URL);
  hls.attachMedia(audio);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    status.textContent = 'Ready (hls.js).';
  });
  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      status.textContent = `Stream error: ${data.type}`;
    }
  });
} else {
  status.textContent = 'HLS playback is not supported in this browser.';
}

listenBtn.addEventListener('click', () => {
  audio.play().catch(() => {
    status.textContent = 'Press the player\'s play button to start.';
  });
});

let lastCoverKey = null;

async function refreshNowPlaying() {
  let data;
  try {
    const response = await fetch('/api/now-playing');
    data = await response.json();
  } catch (err) {
    return;
  }

  document.getElementById('np-title').textContent = data.title || 'Unknown title';
  document.getElementById('np-artist').textContent = data.artist || 'Unknown artist';
  document.getElementById('np-album').textContent = data.album
    ? `${data.album}${data.date ? ' (' + data.date + ')' : ''}`
    : '';

  const coverKey = `${data.artist || ''}|${data.title || ''}|${data.album || ''}`;
  if (coverKey !== lastCoverKey) {
    lastCoverKey = coverKey;
    const coverSrc = `${COVER_URL}?t=${Date.now()}`;
    const cover = document.getElementById('np-cover');
    cover.src = coverSrc;
    cover.alt = `${data.title || 'Album art'} — ${data.artist || ''}`;
    backdrop.style.backgroundImage = `url(${coverSrc})`;
  }

  const list = document.getElementById('rp-list');
  list.textContent = '';
  for (let i = 1; i <= 5; i++) {
    const prevArtist = data[`prev_artist_${i}`];
    const prevTitle = data[`prev_title_${i}`];
    if (!prevArtist && !prevTitle) continue;
    const li = document.createElement('li');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'rp-title';
    titleSpan.textContent = prevTitle || 'Unknown title';

    const artistSpan = document.createElement('span');
    artistSpan.className = 'rp-artist';
    artistSpan.textContent = prevArtist || 'Unknown artist';

    li.appendChild(titleSpan);
    li.appendChild(artistSpan);
    list.appendChild(li);
  }
}

refreshNowPlaying();
setInterval(refreshNowPlaying, 15000);
