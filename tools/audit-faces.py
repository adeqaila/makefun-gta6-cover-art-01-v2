#!/usr/bin/env python3
"""Face audit for The Family Cover Studio (round 4 rebuild).

Reads the same literals the renderer uses (app/src/data.js: FACES, LAYOUTS,
FILMS, SLOTS, FILM_DON_OVERRIDE) and re-implements the cover-fit math from
app/src/cover.js in Python. For every film and every panel it checks that
the photo's face box, once drawn, lies whole inside its panel and clear of
the cast-tag strip, the hero tag box, the gang label tab, and the title /
subtitle bands. Draws proof images with the face boxes outlined.

Run from the entry4 directory:
    python3 tools/audit-faces.py
Exits 0 only if every checked face passes.
"""
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
APP = os.path.join(ROOT, "app")
OUT = os.path.join(HERE, "audit")

CW, CH = 1600, 900
ANTON = os.path.join(APP, "fonts", "Anton-Regular.ttf")
PACIFICO = os.path.join(APP, "fonts", "Pacifico-Regular.ttf")


def load_literal(name):
    src = open(os.path.join(APP, "src", "data.js")).read()
    m = re.search(r"export const %s = (\{.*?\n\});" % name, src, re.S)
    if not m:
        raise SystemExit(f"literal {name} not found in data.js")
    text = m.group(1)
    # JS literal -> JSON: single-quoted strings to double quotes, bare keys quoted.
    text = re.sub(r"'([^']*)'", r'"\1"', text)
    text = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)", r'\1"\2"\3', text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


FACES = load_literal("FACES")
LAYOUTS = load_literal("LAYOUTS")
FILMS = load_literal("FILMS")
SLOTS = load_literal("SLOTS")
OVERRIDE = load_literal("FILM_DON_OVERRIDE")


def photo_size(pid):
    with Image.open(os.path.join(APP, "photos", pid + ".jpg")) as im:
        return im.size


def slot_photo(film_id, slot, photos):
    if film_id == "omerta" and slot == "don" and photos.get("don") == "don-table":
        return OVERRIDE["omerta"]["photo"]
    return photos.get(slot)


def cover_fit(iw, ih, panel, tag, face):
    """Mirror of coverFitRect() in app/src/cover.js. Returns
    (src_rect, dst_rect) in image px and cover px."""
    tag_h = 40 * (panel["h"] / 243) if tag in ("top", "bottom") else 0
    uy = panel["y"] + tag_h if tag == "top" else panel["y"]
    uh = panel["h"] - tag_h
    s = max(panel["w"] / iw, uh / ih)
    if face:
        fw = (face[2] - face[0]) * iw
        fh = (face[3] - face[1]) * ih
        s = min(s, panel["w"] / (fw * 1.12), uh / (fh * 1.12))
    cw = min(panel["w"] / s, iw)
    ch = min(uh / s, ih)
    if face:
        fcx = (face[0] + face[2]) / 2 * iw
        fcy = (face[1] + face[3]) / 2 * ih
        cx = min(max(fcx - cw / 2, 0), iw - cw)
        cy = min(max(fcy - ch / 2, 0), ih - ch)
    else:
        cx, cy = (iw - cw) / 2, (ih - ch) / 2
    return (cx, cy, cw, ch), (panel["x"], uy, panel["w"], uh)


def tag_rect(panel):
    tag = panel["tag"]
    if tag == "hero":
        return (panel["x"] + panel["w"] - 204, panel["y"] + 6, 196, 40)
    tag_h = 40 * (panel["h"] / 243)
    if tag == "top":
        return (panel["x"], panel["y"], panel["w"], tag_h)
    return (panel["x"], panel["y"] + panel["h"] - tag_h, panel["w"], tag_h)


def overlaps(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return ax < bx + bw and bx < ax + aw and ay < by + bh and by < ay + ah


def inside(inner, outer):
    ix, iy, iw, ih = inner
    ox, oy, ow, oh = outer
    return ix >= ox and iy >= oy and ix + iw <= ox + ow and iy + ih <= oy + oh


def text_band(font_path, size, text, baseline_y, top_frac=0.72, bottom_frac=0.12):
    f = ImageFont.truetype(font_path, size)
    w = f.getlength(text)
    return (CW / 2 - w / 2, baseline_y - size * top_frac, w, size * (top_frac + bottom_frac))


def audit_film(film_id, idx):
    film = FILMS[film_id]
    layout = LAYOUTS[film["layout"]]
    photos = {slot: SLOTS[slot]["photo"] for slot in SLOTS}
    title_band = text_band(ANTON, film["titleSize"], film["title"].upper(),
                            film.get("titleBase", 748))
    sub_band = text_band(PACIFICO, 56, film["subtitle"], 808, 0.75, 0.30)
    canvas = Image.new("RGB", (CW, CH), (13, 8, 23))
    d = ImageDraw.Draw(canvas)
    results = []
    for panel in layout["panels"]:
        slot = panel["slot"]
        pid = slot_photo(film_id, slot, photos)
        face = FACES.get(pid) if pid else None
        iw, ih = photo_size(pid)
        src, dst = cover_fit(iw, ih, panel, panel["tag"], face)
        with Image.open(os.path.join(APP, "photos", pid + ".jpg")) as im:
            crop = im.crop((src[0], src[1], src[0] + src[2], src[1] + src[3]))
            crop = crop.resize((int(dst[2]), int(dst[3])))
            canvas.paste(crop, (int(dst[0]), int(dst[1])))
        d.rectangle([panel["x"], panel["y"], panel["x"] + panel["w"], panel["y"] + panel["h"]],
                    outline=(216, 178, 74), width=2)
        if not face:
            results.append((slot, pid, "SKIP (no face)", True))
            continue
        # Face box in cover coordinates.
        fx0 = dst[0] + (face[0] * iw - src[0]) / src[2] * dst[2]
        fy0 = dst[1] + (face[1] * ih - src[1]) / src[3] * dst[3]
        fx1 = dst[0] + (face[2] * iw - src[0]) / src[2] * dst[2]
        fy1 = dst[1] + (face[3] * ih - src[1]) / src[3] * dst[3]
        fbox = (fx0, fy0, fx1 - fx0, fy1 - fy0)
        panel_rect = (panel["x"], panel["y"], panel["w"], panel["h"])
        problems = []
        if not inside(fbox, panel_rect):
            problems.append("outside panel")
        if overlaps(fbox, tag_rect(panel)):
            problems.append("under cast tag")
        for lab in layout["labels"]:
            if overlaps(fbox, (lab["cx"] - 48, lab["y"], 96, 28)):
                problems.append(f"under {lab['text']} label")
        if overlaps(fbox, title_band):
            problems.append("under title")
        if overlaps(fbox, sub_band):
            problems.append("under subtitle")
        ok = not problems
        results.append((slot, pid, "; ".join(problems) if problems else "whole", ok))
        color = (60, 220, 90) if ok else (255, 60, 60)
        d.rectangle([fx0, fy0, fx1, fy1], outline=color, width=3)
        d.text((fx0 + 3, fy0 - 14), slot, fill=color)
    # Tag strips + title/subtitle bands, for the proof image.
    for panel in layout["panels"]:
        tr = tag_rect(panel)
        d.rectangle([tr[0], tr[1], tr[0] + tr[2], tr[1] + tr[3]], outline=(255, 215, 106), width=1)
    d.rectangle([title_band[0], title_band[1], title_band[0] + title_band[2],
                 title_band[1] + title_band[3]], outline=(255, 0, 255), width=2)
    d.rectangle([sub_band[0], sub_band[1], sub_band[0] + sub_band[2],
                 sub_band[1] + sub_band[3]], outline=(255, 0, 255), width=1)
    path = os.path.join(OUT, f"v{idx}-panels.jpg")
    canvas.save(path, quality=88)
    return results, path


def main():
    os.makedirs(OUT, exist_ok=True)
    all_ok = True
    for idx, film_id in enumerate(["family", "omerta", "blood"], 1):
        results, path = audit_film(film_id, idx)
        n_ok = sum(1 for r in results if r[3])
        print(f"\n{film_id.upper()} ({FILMS[film_id]['title']}) — {n_ok}/{len(results)} faces whole — {path}")
        for slot, pid, msg, ok in results:
            print(f"  {'PASS' if ok else 'FAIL'} {slot:14s} {pid:14s} {msg}")
            all_ok = all_ok and ok
    print("\nRESULT:", "ALL FACES WHOLE" if all_ok else "FAILURES PRESENT")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
