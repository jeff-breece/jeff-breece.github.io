# Copilot Instructions

## Stack

Jekyll 4.4 static site deployed to GitHub Pages. Theme: **Chirpy 6.5.5** (gem: `jekyll-theme-chirpy`). Ruby 3.0.x / Bundler.

**Active plugins:** `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-include-cache`  
**Note:** `jekyll-feed` is not used — Chirpy provides its own `feed.xml`. `jekyll-mermaid` is removed — Chirpy handles Mermaid natively via `mermaid: true` in post front matter.

## Local Development

```bash
bundle install
bundle exec jekyll serve --livereload
# Visit http://127.0.0.1:4000
```

## CI

`.github/workflows/deploy.yml` — ruby/setup-ruby + configure-pages + deploy-pages.
Triggers on push to `main`. Build is verified before deploy. `jekyll-docker.yml` is deleted.
GitHub's automatic "pages build and deployment" workflow will always fail — this is expected;
it uses an incompatible Docker builder. Suppress it via Settings → Pages → Source → GitHub Actions.

## Architecture

### Theme Structure

Chirpy is gem-based. Theme files live in `vendor/bundle/`. Override by creating matching paths in the project root. Key extension points:
- `_sass/custom/overrides.scss` → imported via `assets/css/jekyll-theme-chirpy.scss`
- `_sass/variables-hook.scss` → override Chirpy SCSS variables
- `_layouts/` → only custom layouts live here (`gallery.html`, `gallery-index.html`)

### Navigation Tabs

`_tabs/` is a Jekyll collection (`sort_by: order`). Each `.md` file becomes a sidebar nav item. Current tabs: `tags.md` (order 1), `gallery.md` (order 2), `archives.md` (order 3), `about.md` (order 4). Chirpy renders these via `site.tabs` in its sidebar include.

### Content

Posts live in `_posts/` as `YYYY-MM-DD-slug.{md,markdown,MARKDOWN}`. `.MARKDOWN` (uppercase) is a convention for personal/lifestyle posts.

### Front Matter

Every post requires:

```yaml
---
layout: post
title: "Title"
date: YYYY-MM-DD HH:MM:SS -0400
categories: [top-category, sub-category]
tags:
  - tag-one
  - tag-two
---
```

Additional optional fields:
```yaml
description: "One-sentence SEO summary."
image: /images/filename.png
excerpt_separator: <!--more-->
last_modified_at: YYYY-MM-DD HH:MM:SS -0400
mermaid: true       # enable Mermaid rendering for this post
math: true          # enable KaTeX math rendering
pin: true           # pin post to top of home feed
```

Tags **must be lowercase with hyphens**. Categories are an array.

### Gallery System

Trail essay galleries use a custom collection + layouts:

- `_data/galleries.yml` — metadata for all galleries (title, slug, location, cover, banks, tags)
- `_galleries/<slug>.md` — per-gallery document with descriptive text
- `images/galleries/<slug>/Bank-N/` — photos organized by shooting session/bank
- `_layouts/gallery.html` — renders a gallery with PhotoSwipe 5 lightbox grid
- `_layouts/gallery-index.html` — renders the gallery landing page from `site.data.galleries`

To add a new trail essay gallery:
1. Create `images/galleries/<slug>/` with photos (subdirectories as banks)
2. Add entry to `_data/galleries.yml` with banks array
3. Create `_galleries/<slug>.md` with intro text

The gallery page at `/gallery/` is a Chirpy tab (`_tabs/gallery.md`, `layout: gallery-index`).

### Taxonomy & Search

Chirpy auto-generates `/tags/` with per-tag archive pages at `/tags/<tag-name>/`. No `tags.md` needed. Search is SimpleJekyllSearch served from `/assets/js/data/search.json` (Chirpy builds this automatically).

### Styles

`assets/css/jekyll-theme-chirpy.scss` is the CSS entry — imports Chirpy's `main` then `custom/overrides`. Custom rules go in `_sass/custom/overrides.scss`. Do not modify Chirpy's gem files directly.

### Images

Post images: `/images/filename.ext`. Gallery images: `/images/galleries/<slug>/Bank-N/`. Reference in front matter as `image: /images/...`.

### Mermaid Diagrams

Add `mermaid: true` to the post's front matter. Use standard fenced code blocks with `mermaid` language identifier. No gem required.

## Key Conventions

- **categories as arrays**: `categories: [top, sub]` — not string form
- **tags lowercase**: `- azure` not `- Azure`
- **Gallery banks**: named `Bank-1` through `Bank-N`, each a subdirectory under `images/galleries/<slug>/`
- `published: false` hides a post from all output
- `_archive/pre-chirpy/` contains the old Minima layouts/includes for reference — do not restore them
