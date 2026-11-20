# ENTRY-REVIEW — The Family Cover Studio (round 4 rebuild)

Bounty: gta6-cover-art-01 · $250 · 50 paid · deadline Sat 21 Nov 2026 17:30 WIB.
Repo: `makefun-gta6-cover-art-01-v2` (owner adeqaila). Built from scratch in
this recording (recording 01a1f795-a6b2-71e0-9c68-e2b03f27fbc5); no code was
read or copied from rounds 1–3 — only the two OFL fonts were carried over by
binary copy, vendor/makefun-app.ts is the kit starter's file unchanged, and
the round-3 ENTRY-REVIEW.md / DOSSIER.md (prose) and screenshots (visual
reference) were the specification. No submit, push, or repo creation was
done here.

## Tujuan fase final

Entry ini dinilai pada kualitas final — ketahanan di data baru, kualitas
juri, determinisme — BUKAN skor dev. Karena itu build ini mengutamakan:
wajah yang tidak pernah terpotong di ketiga varian (audit geometri 15/15),
judul dan tag yang tidak pernah saling menabrak (diperbaiki setelah inspeksi
visual), export yang deterministik (grain + barcode dari LCG berseed tetap),
dan app yang berjalan penuh offline tanpa referensi eksternal.

## What it is

A web app — **The Family Cover Studio** — that turns the user's photos into
a 1950s mafia noir movie-poster billboard in 16:9 landscape. One main
character, the hero (brown leather jacket, rainy neon street), stands
biggest in the middle, full-bleed; three gangs surround him — **MAFIA** on
one side, **POLICE** on the other, **HEROES** (his allies) beside them —
each gang under its own gold label tab, every person with a cast tag (name
+ place + time). A giant gradient title crosses the lower middle, a glowing
script subtitle sits beneath it, a press quote bar runs on top, and a
tagline pill, a billing line with every name on the poster, a FAM box,
a barcode and "NOW SHOWING ON YOUR FEED" close the poster. A darkened
neon-street photo sits behind the whole poster.

## The three films

1. **THE FAMILY** — Blood Runs Thicker. "EVERY FAMILY HAS ITS PRICE" —
   THE DAILY RACKET, VOL. 13. Hero: the man in the brown leather jacket.
   Layout: Center Hero (MAFIA left, POLICE top-right, HEROES bottom-right).
   Grade: Noir. Title gradient gold.
2. **OMERTÀ** — The Code of Silence. "SILENCE IS THE ONLY ALIBI" — THE
   UNDERWORLD GAZETTE, VOL. 07. Hero: the three-gang standoff (mafia left,
   hero centre, police right). Layout: Wide Hero. Grade: Rain Noir. Title
   gradient silver/steel. Starburst: MADE MAN.
3. **BLOOD & SILK** — Love, Loyalty, Betrayal. "IN THIS FAMILY, TRUST IS A
   WEAPON" — THE NOIR HERALD, VOL. 21. Hero: the man in the brown leather
   jacket. Layout: Mirrored (POLICE + HEROES left, MAFIA right). Grade:
   Crimson. Title gradient crimson. Starburst: MOST WANTED.

## Photos — 18 stills, all panels are photos

- main-hero.jpg — the hero, front face, rainy neon street.
- hero-don.jpg — the Don in pinstripe and fedora by his black Cadillac.
- don-table / consigliere / widow / enforcer — cropped from the 2×2 mafia
  grid at its black dividers by tools/crop-photos.py (divider detected from
  pixels; candlelit table, jazz club, casino floor, warehouse).
- driver / lookout — cropped from the diptych at its black divider
  (getaway driver, lamp-post lookout in the rain).
- detective / sergeant / officer / riot — cropped from the 2×2 police grid
  (trench-coat detective, sergeant at the patrol car, policewoman at the
  precinct door, helmeted riot officer).
- racer / mentor / spark / fighter — cropped from the 2×2 heroes grid
  (racer by the vintage coupe, pipe-smoking mentor, headset-wearing spark,
  boxer in the gym).
- standoff.jpg — the three-gang standoff; street.jpg — the neon night
  street, darkened, as the poster backdrop.

## Faces are never cut

Every photo carries a measured face box (forehead to chin, cheek to cheek),
measured by eye from the stills (see tools/audit/contact.jpg). The
cover-fit draw keeps that box whole inside its panel and clear of the cast
tag: the tag strip is reserved before the crop is chosen, so a chin can
never slide under a tag. Panels whose bottom edge the giant title would
cross carry their tag at the top instead. Gang label tabs sit centred over
their gang block, never over a face. Verified with tools/audit-faces.py,
which reads the same data.js literals the renderer uses and re-implements
its cover-fit math: **all 15 faces whole in all 3 variants** — see
tools/audit/v1-panels.jpg, v2-panels.jpg, v3-panels.jpg (green boxes).
The Don's fedora photo appears only in OMERTÀ's mafia row (the candlelit
Don appears in THE FAMILY and BLOOD & SILK), so the Don is never shown
twice on one cover; the billing line dedupes his name.

## Editor

Live landscape preview; three film buttons + thumbnails; text fields for
title, subtitle, quote, newspaper, tagline, VOL; cast editor (slot, name,
place, time) for all 18 slots; photo strip to swap any panel's photo
(click a photo, then click a panel in the preview, or use the apply button)
+ upload for the selected slot; three grades (Noir / Rain Noir / Crimson);
three layouts (Center Hero / Wide Hero / Mirrored); export PNG 1600×900,
1200×675, 1080×1080 (square keeps the 16:9 cover whole on a blurred
blow-up of itself), one size or all three. Finishing pass: grade wash +
vignette + deterministic film grain (seeded LCG tile).

## Verification (this build)

- Face audit: 15/15 faces whole in all 3 variants (tools/audit-faces.py,
  exit 0; proof images in tools/audit/).
- Export test (tools/test-export.html, OMERTÀ, headless Chrome):
  1600×900 PNG 3,451,256 B; 1200×675 PNG 1,989,543 B; 1080×1080 PNG
  1,818,453 B — all three sizes render.
- Grader-sim: `MAKEFUN_OUTPUT_DIR=out node main.ts` exits 0 in ~0.3 s;
  dossier.json sha256 identical across two runs:
  `87b64424fbd1222607106fb966bbbb3aa9cf6fa4215b1594a0b9f91744bee195`;
  main.ts clears only the contents of the output directory, never the
  directory itself.
- Kit check (`node cli/makefun.mjs check --kit . --repo <entry4>
  --worktree`, offline): **4 passed, 0 failed, 17 skipped, 5 checked at
  submission** (the 5 are submission-time: repo public, repo owner,
  repo created after open, commit in repo, duplicate snapshot).
- Screenshots (1280×720, each ≤ 256 KiB, visually verified): 1-cover
  (THE FAMILY landscape, 223,485 B), 2-editor (full studio UI — 3 variant
  buttons, edit fields, landscape preview, 18-photo strip, 222,954 B),
  3-varian (OMERTÀ landscape, 218,455 B), 4-export (BLOOD & SILK
  landscape, 222,349 B). Nothing cut off at frame edges, no empty space
  over 25% of any frame, all titles fully readable, all faces whole.
- No external references in app/ (local fonts and photos only); no Rockstar
  artwork, logo or font; no PALM HEIST or beach content anywhere in the
  entry.

## Fixes made during the build

- The giant title overlapped the bottom-row side panels' top cast tags
  ("RADIO BENCH · 1:45 AM" half-hidden behind the Y of THE FAMILY; "THE
  RACER" half-hidden behind the À of OMERTÀ): each film's title is now
  slightly smaller with its own baseline (family 138/758, omertà 165/772,
  blood 136/758), so every tag reads in full. Verified by zoomed crops of
  the re-rendered covers.
- OMERTÀ's Don showed the candlelit-table photo with a "CADILLAC ROW" tag:
  the per-film Don override never fired (its guard tested the wrong
  condition). Now the fedora-by-Cadillac photo appears in OMERTÀ only while
  the Don still holds his default still, and the audit checks the same rule.
- The MAFIA label tab grazed the Don's forehead: label tabs now sit
  centred over their gang block instead of at its top-left corner.
- The hero's tag box grazed the hero's forehead by a fraction of a pixel:
  the box is now 4 px shorter and 2 px higher.
- The editor overflowed 720 px with the upload row below the fold: header,
  thumbnails, strip and panel spacing tightened until the whole UI fits in
  1280×720.
