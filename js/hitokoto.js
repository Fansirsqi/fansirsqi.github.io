'use strict';

(() => {
  const quote = document.getElementById('hitokoto');
  const siteMeta = document.querySelector('.site-meta');
  if (!quote || !siteMeta || quote.dataset.initialized) return;

  quote.dataset.initialized = 'true';
  const subtitle = siteMeta.querySelector('.site-subtitle');
  if (subtitle) subtitle.after(quote);
  else siteMeta.append(quote);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  fetch('https://v1.hitokoto.cn/?encode=json', { signal: controller.signal })
    .then(response => {
      if (!response.ok) throw new Error(`Hitokoto HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (typeof data.hitokoto === 'string' && data.hitokoto.trim()) {
        quote.textContent = data.hitokoto;
      }
    })
    .catch(() => {
      // Keep the local fallback when the external service is unavailable.
    })
    .finally(() => clearTimeout(timeout));
})();
