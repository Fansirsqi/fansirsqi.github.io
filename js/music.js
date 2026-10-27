'use strict';

(() => {
  const widget = document.getElementById('site-music');
  if (!widget || widget.dataset.initialized) return;
  widget.dataset.initialized = 'true';

  const status = widget.querySelector('.site-music-status');
  const message = status.querySelector('[role="status"]');
  const retry = status.querySelector('button');
  const link = status.querySelector('a');
  const { api, server, type, id } = widget.dataset;
  if (server === 'netease' && type === 'playlist') {
    link.href = `https://music.163.com/#/playlist?id=${encodeURIComponent(id)}`;
  } else {
    link.hidden = true;
  }

  async function loadMusic() {
    retry.hidden = true;
    status.hidden = false;
    message.textContent = '音乐加载中…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      if (typeof window.APlayer !== 'function') throw new Error('APlayer unavailable');
      const values = { server, type, id };
      const url = api.replace(/:(server|type|id)\b/g, (_, key) => encodeURIComponent(values[key]));
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Music HTTP ${response.status}`);
      const audio = await response.json();
      if (!Array.isArray(audio) || !audio.length || audio.some(track => !track || typeof track.url !== 'string' || !track.url)) {
        throw new Error('Empty or invalid playlist');
      }

      // This container is outside NexT's PJAX replacement regions.
      widget.aplayer = new window.APlayer({
        container: document.getElementById('site-music-player'),
        audio,
        fixed: true,
        autoplay: false,
        theme: '#409EFF',
        listFolded: true,
        preload: 'none',
        lrcType: 3,
        mutex: true,
        storageName: 'metingjs'
      });
      status.hidden = true;
    } catch {
      message.textContent = '音乐暂不可用，可重试或前往歌单收听。';
      retry.hidden = typeof window.APlayer !== 'function';
    } finally {
      clearTimeout(timeout);
    }
  }

  retry.addEventListener('click', loadMusic);
  loadMusic();
})();
