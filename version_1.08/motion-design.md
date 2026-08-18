# motion-design.md — v1.08 UI/Motion Redesign Plan

> Status: **implemented.** Built end-to-end on 2026-08-18; every phase in §8 is done and the
> production build (`build/build.bat`) passes all nine gates. Deviations from the plan and the
> measured numbers are recorded in §10.
> Scope: `version_1.08/` — frontend only (`frontend/src`, `frontend/public/view/css`). No backend,
> admin, `data/profile.json` schema, or route changes.

---

## 0. Sources this plan is built on

| Source | What was taken from it |
| --- | --- |
| [motion.dev](https://motion.dev) — Motion v13.1.0 | `animate()` (mini/WAAPI, 2.3 kB), `scroll()` (ScrollTimeline-backed, off-main-thread), `inView()` (IntersectionObserver wrapper), `stagger()`. Verified export surface: `motion/mini` ships **only** `animate` + `animateSequence`; `scroll`/`inView`/`stagger` come from the `motion` root entry and are individually tree-shakeable. |
| `ui-ux-pro-max` skill (`nextlevelbuilder/ui-ux-pro-max-skill`) | Ran `search.py --design-system "personal portfolio creative developer showcase" --variance 7 --motion 9 --density 4`. Matched pattern: **Scroll-Triggered Storytelling**. Matched style (secondary query): **Cyberpunk UI** (`cyberpunk-ui`). Plus §3 Performance, §7 Animation and the `gsap` motion presets, translated from GSAP into Motion/CSS equivalents. |
| The existing codebase | Every data field, component and CSS partial currently shipping — inventoried in §2. |

**Deliberate deviation from the skill's output:** `--design-system` proposed a Brutalism palette
(`#18181B` / `#2563EB`) and an Archivo/Space Grotesk pairing. That is rejected — it would discard the
existing brand. The site's teal `#00d3b4` + magenta `#fd2155` pair is already textbook `cyberpunk-ui`
("neon accents on dark, glitch, terminal"), and the logo is *literally* two colour-separated layers.
We keep the palette and take the skill's **structural, motion and accessibility** rules instead.

---

## 1. The concept — **DECODE**

> *Information arrives as signal, and resolves into meaning as you scroll.*

One metaphor drives every animation on the site, which satisfies the skill's `motion-meaning` rule
("every animation must express a cause-effect relationship, not just be decorative"):

```
   NOISE  ──────────────▶  SPLIT  ──────────────▶  LOCK
   particles / static      two colour channels     readable, settled content
   (background layer)      offset apart            channels converged
```

Everything on the page is somewhere on that axis:

- The **background** is permanent noise — the particle network, now site-wide.
- The **logo loader** is the split resolving for the first time. Both of its colour groups already
  exist in `favicon.svg` (`#FD2155` group offset ~3.9 px / −1.8 px from the `#00D3B4` group) — the
  glitch is not faked with filters, it animates the real artwork.
- **Every scroll reveal** is a decode: element enters split + dim, snaps to locked + legible.
- The **cursor** is the read-head: an invisible native pointer, a teal probe dot, a lagging magenta
  ring, and the existing implode trail promoted site-wide.
- **Aggregate views** (skill sphere, certificate constellation) are scattered signal *gathering into
  one object* — which is exactly the "multiple info gathered to a component view" ask.

Two colours, two states, one story. No new visual vocabulary is invented anywhere else.

---

## 2. Inventory — every datum currently on screen

Nothing below may be dropped by the redesign. Column 3 is the new treatment (detailed in §5).

### 2.1 `info` (single object)

| Field | Shown where | New treatment |
| --- | --- | --- |
| `full_name`, `first_name`, `last_name` | Hero name, `<title>`, footer credit | Hero: channel-split → lock on load |
| `nick_name` | *not rendered* (hero prints "Farhan" literal) | left as-is |
| `designations[3]` — Sr.Software Engineer / AI Researcher / Art Enthusiast | Typed.js loop in hero | glitch burst on each string swap |
| `intro_text` (HTML) | Hero paragraph | line-wise rise, 40 ms stagger |
| `about_text` (HTML) | About page hero | line-wise rise |
| `expertise_preference_details` (HTML) | Home + Expertise intro copy | rise |
| `contact_preference_details` | Contact panel lead | rise |
| `intro_image_url` | About page CSS background | reveal + subtle parallax |
| `resume_url` | Hero "Resume" button | magnetic hover |
| `address`, `phone`, `email` | Contact list (3 rows, icon-font glyphs K/L/M) | stagger 40 ms + copy-to-clipboard feedback |
| `secondary_phone`, `alternative_email` | *not rendered* | unchanged |
| `facebook_url`, `github_url`, `linkedin_url`, `whatsapp_url` | Social row (glyphs A/B/C/D) | pop-in stagger 50 ms, ring hover |
| `website_domain_name` | Footer copyright | rise |
| `website_base_url` | API host, error pages, `{{base_url}}` expansion | no visual change |
| `profile_id` | every tracking request | no visual change |

### 2.2 Lists

| List | Count | Fields rendered today | New component |
| --- | --- | --- | --- |
| `educations` | 4 | `subject`, `institute_name`, `institute_url`, `end_date`/`start_date`, `activity` | Converging timeline (left rail) |
| `experiences` | 3 | `position`, `institute_name`, `institute_url`, dates, `project_details`, `project_text_1`, `project_url_1` | Converging timeline (right rail) |
| both, interleaved | 7 | same, zig-zag | About page: **spine draw** timeline |
| `expertises` | 23 | `name` only (sphere) / `name`+`level`+`duration`+`description` (Expertise page cards) | **Skill sphere assembly** — sphere now surfaces level/duration/description on lock-on |
| `skills` | 12 | `name`, `percentage`, derived level label | **Charge meters** (scaleX fill + count-up) |
| `achievements` | 10 | `certification_logo`, `name` (tooltip), `certification_url` | **Certificate constellation** — adds `level` + `certification_date` to the tooltip |
| `projects` | 8 | card: `logo_image`, `name`, `type`, `stack`, `work_role`, `details`; detail page: `+ start_date`, `last_contribution_date`, `scope_of_work`, `current_status`, `methodology`, `tech_stack` (CSV → chips), `challenges`, `future_scope`, `live_text`/`live_url`, `source_url`, `media[]` | Velocity marquee (home) / wave grid (/works) / staggered dossier (/work) |
| `projects[].media` | 5 on p1 | `media_type` Image \| Vimeo \| Video, `media_link` | lazy reveal, click-to-play video |
| `gallery` | 11 across 6 categories | `thumb_url`, `image_url`, `name`, `description`, `category` | Centre-out wave + **FLIP shared-element** into the photo viewer; category surfaces as a chip |

### 2.3 Non-profile surfaces

`/gaming` (YouTube list, sort filter, skeletons, `runfzrun.png` loader) · `/syncbot` (its own ambient
console UI) · `/403 /404 /500` · Navbar · ThemePopup · BackToTop · PhotoViewer · Footer.
Treatment: these inherit the four global systems only — **no bespoke choreography**, see §5.9.

---

## 3. Design language

### 3.1 Colour (unchanged brand, formalised)

```css
--sig-teal:      #00d3b4;   /* channel A — primary, "locked" */
--sig-magenta:   #fd2155;   /* channel B — secondary, "split" */
--sig-teal-dim:  rgba(0,211,180,.40);
--sig-mag-dim:   rgba(253,33,85,.40);
/* dark  */ --ink-0:#252525; --ink-1:#343434; --paper:#e7e7e7; --paper-2:#a3a3a3; --paper-3:#b4b4b4;
/* light */ --ink-0:#ffffff; --ink-1:#f6f6f6; --paper:#252525; --paper-2:#343434; --paper-3:#7f7f7f;
```

Roles are fixed, and this is the only place hex appears:

| Role | Dark | Light |
| --- | --- | --- |
| Locked / success / active | teal | teal |
| Split / alert / hover-secondary | magenta | magenta |
| Link text | teal (`cross-theme`) | magenta (`cross-theme`) |
| Particle dots & links | `#9a9a9a` @ 0.5→0 by distance | `#6f6f6f` @ 0.35→0 |

⚠ **Contrast audit needed before build:** teal on white is ≈1.9:1 and magenta on white is ≈4.0:1 —
both fail 4.5:1 for body text in light mode. Rule to adopt: *neon is for accents, borders, glows and
large text only; never for light-theme body copy.* Existing usage is already compliant except link
text in light mode, which needs to go to `#d4104a` (≈5.0:1) or gain an underline.

### 3.2 Typography

No new webfont is downloaded. Titillium Web stays the body face; a **system mono stack** carries the
"terminal" register at zero byte cost:

```css
--font-body: "titillium-font", system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
```

Mono is used for: tech-stack chips, dates, percentages, project status/methodology, the loader's
status line, the section index rail. This delivers the skill's "code / developer / technical" mood
that the JetBrains Mono recommendation was aiming at, for free.

Scale (rem, 16 px base, line-height 1.5 body / 1.15 display):

```
display 4.0 → 2.4 (clamp)   h1 2.4   h2 1.75   h3 1.25   body 1.0   small .875   micro .75
```

Also: convert `TitilliumWeb-Regular.ttf` (57 kB) → `.woff2` (≈22 kB), add `font-display: swap`,
and preload it. That alone offsets most of the JS this plan adds.

### 3.3 Motion tokens — one rhythm for the whole site

The skill's `motion-consistency` and `duration-timing` rules require shared tokens, not
per-component numbers.

```css
--mo-instant: 90ms;    /* press feedback, hover colour */
--mo-fast:   160ms;    /* exits, dismiss  (= ~60% of base, per exit-faster-than-enter) */
--mo-base:   320ms;    /* standard reveal, state change */
--mo-slow:   560ms;    /* hero, section-level, shared-element */
--mo-glitch: 220ms;    /* the decode burst — always stepped, never eased */

--ease-enter: cubic-bezier(.16,1,.3,1);    /* decelerate in  (≈ expo.out) */
--ease-exit:  cubic-bezier(.7,0,.84,0);    /* accelerate out (≈ expo.in)  */
--ease-soft:  cubic-bezier(.4,0,.2,1);     /* colour, opacity */
--ease-step:  steps(3, end);               /* glitch only */
--spring-ui:  { stiffness: 260, damping: 26 }   /* cursor ring, magnetic buttons */

--stagger:      40ms;   /* per item (skill: 30–50 ms) */
--stagger-max:  8;      /* items after the 8th share the 8th's delay — total ≤ 320 ms */
--rise:         16px;   /* text reveal offset */
--rise-card:    24px;   /* card reveal offset */
--split-max:    8px;    /* max channel separation */
```

Hard rules derived from the skill's §7:
- Transform + opacity only. Never animate `width`, `height`, `top`, `left`, `margin`.
  (This directly replaces today's `animate-left/right/top/bottom`, which animate `margin-*` by 300 px.)
- Reveal once. `toggleActions` equivalent = play, never reverse.
- 1–2 focal animations per viewport. A stagger group counts as one.
- Every animation interruptible; nothing blocks input; no correctness depends on `animationend`.

### 3.4 Depth & surface

Four planes, fixed z-order — this is what makes a site-wide canvas safe:

```
z -1   particle field (fixed, canvas, pointer-events:none, aria-hidden)
z  0   page content
z  10  sticky chrome — navbar, scroll progress, section rail, back-to-top
z 100  overlays — photo viewer, theme popup, loader
z 999  cursor layer (pointer-events:none, aria-hidden)
```

Surfaces: `bg1` page, `bg2` card, 1 px `rgba(255,255,255,.06)` hairline in dark /
`rgba(0,0,0,.08)` in light, radius 4 px (kept angular per `cyberpunk-ui`), no blur-heavy glass
(the skill flags `drivers:blur` as a moderate perf cost — we take the glow, skip the blur).

---

## 4. Four global systems

Everything in §5 is composed from these four. They are built first, in this order.

### 4.1 `GlitchLoader` — the logo boot sequence

Replaces `components/PreLoader/PreLoader.tsx` (currently a 1 s `scale()` heartbeat on an `<img>`).

`favicon.svg` is inlined as a React component so its two `<g>` groups are addressable. No filters,
no image duplication, no extra request.

Timeline (~1.0 s, then holds/loops until ready):

| t | What |
| --- | --- |
| 0–120 ms | Both channels fade 0→1 at **max split**: magenta `translate(-8px,+3px)`, teal `translate(+8px,-3px)`. Scanline overlay at full opacity. |
| 120–420 ms | Converge to the artwork's native offset, `--ease-step` — 3 discrete jumps, not a glide. At step 2 a 14 px-tall horizontal band (`clip-path`) offsets by 10 px for one frame. This is the glitch. |
| 420–700 ms | A 2 px teal→magenta scanline sweeps top→bottom (transform only). |
| 700–1000 ms | Settle. Breathing `scale(1 → 1.03)` at 2.4 s loop while still waiting. |
| bottom | 1 px hairline progress bar, real progress where known (fonts loaded / profile fetched), indeterminate shimmer otherwise. Mono status line: `DECODING PROFILE…` → `LOCK`. |

Also fixes the current load path: `usePageReveal` today waits for two `FontFace` loads **and then a
hard `setTimeout(1000)`** on *every* page view. New rule: **min 700 ms** (so the animation reads) and
**max 1400 ms** (so a slow font can't hold the page hostage) — fonts move to `font-display: swap`
and stop gating the reveal.

`/gaming` keeps `runfzrun.png`: a generic `<GlitchLoader src>` variant stacks two tinted copies with
`mix-blend-mode: screen` for the same split, so one component serves both.

Reduced motion → static logo, opacity fade only, no split, no sweep.

### 4.2 `ParticleField` — site-wide backdrop

Today `initParticleNetwork` is mounted **inside the hero only**, sized to the viewport, at
`density: 15000` with unbounded particle count and an O(n²) link pass. Promoting it as-is would be
the single biggest risk to the "must stay light" requirement, so it is rewritten:

| Change | Why |
| --- | --- |
| Mounted once in `App`, `position: fixed; inset: 0; z-index: -1; pointer-events: none; aria-hidden` | one canvas for the whole SPA, survives route changes |
| **Hard particle cap**: `min(area / 22000, 90)` desktop, `min(area / 30000, 40)` under 800 px | bounds the frame cost regardless of screen size |
| **Spatial hash grid** bucketed at `netLineDistance`, 9-cell neighbour scan | replaces the O(n²) double loop; ~10× fewer distance tests |
| DPR capped at 1.5 | 4K screens currently render 4× the pixels for a background |
| Pointer tracked at **document** level, rAF-throttled, never `preventDefault` | ⚠ today's `touchmove` handler calls `preventDefault()` — site-wide that would **break scrolling on every mobile page**. Must not ship. |
| Colours read from `--theme-color` / `--theme-secondary-color`; link colour lerps teal→magenta by distance | ties the backdrop to the brand and to the theme toggle |
| Pauses on `visibilitychange`, on `prefers-reduced-motion` (renders one static frame), and while `/syncbot` is mounted (it has its own ambient layer — two canvases is waste) | |
| **Glitch pulse**: every 6–14 s, a 180 ms window where a 60–140 px horizontal band shifts x by ±3 px and link alpha jumps ~1.6× | the site-wide glitch the concept asks for, at ~0 cost |
| Scroll parallax via `scroll()`: canvas element gets `translateY` of ≤ 8 % of scroll | one composited transform, no redraw |

Click-to-spawn is kept (it is a nice easter egg) but capped at +12 particles above the baseline,
decaying back over 6 s.

Frame budget: **≤ 3 ms at 1080p** with 90 particles. Measured in Phase 5.

### 4.3 `Cursor` — hidden pointer, visible read-head

The user's ask: native cursor invisible everywhere, the existing trail everywhere.

```
cursor: none            on html, body and all children — only under @media (pointer: fine)
```

Three layers in one fixed `aria-hidden` container:

1. **Probe** — 6 px teal dot, tracks the pointer 1:1 in the shared rAF loop.
2. **Ring** — 28 px magenta 1 px ring, lags with a spring (`stiffness 260, damping 26`). On
   interactive hover it scales to 1.8 and the probe dims — driven by **one delegated `pointerover`
   listener** setting `data-cursor="link|text|media|drag"` on the container, not per-element listeners.
3. **Trail** — the existing `.ball` implode keyframe, promoted site-wide, but **pooled**:
   14 pre-created divs recycled round-robin, emitted at most every 40 ms and only after >12 px of
   movement. Today's version does `createElement` + `appendChild` on *every* `mousemove` and removes
   on `animationend` — at site scale that is hundreds of nodes per second and unacceptable.

Fallbacks — non-negotiable:
- `@media (pointer: coarse)` → the whole layer is not rendered and `cursor: auto` is restored.
- `prefers-reduced-motion` → probe only, no lag, no trail.
- The existing `cursor-b.png` / `cursor-w.png` rules in `dark.css` / `light.css` are deleted.
- ⚠ Because the pointer disappears, **keyboard focus must become visible**. Today
  `01-base.css` has `*:focus { outline: none !important }`, which the skill flags as a CRITICAL
  anti-pattern. Replaced with a `:focus-visible` teal ring on every interactive element. Hiding the
  cursor without this is a regression, not a style.

### 4.4 `reveal` — the scroll engine

One observer per page, driven by declarative attributes. No per-component observers.

```html
<div data-reveal="rise"                >…</div>
<h2  data-reveal="decode"              >…</h2>
<ul  data-reveal="stagger" data-reveal-from="center">…</ul>
<div data-reveal="rise" data-reveal-delay="120">…</div>
```

| Variant | Motion | Duration | Used by |
| --- | --- | --- | --- |
| `rise` | `opacity 0→1`, `y 16→0` | `--mo-base` / `--ease-enter` | body copy, list rows — the default |
| `card` | `opacity 0→1`, `y 24→0`, `scale .98→1` | `--mo-base` | cards, tiles, panels |
| `decode` | two pseudo-copies (teal/magenta) at `--split: 6px → 3px → 0`, 3 stepped frames, then main text `opacity 1` | `--mo-glitch` | every `.section-head`, page titles, project names |
| `stagger` | children run `rise`/`card` at 40 ms apart, `from: start\|center`, capped at 8 | ≤ 320 ms | grids, lists, chip rows |
| `line` | `scaleX(0→1)` from left | `--mo-slow` | `#content-gap` rules, timeline spines, underlines |
| `meter` | `scaleX(0→pct)` + count-up on the number | `--mo-slow` | skill bars |
| `assemble` | items fly from scattered offsets to layout position | `--mo-slow` | skill sphere, constellation |

Trigger: `inView(el, cb, { amount: 0.15, margin: "0px 0px -12% 0px" })` — equivalent to GSAP's
`start: 'top 88%'`. **Once only.** Reduced motion → observer fires and applies the *final* state with
zero duration, so content is never invisible.

This also retires two current behaviours:
- `wobbleAnimation()` is bound to `window.scroll` and, on every scroll pass, rewrites matched
  elements' `innerText` into per-letter `<span>`s. That is a DOM write storm on scroll and it
  destroys the accessible text node mid-animation. **The scroll listener goes away entirely.** The
  per-letter wobble is kept for `mouseover`/`click` only (it's a signature interaction) and, where a
  scroll-in effect is wanted, `decode` does it with pure CSS and no DOM rewriting.
- `animate-left/right/top/bottom` (300 px `margin` animations) are re-implemented as transforms
  under the same class names, so no JSX changes are needed for that swap.

### 4.5 Scroll progress + section rail (small, but the concept's spine)

- 2 px top bar, teal→magenta gradient (same gradient as the existing scrollbar thumb), driven by
  `scroll()` on a ScrollTimeline — literally zero main-thread cost where supported.
- Home + About only: a right-edge rail of 5 mono-labelled dots (`BACKGROUND / EXPERTISE / WORKS /
  HOBBIES / CONTACT`). Active dot expands to a teal capsule with the label. Real `<a>` anchors, so
  it is keyboard-navigable, not decoration.

---

## 5. Section-by-section choreography

Every entry states which data it renders, so §2 is fully covered.

### 5.1 Hero — `IntroAnimation`

Renders: name, 3 typed designations, `intro_text`, Contact / Resume / Ask AI buttons.

- **Load:** name locks in via the same channel-split as the loader (visual rhyme, ~360 ms), then
  designation types, then `intro_text` rises line by line at 40 ms, then the three buttons at 60 ms.
  Total ≤ 1.1 s and fully interactive from t=0.
- **Typed swap:** on Typed.js `onStringTyped`, add `.decode` for 200 ms — each designation change
  glitches. This is the only infinite-ish motion in the hero, and it's user-legible (`continuous-animation`
  rule: infinite motion must carry meaning; a type loop does).
- **Scroll out (the one scrubbed region on the page):** `scroll(cb, { target: hero, offset:
  ['start start','end start'] })` drives name `scale 1→0.92` + `opacity 1→0`, the particle field
  brightening, and `#content-gap`'s rule drawing in. The skill's rule is *don't pin more than 1–2
  sections* — we pin **zero** and scrub one, which is even safer for mobile.
- **Buttons:** magnetic hover (translate ≤ 6 px toward the pointer, spring), `scale(.97)` on press
  (`scale-feedback`). "Ask AI" keeps its existing sheen.

### 5.2 Background — education (4) + experience (3)

Renders: subject / position, institute name + link, dates, activity / project details + project link.

**Converging timeline.** A vertical hairline draws down the centre as the section scrolls (`line`).
Education entries arrive from the left, experience from the right, alternating, 80 ms apart. Per
entry: hotspot dots pulse → header `decode` → sub-header + description `rise` (60 ms internal
stagger). The existing hover translate (`move-right` / `move-left`) is kept but retimed to
`--mo-base` / `--ease-enter`.

⚠ Accessibility fix folded in: `point-box` rows are `<div onClick={window.open}>` today. They become
real `<a>` elements — keyboard reachable, middle-clickable, and they get the new focus ring.

### 5.3 Expertise — the flagship section

**(a) Skill sphere — "the cloud forms".** This is the component the user singled out.

Current: `TagCloud` 2.2.0 builds a rotating sphere of the 23 names, and is **fully torn down and
rebuilt on every window width change**.

Proposed: **drop the TagCloud dependency** and write ~90 lines of our own sphere. Reasons, in order:

1. It removes a dependency (≈3 kB) — the new code is smaller, so the sphere is *bundle-negative*.
2. Assembly becomes possible. TagCloud writes `transform` on every span every frame, so anything we
   animate on the same elements fights it.
3. It fixes the resize teardown (recompute the radius, don't rebuild the DOM).
4. Tags become real elements we control, so they can carry `level` / `duration` / `description`.

Behaviour:
- Positions from a Fibonacci sphere (even distribution, no clustering at the poles — TagCloud's
  ring layout clusters).
- **Assemble:** the 23 names begin scattered across the section at particle-field positions, at
  `scale(.4)`, `opacity 0`, `blur(4px)`. On `inView` they fly to their sphere positions with 30 ms
  stagger and `--ease-enter` over `--mo-slow`, blur resolving to 0. The particle field is *where they
  came from* — the section literally condenses out of the background.
- **Idle:** one shared rAF, `translate3d` per tag, ~0.15°/frame. Speed and axis follow the pointer
  when it is over the section; sphere slows to 40 % when off-screen and stops entirely when the tab
  is hidden.
- **Lock-on (hover / focus):** tag scales 1.35, gains a teal glow, and a mono card appears beside
  the sphere with `name · level · duration months · description`. Today those three fields are only
  visible on `/expertise`; surfacing them here is the "multiple info gathered into one component
  view" the brief asks for.
- Depth: `opacity` and `font-size` scale with z, so the back of the sphere recedes.
- Reduced motion / coarse pointer / < 640 px → no sphere. It degrades to a **static tag grid** with
  the same lock-on card on tap. This is not a fallback afterthought: 23 tags on a 375 px screen is a
  better grid than it is a sphere.

**(b) Skill bars → charge meters.** 12 skills, `name` + `percentage`.
`scaleX(0 → pct)` with `transform-origin: left` (never `width` — `transform-performance`), 40 ms
stagger, the number counts up over the same duration, and the derived level label
(`getExpertiseLevel`) fades in on completion. Track gets a faint scanline texture.

**(c) Achievements → certificate constellation.** 10 certificate logos.
Currently a flat row of `<img>` in a tooltip wrapper. New: nodes laid out on a shallow arc / hex
cluster, connected by **the same line style as the particle network** (drawn as SVG `<line>`s, ~14
lines, static — no per-frame cost). On reveal: nodes scale `.6→1` with a small overshoot, 50 ms
stagger, then the connecting lines draw (`stroke-dashoffset`, `--mo-slow`). Hover/focus: node lifts
6 px, its incident lines brighten to teal, and the tooltip grows to `name · level · certification_date`
(today it shows `name` only). Click still opens `certification_url`.
⚠ Every `<img>` gains a real `alt` (currently missing on all 10).

### 5.4 Works — home marquee

8 projects, showing `logo_image`, `name`, `type`, `stack`.

Keep the endless CSS marquee — it is cheap and it works. Add:
- **Velocity skew:** `scroll()` exposes `info.y.velocity`; map it to `skewX` (±3° max, spring-damped
  back to 0) and to a marquee speed multiplier (0.6×–1.6×). One transform on one wrapper.
- Cards `decode` in on first reveal.
- Hover already un-greyscales the image and shows `type` / `stack`; retimed to `--mo-fast`, and the
  `display:none → flex` swap becomes an opacity/translate transition so it doesn't snap
  (`state-transition` rule).
- Pause the marquee on hover and when off-screen.

### 5.5 Works — `/works` grid

8 project cards with `logo_image`, `name`, `work_role`, `details`, `type`, `stack`.

- Grid reveal wave `from: 'center'` (the skill's bento-grid recommendation), 40 ms stagger, capped at 8.
- Hover: keep the current lift; **remove** `animate-infinite-tossing` — an infinite animation on
  hover violates `continuous-animation` and reads as jitter. Replace with a single `translateY(-6px)`
  + teal edge glow, and add the first 3 `tech_stack` chips sliding in from the bottom edge.
- `loading="lazy"` + explicit `aspect-ratio` on every `logo_image` (the skill's `image-dimension` /
  CLS rule — these are remote Flickr/CDN images with no dimensions today).

### 5.6 Work detail — `/work?work_id=n`

Renders the full dossier: `name`, `work_role`, `logo_image`, `details`, `media[]`, `type`, `stack`,
`start_date`, `last_contribution_date`, `scope_of_work`, `live_text`/`live_url`, `source_url`,
`current_status`, `methodology`, `tech_stack`, `challenges`, `future_scope`.

- Title `decode`, role rises beneath it.
- Left column: logo + `details` rise together; `media[]` items reveal on scroll, lazily, videos
  click-to-play (never autoplay — skill `auto-play-video` rule).
- Right column becomes a **mono dossier panel**: the stat rows stagger in at 25 ms; `tech_stack`
  chips (split from the CSV) cascade last at 20 ms each; `challenges` and `future_scope` as tagged
  rows.
- ⚠ Bug to fix while here: `ProjectDetails` prints the literal string `"null"` for absent
  `challenges` / `future_scope` (`String(project.challenges)`). The redesign hides the row instead.

### 5.7 Hobbies / gallery

11 items across 6 categories: `thumb_url`, `image_url`, `name`, `description`, `category`.

- Reveal: centre-out wave, 40 ms, each tile flashing a 1-frame RGB split as it lands.
- Keep the pointer-tilt (it's good), but move the per-`mousemove` inline style writes into the shared
  rAF loop — right now every mouse event writes `boxShadow` + `transform` synchronously after a
  `getBoundingClientRect()` read, which is exactly the read/write interleaving the skill's
  `reduce-reflows` rule warns about.
- `category` surfaces as a mono chip on hover; `name` already shows via `data-name`.
- **Shared-element open (FLIP):** clicking a tile measures its rect, then animates the full-size
  image from that rect to the viewer position in one transform over `--mo-slow`. Close reverses at
  `--mo-fast`. This is the skill's `shared-element-transition` + `modal-motion` pair and it is the
  single highest-impact addition on this page.
- ⚠ Alt text from `name` on every gallery image (missing today).

### 5.8 Contact

Renders `contact_preference_details`, address/phone/email, 4 socials, the message form, footer.

- The Flickr parallax background moves from `background-attachment` (a known mobile jank source) to
  a transform-driven layer at ≤ 12 % scrub (`parallax-subtle`).
- Section head `decode`; the two panels rise 80 ms apart; contact rows 40 ms; socials 50 ms with a
  ring-draw on hover.
- Form: label floats on focus, a teal underline draws left→right over `--mo-fast`, inline validation
  with the error message beside the field (skill §8: `inline-validation`, `error-clarity`, never
  placeholder-as-label). Submit → button morphs to a progress state → teal check on success,
  magenta shake (≤ 6 px, one cycle) on failure.
- Copying a contact detail flashes a "COPIED" mono chip — the tracking event already exists for it.

### 5.9 Chrome, and what deliberately stays plain

- **Navbar** — background/shadow now driven by `scroll()` instead of the removed scroll listener;
  hides on scroll-down, returns on scroll-up (velocity sign, `--mo-fast` out / `--mo-base` in); the
  active-link underline is one element that slides between items. Mobile menu: slide + 40 ms stagger
  on the 5 links.
- **Theme toggle** — a 220 ms full-screen channel-swap glitch replaces the current approach, where
  ~40 selectors each carry `transition: all 0.5s`. `transition: all` on that many elements is a real
  cost on every repaint, not just on toggle.
- **BackToTop** — spring rise, teal ring on hover, `:focus-visible` ring.
- **ThemePopup** — unchanged behaviour, retimed to the tokens.
- **`/gaming`, `/syncbot`, `/403 /404 /500`** — inherit loader, cursor, particles (suppressed on
  `/syncbot`) and `reveal`, and nothing else. SyncBot's ambient console is already a coherent
  design; this plan does not touch its internals. Gaming gets `reveal` on its video grid and keeps
  its skeletons.

---

## 6. Technical decisions

### 6.1 Library

Motion v13.1.0, imported surgically:

```ts
import { animate }                 from 'motion/mini'  // WAAPI-only, 2.3 kB
import { inView, scroll, stagger } from 'motion'
```

- `animate` from **`motion/mini`** — WAAPI, runs off the main thread, no spring engine. Covers ~90 %
  of what we need (reveals, meters, glitch steps).
- `inView` — an IntersectionObserver wrapper; that's all the reveal engine needs.
- `scroll` — ScrollTimeline-backed. The progress bar, hero scrub, parallax and marquee velocity all
  ride it, which is why they cost effectively nothing.
- `stagger` — a pure delay function.
- The cursor spring and the sphere run in **our own rAF**, not Motion's, because they must share one
  frame loop with the particle field (see 6.3).

**Bundle gate:** measure the gz delta after Phase 1. **If Motion adds more than 10 kB gz, we drop it**
and ship the equivalent in ~2 kB of native `IntersectionObserver` + `element.animate()` + one passive
scroll listener. The API surface we use is small enough that this swap is a contained change, and the
"must stay light" constraint outranks the library choice.

### 6.2 Budget

Current build: **298.5 kB JS / 63.4 kB CSS** uncompressed (≈95 kB / ≈12 kB gz).

| Line item | Δ gz |
| --- | --- |
| Motion (`animate` mini + `inView` + `scroll` + `stagger`) | +6 … +9 kB |
| Remove `TagCloud` 2.2.0 | −3 kB |
| New JS: field, cursor, reveal, sphere, constellation, FLIP, rAF conductor | +5 kB |
| New CSS: `24-motion.css` + edits | +2 kB |
| Titillium `.ttf` → `.woff2` | **−35 kB** |
| **Net** | **≈ −16 … −22 kB** |

The redesign should ship *smaller* than what is there now. If it doesn't, the Phase 5 gate fails and
we cut back.

Runtime targets: 60 fps scroll on a mid-tier laptop and a 2020-era Android; ≤ 16 ms/frame with
particles + cursor + sphere all live; LCP unchanged; CLS < 0.1 (helped by adding the missing image
dimensions); no long task > 50 ms during the reveal cascade.

### 6.3 One rAF conductor

**Non-negotiable.** A single `raf.ts` owns one `requestAnimationFrame` loop; the particle field, the
cursor, and the sphere subscribe to it. Three independent loops is the classic way a site like this
ends up at 30 fps. The conductor also does the read/write split: all `getBoundingClientRect()` reads
in one pass, all style writes in the next (`reduce-reflows`).

It stops on `visibilitychange`, and each subscriber can self-suspend when off-screen.

### 6.4 Files

**New**
```
src/lib/motion/tokens.ts        the §3.3 values, single source, mirrored into CSS vars
src/lib/motion/raf.ts           the shared frame loop
src/lib/motion/reveal.ts        inView engine + variant table
src/lib/motion/flip.ts          ~40 lines, shared-element transitions
src/lib/particleField.ts        rewrite of lib/particleNetwork.ts
src/components/Cursor/Cursor.tsx
src/components/GlitchLoader/GlitchLoader.tsx   (+ inlined logo SVG component)
src/components/ScrollProgress/ScrollProgress.tsx
src/components/SectionRail/SectionRail.tsx
src/components/SkillSphere/SkillSphere.tsx     (replaces SkillCloud)
src/components/Achievements/Constellation.tsx
src/styles/24-motion.css        tokens, reveal variants, glitch, cursor, focus rings
```

**Changed**
```
App.tsx                      mount ParticleField + Cursor + ScrollProgress once
hooks/usePageReveal.ts       drop the scroll listener + fixed 1 s; min/max loader window
lib/wobble.ts                hover/click only; scroll path deleted
components/PreLoader         → GlitchLoader
components/PageShell         loader swap
components/SkillCloud        → SkillSphere (deleted)
components/SkillBars         meter variant
components/Gallery           rAF tilt + FLIP open
components/PhotoViewer       FLIP receive
components/Works/*           velocity skew, wave grid, no infinite toss
components/ProjectDetails    dossier stagger + the "null" fix
components/Timeline/*        converging rails, <a> semantics
components/Navbar            scroll()-driven, sliding underline
components/ContactForm       inline validation + morph submit
styles/01-base.css           :focus-visible, scoped user-select, token import
styles/10-animations.css     margin animations → transforms
styles/index.css             + 24-motion.css
public/view/css/theme/*.css  drop cursor:url(), drop blanket transition:all .5s
index.html                   remove user-scalable=no, preload woff2
package.json                 + motion, − TagCloud
```

---

## 7. Accessibility — fixes this redesign must carry

Hiding the cursor and animating everything raises the bar, so these ship *with* the design, not after.

| Issue (present today) | Fix |
| --- | --- |
| `*:focus { outline: none !important }` | `:focus-visible` teal ring on every interactive element — mandatory once the cursor is hidden |
| `user-select: none` on `*` — contact details can't be copied | scope to decorative/animated text only |
| `user-scalable=no` in the viewport meta — WCAG 1.4.4 failure | remove |
| No `alt` on achievement, work-card or gallery images | populate from `name` |
| `point-box` / work cards are `div`s with `onClick` | real `<a>` / `<button>` |
| Remote images have no dimensions | `aspect-ratio` + `loading="lazy"` |
| `wobble` rewrites text nodes on scroll | replaced by CSS-only `decode` |
| Neon on light theme fails 4.5:1 | accents only; link text darkened |

**`prefers-reduced-motion: reduce` — the complete path**, per the skill's HIGH-severity rules:
particle field renders one static frame · no trail, no lag on the cursor ring (or the native cursor
returns) · loader is a fade · `decode` becomes a plain fade · all reveals apply final state at 0 ms ·
sphere becomes the static grid · marquee stops · parallax and scrub disabled · form feedback stays
(it's functional, not decorative). Nothing is ever left invisible.

---

## 8. Phases

| # | Phase | Contents | Done when |
| --- | --- | --- | --- |
| 0 | Foundation | tokens.ts + `24-motion.css`, rAF conductor, reduced-motion path, the §7 a11y fixes, transform-based `animate-*` | axe clean, keyboard-navigable, nothing visually changed yet |
| 1 | Loader | `GlitchLoader`, inlined logo, min/max window, woff2 + `font-display` | loader reads at 700 ms and at 3 s; **bundle gate on Motion measured here** |
| 2 | Backdrop + cursor | `ParticleField` site-wide, `Cursor`, trail pool | 60 fps on every route incl. mobile; scrolling verified unbroken on touch |
| 3 | Reveal engine | `reveal.ts`, variants, applied to every existing section, old scroll listener deleted | no scroll-driven DOM writes remain |
| 4 | Signature components | SkillSphere, Constellation, timeline rails, marquee velocity, gallery FLIP, dossier, navbar, contact form | every §2 datum present and animated |
| 5 | Polish + gate | measurement, budget check, 375/768/1024/1440, light + dark, reduced motion | §6.2 numbers met, `build.bat` release green |

Each phase is independently shippable; the site is never left half-animated.

### Acceptance checklist (skill's pre-delivery list, adapted to web)

- [ ] No emoji as icons — SVG / icon-font only *(already true)*
- [ ] Every interactive element has a visible `:focus-visible` state
- [ ] Hover states transition, never snap
- [ ] 4.5:1 body text in **both** themes, verified with a contrast tool
- [ ] `prefers-reduced-motion` honoured on every animation listed here
- [ ] 375 / 768 / 1024 / 1440 px, portrait + landscape
- [ ] No horizontal scroll at any width
- [ ] Transform + opacity only; zero `width`/`height`/`margin` animations
- [ ] One rAF loop; everything pauses when hidden or off-screen
- [ ] Bundle ≤ current size (§6.2)
- [ ] Touch: scrolling never blocked, no cursor layer, tap targets ≥ 44 px

---

## 9. Decisions taken

| # | Question | Decision |
| --- | --- | --- |
| 1 | Skill sphere | **Own sphere.** `TagCloud` removed; `SkillSphere` does the assemble and the lock-on readout. |
| 2 | Cursor scope | **Hidden everywhere including `/syncbot`; `/gaming` keeps its native cursors** — pointer, caret and all. On `/gaming` the cursor layer is not rendered at all, so nothing is parked in the corner. |
| 3 | Loader | **Shortened, and only when needed.** 140 ms grace before it appears; if it appears it holds 700 ms; font wait capped at 1400 ms. A warm load never shows it. |
| 4 | Section rail | **Added** on home and about. |
| 5 | `runfzrun-dp.png` (1.4 MB) | **Left alone**, to be replaced by hand later. |

---

## 10. What actually shipped — deviations and measurements

### Measured budget (§6.2 revisited)

| | before | after | delta gz |
| --- | --- | --- | --- |
| JS | 298.5 kB / 93.9 kB gz | 333.8 kB / 108.8 kB gz | **+14.9 kB** |
| CSS | 63.4 kB / 12.8 kB gz | 90.8 kB / 18.0 kB gz | **+5.2 kB** |
| Fonts | 61.3 kB (`.ttf`) | 22.5 kB (`.woff2`) | **−38.8 kB** |
| **Net over the wire** | | | **−20.6 kB** |

The **Motion bundle gate passed**: measured in isolation (temporary manual chunk) Motion is
22.5 kB raw / **8.6 kB gz**, under the 10 kB ceiling, so the native-API fallback was not needed.
The rest of the JS delta is the new components — the particle field, cursor, sphere, constellation,
FLIP, rAF loop and reveal engine — net of the `TagCloud` removal.

### Deviations from the plan

- **`content-visibility: auto` on `.nav-section` was reverted.** It implies `contain: paint`, which
  clipped the CTA buttons that deliberately straddle two sections, and made
  IntersectionObserver measurements unreliable while a section was skipped. Not worth the paint
  saving at this page size.
- **The page background moved to `<html>`.** Not in the plan, but required: `body` and
  `.main-page` both painted `#252525`, so the field was only visible in the top viewport where
  margin collapsing left the root background exposed. The canvas now sits above `html`'s ground and
  behind everything else, which is what "behind the whole site" actually needs.
- **`line` and `spine` reveals animate the `scale` property, not `transform`.** `.ex-box-line` is
  centred with `translateX(-50%)`; animating `transform` would have wiped it. Same reason the hero
  scrub writes `scale` rather than `transform` on `.intro-text`.
- **The reveal engine has a safety-net sweep.** The observer alone left the footer unrevealed on
  `/gaming`. A debounced scroll sweep now reveals anything whose box has entered the viewport and
  detaches itself once nothing is pending, so content can never be stranded at opacity 0 —
  whatever the container or layout does.
- **The skill-bar level chip moved into the info row.** The old `::after` chip above the fill sat
  exactly where the new percentage read-out does; both now live in one mono line
  (`ADVANCED  72%`) and the pseudo-element chips are off.
- **Light-theme neon was darkened for small text.** A `--sig-teal-text` token per theme
  (`#00d3b4` dark / `#00786a` light) carries every mono label, and `.cross-theme` link text in
  light mode went from `#fd2155` (4.0:1) to `#d4104a` (5.1:1).
- **Section heads carry a data-derived meta line** (`02 — 23 technologies · 12 skills`). The counts
  are read off `profile.json`, so no copy was invented.
- **`cursor-b.png` / `cursor-w.png` are now unreferenced** (579 bytes total). Left in place rather
  than deleted.

### Verified

Driven with Playwright across `/`, `/about`, `/expertise`, `/works`, `/work?work_id=1`,
`/hobbies`, `/gaming`, `/syncbot`, `/404`:

- no console errors and no page errors on any route
- every `[data-reveal]` element reaches `data-revealed="true"` on every route
- loader appears on a slow load, and **does not appear** on a fast one
- reduced motion: 0 unrevealed elements, 0 trail dots, 37 elements marked instant
- `/gaming`: `html[data-cursor-hidden]` absent, cursor layer not rendered
- `/syncbot`: cursor hidden, particle canvas `display: none`
- touch at 375 px: page scrolls (the old `preventDefault` on `touchmove` is gone), `body` cursor `auto`
- light and dark themes, 375 px and 1440 px
- `build/build.bat --skip-install` → BUILD OK, 60 files, all PHP parses, no localhost in the bundle

---

*Written and implemented against `version_1.08` on 2026-08-18.*
