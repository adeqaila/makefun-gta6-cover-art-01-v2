[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/adeqaila/makefun-gta6-cover-art-01-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/adeqaila/makefun-gta6-cover-art-01-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# The Family Cover Studio

A web app that turns your photos into a 1950s mafia noir movie-poster
billboard in 16:9 landscape. One main character — the hero in the brown
leather jacket on a rainy neon street — stands biggest in the middle,
full-bleed; three gangs surround him — **MAFIA** on one side, **POLICE** on
the other, **HEROES** (his allies) beside them — each gang under its own
gold label tab, every person with a cast tag (name + place + time). A giant
gradient title crosses the lower middle, a glowing script subtitle sits
beneath it, a press quote bar runs on top, and a tagline pill, a billing
line with every name on the poster, a FAM box, a barcode and "NOW SHOWING
ON YOUR FEED" close the poster. A darkened neon-street photo sits behind
the whole poster.

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
- hero-don.jpg — the Don in pinstripe and fedora by his black Cadillac
  (appears only in OMERTÀ, so the Don is never shown twice on one cover).
- don-table / consigliere / widow / enforcer — cropped from the 2×2 mafia
  grid at its black dividers (candlelit table, jazz club, casino floor,
  warehouse).
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

Every panel is drawn cover-fit anchored on a per-photo face box, so no
face is ever cut — the crop keeps each face whole and clear of its cast
tag (the tag strip is reserved before the crop is chosen). Verified with
`tools/audit-faces.py`: all 15 faces whole in all 3 variants.

## Editor

Live landscape preview; three film buttons + thumbnails; text fields for
title, subtitle, quote, newspaper, tagline, VOL; cast editor (slot, name,
place, time) for all 18 slots; photo strip to swap any panel's photo +
upload for the selected slot (or click a panel in the preview); three
grades (Noir / Rain Noir / Crimson); three layouts (Center Hero / Wide
Hero / Mirrored); export PNG 1600×900, 1200×675, 1080×1080 (square keeps
the 16:9 cover whole on a blurred blow-up of itself), one size or all
three. Finishing pass: grade wash + vignette + deterministic film grain
(seeded LCG tile).

## Run it

```sh
node serve.ts        # app/ on http://localhost:8080
```

`node main.ts` (or `MAKEFUN_OUTPUT_DIR=out node main.ts`) hands the entry
in: it copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` there. Screenshots live in `screenshots/` (1280×720 JPEGs):
`1-cover.jpg` (THE FAMILY), `2-editor.jpg` (studio UI), `3-varian.jpg`
(OMERTÀ), `4-export.jpg` (BLOOD & SILK).

Everything runs offline in the browser: local photos and fonts only, no
network request, no Rockstar artwork, logo or font.
