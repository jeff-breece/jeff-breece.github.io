# Jekyll Theme Selection — 2026

**Status:** Phase 1 complete — ready for decision  
**Date:** 2026-07-15  
**Prepared for:** jeff-breece.github.io modernization  

---

## Current Site Snapshot

Before evaluating themes, a baseline inventory was taken:

| Item | Count / Notes |
|---|---|
| Posts | 28 (mix of engineering, personal, outdoors) |
| Images | 65 files in `/images/` |
| Gallery | `gallery-site/Olympics/` — 6 Bank folders, standalone sub-site |
| Standalone pages | about, resume, search, tags, 404, gap-state, golden-state |
| Current theme | Minima 2.5 with custom `_layouts/`, `_includes/`, SCSS |
| Plugins | jekyll-mermaid ⚠️, jekyll-feed, jekyll-paginate, jekyll-seo-tag |
| Search | Custom Lunr.js (hand-rolled `search.json` + `assets/js/search.js`) |
| CI | GitHub Actions — Docker-based build + CSS verification |
| Tags | ~60 clean tags (plus significant YAML damage in the diet/nutrition post) |

**Notable constraint:** `jekyll-mermaid` is used in at least two engineering posts. Any new theme must either preserve Mermaid rendering or provide a native equivalent.

---

## Selection Criteria

Themes were evaluated against the following criteria, weighted for a personal engineering blog with outdoors/personal content and a resume page:

| Criterion | Weight | Notes |
|---|---|---|
| Active maintenance (commits, releases, issues) | High | Abandoned themes accumulate security and compatibility debt |
| Dark/light mode | High | Personal preference; increasingly a baseline expectation |
| Tag archive pages (per-tag post lists) | High | Core navigation pattern in use today |
| Mermaid diagram support | High | Used in architecture posts — must not regress |
| Built-in or easy gallery support | Medium | Olympics gallery + trail photo essays |
| Resume / CV layout | Medium | `resume.md` is a key page |
| GitHub Pages / GitHub Actions compatible | High | Deployment target is fixed |
| Built-in search | Medium | Custom Lunr.js exists but removing the manual work is a win |
| Responsive + accessible | High | Table stakes in 2026 |
| SEO (Open Graph, Twitter Card, sitemap) | High | `jekyll-seo-tag` currently in use |
| Clean typography, readable for long-form | High | Posts range from notes to long architecture writeups |
| Customizable without deep forking | High | Per project constraints |
| Pagination | Medium | Currently paginate: 10 |
| Categories | Low | Not currently used; nice-to-have |
| RSS/Atom feed | Medium | `jekyll-feed` in use |

---

## Themes Reviewed

### 1. Chirpy — `cotes2020/jekyll-theme-chirpy`

- **GitHub:** https://github.com/cotes2020/jekyll-theme-chirpy  
- **Demo:** https://chirpy.cotes.page  
- **Stars:** ~7,000+ (one of the most active Jekyll repos in 2025–2026)  
- **Last release:** Actively maintained; dozens of releases in 2024–2025, regular commits  
- **License:** MIT

**Features relevant to this project:**

- Dark/light mode — toggle built-in, respects system preference ✅
- Tags with auto-generated per-tag archive pages ✅
- Hierarchical categories ✅
- Auto-generated Table of Contents ✅
- Native Mermaid support (rendered via CDN, no extra gem needed) ✅
- Built-in search (SimpleJekyllSearch, no Lunr.js setup required) ✅
- Pinned posts, trending tags ✅
- SEO (Open Graph, Twitter Card, structured data) ✅
- Atom/RSS feed ✅
- Pagination ✅
- PWA support ✅
- Syntax highlighting (code language badges) ✅
- `last_modified_at` support ✅
- No built-in gallery — requires custom include or standalone page ⚠️
- Requires GitHub Actions deployment (not GitHub Pages safe mode) ⚠️

**Pros:**
- Best overall feature-to-maintenance ratio in 2026
- Cleanest modern design — narrow column, excellent reading typography
- Tag system is first-class, not bolted on
- Mermaid is a first-class feature (critical for architecture posts)
- 100+ contributors; one of the most-forked Jekyll themes
- Chirpy starter template (`chirpy-starter`) makes initial setup structured
- Dark mode is polished and automatic
- No Lunr.js DIY — search just works

**Cons:**
- Requires GitHub Actions (Chirpy's own deploy action or equivalent) — not pure `github-pages` gem
- No gallery page out of the box; Olympics section needs a custom solution
- Chirpy uses its own conventions (e.g., `categories: [top, sub]` array syntax); migrating existing `categories:` front matter requires care
- Some config options are Chirpy-specific and not portable

**Migration complexity:** Moderate
- Install via `remote_theme` or gem + GitHub Actions
- Front matter: add `categories`, verify `tags` format (Chirpy uses YAML lists — already matches)
- Build new `_config.yml` following Chirpy's schema
- Drop custom Lunr.js (Chirpy search replaces it)
- Port `assets/main.scss` overrides into `_sass/` overrides
- Create gallery page using Chirpy's image include pattern or custom layout
- Resume page fits naturally as a standard Chirpy page

---

### 2. Minimal Mistakes — `mmistakes/minimal-mistakes`

- **GitHub:** https://github.com/mmistakes/minimal-mistakes  
- **Demo:** https://mmistakes.github.io/minimal-mistakes/  
- **Stars:** ~13,000+ (most-starred Jekyll theme overall)  
- **Last release:** v4.28.0 (2024); actively maintained since 2013  
- **License:** MIT

**Features relevant to this project:**

- 9+ color skins (Air, Aqua, Dark, Dirt, Mint, Neon, Plum, Sunrise, Default) ✅
- Archive pages for tags, categories, years ✅
- Built-in gallery include (`{% include gallery %}`) ✅
- Built-in Lunr.js search ✅
- `jekyll-include-cache` required (adds a gem dep)
- Sidebar support with navigation links ✅
- SEO (Open Graph, Twitter Card) ✅
- RSS ✅
- Pagination ✅
- `remote_theme` compatible with GitHub Pages ✅ (no Actions required)
- Dark skin available but no auto OS-detect toggle ⚠️
- Mermaid: not built-in; requires custom `_includes/head/custom.html` addition ⚠️
- Resume/CV: no dedicated layout; done via the `single` layout with custom include
- Two-column layout by default

**Pros:**
- Largest user community; best documentation by a wide margin
- Only theme in this shortlist with `remote_theme` support for pure GitHub Pages safe mode
- Gallery `{% include gallery %}` is mature and well-documented
- Maximum layout flexibility (single, archive, splash, home, search, 404)
- Sidebars, TOC, breadcrumbs, author bio — all configurable
- The most-used theme means maximum StackOverflow/forum coverage

**Cons:**
- Two-column default layout feels heavy for a personal writing blog
- No automatic dark/light toggle — user picks a skin; no system-preference detection
- Mermaid requires a manual head include addition
- `_config.yml` has ~150+ options; steep initial configuration overhead
- Design feels "enterprise blog" rather than "personal engineer blog"
- Sass is complex and deeply nested — overrides require knowing the internals

**Migration complexity:** Moderate-High
- Switch to `remote_theme: mmistakes/minimal-mistakes` in Gemfile + _config.yml
- Add `jekyll-include-cache` gem
- Build navigation YAML in `_data/navigation.yml`
- Add `defaults:` blocks in `_config.yml` for post layouts
- Create `_pages/` for standalone pages (about, tags, search, resume)
- Port all custom SCSS to `_sass/minimal-mistakes/` overrides
- Wire up Mermaid via custom head include

---

### 3. YAT (Yet Another Theme) — `jeffreytse/jekyll-theme-yat`

- **GitHub:** https://github.com/jeffreytse/jekyll-theme-yat  
- **Demo:** https://jeffreytse.github.io/jekyll-theme-yat/  
- **Stars:** ~500+  
- **Last release:** v1.10.0; releases have slowed; last substantial update 2022–2023  
- **License:** MIT

**Features relevant to this project:**

- Night mode with toggle ✅
- Built-in layouts: home, post, tags, archive, about ✅
- Page banners (image or video per-post) ✅
- PhotoSwipe 5 gallery — full-screen image lightbox ✅
- Syntax highlighting via highlight.js ✅
- Mermaid via jekyll-spaceship ⚠️ (not GitHub Pages whitelisted)
- RSS ✅, SEO ✅
- `jekyll-spaceship` adds LaTeX, PlantUML, media embeds (requires GitHub Actions)
- Requires GitHub Actions for full plugin set

**Pros:**
- Most visually striking design — banner images make posts feel editorial
- PhotoSwipe gallery is best-in-class for image-heavy pages (Olympics photos would shine)
- Night mode is clean and well-implemented
- Built-in tag and archive layouts reduce setup work

**Cons:**
- Maintenance has visibly slowed compared to Chirpy or MM — risk of abandonment
- `jekyll-spaceship` provides Mermaid but is not GitHub Pages safe; requires Actions
- Smaller community (500 stars vs 7k/13k) — fewer resources when stuck
- Banner image per post creates a new content workflow obligation
- No built-in search

**Migration complexity:** Low-Moderate
- Gem-based install, straightforward `_config.yml` schema
- Front matter compatible with existing posts (tags as lists ✅)
- Banner image fields optional — existing posts work without them
- Mermaid: must swap `jekyll-mermaid` gem for `jekyll-spaceship` + GitHub Actions

---

### 4. Hydejack — `hydecorp/hydejack`

- **GitHub:** https://github.com/hydecorp/hydejack  
- **Demo:** https://hydejack.com  
- **Stars:** ~8,000+  
- **Last release:** v9.2.1; activity has slowed since 2022  
- **License:** MIT (free tier); PRO version is paid

**Features relevant to this project:**

- Sidebar drawer navigation ✅
- Blog + Portfolio + Resume layouts built-in ✅
- Cover pages per section ✅
- Dark mode ✅
- Syntax highlighting ✅
- Tags and categories ✅
- Single-page app feel (AJAX navigation) ✅
- Resume (web + print/PDF) ✅ — strongest resume feature in this list
- Gallery: PRO only ⚠️
- Mermaid: not built-in ⚠️
- Heavy JavaScript (SPA routing, FLIP animations)

**Pros:**
- Best resume presentation of any theme reviewed
- Boutique design — visually distinctive
- Portfolio layout useful for project showcases
- Cover pages create strong section identity

**Cons:**
- PRO features (gallery, advanced layouts) require a paid license
- Heavy JS SPA navigation is overkill for a static blog
- Maintenance pace has slowed noticeably since 2022
- Mermaid requires custom work
- The aesthetic may feel "too designed" for a pragmatic engineering blog
- Bundle size is among the heaviest in this list

**Migration complexity:** Moderate
- Substantial `_config.yml` reconfiguration
- Must explicitly decide free vs PRO features
- Resume layout requires Hydejack-specific YAML data file
- No built-in search

---

### 5. al-folio — `alshedivat/al-folio`

Reviewed but excluded from shortlist. Designed for academic portfolios with publications, talks, and teaching pages. Excellent for researchers; mismatched for a practitioner engineering blog. Adds significant structural complexity (collections for publications, projects) with no benefit for this site's content model.

---

## Shortlist Table

| Theme | Stars | Dark/Light | Tags+Archive | Mermaid | Gallery | Resume | Search | GitHub Pages | Last Active | Migration |
|---|---|---|---|---|---|---|---|---|---|---|
| **Chirpy** | 7k+ | ✅ auto-toggle | ✅ per-tag | ✅ native | ❌ custom needed | ✅ page | ✅ built-in | Actions req. | 2025–2026 | Moderate |
| **Minimal Mistakes** | 13k+ | ⚠️ manual skin | ✅ archive index | ⚠️ custom include | ✅ gallery include | ✅ single layout | ✅ Lunr.js | ✅ remote_theme | 2024 | Moderate-High |
| **YAT** | 500+ | ✅ toggle | ✅ built-in | ⚠️ spaceship | ✅ PhotoSwipe | ✅ page | ❌ none | Actions req. | 2022–2023 | Low-Moderate |
| **Hydejack** | 8k+ | ✅ | ✅ | ❌ custom | ❌ PRO only | ✅ excellent | ❌ none | ✅ free tier | 2022 | Moderate |

---

## Recommended Theme

### ✅ Primary: Chirpy (`cotes2020/jekyll-theme-chirpy`)

**Rationale:**

Chirpy is the best fit for this blog in 2026. The reasoning by goal:

- **Modern design** — Chirpy's narrow single-column layout with clean typography is the right aesthetic for a writing-first engineer blog. It reads well on both mobile and desktop.
- **Better tags** — Tag archive pages are auto-generated and first-class. The existing tag conventions (YAML list under `tags:`) require no front matter changes.
- **Mermaid** — Native Mermaid support resolves the biggest technical compatibility risk in a theme migration. The existing `jekyll-mermaid` gem can be removed; Chirpy handles it via CDN.
- **Resume integration** — Resume renders naturally as a Chirpy page. The existing `resume.md` with its rich Markdown content translates cleanly.
- **Gallery** — Not built-in, but Chirpy's image include pattern (`![caption](/path/to/img){: .normal }`) and its support for custom layouts makes adding a gallery page low-risk. The Olympics section can remain a standalone page or be ported to a Chirpy-layout gallery page.
- **Search** — Replaces the hand-rolled Lunr.js setup entirely. Less to maintain.
- **Dark/light mode** — Automatic OS-preference detection plus a manual toggle. No skin-picking required.
- **Maintenance confidence** — 100+ contributors, active issue tracker, release cadence that follows Jekyll ecosystem updates. This is not a one-person project at risk of abandonment.

**Deployment model:** Chirpy requires GitHub Actions (not pure `github-pages` gem). A `chirpy-deploy.yml` workflow replaces the existing `jekyll-docker.yml`. Jeff already has GitHub Actions infrastructure, so this is a workflow swap, not new infrastructure.

---

### 🔁 Fallback: Minimal Mistakes (`mmistakes/minimal-mistakes`)

**Use if:**
- You want to stay on pure GitHub Pages safe mode (`remote_theme`) without GitHub Actions
- You need sidebar navigation for long posts
- Gallery support via `{% include gallery %}` is a hard requirement without custom work
- You are willing to invest in a heavier initial configuration for maximum future flexibility

**Caveat:** Minimal Mistakes' dark mode requires manually selecting the `dark` skin — there is no auto OS-preference toggle. If dark/light auto-toggle is important, Chirpy is the better choice.

---

## Migration Notes

### What carries over cleanly

| Item | Status |
|---|---|
| All post Markdown content | ✅ No changes needed |
| Post front matter `title`, `date`, `tags`, `description`, `image` | ✅ Compatible |
| `/images/` directory | ✅ Move as-is |
| `resume.md` prose content | ✅ Paste into Chirpy page layout |
| `about.markdown` | ✅ Rename to `about.md`, use Chirpy `page` layout |
| RSS via jekyll-feed | ✅ Chirpy uses jekyll-feed |
| SEO via jekyll-seo-tag | ✅ Chirpy uses jekyll-seo-tag |

### What needs rework

| Item | Work Required |
|---|---|
| `_layouts/` (home, post, default) | Drop all three; Chirpy provides its own |
| `_includes/` (header, footer, social) | Drop; Chirpy manages these |
| `assets/main.scss` | Port custom rules to `_sass/` Chirpy override files |
| `assets/js/search.js` + `search.json` | Drop; Chirpy search replaces both |
| `tags.md` (custom liquid) | Drop; Chirpy auto-generates `/tags/` page |
| `_config.yml` | Full rewrite following Chirpy schema |
| `jekyll-mermaid` gem | Remove; Chirpy handles natively |
| `jekyll-paginate` | Chirpy uses its own pagination; verify behavior |
| `gallery-site/` | Decide: keep as standalone sub-site OR port to Chirpy gallery page |
| `gap-state.html`, `golden-state.html` | Port content to Chirpy `page` layout |
| CI workflow | Replace `jekyll-docker.yml` with Chirpy's recommended Actions workflow |
| Tag YAML damage in diet post | ⚠️ Fix malformed front matter (275 "tags" in that post are prose, not tags) |

### The tag YAML issue

The post `2024-07-03-Workout-Routine-July-2024.MARKDOWN` (and possibly `2024-07-28-scioto-trail-state-park.MARKDOWN`) contains a `tags:` block where list items are long prose sentences — likely a copy-paste from body content into front matter. This does not affect the current site visually (Minima ignores malformed tags) but will create a broken tag index under Chirpy. **This must be cleaned up during migration**, not after.

---

## Risks and Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| URL changes break inbound links | Low | High | Chirpy default URLs match Jekyll defaults (`/YYYY/MM/DD/slug.html`); verify before deploying |
| Mermaid rendering differences | Low | Medium | Test all architecture posts locally before merging |
| Tag YAML corruption breaks tag index | High | Medium | Fix malformed front matter before switching themes |
| Gallery migration scope creep | Medium | Low | Keep `gallery-site/` as-is initially; migrate in Phase 3 |
| GitHub Actions deploy workflow setup | Low | Medium | Use Chirpy's starter workflow verbatim first, then customize |
| `jekyll-spaceship` dependency removed | n/a | Low | Not currently used; no risk |
| CSS override rework effort | Medium | Low | Port only the custom rules in `assets/main.scss` — small file |

---

## Next Steps — Phase 2: Local Migration Plan

1. **Create migration branch**
   ```bash
   git checkout -b theme/chirpy-migration
   ```

2. **Set up Chirpy starter**
   - Reference: https://github.com/cotes2020/chirpy-starter
   - Install as gem or remote_theme
   - Build new `_config.yml` from Chirpy schema

3. **Fix tag front matter** (prerequisite — do this before anything else)
   - Audit all 28 posts for malformed `tags:` blocks
   - Clean the diet/workout post; keep only real tag tokens

4. **Port posts**
   - Verify front matter for all 28 posts
   - Add `categories:` where appropriate (optional in Chirpy)
   - Validate Mermaid blocks render

5. **Port standalone pages**
   - `about`, `resume`, `search` → Chirpy `page` layout
   - `tags` → remove (Chirpy auto-generates)
   - `gap-state.html`, `golden-state.html` → evaluate content, convert to pages

6. **Port SCSS overrides**
   - Move custom rules from `assets/main.scss` to `_sass/` Chirpy override

7. **Update GitHub Actions workflow**
   - Replace `jekyll-docker.yml` with Chirpy's deploy workflow
   - Preserve CSS verification step

8. **Validate locally**
   ```bash
   bundle exec jekyll serve --livereload
   ```
   - Check home feed, tag index, individual posts, resume, about, 404
   - Check Mermaid renders in architecture posts
   - Check images load

9. **Gallery decision point** (defer to Phase 3)
   - Keep `gallery-site/` as standalone for now
   - Plan gallery page migration in Phase 3

---

*Report generated: 2026-07-15. Proceed to Phase 2 only after selecting a theme.*
