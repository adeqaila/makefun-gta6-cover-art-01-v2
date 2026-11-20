#!/usr/bin/env python3
"""Crop the mafia photo sheets into 18 single stills for The Family Cover Studio.

Reads the composite sheets in refs/photos-mafia (2x2 grids + 1 diptych) and
cuts them at their black dividers, detected from the pixels, then copies the
four single shots. Output: app/photos/*.jpg (JPEG q88).

Run from the entry4 directory:
    python3 tools/crop-photos.py
"""
import os
import sys
from PIL import Image

REFS = os.path.expanduser(
    "~/workspace/makefun-gta6-cover-art-01-regrind/refs/photos-mafia")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app", "photos")
OUT = os.path.normpath(OUT)


def col_lum(im, x):
    """Mean luminance of column x (sampled every 4th row)."""
    px = im.load()
    w, h = im.size
    total = 0
    n = 0
    for y in range(0, h, 4):
        r, g, b = px[x, y][:3]
        total += 0.299 * r + 0.587 * g + 0.114 * b
        n += 1
    return total / n


def row_lum(im, y):
    px = im.load()
    w, h = im.size
    total = 0
    n = 0
    for x in range(0, w, 4):
        r, g, b = px[x, y][:3]
        total += 0.299 * r + 0.587 * g + 0.114 * b
        n += 1
    return total / n


def darkest_in(im, axis, lo, hi):
    """Position of the darkest column (axis='x') or row (axis='y') in [lo, hi)."""
    fn = col_lum if axis == "x" else row_lum
    best, best_v = lo, 1e9
    for p in range(lo, hi):
        v = fn(im, p)
        if v < best_v:
            best_v, best = v, p
    return best, best_v


def edge_trim(im):
    """Trim the black outer frame: first row/col from each side brighter than 14."""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    top = 0
    while top < h // 4 and sum(px[x, top] for x in range(0, w, 8)) / (w // 8) < 14:
        top += 1
    bottom = h - 1
    while bottom > 3 * h // 4 and sum(px[x, bottom] for x in range(0, w, 8)) / (w // 8) < 14:
        bottom -= 1
    left = 0
    while left < w // 4 and sum(px[left, y] for y in range(0, h, 8)) / (h // 8) < 14:
        left += 1
    right = w - 1
    while right > 3 * w // 4 and sum(px[right, y] for y in range(0, h, 8)) / (h // 8) < 14:
        right -= 1
    return (left, top, right + 1, bottom + 1)


def split_grid(path, names):
    """Split a 2x2 grid into 4 stills. names = (TL, TR, BL, BR)."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    vx, _ = darkest_in(im, "x", int(w * 0.45), int(w * 0.55))
    hy, _ = darkest_in(im, "y", int(h * 0.45), int(h * 0.55))
    print(f"{os.path.basename(path)}: divider x={vx} y={hy}")
    boxes = {
        names[0]: (0, 0, vx, hy),
        names[1]: (vx, 0, w, hy),
        names[2]: (0, hy, vx, h),
        names[3]: (vx, hy, w, h),
    }
    for name, box in boxes.items():
        cell = im.crop(box)
        l, t, r, b = edge_trim(cell)
        # keep the divider side clean: shave 3 px off the divider edge too
        if name == names[0]:
            r -= 3; b -= 3
        elif name == names[1]:
            l += 3; b -= 3
        elif name == names[2]:
            r -= 3; t += 3
        else:
            l += 3; t += 3
        cell = cell.crop((l, t, r, b))
        save(cell, name)


def split_pair(path, names):
    """Split a side-by-side diptych into 2 stills. names = (LEFT, RIGHT)."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    vx, _ = darkest_in(im, "x", int(w * 0.45), int(w * 0.55))
    print(f"{os.path.basename(path)}: divider x={vx}")
    for name, box in zip(names, [(0, 0, vx, h), (vx, 0, w, h)]):
        cell = im.crop(box)
        l, t, r, b = edge_trim(cell)
        if name == names[0]:
            r -= 3
        else:
            l += 3
        save(cell.crop((l, t, r, b)), name)


def copy_single(src_name, dst_name):
    im = Image.open(os.path.join(REFS, src_name)).convert("RGB")
    save(im, dst_name)


def save(im, name):
    path = os.path.join(OUT, name + ".jpg")
    im.save(path, "JPEG", quality=88)
    print(f"  {name}.jpg {im.size} {os.path.getsize(path)} B")


def main():
    os.makedirs(OUT, exist_ok=True)
    split_grid(os.path.join(REFS, "media-generation-mafia-cast-grid-4-0-52baa0aa-3b78-492a-8bb3-ad86d3aef0a5.jpg"),
               ("don-table", "consigliere", "widow", "enforcer"))
    split_grid(os.path.join(REFS, "media-generation-police-grid-4-0-11c2bbc6-c6dd-4f17-a6c5-eda3019f433e.jpg"),
               ("detective", "sergeant", "officer", "riot"))
    split_grid(os.path.join(REFS, "media-generation-heroes-grid-4-0-6218a02d-4128-4fd4-87dd-9a805a385cf0.jpg"),
               ("racer", "mentor", "spark", "fighter"))
    split_pair(os.path.join(REFS, "media-generation-mafia-cast-pair-2-0-c25047b5-81d8-4950-a8e5-a2ac72dc5502.jpg"),
               ("driver", "lookout"))
    copy_single("media-generation-main-hero-0-db1327ad-fe13-46e1-9e52-fd31093bddb0.jpg", "main-hero")
    copy_single("media-generation-mafia-hero-don-0-007f5b91-16d3-41c9-b12b-9453e1da220b.jpg", "hero-don")
    copy_single("media-generation-three-gangs-standoff-0-583e3af5-1152-456e-af78-813f422110a4.jpg", "standoff")
    copy_single("media-generation-mafia-street-backdrop-0-89083a67-9a17-40d0-8b98-71c36a1d0422.jpg", "street")
    print("done:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    sys.exit(main())
