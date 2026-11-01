---
name: herma-ring-labels
description: Generates a print-ready PDF of HERMA 4671 ring labels (49×10mm, 3 columns × 20 rows = 60 per sheet) for a Brother MFC-9140CDN printer. Use this skill whenever Andy asks to generate ring labels, print labels, make a label PDF, or says something like "I need X of each of these SKUs" or "make me labels for these rings". The skill handles all printer compensation, layout, and formatting automatically — Andy only needs to supply a list of SKUs and prices (and optionally a quantity per label). Always use this skill for any label generation request, even if Andy doesn't explicitly mention HERMA or the printer.
---

# HERMA 4671 Ring Label Generator

Generates a 5-sheet (300 label) PDF pre-calibrated for Andy's Brother MFC-9140CDN printer.

## What to ask Andy

If not provided, ask for:
1. **List of items**: ring name, SKU, price for each
2. **Quantity per SKU** (default: fill 5 sheets of 60 = 300 total, distributed as evenly as possible)

If a specific total is given, distribute evenly: `ceil(total/n)` for the first `total % n` SKUs, `floor(total/n)` for the rest.

## Label Design

Each HERMA 4671 label is dumbbell-shaped with three zones:
- **Left pad** — SKU, small font, rotated 90°, near left edge (leaves room to handwrite ring size)
- **Middle** — thin non-adhesive section, left blank (wraps around ring shank)
- **Right pad** — Price, large bold font, centred

## Generating the PDF

Run the script at `scripts/generate.py`, passing label data as a JSON argument:

```bash
python3 scripts/generate.py --output /mnt/user-data/outputs/ring_labels.pdf --labels '[
  {"sku": "061", "price": "£50", "qty": 22},
  {"sku": "060", "price": "£50", "qty": 22}
]'
```

Or call it directly from Python — see `scripts/generate.py` for the full API.

## Printing Instructions (important — tell Andy every time)

- Open in **Adobe Acrobat Reader**
- Page Sizing: **Actual size** (NOT Fit, NOT Shrink)
- Scale: **100%**
- Orientation: **Auto**

## Calibration Notes

The printer compensation values in `scripts/generate.py` were tuned empirically over multiple test prints specifically for Andy's Brother MFC-9140CDN. Do not change them unless Andy reports new misalignment. If Andy reports misalignment, see `references/calibration.md` for how to adjust.
