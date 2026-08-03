# RedHawk Applied AI — Website

Static site. No build step, no dependencies, no framework. Three files plus images.

```
index.html      all content
styles.css      design system + layout
script.js       scroll behavior, nav, form embed
assets/         images (currently labeled placeholders)
IMAGES.md       what image goes where + sourcing guide
```

---

## Preview locally

```bash
python -m http.server 5173 --directory "C:\Users\ryan5\redhawk-website"
```

Then open <http://localhost:5173>.

> Open it through the server, not by double-clicking `index.html`. The `file://`
> protocol blocks the Google Form iframe.

---

## Before launch — the four things that need real content

### 1. The Google Form — ✅ done
Wired to the live "Redhawk Applied AI Interest Form" (Full Name, Major/Minors, Grade,
Miami Email). Verified loading and publicly reachable with no sign-in wall.

The `utm_source=ig` tracking params from the link-in-bio URL were dropped and
`?embedded=true` added — that param is what makes Google serve the chromeless version.

To swap forms later, change `data-form-src` on the `#interestForm` iframe. The script
validates the URL is a real `docs.google.com/forms/` address before loading it; if not,
it shows a styled fallback with a direct link rather than a broken empty frame.

If the embedded form ends up scrolling internally, adjust the iframe's `height`
attribute (currently `820`).

### 2. The logo
Save your real logo (white circle version) to `assets/logo.png`, then update the two
`<img src="assets/logo.svg">` references in `index.html` — one in the nav, one in the
footer. SVG is better than PNG if you have the vector file.

### 3. The hero campus photo
Save to `assets/hero-campus.jpg` and update the hero `<img>` src.
**See `IMAGES.md`** — use a real photo, not an AI-generated one.

### 4. Exec headshots — ✅ 8 of 9 done
Eight headshots are live in `assets/team/` with real LinkedIn links wired up.
**Still needed: Claire Richardson** (headshot + LinkedIn). Her card currently shows
the placeholder portrait and deliberately has no LinkedIn button — a dead `#` link is
worse than none.

To add her: drop `claire-richardson.jpg` in `Downloads`, add her to the `$map` in
`process-headshots.ps1`, run it, then update her `<article class="member">` block to
match the other eight.

**Adjusting a crop.** Each headshot was auto-cropped to 4:5 from a differently-shaped
source. If someone's face sits too high or low in their card, add a focus override to
that one `<img>` — no other change needed:

```html
<img src="assets/team/ryan-barone.jpg" style="--focus: 50% 18%" ...>
```

Second value is the vertical anchor: **lower % = more headroom above the face**,
higher % = more chin/shoulders. Default is `50% 28%`.

Also still `href="#"`: the two footer social links (Instagram, LinkedIn), and confirm
`redhawkappliedai@miamioh.edu` is your real address (it appears twice — interest
section and footer).

---

## Deploying to Vercel

Because it's a static site with no build step, this is about as simple as it gets.

**Option A — drag and drop (fastest)**
1. Go to <https://vercel.com/new>
2. Drag the `redhawk-website` folder onto the page
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy.

**Option B — Git (better, gives you auto-deploy on every push)**
1. Push this folder to a GitHub repo
2. Vercel → New Project → import the repo
3. Framework preset: **Other**, no build command, output directory `.`
4. Deploy. Every push to `main` redeploys automatically.

**Custom domain:** Vercel dashboard → Project → Settings → Domains. If Miami provides
a subdomain you'll need a CNAME record; a `.org` or `.club` domain runs about $10–15/yr.

---

## Design system reference

Change these in one place — the `:root` block at the top of `styles.css`.

| Token | Value | Used for |
|---|---|---|
| `--paper` | `#FDFCFA` | primary light background |
| `--paper-tint` | `#F4F1EC` | alternating light band |
| `--ink` | `#15161A` | dark bands + footer |
| `--red` | `#C8102E` | Miami red — primary accent |
| `--t1` / `--t2` / `--t3` | text on light | heading / body / muted |
| `--d1` / `--d2` / `--d3` | text on dark | heading / body / muted |

**Type:** Plus Jakarta Sans (headings) · Inter (body) · Instrument Serif (italic accents)

**Section rhythm** — deliberately alternating so it doesn't read as one flat scroll:
`hero (photo) → light → tint → DARK → light → tint → DARK → footer`

---

## Accessibility notes

Verified in-browser, not assumed:

- All body/muted text meets **WCAG AA (4.5:1)** on both light and dark backgrounds.
  `--t3` is specifically tuned to pass at 13px on the tinted background.
- All touch targets are ≥44×44px. (Inline text links are exempt under WCAG 2.5.8.)
- No horizontal overflow at 375px, 768px, 1024px, or 1440px.
- Body text is 16px on mobile, which prevents iOS auto-zoom on focus.
- `prefers-reduced-motion` disables all animation and reveals content immediately.
- Skip link, visible focus rings, semantic landmarks, and labeled icon-only buttons.

**Content is never hidden behind JavaScript.** Reveal animations only activate when JS
is running (via an `html.js` class set before first paint), and a 1.6s failsafe reveals
everything if the observer never fires. If JS fails entirely, the page renders fully
readable — just without the fade-ins.

---

## Editing tips

- **Sections** are `<section class="panel" id="...">`. Add `panel-light`, `panel-tint`,
  or `panel-dark` to set the band color. Adding a section? Also add a matching
  `<button class="rail-dot" data-target="your-id">` to the scroll rail.
- **Reveal on scroll:** add `class="reveal"` to any element. Siblings auto-stagger.
- **Snap scrolling** uses `scroll-snap-type: y proximity` — it guides to section starts
  without trapping you mid-section on tall content. Change `proximity` to `mandatory` in
  `.snap` if you want harder snapping.
