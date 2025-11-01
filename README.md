# Jeff Breece — Personal Site & Journal

This repository powers my personal site and writing space. It’s where I publish engineering notes, architecture patterns, how‑to guides, photo essays from the trail, and occasional reflections on work and life. The content is written for curious practitioners and future‑me—clear enough to reuse, small enough to iterate.

## What you’ll find here

- Engineering posts: Power Platform/Power Apps, integration, architecture, and practical patterns.
- Build notes and diagrams from projects I’m exploring.
- Personal logs: outdoors, fitness, and retrospectives.
- A simple tag system and fast on‑site search to help you find things quickly.

## Who I am (brief)

I’m a systems/solutions architect and hands‑on engineer. I like clean designs, pragmatic tooling, and writing things down. Off the keyboard I’m an outdoorsman, family man, and avid home cook.

## Site tech stack (short)

- Static site: Jekyll on GitHub Pages (theme: Minima, with light overrides).
- Content: Markdown posts with front‑matter for tags and categories.
- Search: Client‑side Lunr.js index served from `/search.json`.
- Taxonomy: Tag index page with anchors (e.g., `#azure`).
- Pagination: Classic Jekyll pagination on the home feed.
- Styles: A small Sass layer for spacing and UX polish (compiled to `/assets/main.css`).

This keeps the site fast, portable, and easy to maintain with plain text and Git.

## Local development

- Prereqs: Ruby + Bundler (or use Docker).
- Run locally:
  - `bundle install`
  - `bundle exec jekyll serve --livereload`
  - Visit http://127.0.0.1:4000

Docker option:
```
docker run --rm -it -v ${PWD}:/srv/jekyll -p 4000:4000 jekyll/jekyll:4 jekyll serve --livereload --host 0.0.0.0
```

## Navigation

- Home (paginated feed)
- Tags (browse by topic)
- Search (full‑text across posts)
- Resume
- About

## License & attribution

Content and code are in this repo; see [LICENSE](./LICENSE) for terms. Theme is based on Minima. Client search uses Lunr.js.

— Jeff