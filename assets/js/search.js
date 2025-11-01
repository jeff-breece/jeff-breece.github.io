(function () {
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (initialQuery) input.value = initialQuery;

  let index = null;
  let documents = [];

  function renderResults(items) {
    if (!items.length) {
      resultsEl.innerHTML = '<p>No results.</p>';
      return;
    }
    const html = [
      '<ul class="search-result-list">',
      ...items.map(({ ref }) => {
        const doc = documents[ref];
        const date = doc.date ? new Date(doc.date).toISOString().slice(0, 10) : '';
        const snippet = (doc.content || '').slice(0, 200);
        return `
          <li>
            <a href="${doc.url}">${doc.title}</a>
            <small>${date}</small>
            <p>${snippet}&hellip;</p>
          </li>
        `;
      }),
      '</ul>',
    ].join('');
    resultsEl.innerHTML = html;
  }

  function search(q) {
    if (!index || !q) {
      resultsEl.innerHTML = q ? '<p>Indexing…</p>' : '';
      return;
    }
    try {
      const hits = index.search(q.trim());
      renderResults(hits);
    } catch {
      // Fallback for malformed queries: OR search with wildcards
      try {
        const orQuery = q
          .split(/\s+/)
          .map((t) => `${t}*`)
          .join(' ');
        const hits = index.search(orQuery);
        renderResults(hits);
      } catch {
        renderResults([]);
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

  input.addEventListener('input', (e) => {
    const q = e.target.value;
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    search(q);
  });

  buildIndex();
})();