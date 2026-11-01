# Style specification

## Canonical direction

Mid-century European railway and tourism poster, without copying any living artist or any single existing poster. Graphic, architectural, elegant, optimistic. Not distressed, not kitschy, not ironic.

The three bundled reference posters in `assets/` are finished pieces from this collection and are the standard. Match their palette, finish and lettering; never their compositions.

**One deliberate departure from them: they carry a thin cream border and new work does not.** The artwork now runs full bleed to the edge. See `output-spec.md` for why.

---

## Palette — the collection's actual colours

These hex values are sampled from the finished work, not invented. Use them as the collection's home ground and shift within the families for each destination.

**Fixed across the whole range**

| Role | Hex | Notes |
|---|---|---|
| Warm cream | `#F2D9AE` | Lettering, cloud and highlight forms, sunlit stone. Warmer and more saturated than plain off-white. Not used as a border — see below. |
| Cream lettering and highlights | `#F1D8AD` – `#F4E3C4` | Titles set over sky; cloud and highlight forms. |
| Deep ink | `#202E2B` | Darkest shadow mass, silhouetted foreground, deepest foliage. |

**The working families**

| Family | Values | Use |
|---|---|---|
| Teal and petrol | `#416870` `#547B81` `#638181` | Sky, sea, deep water, distant hills. The signature colour of the range. |
| Muted sage and grey-green | `#7D9790` `#879A95` `#A3B09D` | Middle-distance foliage, atmospheric haze, stone in shade. |
| Deep green-black | `#40483B` `#354338` `#202E2B` | Foreground foliage, shadow masses, silhouetted framing elements. |
| Warm stone and sand | `#DBC69A` `#CBBB93` `#D5AB6F` | Buildings, beach, paving, sunlit masonry. |
| Ochre and tan | `#8E734B` `#BD8D50` `#C59858` | Warm architectural mass, tree trunks, mid-tone earth. |
| Terracotta and burnt orange | `#C0703F` `#CB9461` `#D09D60` | Roof tiles, awnings, warm accents. Used sparingly — small areas, high impact. |
| Atmospheric pale | `#EDE0C4` `#B0BEA2` `#9CA597` | Distant horizon, cloud edges, faded far hills. |

**Rules for using it**

- Roughly six to ten principal colours per piece. More than that and it stops reading as a printed poster.
- Mediterranean and Aegean subjects run warmer and brighter, with harder light and more terracotta. Alpine, Baltic and Atlantic subjects run cooler, with lavender-grey shadows, softer horizons and a single warm accent held back for one element.
- **Keep saturation controlled.** The most common way this style fails is colour that is too clean and too bright — it stops reading as lithography and starts reading as digital illustration.
- Northern light is genuinely different from southern light. The palette should say so.

---

## Lettering

Pinned to **Josefin Sans Thin (100)**, with ExtraLight (200) permitted only where Thin would vanish against a busy field. `assets/title-lettering-specimen.png` is authoritative. The full letterform description and the rules that go with it are in `SKILL.md` — follow them exactly, and never imitate lettering from the reference posters directly.

---

## Illustration language

- Flat, vector-like shapes with hand-printed character.
- Minimal internal linework. Define form with shape boundaries and blocks of value.
- Large architectural masses simplified, but retaining landmark-defining proportion and silhouette. A cathedral must still be that cathedral.
- Shadows as broad graphic shapes, never soft airbrushed gradients.
- Reflections, clouds, water, mountains and vegetation stylised into simple rhythmic forms.
- A very subtle paper or lithographic grain on the poster and panorama. No heavy faux ageing, cracks, stains, fold marks or torn-paper effects.
- **No texture at all on the badge** — it prints on fabric.

Keeping the artwork genuinely flat is not only aesthetic. Flat colour with crisp edges upscales far better than soft gradient work, and every file is upscaled roughly 5× before it reaches a printer.

---

## Composition — poster (portrait)

- One strong viewpoint: elevated overlook, waterfront sweep, river axis, boulevard perspective, harbour mouth, mountain-framed cityscape, or monumental architectural foreground.
- A three-layer read wherever possible: foreground frame, main destination mass, simplified distance and sky.
- Framing devices where geographically appropriate: foliage, balustrades, quays, arches, bridges, awnings, rooftops, pine boughs, lamp standards.
- Bold asymmetry is welcome, but keep a clean field for the title.
- **No border.** The artwork runs full bleed to all four edges. The outer 6% of every edge is expendable to trim — open sky, sea or plain foreground. See `output-spec.md`.
- Avoid scrapbook collage, postcard montage, landmark grids and photorealistic aerial views.

## Composition — panorama (landscape)

- A continuous horizontal strip, re-composed for the shape. Not a cropped poster.
- One sweeping subject that reads left to right: a bay, a waterfront, a ridgeline, a bridge, a terrace of building fronts.
- For a single tall landmark, place it off-centre with the city spreading either side rather than centring a tower in a wide frame.
- Plain trimmable sky above and plain trimmable foreground below. Subject inside the central 64% of the height.
- Title centred, smaller in the frame than on the poster, and clear of the outer 12% of each side.
- Full bleed, no border. Same palette and treatment as the poster for that destination.

## Composition — badge (square)

- A contained emblem: circle, oval, shield or arched panel, with the destination name integrated into the shape.
- One motif, reduced to its silhouette — the single most recognisable form of the destination.
- Four to six flat colours. Closed shapes, clear separation, no gradients, no grain, no linework below roughly 2 pt at print size.
- No outer border. The emblem's own edge is the border.
- Flat white background, no shadow and no texture, so it keys out cleanly to transparency.
- Must read at three metres. If it needs examining, it is too detailed.

---

## Negative constraints

Avoid: photorealism; 3D render finish; glossy digital-painting effects; neon or cyberpunk palettes; comic-book inking; watercolour washes; anime; collage; excessive grain; fake fold marks; fake historical logos; any text beyond the destination name; illegible pseudo-text; invented landmarks; bold or condensed lettering; and railway imagery in an ordinary destination poster.

Railway imagery is reserved for explicitly rail-related subjects — a named railway journey, route, train or station.
