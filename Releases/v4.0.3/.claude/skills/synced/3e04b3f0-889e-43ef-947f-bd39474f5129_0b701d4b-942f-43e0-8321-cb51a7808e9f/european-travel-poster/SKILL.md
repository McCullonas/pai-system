---
name: european-travel-poster
description: Create vintage European travel poster artwork for a print-on-demand souvenir range. Produces all three masters the product range needs — a portrait poster, a landscape panorama band, and a square badge emblem — in one run. Use when the user asks for a vintage railway poster, retro travel poster, destination poster, tourism poster, illustrated city poster, or the mug, t-shirt or tea towel artwork for a European destination. Research and verify landmarks and image-rights restrictions before generating, then produce finished artwork in the established muted block-colour 1930s-1950s style with the collection's pinned lettering.
---

# European Travel Poster

Create finished illustrated destination artwork, not a prompt or a concept.

Everything this skill produces is sold on a physical product in a print-on-demand range. Three things therefore matter as much as the picture: the artwork must use the **collection's pinned lettering**, it must be **composed to survive being cropped** to several print shapes, and it must be **clear of image-rights restrictions**. All three are specified below and none is optional.

## Default output — all three masters

**Unless the user names a single variant, produce all three masters in one run, in this order:**

1. **Poster** — portrait 1024 × 1536. Feeds posters, framed prints and tea towels.
2. **Panorama** — landscape 1536 × 1024. Feeds mugs, coasters and bookmarks.
3. **Badge** — square 1024 × 1024. Feeds t-shirts, totes and stickers.

Do one Source check covering the destination, then generate all three, each with its own composition rules. State the three filenames at the end.

Produce a single variant only when the user explicitly asks for one — "just the poster", "only the mug artwork", "the badge for Porto". If they ask for a variant to be redone, regenerate that one alone.

## Input

- A European destination, e.g. `Lisbon`.
- Optionally a named landmark or view, e.g. `Lisbon — Tram 28 and Alfama`.
- Optionally a variant restriction, e.g. `Porto, poster only`.

If the destination name is genuinely ambiguous between multiple European places, ask for the country. Otherwise proceed without clarification.

## Workflow

1. Read all three reference files: `references/style-spec.md`, `references/output-spec.md`, `references/rights-and-taste.md`. Follow them closely.
2. **Rights check first.** Consult `references/rights-and-taste.md`. If the destination is on the do-not-produce list, say so plainly and offer the named substitute rather than generating anything. If the destination's most obvious landmark is restricted, compose around it.
3. Research the destination on the web. Prefer official tourism and cultural-heritage sources, municipal or museum sources, UNESCO where relevant, and high-quality geographic references.
4. Choose one hero view and one supporting cue. Verify any landmark the user named.
5. Show a compact **Source check** (format below): the view, the sources, and any rights decision.
6. Generate the three masters, or the single requested one, following `references/output-spec.md` for each variant's shape, safe zones and constraints, and `references/style-spec.md` for the look.
7. List the filenames to save them under, per the naming convention in `references/output-spec.md`.
8. Do not write a prose description of the pictures afterwards. The Source check comes before the images; nothing follows them but the filenames.

## Dimensions at a glance

Full detail, safe zones and upscaling method are in `references/output-spec.md`. This is the summary that must never be lost:

| Master | Generate at | Ratio | Feeds | Final print files (300 dpi unless noted) |
|---|---|---|---|---|
| Poster | 1024 × 1536 | 2:3 | A4 print | 2480 × 3508 |
| | | | A3 print | 3508 × 4961 |
| | | | A2 print | 4961 × 7016 |
| | | | A1 print | 7016 × 9933 |
| | | | 12 × 18 in | 3600 × 5400 |
| | | | 18 × 24 in | 5400 × 7200 |
| | | | Tea towel 50 × 70 cm | 2953 × 4134 @150 dpi |
| Panorama | 1536 × 1024 | 3:2 | Mug wrap 20 × 8.5 cm | 2362 × 1004 |
| | | | Coaster 9 × 9 cm | 1063 × 1063 |
| Badge | 1024 × 1024 | 1:1 | T-shirt 30 × 40 cm | 3543 × 4724 |
| | | | Tote 35 × 40 cm | 4134 × 4724 |

Three consequences that change how the artwork must be composed:

- **A-sizes are 1:1.414, not 2:3.** Printing the poster at A2 trims about 3% of the height off the top and bottom, and the printer's own trim tolerance takes a little more. The artwork is **full bleed with no border**, so the outer 6% of every edge must be expendable — open sky, sea, plain foreground. Nothing that would be missed.
- **The mug wrap is 2.35:1.** The whole subject must sit inside the central 64% of the panorama's height, with plain trimmable sky above and plain trimmable foreground below.
- **Generated files are not print files.** 1024 px on the short side is a fraction of what A2 needs. Every master is upscaled roughly 5× before printing — which is why the artwork must stay flat and crisp rather than soft and gradient-heavy.

## Lettering — pinned, not described

Inconsistent lettering has been the main defect in this range. The typeface is now fixed.

**The face is Josefin Sans Thin (weight 100).** It is a geometric sans in the 1920s Art Deco tradition, on Google Fonts under the SIL Open Font Licence, so it is free for commercial use. Its ExtraLight (200) weight is acceptable where Thin would disappear against a busy field; nothing heavier.

`assets/title-lettering-specimen.png` is the authoritative reference: the full alphabet, numerals, the European accented characters and four sample destination titles, rendered in that face at the collection's tracking on the collection's cream. **Match it.** Where instructions and the specimen disagree, the specimen wins.

The letterforms, so they can be reproduced without the font file:

- Hairline monoline strokes of even weight throughout — no thick/thin contrast anywhere.
- Geometric construction: `O`, `Q`, `C`, `G` built on a true circle; `A`, `M`, `N`, `V`, `W` from straight strokes with sharp apexes.
- `M` has a pointed centre vertex descending to the baseline, with near-vertical outer stems.
- `J` descends below the baseline with a shallow hook.
- `G` has a straight horizontal bar and no spur.
- `E`, `F` have arms of equal length; `E` is narrow.
- Caps only. Never any lowercase.
- Letter-spacing is generous — roughly 12–16% of the cap height between characters. This is the most recognisable single quality of the range.
- Diacritics are light and set clear above the cap height, matching the stroke weight of the letters.

Rules that go with it:

- The destination name is the **only** text that ever appears, on any variant.
- Reproduce the name **exactly as supplied**, every diacritic included: `San Sebastián`, `Nîmes`, `Kraków`, `Göteborg`, `Český Krumlov`, `Ölüdeniz`, `Þingvellir`. The name is printed on a physical product; a missing accent is a defect that reaches a customer.
- The title sits **inside the image, over an open field of colour — normally sky in the upper third**, lettered in cream. Never in a margin, a band, a panel or a strip below the picture. There is no border to put it in.
- It may sit lower — over water, a plain wall, or open ground — when the composition calls for it, provided it is over the artwork itself and clear of the safe-area margins.
- Long names break across two lines at the same size rather than being condensed.
- No slogans, country names, route names, dates, railway-company text, captions, badges, monograms, signatures, watermarks, QR codes or pseudo-text. Ever.

## Bundled references

- `assets/title-lettering-specimen.png` — the lettering. Authoritative.
- `assets/reference-poster-01-lyon.jpg` — river and hilltop composition, title over sky.
- `assets/reference-poster-02-gijon.jpg` — coastal sweep with balustrade foreground, title over sky.
- `assets/reference-poster-03-nimes.jpg` — monumental architecture, warm palette, title over sky.

These three are finished pieces from this collection and define its palette, finish and lettering. Take those qualities from them. **Never reproduce their compositions, their viewpoints or their sample words**, and never treat the lettering specimen's layout as a design to copy — it is a letterform reference only.

One deliberate departure from the references: they carry a thin cream border and **new work does not**. Take everything else from them and ignore that.

## Landmark selection rules

- Prefer elements that are recognisably local rather than generic European architecture.
- Favour a coherent vista over a collage. One hero landmark plus one supporting cue beats many small landmarks.
- Preserve real geography. Do not put a mountain where there is none, or move a castle to the wrong bank of a river.
- Do not invent towers, bridges, mountain ranges, coastlines, monuments or architectural features.
- Never attribute one island's or town's landmark to a neighbour. This is the commonest factual error in the genre.
- If sources conflict, or the requested landmark is not in or visible from the destination, say so in the Source check and choose a truthful alternative.
- The result is a stylised illustration, not a photograph — but its identifying features must be grounded in verified references.

## Source check format

Two to five lines, once per destination, immediately before the first image.

**Source check — [DESTINATION]**
- **[Hero view]:** what is depicted and why. [citation]
- **[Supporting cue]:** brief factual grounding. [citation]
- **Rights:** *(only when a decision was made)* what was excluded and what replaced it.

Then generate.

## Consistency across the range

The collection is the product. A customer buying a second piece is buying a matching one.

- Lettering, level of simplification and print-era finish stay constant. No borders, margins or framing bands on any variant.
- Palette varies by destination within the collection's fixed families — see `references/style-spec.md`, which now carries the actual hex values sampled from the finished work.
- Prefer strong foreground framing, a clear middle-ground landmark mass, and a simplified distant horizon.
- Keep people, vehicles, boats and birds tiny and secondary unless asked otherwise.
- The three masters for one destination must read as siblings: same palette, same lettering, same treatment.
- **No railway imagery in an ordinary destination poster** — no trains, locomotives, carriages, track, platforms or signals. Include them only when the subject is explicitly a railway journey, route, train or station, such as the Bernina Express or the Glacier Express.
