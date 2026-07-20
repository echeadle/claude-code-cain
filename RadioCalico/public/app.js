const STREAM_URL = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';
const COVER_URL = 'https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg';

const audio = document.getElementById('player');
const playBtn = document.getElementById('play-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume');
const timeDisplay = document.getElementById('time-display');

if (audio.canPlayType('application/vnd.apple.mpegurl')) {
  audio.src = STREAM_URL;
} else if (window.Hls && Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(STREAM_URL);
  hls.attachMedia(audio);
}

function formatTime(seconds) {
  const total = Math.floor(seconds || 0);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  playBtn.textContent = '⏸';
});

audio.addEventListener('pause', () => {
  playBtn.textContent = '▶';
});

audio.addEventListener('timeupdate', () => {
  timeDisplay.textContent = `${formatTime(audio.currentTime)} / Live`;
});

muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
});

volumeSlider.addEventListener('input', () => {
  audio.volume = Number(volumeSlider.value);
  if (audio.volume === 0) {
    audio.muted = true;
    muteBtn.textContent = '🔇';
  } else if (audio.muted) {
    audio.muted = false;
    muteBtn.textContent = '🔊';
  }
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

  document.getElementById('np-artist').textContent = data.artist || 'Unknown artist';
  document.getElementById('np-title').textContent = data.date
    ? `${data.title || 'Unknown title'} (${data.date})`
    : data.title || 'Unknown title';
  document.getElementById('np-album').textContent = data.album || '';

  document.getElementById('quality-source').textContent = data.bit_depth && data.sample_rate
    ? `Source quality: ${data.bit_depth}-bit ${(data.sample_rate / 1000).toFixed(1)}kHz`
    : 'Source quality: —';

  document.getElementById('quality-stream').textContent = data.sample_rate
    ? `Stream quality: ${(data.sample_rate / 1000).toFixed(1)}kHz FLAC / HLS Lossless`
    : 'Stream quality: —';

  const coverKey = `${data.artist || ''}|${data.title || ''}|${data.album || ''}`;
  if (coverKey !== lastCoverKey) {
    lastCoverKey = coverKey;
    const coverSrc = `${COVER_URL}?t=${Date.now()}`;
    const cover = document.getElementById('np-cover');
    cover.src = coverSrc;
    cover.alt = `${data.title || 'Album art'} — ${data.artist || ''}`;
  }

  const list = document.getElementById('rp-list');
  list.textContent = '';
  for (let i = 1; i <= 5; i++) {
    const prevArtist = data[`prev_artist_${i}`];
    const prevTitle = data[`prev_title_${i}`];
    if (!prevArtist && !prevTitle) continue;
    const li = document.createElement('li');

    const artistSpan = document.createElement('span');
    artistSpan.className = 'rp-artist';
    artistSpan.textContent = prevArtist || 'Unknown artist';

    const separator = document.createTextNode(': ');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'rp-title';
    titleSpan.textContent = prevTitle || 'Unknown title';

    li.appendChild(artistSpan);
    li.appendChild(separator);
    li.appendChild(titleSpan);
    list.appendChild(li);
  }
}

refreshNowPlaying();
setInterval(refreshNowPlaying, 15000);
