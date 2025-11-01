---
layout: default
title: Search
permalink: /search/
---

<h1>Search</h1>

<form id="search-form" role="search" aria-label="Site search" onsubmit="return false;">
  <label for="search-input" class="sr-only">Search the site</label>
  <div class="search-bar">
    <input id="search-input" type="search" placeholder="Search posts..." autocomplete="off" />
    <button id="search-clear" type="button" aria-label="Clear search" title="Clear">×</button>
  </div>
  <p id="search-help" class="search-help">Type at least 2 characters. You can include tags, e.g., #azure.</p>
</form>

<div id="search-results" aria-live="polite"></div>

<script src="https://cdn.jsdelivr.net/npm/lunr@2/lunr.min.js"></script>
<script src="{{ '/assets/js/search.js' | relative_url }}"></script>