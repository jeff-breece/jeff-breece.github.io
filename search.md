---
layout: default
title: Search
permalink: /search/
---

<h1>Search</h1>

<form id="search-form" role="search" aria-label="Site search" onsubmit="return false;">
  <input id="search-input" type="search" placeholder="Search posts..." autofocus />
</form>

<div id="search-results" aria-live="polite"></div>

<script src="https://cdn.jsdelivr.net/npm/lunr@2/lunr.min.js"></script>
<script src="{{ '/assets/js/search.js' | relative_url }}"></script>