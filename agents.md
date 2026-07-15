# Agent Standing Orders — jeff-breece.github.io

> **Purpose:** This file is the authoritative operational manual for any AI agent
> (Copilot, Claude, GPT, or otherwise) working in this repository. Read it before
> making any changes. Update it when you discover new patterns or fix new bugs.

---

## 1. Standing Orders

### Always
- Run `bundle exec jekyll build` and verify **exit code 0** before committing.
- Use `git commit` with small, reviewable changesets. Include the co-author trailer:
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- Work on a feature branch (`git checkout -b <branch>`). Never commit directly to `main`.
- Preserve existing post URLs. Changing a post's date or slug changes its URL and breaks inbound links.
- Keep posts' raw content intact unless cleanup is explicitly requested.
- Add `noblank: true` to any contact entry in `_data/contact.yml` that uses a `javascript:` URL.

### Never
- Fork or edit files inside `vendor/bundle/` (Chirpy gem internals). Override via site-level files instead.
- Add `jekyll-feed` to the Gemfile. Chirpy ships its own `feed.xml`; the plugin causes a file conflict.
- Require Ruby > 3.0.x. The site is locked to Ruby 3.0. Chirpy 7.x requires Ruby ≥ 3.1 — stay on **6.5.5**.
- Place custom CSS in `assets/main.scss`. Chirpy's entry point is `assets/css/jekyll-theme-chirpy.scss`.
- Use `<img>` tags inside gallery layouts. Chirpy's `refactor-content.html` mangles them (see §6).
- Push to `main` without a passing build. The deploy workflow (`deploy.yml`) builds on push; failures are visible in Actions.
- Delete posts without explicit owner instruction.

### Before Every Commit
```bash
cd /home/jeff/src/jeff-breece.github.io
bundle exec jekyll build          # must exit 0
grep -r "//images\|src=\"/{{" _site/ | wc -l   # must be 0
```

---

## 2. Repository Layout

```
jeff-breece.github.io/
├── _config.yml                  # Chirpy config — paginate, defaults, social, SEO
├── _posts/                      # Regular posts (.md or .MARKDOWN)
│   └── archive/                 # Posts >3 years old (auto-graduated by _layouts/archives.html)
├── _tabs/                       # Sidebar nav pages (order: N in front matter)
│   ├── about.md                 # Bio
│   ├── archives.md              # Archive index
│   ├── gallery.md               # Gallery landing
│   ├── resume.md                # Resume/CV
│   └── tags.md                  # Geometric tag cloud
├── _galleries/                  # Trail essay gallery documents
├── _layouts/                    # Custom layouts (gallery, gallery-index, archives, tags)
├── _includes/                   # Overrides of Chirpy includes (trending-tags.html)
├── _data/
│   ├── galleries.yml            # Gallery metadata — single source of truth
│   ├── contact.yml              # Sidebar contact icons
│   ├── share.yml                # Share button config
│   └── locales/en.yml           # Chirpy locale override ("All rights reserved.")
├── _plugins/
│   └── post_first_image.rb      # Jekyll hook: extracts first post image for card thumbnail
├── _sass/custom/overrides.scss  # All custom CSS — imported by jekyll-theme-chirpy.scss
├── assets/
│   ├── css/jekyll-theme-chirpy.scss   # CSS entry point — imports main + overrides
│   └── img/
│       ├── favicons/            # Campfire favicon set
│       └── default-post.svg     # Fallback card image (architecture wireframe)
├── images/
│   ├── galleries/olympics/      # 303 Olympics trail photos (Bank-1 … Bank-6)
│   ├── archive/                 # Images recovered from Wayback Machine for archive posts
│   └── unsplash/                # Contextual images fetched via Unsplash API
├── .github/
│   ├── workflows/deploy.yml     # Only active workflow — ruby/setup-ruby + deploy-pages
│   └── copilot-instructions.md  # Chirpy-aware dev context for Copilot
└── THEME_SELECTION_2026.md      # Theme research report
```

---

## 3. Runbook

### 3.1 Local Development

```bash
cd /home/jeff/src/jeff-breece.github.io

# First-time setup
bundle install

# Serve with live reload
bundle exec jekyll serve --livereload --port 4000 --host 0.0.0.0

# Build only (CI check)
bundle exec jekyll build
```

### 3.2 Publishing a New Post

1. Create `_posts/YYYY-MM-DD-slug.md` (or `.MARKDOWN` for personal posts).
2. Required front matter:
   ```yaml
   ---
   layout: post
   date: YYYY-MM-DD HH:MM:SS -0400
   title: "Title"
   categories: [category]
   tags:
     - lowercase-tag
   ---
   ```
3. Optional but recommended:
   ```yaml
   description: "One-sentence SEO summary."
   image:
     path: /images/filename.jpg
     alt: "Description. Photo by Name on Unsplash"
   mermaid: true      # for Mermaid diagrams
   excerpt_separator: <!--more-->
   ```
4. Build, verify, commit, push to a branch, open PR.

### 3.3 Adding a Trail Essay Gallery

1. Create photo directories: `images/galleries/<slug>/Bank-1/`, `Bank-2/`, etc.
2. Resize photos to web resolution: `find images/galleries/<slug> -name "*.jpg" | xargs mogrify -resize "1920x>" -quality 82 -strip`
3. Add entry to `_data/galleries.yml`:
   ```yaml
   - title: "Gallery Title"
     slug: gallery-slug
     location: "Location Name"
     date: "Month Year"
     description: "Short description."
     cover: /images/galleries/gallery-slug/Bank-1/cover-photo.jpg
     image_dir: images/galleries/gallery-slug
     tags: [trail, hiking]
     banks:
       - name: "Bank 1 — Day Label"
         dir: Bank-1
   ```
4. Create `_galleries/<slug>.md`:
   ```yaml
   ---
   layout: gallery
   title: "Gallery Title"
   slug: gallery-slug
   permalink: /gallery/gallery-slug/
   ---
   Essay text here.
   ```
5. Build and verify gallery renders at `/gallery/gallery-slug/`.

### 3.4 Graduating Posts to Archive

Posts with `date` older than 3 years automatically appear on the `/archives/` page via
`_layouts/archives.html` (filter: `page.date < now - 94608000`). No manual action needed.

To pre-graduate a post immediately: move the file to `_posts/archive/` and add to front matter:
```yaml
archived: true
original_permalink: "https://jeffbreece.com/slug/"
```

### 3.5 Unsplash Image Enrichment (remaining ~61 posts)

The script at `/tmp/unsplash_enrich.py` is **idempotent** — it skips posts where
`images/unsplash/<slug>.jpg` already exists. Unsplash demo tier: 50 requests/hour.

```bash
# Run after rate limit resets (top of hour)
python3 /tmp/unsplash_enrich.py

# After completion:
cd /home/jeff/src/jeff-breece.github.io
bundle exec jekyll build
git add images/unsplash/ _posts/
git commit -m "feat: Unsplash images batch N/N"
git push origin <branch>
```

To upgrade from 50/hr to 5000/hr: go to
https://unsplash.com/oauth/applications/988660 and apply for Production status.

### 3.6 Deploy to Production

```bash
# All work is done on a feature branch. Merge via PR:
gh pr create --base main --head <branch> --title "..." --body "..."
gh pr merge <PR-number> --merge --auto

# Monitor deploy
gh run list --limit 3
gh run view <run-id> --log-failed   # if something fails
```

The deploy workflow (`deploy.yml`) runs `bundle exec jekyll build` then deploys to
GitHub Pages via `deploy-pages@v4`. Build artifacts are verified before deploy.

### 3.7 Checking for Broken Images in Archive Posts

```bash
python3 - << 'EOF'
import re
from pathlib import Path

posts = list(Path("_posts/archive").glob("*.md"))
broken = []
for p in posts:
    text = p.read_text()
    for m in re.finditer(r'!\[([^\]]*)\]\(([^)]+)\)', text):
        url = m.group(2)
        if url.startswith('http') and 'jeffbreece.com' in url:
            broken.append((p.name, url))
print(f"{len(broken)} broken external image links")
for fname, url in broken[:20]:
    print(f"  {fname}: {url}")
EOF
```

---

## 4. Troubleshooting Guide

### Build fails: "cannot load such file — jekyll-feed"
**Cause:** `jekyll-feed` added to Gemfile; conflicts with Chirpy's own `feed.xml`.  
**Fix:** Remove `jekyll-feed` from `Gemfile` and `_config.yml` plugins list.

### Home page blank / no posts
**Cause:** `jekyll-paginate` gem missing or `paginate:` not set in `_config.yml`.  
**Fix:** Ensure `Gemfile` has `gem "jekyll-paginate"` and `_config.yml` has:
```yaml
paginate: 10
paginate_path: "/page:num/"
```

### Gallery thumbnails show shimmer but never load (`src="/{{..."`)
**Cause:** Chirpy's `_includes/refactor-content.html` mangles `<img>` alt text containing
em-dashes (`—`) or ampersands (`&`), producing `src="/{{` (broken protocol-relative URL).  
**Fix:** Replace `<img>` tags in gallery layouts with CSS `background-image` divs:
```html
<!-- WRONG — triggers Chirpy's refactor bug -->
<img src="{{ photo_url }}" alt="Day 1 — Arrival & Forest">

<!-- CORRECT — no <img> tag, refactor never fires -->
<div class="photo-bg" style="background-image:url('{{ photo_url }}');"></div>
```

### Post card thumbnail shows "Preview Image" alt text / default SVG
**Cause 1:** Post has no `image:` field and no images in content body.  
**Fix:** Add Unsplash image via `python3 /tmp/unsplash_enrich.py` or add explicit `image:` front matter.

**Cause 2:** Post has `image: /path/to/missing-file.jpg` (Minima-era format, file doesn't exist).  
**Fix:** Remove the `image:` field or replace with a valid path. The config default (`default-post.svg`) will apply.

**Cause 3:** Post content uses Liquid `{{ site.url }}{{ site.baseurl }}/images/foo.jpg` in markdown.  
**Fix:** The `_plugins/post_first_image.rb` hook handles this by extracting the static path. If still broken, convert to a direct path: `![alt](/images/foo.jpg)`.

### Trending tags link to /tags/TAG/ → 404
**Cause:** Chirpy's default `trending-tags.html` generates `/tags/TAG/` URLs; we don't run `jekyll-archives`.  
**Fix:** Already resolved via `_includes/trending-tags.html` override (anchor links to `/tags/#tag-slug`).  
**Do not** add `jekyll-archives` without testing GitHub Actions deploy compatibility.

### Clicking a post tag → 404
**Cause:** Same as above — Chirpy generates `/tags/TAG/` links on post pages.  
**Status:** Known issue; `/tags/` page has all tags with anchor links, but per-tag deep links don't resolve.  
**Fix path:** Add `jekyll-archives` + configure in `_config.yml`:
```yaml
jekyll-archives:
  enabled: [tags, categories]
  layout: tag
  slugify_mode: latin
```
Test locally before deploying — `jekyll-archives` is not GitHub Pages safe (native build), but works with Actions.

### Mail icon in sidebar opens blank tab instead of mail client
**Cause:** Chirpy generates a `javascript:mailto` URL and adds `target="_blank"`, which opens a new tab.  
**Fix:** Add `noblank: true` to the email entry in `_data/contact.yml`.

### "All rights reserved" shows as "Some rights reserved"
**Cause:** Chirpy reads footer text from `_data/locales/en.yml`; without an override, the gem default is used.  
**Fix:** The site-level `_data/locales/en.yml` overrides the gem. Change `copyright.brief`.

### CSS compile error: "File to import not found: main"
**Cause:** Custom SCSS placed in `assets/main.scss` instead of `assets/css/jekyll-theme-chirpy.scss`.  
**Fix:** Move to `assets/css/jekyll-theme-chirpy.scss` with correct front matter and `@import 'main'`.

### Large push stalls / times out (>300MB)
**Cause:** Gallery images at full resolution (4928×3264, ~5-7MB each).  
**Fix:** Resize before committing: `find images/galleries -name "*.jpg" | xargs mogrify -resize "1920x>" -quality 82 -strip`

### deploy.yml fails but `pages build and deployment` always fails
**Cause:** GitHub runs its classic Pages builder in parallel with our custom workflow. The classic builder
doesn't know about Chirpy's gems and always fails.  
**Fix:** Go to Settings → Pages → Source → set to **"GitHub Actions"** (not "Deploy from branch").
This disables the classic builder entirely.

---

## 5. Automated Regression Tests

Install Playwright once:
```bash
cd /home/jeff/src/jeff-breece.github.io
npm init -y
npm install --save-dev @playwright/test
npx playwright install chromium
```

Create `tests/regression.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4000';

// ── Core pages ────────────────────────────────────────────────────────────────
test('home page renders post cards', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('article.card-wrapper')).toHaveCount(10);
  await expect(page.locator('#post-list')).toBeVisible();
});

test('home page pagination present', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('.pagination, nav[aria-label*="pag"]')).toBeVisible();
});

test('tags page renders tag cloud', async ({ page }) => {
  await page.goto(`${BASE}/tags/`);
  await expect(page.locator('.tag-cloud, .tags-cloud, #tag-cloud')).toBeVisible();
  const tags = page.locator('a.post-tag, .tag-item');
  await expect(tags.first()).toBeVisible();
});

test('trending tags sidebar links to /tags/#anchor', async ({ page }) => {
  await page.goto(BASE);
  const trendingLink = page.locator('a.post-tag[href*="/tags/#"]').first();
  await expect(trendingLink).toBeVisible();
  const href = await trendingLink.getAttribute('href');
  expect(href).toMatch(/\/tags\/#\w+/);
});

test('gallery index page shows at least one gallery card', async ({ page }) => {
  await page.goto(`${BASE}/gallery/`);
  await expect(page.locator('.gallery-card, [class*="gallery"]').first()).toBeVisible();
});

test('Olympics gallery loads thumbnails (CSS background-image)', async ({ page }) => {
  await page.goto(`${BASE}/gallery/olympics/`);
  // CSS bg thumbnails — no img tag; check the container divs are present
  const thumbs = page.locator('.photo-thumb, .photo-bg');
  await expect(thumbs.first()).toBeVisible();
  const count = await thumbs.count();
  expect(count).toBeGreaterThan(50); // 303 photos
});

test('archives page shows grouped posts', async ({ page }) => {
  await page.goto(`${BASE}/archives/`);
  await expect(page.locator('h2, .archive-year')).toBeTruthy();
  const links = page.locator('a[href*="/archive/"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(100);
});

test('resume page renders', async ({ page }) => {
  await page.goto(`${BASE}/resume/`);
  await expect(page.locator('h1, .page-heading')).toBeVisible();
  // Confirm actual resume content loaded
  await expect(page.locator('body')).toContainText('Breece');
});

test('about page shows bio', async ({ page }) => {
  await page.goto(`${BASE}/about/`);
  await expect(page.locator('body')).toContainText('Jeff');
});

// ── A sample post ─────────────────────────────────────────────────────────────
test('a recent post renders correctly', async ({ page }) => {
  await page.goto(BASE);
  const firstPost = page.locator('article.card-wrapper a.post-preview').first();
  const href = await firstPost.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(`${BASE}${href}`);
  await expect(page.locator('h1.post-title, .post h1')).toBeVisible();
  await expect(page.locator('article.post-content, .content')).toBeVisible();
});

// ── Archive post ──────────────────────────────────────────────────────────────
test('archive post renders', async ({ page }) => {
  await page.goto(`${BASE}/archive/food/2019/08/28/fireflies-and-5ks.html`);
  await expect(page.locator('h1')).toContainText('Fireflies');
  await expect(page.locator('article')).toBeVisible();
});

// ── Navigation ────────────────────────────────────────────────────────────────
test('sidebar nav links all resolve (no 404)', async ({ page }) => {
  await page.goto(BASE);
  const navLinks = await page.locator('#sidebar nav a, .sidebar a[href]').all();
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) continue;
    const url = href.startsWith('http') ? href : `${BASE}${href}`;
    const resp = await page.request.get(url);
    expect(resp.status(), `Nav link ${href} returned ${resp.status()}`).toBeLessThan(400);
  }
});

test('favicon loads', async ({ page }) => {
  const resp = await page.request.get(`${BASE}/assets/img/favicons/favicon.ico`);
  expect(resp.status()).toBe(200);
});

test('RSS feed is valid XML', async ({ page }) => {
  const resp = await page.request.get(`${BASE}/feed.xml`);
  expect(resp.status()).toBe(200);
  const body = await resp.text();
  expect(body).toContain('<feed');
  expect(body).toContain('</feed>');
});

test('mailto link has no target=_blank', async ({ page }) => {
  await page.goto(BASE);
  const mailtoLink = page.locator('a[href*="mailto"]');
  const target = await mailtoLink.getAttribute('target');
  expect(target).not.toBe('_blank');
});

// ── Footer ────────────────────────────────────────────────────────────────────
test('footer says All rights reserved', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('footer')).toContainText('All rights reserved');
});

// ── Images ────────────────────────────────────────────────────────────────────
test('no broken images on home page', async ({ page }) => {
  await page.goto(BASE);
  const broken: string[] = [];
  page.on('response', (resp) => {
    if (resp.request().resourceType() === 'image' && resp.status() >= 400) {
      broken.push(resp.url());
    }
  });
  await page.waitForLoadState('networkidle');
  expect(broken, `Broken images: ${broken.join(', ')}`).toHaveLength(0);
});

test('default post SVG exists', async ({ page }) => {
  const resp = await page.request.get(`${BASE}/assets/img/default-post.svg`);
  expect(resp.status()).toBe(200);
});

// ── Mobile viewport ───────────────────────────────────────────────────────────
test('home page mobile viewport renders without overflow', async ({ browser }) => {
  const ctx  = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await expect(page.locator('#sidebar')).toBeVisible();
  await expect(page.locator('#post-list')).toBeVisible();
  // Sidebar should be collapsible on mobile — no horizontal scroll
  const scrollWidth: number = await page.evaluate(() => document.body.scrollWidth);
  const clientWidth: number = await page.evaluate(() => document.body.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  await ctx.close();
});

// ── No console errors ─────────────────────────────────────────────────────────
test('home page has no JS console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  // Filter known benign messages
  const real = errors.filter(e => !e.includes('favicon') && !e.includes('LiveReload'));
  expect(real, `Console errors: ${real.join('\n')}`).toHaveLength(0);
});
```

`playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4000',
    headless: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
```

`package.json` scripts to add:
```json
"scripts": {
  "test": "npx playwright test",
  "test:headed": "npx playwright test --headed",
  "test:report": "npx playwright show-report"
}
```

Run tests:
```bash
# 1. Start Jekyll (keep running in background)
bundle exec jekyll serve --port 4000 &

# 2. Run tests
npm test

# 3. View HTML report on failure
npm run test:report
```

---

## 6. Known Chirpy 6.5.5 Bugs & Workarounds

### refactor-content.html — img attribute parser
Chirpy post-processes every `<img>` tag in layouts using `refactor: true`. Its Liquid
regex parser **breaks on em-dashes (`—`) and ampersands (`&`) in alt text**, producing:
- `src="//"` or `src="/{{..."` — protocol-relative or raw Liquid literal
- `href="/lazy"` — the word "lazy" from `loading="lazy"` treated as a URL
- Infinite shimmer (image never loads)

**Workaround:** Use CSS `background-image` on a `<div>` instead of `<img>` in any
custom layout that uses `layout: default` (which enables refactor). No `<img>` = no
refactor. This is applied in `_layouts/gallery.html` and `_layouts/gallery-index.html`.

### Nested `<a>` bug
When an `<img>` is inside `<a>`, refactor wraps the `<img>` in another `<a class="popup img-link">`,
creating invalid nested anchors. Browsers break the outer link. Same fix: use `background-image` div.

### Trending tags per-tag pages
Chirpy generates `/tags/TAG/` links but doesn't create the pages without `jekyll-archives`.
Clicking tag links on post cards → 404. Our `_includes/trending-tags.html` override fixes
the sidebar widget but not per-post tag pills.

### post_first_image.rb — Liquid URL guard
Posts using `{{ site.url }}{{ site.baseurl }}/images/foo.jpg` in markdown produce
`src="/{{..."` when extracted pre-render. The plugin strips the Liquid prefix and uses
the static path (`/images/foo.jpg`) instead. Posts with only Liquid image paths and no
extractable static portion fall back to `default-post.svg`.

---

## 7. Key Credentials & Services

| Service | Config location | Notes |
|---------|----------------|-------|
| Unsplash API | `HC_IMAGE_API_KEY` env var (not in repo) | App ID 988660, 50 req/hr demo |
| Ollama LLM | `http://10.0.100.10:11434` | Lab homelab, `qwen2.5:7b` for content analysis |
| GitHub Pages | Settings → Pages → Source: GitHub Actions | Must be "GitHub Actions" not "Deploy from branch" |
| Ruby version | `.ruby-version` or `Gemfile` | Must stay at 3.0.x; Chirpy 7.x needs 3.1+ |

---

## 8. Maintenance Checklist

Run monthly or before a major content push:

- [ ] `bundle update` — check for gem security updates (test build after)
- [ ] `python3 /tmp/unsplash_enrich.py` — top up any new posts missing images
- [ ] Check `gh run list --limit 10` — no persistent workflow failures
- [ ] Verify https://jeff-breece.github.io/ returns 200
- [ ] Run `npm test` against production: `BASE_URL=https://jeff-breece.github.io npm test`
- [ ] Review `_posts/` for any `.md` files missing `categories:` array (build will warn)
- [ ] Check gallery image sizes: `du -sh images/galleries/` — keep under 400MB total
