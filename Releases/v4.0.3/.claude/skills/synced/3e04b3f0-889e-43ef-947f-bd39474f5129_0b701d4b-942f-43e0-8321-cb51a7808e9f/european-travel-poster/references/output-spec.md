# Output specification

This artwork is printed on physical products. One image cannot serve all of them, and an image composed without regard to cropping is silently ruined by the crop. This file defines the three masters, the safe zones each needs, what happens to the files afterwards, and how they are named for the product pipeline.

---

## 1. The three masters

Every destination gets all three unless the user asks for one. They are not crops of each other — a portrait poster cropped to a mug wrap gives a sliver of sky, and reduced to a t-shirt print it turns to mud. Each is composed for its own shape.

| Master | Generated at | Ratio | Products |
|---|---|---|---|
| **Poster** | 1024 × 1536 | portrait 2:3 | Posters, framed prints, tea towels |
| **Panorama** | 1536 × 1024 | landscape 3:2 | Mugs, coasters, bookmarks |
| **Badge** | 1024 × 1024 | square 1:1 | T-shirts, totes, stickers |

These are the only three output sizes the image tool produces. Every print shape is derived from them afterwards, which is exactly why the safe zones below matter.

---

## 2. Poster master — portrait 1024 × 1536

### No border. Full bleed.

The artwork runs to all four edges with no cream margin, frame or band of any kind.

This is deliberate. A printed border is the least forgiving thing you can put on a print-on-demand product: the printer's trim tolerance is a millimetre or two either way, and on a narrow border that lands as visibly more margin on one side than the other. A straight line against an edge is the easiest asymmetry in the world for the eye to catch, and unlike a soft-edged illustration it has no way to hide the drift. Framing makes it worse — a mount rebate covers several millimetres of the sheet, so a printed border ends up half-hidden and looking like a mistake.

If a bordered version is ever wanted as a product, it is added downstream at derivative time, where the geometry is computed in pixels and is even by construction. It is never drawn into the master.

### The safe area rule

The poster is generated at 2:3 but must also print at **A-sizes**, which are 1:1.414 — proportionally shorter. An A-size print trims about **3% of the height from the top and 3% from the bottom**. A 50 × 70 cm tea towel is 1:1.4 and trims about 3.5%. The printer's own tolerance takes a little more.

> **The outer 6% of every edge must be expendable — open sky, sea, plain water or plain foreground. Nothing that would be missed if it were cut away.**

Supporting rules:

- Lettering stays within the **central 88% of the height** and the **central 90% of the width**.
- No landmark silhouette, spire, roofline or framing element runs hard to the top or bottom edge, where a trim would slice it.
- Composition is horizontally centred within tolerance; nothing is trimmed horizontally at A-sizes, but a mug or coaster derived from the panorama is.
- Corners carry no detail. They are the first thing a trim or a frame rebate eats.

### Print files derived from it

| Print | Size | Pixels | Notes |
|---|---|---|---|
| A4 | 210 × 297 mm | 2480 × 3508 @300 dpi | |
| A3 | 297 × 420 mm | 3508 × 4961 @300 dpi | |
| A2 | 420 × 594 mm | 4961 × 7016 @300 dpi | The size to design for |
| A1 | 594 × 841 mm | 7016 × 9933 @300 dpi | Or 4677 × 6614 @200 dpi |
| 12 × 18 in | 305 × 457 mm | 3600 × 5400 @300 dpi | 2:3, native, no trim |
| 18 × 24 in | 457 × 610 mm | 5400 × 7200 @300 dpi | 2:3, native, no trim |
| 24 × 36 in | 610 × 914 mm | 7200 × 10800 @300 dpi | 2:3, native, no trim |
| Tea towel | 50 × 70 cm | 2953 × 4134 @150 dpi | 150 dpi is standard for textiles; hem safe zone ~2 cm all round |

### What to request

Vintage European travel-poster illustration, 1930s–1950s advertising character. Simplified geometric forms, broad flat colour areas, muted harmonious block colours with destination-specific accents, crisp silhouettes, restrained detail, screen-print or lithograph finish. Depth through overlapping flat colour planes rather than photorealistic shading. Elegant optimistic composition, one strong viewpoint. Full bleed to all four edges with no border or margin. One uppercase destination title set inside the image over an open field of colour, in the collection's pinned lettering, spelling and diacritics exact. No logos, badges, company marks, signatures, watermarks, fake artist marks, QR codes, pseudo-text or any wording other than the destination name.

---

## 3. Panorama master — landscape 1536 × 1024

On an 11 oz mug the artwork wraps around the body and its left and right edges meet at the handle. That changes the composition completely.

### Safe zones

- **Vertical.** The finished mug band is about 2.35:1, cut from the centre of the 3:2 image. **The whole subject sits within the central 64% of the image height.** The top and bottom sixths are plain sky and plain water, sand or foreground, trimmed away with nothing lost.
- **Horizontal.** The outer **12% of each side disappears into the handle join.** Keep the hero landmark and all lettering out of both side margins.
- **Title.** Centred, smaller relative to the frame than on the poster.

### Print files derived from it

| Print | Size | Pixels |
|---|---|---|
| Mug wrap, 11 oz | 20 × 8.5 cm | 2362 × 1004 @300 dpi |
| Mug wrap, 15 oz | 22 × 10 cm | 2598 × 1181 @300 dpi |
| Coaster | 9 × 9 cm + 3 mm bleed | 1063 × 1063 @300 dpi — centre square crop |
| Bookmark | 5 × 15 cm | 591 × 1772 @300 dpi — rotated crop |

Check the title survives the coaster's square crop. If it cannot, the coaster takes the badge instead.

---

## 4. Badge master — square 1024 × 1024

A full poster printed on a t-shirt is unreadable and prints badly: fine linework fills in, paper grain becomes noise, and a rectangular scene on a garment reads as a photo print rather than a design.

### What to request

- A **contained emblem** — circular, oval, shield or arched panel — with the destination name integrated into the shape, in the collection's pinned lettering.
- **One motif only**, reduced to its silhouette.
- **Four to six flat colours maximum.** No gradients, no paper texture, no halftone, no linework below roughly 2 pt at print size.
- Bold closed shapes with clear separation; must survive printing at 30 cm on textured cotton.
- **No outer border.** The emblem's own edge is the border.
- **On a plain, perfectly flat white background with no texture, shadow or gradient**, so it keys out cleanly to transparency.

### Print files derived from it

| Print | Size | Pixels |
|---|---|---|
| T-shirt front | 30 × 40 cm | 3543 × 4724 @300 dpi, transparent PNG |
| Tote | 35 × 40 cm | 4134 × 4724 @300 dpi, transparent PNG |
| Sticker | 8 × 8 cm | 945 × 945 @300 dpi, transparent PNG |

---

## 5. Resolution and upscaling

The image tool's maximum output is 1024 px on the short side. **This is not print resolution. The raw file must never be sent to a printer.**

| Target | Upscale needed from master |
|---|---|
| A4 | ~2.4× |
| A3 | ~3.4× |
| A2 | ~4.9× |
| A1 @300 dpi | ~6.9× |
| Tea towel | ~2.9× |
| T-shirt from badge | ~3.5× |
| Mug wrap from panorama | ~1.6× |

Method:

1. Generate the master.
2. Upscale **5×** with an AI upscaler — Upscayl (free, runs locally), Topaz Gigapixel, or Magnific. From the poster master this gives roughly 5120 × 7680, covering everything to A2 at full 300 dpi.
3. Crop to the exact print shape, then resample down to the target pixel dimensions.

Two things worth knowing:

- **Flat vector-like illustration upscales far better than photographic imagery.** Broad areas of flat colour with crisp edges are close to the best case for an upscaler. This is a practical reason to keep the artwork flat and avoid soft gradients and heavy grain, over and above the aesthetic one.
- **A1 at 300 dpi is beyond comfortable reach.** Either cap the range at A2, or accept roughly 200 dpi at A1, which is fine for wall art at normal viewing distance.

Work and save in **sRGB** throughout. Print partners convert to CMYK themselves and each does it differently; supplying CMYK usually makes the result worse.

---

## 6. File naming

Names feed an automated product pipeline, so they must be exact and machine-readable.

```
{ISO2}-{destination-slug}-{variant}-v{n}.png
```

- `ISO2` — two-letter country code, uppercase: `ES`, `PT`, `FR`, `GB`, `GR`.
- `destination-slug` — the destination, lowercase, ASCII only, hyphenated, diacritics stripped: `san-sebastian`, `nimes`, `cesky-krumlov`.
- `variant` — one of `poster`, `pano`, `badge`.
- `v{n}` — version, starting at `v1`. Never overwrite; increment.

A complete destination looks like this:

```
ES-san-sebastian-poster-v1.png
ES-san-sebastian-pano-v1.png
ES-san-sebastian-badge-v1.png
```

The slug strips diacritics. **The artwork never does.** `nimes` in the filename, `NÎMES` on the poster.
