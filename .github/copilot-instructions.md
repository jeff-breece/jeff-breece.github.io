# Copilot Instructions

## Stack

Jekyll 4.4 static site deployed to GitHub Pages. Theme: Minima 2.5 with local overrides. Ruby/Bundler dependency management.

**Active plugins:** `jekyll-feed`, `jekyll-paginate`, `jekyll-seo-tag`, `jekyll-mermaid`

## Local Development

```bash
bundle install
bundle exec jekyll serve --livereload
# Visit http://127.0.0.1:4000
```

Docker alternative:
```bash
docker run --rm -it -v ${PWD}:/srv/jekyll -p 4000:4000 jekyll/jekyll:4 jekyll serve --livereload --host 0.0.0.0
```

## CI

`.github/workflows/jekyll-docker.yml` builds with Docker, then verifies:
- `_site/assets/main.css` exists
- Expected CSS selectors are present: `.site-header .site-nav`, `.pagination`, `.tags .tag`

## Architecture

### Content

Posts live in `_posts/` as `YYYY-MM-DD-slug.markdown` or `.md`. Personal/lifestyle posts use uppercase `.MARKDOWN` extension; engineering posts use lowercase `.markdown` or `.md`. This is a convention, not a technical requirement.

### Front Matter

Every post requires at minimum:

```yaml
---
layout: post
title: "Title"
date: YYYY-MM-DD HH:MM:SS -0400
tags:
  - tag-one
  - tag-two
---
```

Engineering posts typically also include:
```yaml
description: "One-sentence summary for SEO."
image: /images/filename.png
excerpt_separator: <!--more-->
```

Some posts carry `original_date` and `last_modified_at` fields for tracking edits.

### Layouts

- `_layouts/default.html` — base chrome, wraps everything
- `_layouts/home.html` — paginated post feed with inline tag links rendered as `#tag` anchors pointing to `/tags/#slug`
- `_layouts/post.html` — Schema.org BlogPosting markup

### Taxonomy & Search

**Tags** are the primary taxonomy. `tags.md` (permalink `/tags/`) renders a tag cloud + per-tag post lists using anchor IDs (`#tag-name-slugified`). Tag links in the home feed use `{{ '/tags/' | relative_url }}#{{ tag | slugify }}`.

**Search** is client-side Lunr.js. `search.json` (built by Jekyll liquid template) emits stripped post content, titles, tags, and URLs. `assets/js/search.js` loads the index, supports `#tag` prefix queries, and highlights matches inline.

### Styles

`assets/main.scss` imports Minima then adds site-specific overrides. The Jekyll pipeline compiles this to `_site/assets/main.css`. Do not add styles anywhere else — all CSS customization goes in this file.

### Images

Post images live in `/images/`. Reference them in front matter as `image: /images/filename.ext` and inline via standard Markdown.

### Mermaid Diagrams

`jekyll-mermaid` is active. Use fenced code blocks with `mermaid` language identifier in posts.

## Key Conventions

- `show_excerpts: true` in `_config.yml` — the home feed shows post excerpts automatically. Use `<!--more-->` to control the cut point; without it Jekyll uses the first paragraph.
- `paginate: 10` — home feed paginates at 10 posts. The paginator path is `/page:num/`.
- `draft: true` in front matter excludes a post from `search.json` (see the `where_exp` filter there), but Jekyll still builds it unless `--no-future` / `--drafts` flags are set.
- Posts with future dates are included in CI builds (`jekyll build --future`) but not served locally by default.
- `_posts_imported/` and `migration_reports_v2/` are legacy migration artifacts — do not modify or publish from them.
