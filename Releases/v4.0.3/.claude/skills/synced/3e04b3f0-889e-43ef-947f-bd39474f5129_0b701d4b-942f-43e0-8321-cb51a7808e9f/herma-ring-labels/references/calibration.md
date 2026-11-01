# Calibration Reference

## Current Calibration — Brother MFC-9140CDN

These values were dialled in over multiple iterative test prints. The printer compresses output slightly in both dimensions even at 100% actual size in Adobe Acrobat Reader.

### Scale Factors

| Axis | Factor | Derivation |
|------|--------|------------|
| Horizontal | `H_SCALE = 167 / (167 - 5) ≈ 1.0309` | Total label area width is 167mm; printer compressed by ~5mm |
| Vertical | `V_SCALE = 276 / (276 - 3.5) ≈ 1.0128` | Total label area height is 276mm; printer compressed by ~3.5mm |

### Additional Empirical Corrections (on top of scale factors)

| Correction | Value | Effect |
|------------|-------|--------|
| Top margin offset | −3 mm | Shifts entire grid up so row 1 aligns |
| Column pitch extra | +1.0 mm | Correctly spaces columns 2 and 3 |
| Row pitch extra | +6/19 mm per gap ≈ +0.316 mm | Stretches rows to reach bottom of sheet |
| SKU horizontal position | `x + SKU_FONT * 0.7` from left edge | Places SKU near left edge of left pad, rotated 90° |

### Final Computed Values (at runtime)

| Parameter | Value |
|-----------|-------|
| LEFT_MARGIN | ~22.16 mm |
| TOP_MARGIN | ~7.63 mm |
| LABEL_W | ~50.51 mm |
| LABEL_H | ~10.13 mm |
| COL_PITCH | ~61.82 mm |
| ROW_PITCH | ~14.59 mm |

---

## How to Recalibrate

If the labels are misaligned after a printer change or driver update, do a plain-paper test print and measure:

### Horizontal misalignment
- If **all columns are shifted uniformly** left or right → adjust `LEFT_MARGIN` (add/subtract mm)
- If columns **drift progressively** (col 1 ok, col 3 wrong) → adjust `COL_PITCH` (increase if too compressed, decrease if too spread)
- Rule of thumb: if col 3 is Xmm too far left, add `X/2` mm to `COL_PITCH`

### Vertical misalignment
- If **row 1 is wrong** but the rest are ok → adjust the `−3` offset in `TOP_MARGIN`
- If **rows drift progressively** (row 1 ok, row 20 wrong) → adjust `ROW_PITCH`
  - If row 20 is Xmm too high, add `X/19` mm to `ROW_PITCH`
  - If row 20 is Xmm too low, subtract `X/19` mm from `ROW_PITCH`

### Complete recalibration from scratch
1. Measure the total printable label area width and height on a test print
2. Compare to true HERMA 4671 spec: 167mm wide × 276mm tall
3. Set `H_SCALE = 167 / printed_width_mm` and `V_SCALE = 276 / printed_height_mm`
4. Set `TOP_MARGIN` offset and `COL_PITCH` extra to 0 and retest
5. Fine-tune from there

---

## HERMA 4671 Official Spec

| Property | Value |
|----------|-------|
| Label size | 49 × 10 mm |
| Columns | 3 |
| Rows | 20 |
| Labels per sheet | 60 |
| Left margin | 21.5 mm |
| Top margin | 10.5 mm |
| Column pitch | 59.0 mm |
| Row pitch | 14.0 mm |
| Horizontal gap between labels | 10.0 mm |
| Vertical gap between labels | 4.0 mm |
| Page size | A4 (210 × 297 mm) |
