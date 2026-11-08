# KOVA Planning Co. | Website v06.6

Six-page static website for a founder-led Auckland planning consultancy.

## What changed
- A new monochrome **architectural linework system**: aerial neighbourhood massing, subdivision/site plan, streetscape perspective and contour studies. All drawings are original SVG strokes with transparent backgrounds, shared pen weights and no photography or filled image cards.
- The visual studies are integrated into the six page layouts and designed not to obscure copy or interactive tools.
- Refined the header, mobile menu and footer project enquiry actions with thin rules, consistent type and light space in place of a solid black slab.
- Existing planning content, six page journeys, tools and the draft-only enquiry form remain unchanged.

## Pages
Home · Expertise · Our Approach · Planning Explained · About · Contact

Live site: https://skhan2618.github.io/Kova-Planning/

Rendering checks: 6 pages × 4 viewport widths. Draft-only enquiry form preserved.

Rendering checks: 6 pages × 4 viewport widths. Draft-only enquiry form preserved.

Rendering checks: 6 pages × 4 viewport widths. Draft-only enquiry form preserved.

Rendering checks: 6 pages × 4 viewport widths. Draft-only enquiry form preserved.

Rendering checks: 6 pages × 4 viewport widths. Draft-only enquiry form preserved.


## v06.6 update
- A permanent branded Privacy page (`privacy.html`) replaces the short modal; all footers link to it.
- The privacy page explains browser-only draft enquiries, GitHub Pages IP logging, direct correspondence, limited sharing, rights and current contact limitations.
- Two additional generated architectural line studies integrated at section level with alpha transparency and consistent monochrome treatment.
- Existing four vector sketches remain.
- No new collection mechanism, analytics or backend has been added.

## v06.6 copy and layout refinements

- Edited introductory and supporting copy for confident, precise planning language; retained source-specific legal/technical details and the founder's main story.
- Changed the general service dropdown option to `General Inquiries`.
- Consistent `Our Approach` navigation title case and corrected Contact chapter number.
- Improved secondary text contrast and reading rhythm without replacing the approved KOVA typeface.
- Removed the redundant footer home link and restored horizontal footer gutter on mobile and desktop.

## v06.7 — Planning Explained + typography exploration

- Expanded Planning Explained from four to ten researched, source-linked practical guides. Added consent triggers, subdivision, minor dwellings, required reports, neighbours and consent time/cost.
- Static Insights content and JS-rendered listing updated together for direct links and search engines.
- Homepage remains limited to two previews with a link to the complete ten-guide library.
- Introduced a restrained line-separated guide index rather than additional heavy shaded cards.
- Added `type-study.html` for an actual KOVA copy comparison of the current Helvetica fallback stack and open-license Geist, plus official licensed specimen links for Neue Haas Grotesk and Helvetica Now. The live site font remains unchanged pending selection and web-font licence. The study loads Geist via Google Fonts only when opened.

## v06.8 — Interaction reliability

- Repaired script cache behaviour by versioning all seven page stylesheet/script references. A browser with cached v06.6 code now requests v06.8 JavaScript explicitly.
- Added automated syntax and interaction smoke checks for Anatomy of a Consent (7 steps), Planning Explained (10 guides and back action), scenario explorer, consent topics and seven-stage Approach; run on each GitHub update.
- No changes to the draft-only enquiry form, professional copy, approved visual direction or fonts.

## v06.9 — Focused editorial presentation

- Removed public-facing external government source-link lists from all ten Planning Explained guide detail views; retained their editorial source references in the content data for future verification.
- Removed external guidance links from the Expertise topic and Anatomy sections (static and interactive views), while preserving the useful explanatory context.
- Simplified the article navigation panel by removing the “Where to go next” label and fixing its spacing, padding, mobile behaviour and link alignment.
- Updated CSS/JS asset versions and smoke-test expectations to v06.9 so browsers load the latest presentation.

## v07.0 — Architectural motion and contrast

- Selected charcoal accents for the home founder feature, Planning Explained header and one editorial teaser; all original KOVA logos and typography retained.
- Replaced dual wipe navigation with one transform-only curtain synchronised using transitionend, with a safety timeout and reduced-motion bypass.
- Added pinned Lenis 1.3.27 smooth-wheel easing on fine-pointer desktop only. No scroll smoothing on touch devices or when reduced motion is preferred. Native scrolling remains available if the external script fails.
- Added softer editorial reveals, architectural diagram wipe, restrained hover motion and smoother transitions inside planning modules.
- All seven static pages use versioned v07.0 CSS/JS to avoid stale cache; existing contact draft and planning content unchanged.
