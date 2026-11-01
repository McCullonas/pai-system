#!/usr/bin/env python3
"""
HERMA 4671 Ring Label PDF Generator
Calibrated for Brother MFC-9140CDN printer.

Usage:
    python3 generate.py --output labels.pdf --labels '[{"sku":"061","price":"£50","qty":22}, ...]'

Or import and call generate_pdf() directly.
"""

import argparse
import json
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

# ─────────────────────────────────────────────
# PAGE
# ─────────────────────────────────────────────
PAGE_W = 210 * mm
PAGE_H = 297 * mm

# ─────────────────────────────────────────────
# PRINTER COMPENSATION — Brother MFC-9140CDN
# These were tuned empirically over multiple test prints.
# Do not change unless recalibrating for a new printer.
# See references/calibration.md for adjustment instructions.
# ─────────────────────────────────────────────
H_SCALE = 167 / (167 - 5)    # ~1.0309 — horizontal stretch
V_SCALE = 276 / (276 - 3.5)  # ~1.0128 — vertical stretch

# ─────────────────────────────────────────────
# HERMA 4671 SPEC (base mm, before compensation)
# ─────────────────────────────────────────────
_LEFT_MARGIN_BASE  = 21.5   # mm
_TOP_MARGIN_BASE   = 10.5   # mm
_LABEL_W_BASE      = 49.0   # mm
_LABEL_H_BASE      = 10.0   # mm
_COL_PITCH_BASE    = 59.0   # mm  (left-edge to left-edge)
_ROW_PITCH_BASE_L  = 10.0   # mm  label height component
_ROW_PITCH_BASE_G  = 4.0    # mm  gap height component
ROWS = 20
COLS = 3

# ─────────────────────────────────────────────
# COMPUTED LAYOUT (with compensation applied)
# ─────────────────────────────────────────────
LEFT_MARGIN = _LEFT_MARGIN_BASE * mm * H_SCALE
TOP_MARGIN  = (_TOP_MARGIN_BASE * V_SCALE - 3) * mm   # -3mm empirical top shift
LABEL_W     = _LABEL_W_BASE * mm * H_SCALE
LABEL_H     = _LABEL_H_BASE * mm * V_SCALE
COL_PITCH   = _COL_PITCH_BASE * mm * H_SCALE + 1.0 * mm  # +1mm empirical col correction

# Row pitch: base grid scaled, then expanded +6mm total, then +6/19mm per gap
_grid_h = ROWS * _ROW_PITCH_BASE_L * V_SCALE + (ROWS - 1) * _ROW_PITCH_BASE_G * V_SCALE
ROW_PITCH = ((_grid_h + 6) / ROWS + 6.0 / 19) * mm

# ─────────────────────────────────────────────
# LABEL ZONE PROPORTIONS
# Left pad | Middle (non-adhesive) | Right pad
# ─────────────────────────────────────────────
PAD_W = LABEL_W * 0.38   # ~19.2mm each end
MID_W = LABEL_W * 0.24   # ~12.1mm centre

# ─────────────────────────────────────────────
# TYPOGRAPHY
# ─────────────────────────────────────────────
PRICE_FONT      = 15    # pt — Helvetica-Bold, centred in right pad
SKU_FONT        = 7.5   # pt — Helvetica, rotated 90°, near left edge of left pad


def generate_pdf(labels, output_path):
    """
    Generate the label PDF.

    Args:
        labels: list of dicts with keys: sku (str), price (str), qty (int)
        output_path: path to write the PDF to

    Returns:
        Number of pages written.
    """
    # Expand to flat list
    flat = []
    for item in labels:
        for _ in range(item['qty']):
            flat.append((item['sku'], item['price']))

    c = canvas.Canvas(output_path, pagesize=(PAGE_W, PAGE_H))

    idx = 0
    pages = 0
    while idx < len(flat):
        pages += 1
        for row in range(ROWS):
            for col in range(COLS):
                if idx >= len(flat):
                    break
                sku, price = flat[idx]
                idx += 1

                # Bottom-left corner of this label cell
                x = LEFT_MARGIN + col * COL_PITCH
                y = PAGE_H - TOP_MARGIN - (row + 1) * ROW_PITCH + (ROW_PITCH - LABEL_H)

                # ── SKU: rotated 90°, near left edge ──
                sku_w = c.stringWidth(sku, 'Helvetica', SKU_FONT)
                sku_x = x + SKU_FONT * 0.7          # near left edge of label
                sku_y = y + LABEL_H / 2 - sku_w / 2  # vertically centred
                c.saveState()
                c.setFont('Helvetica', SKU_FONT)
                c.translate(sku_x, sku_y)
                c.rotate(90)
                c.drawString(0, 0, sku)
                c.restoreState()

                # ── Price: large bold, centred in right pad ──
                c.setFont('Helvetica-Bold', PRICE_FONT)
                price_w = c.stringWidth(price, 'Helvetica-Bold', PRICE_FONT)
                price_x = x + PAD_W + MID_W + (PAD_W - price_w) / 2
                price_y = y + LABEL_H / 2 - PRICE_FONT * 0.35
                c.drawString(price_x, price_y, price)

        c.showPage()

    c.save()
    return pages


def main():
    parser = argparse.ArgumentParser(description='Generate HERMA 4671 ring label PDF')
    parser.add_argument('--output', required=True, help='Output PDF path')
    parser.add_argument('--labels', required=True, help='JSON array of {sku, price, qty}')
    args = parser.parse_args()

    try:
        labels = json.loads(args.labels)
    except json.JSONDecodeError as e:
        print(f"Error parsing --labels JSON: {e}", file=sys.stderr)
        sys.exit(1)

    total = sum(item['qty'] for item in labels)
    pages = generate_pdf(labels, args.output)
    print(f"Done — {total} labels across {pages} sheets → {args.output}")


if __name__ == '__main__':
    main()
