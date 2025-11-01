(function () {
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  const clearBtn = document.getElementById('search-clear');
  const helpEl = document.getElementById('search-help');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (initialQuery) input.value = initialQuery;

  let index = null;
  let documents = [];

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function highlight(text, q) {
    if (!text || !q) return escapeHtml(text);
    // Simple token highlight for terms >= 2 chars
    const tokens = q.trim().split(/\s+/).filter(t => t.length >= 2);
    if (!tokens.length) return escapeHtml(text);
    const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp(`(${pattern})`, 'gi');
    return escapeHtml(text).replace(re, '<mark>$1</mark>');
  }

  function renderResults(items, q) {
    if (!q || q.length < 2) {
      resultsEl.innerHTML = '<p class="search-no-results">Type at least 2 characters to search.</p>';
      return;
    }
    if (!items.length) {
      resultsEl.innerHTML = '<div class="search-no-results"><p>No results.</p><p>Try a different term or a tag like <code>#azure</code>.</p></div>';
      return;
    }

    const header = `<div class="search-result-count">${items.length} result${items.length === 1 ? '' : 's'} for “${escapeHtml(q)}”</div>`;
    const list = [
      '<ul class="search-result-list">',
      ...items.map(({ ref }) => {
        const doc = documents[ref];
        const date = doc.date ? new Date(doc.date).toISOString().slice(0, 10) : '';
        const snippetSrc = (doc.content || '').slice(0, 220);
        return `
          <li>
            <a href="${doc.url}">${highlight(doc.title || '', q)}</a>
            ${date ? `<small>${date}</small>` : ''}
            <p>${highlight(snippetSrc, q)}&hellip;</p>
          </li>
        `;
      }),
      '</ul>',
    ].join('');
    resultsEl.innerHTML = header + list;
  }

  function search(q) {
    if (!index) {
      resultsEl.innerHTML = q ? '<p>Indexing…</p>' : '';
      return;
    }
    if (!q || q.trim().length < 2) {
      renderResults([], q);
      return;
    }
    try {
      const trimmed = q.trim();
      const hits = index.search(trimmed);
      renderResults(hits, trimmed);
    } catch {
      // Fallback for malformed queries: OR search with wildcards
      try {
        const orQuery = q
          .split(/\s+/)
          .map((t) => (t.length >= 2 ? `${t}*` : t))
          .join(' ');
        const hits = index.search(orQuery);
        renderResults(hits, q);
      } catch {
        renderResults([], q);
      }
    }
  }

  function buildIndex() {
    return fetch('/search.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((docs) => {
        documents = docs;
        const builder = new lunr.Builder();
        builder.ref('id');
        builder.field('title', { boost: 10 });
        builder.field('content', { boost: 1 });
        builder.field('tags', { boost: 5 });
        builder.field('categories', { boost: 3 });

        docs.forEach((d) => {
          builder.add({
            id: d.id,
            title: d.title || '',
            content: d.content || '',
            tags: (d.tags || []).join(' '),
            categories: (d.categories || []).join(' '),
          });
        });

        index = builder.build();
        if (initialQuery) search(initialQuery);
      })
      .catch((err) => {
        console.error('Search index load failed', err);
        resultsEl.innerHTML = '<p>Failed to load search index.</p>';
      });
  }

  function debounce(fn, ms) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  const debounced = debounce((q) => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    search(q);
  }, 200);

  input.addEventListener('input', (e) => debounced(e.target.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; debounced(''); input.focus(); }
  });
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { input.value = ''; debounced(''); input.focus(); });
  }

  buildIndex();
})();