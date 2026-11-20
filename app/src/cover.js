// Draws the 1950s mafia noir billboard cover for The Family Cover Studio.
// Everything is drawn on canvas from local photos and fonts only; no network.
// All geometry comes from data.js in the 1600 x 900 cover space and is scaled
// to whatever canvas size is requested, so the 1600x900, 1200x675 and
// 1080x1080 exports are the same picture at different sizes.
import { FACES, FILMS, GRADES, LAYOUTS, SLOT_ORDER, FILM_DON_OVERRIDE } from './data.js';

const CW = 1600;
const CH = 900;
const GRAIN_SEED = 19501119;

// Deterministic LCG (Numerical Recipes constants).
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const t = document.createElement('canvas');
  t.width = 128;
  t.height = 128;
  const c = t.getContext('2d');
  const img = c.createImageData(128, 128);
  const rnd = lcg(GRAIN_SEED);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  grainTile = t;
  return t;
}

// Cover-fit a photo into a panel rect, keeping its face box whole and clear
// of the cast-tag strip. The tag strip is reserved BEFORE the crop is chosen,
// so a chin can never slide under a tag. Returns the source rect in image
// pixels plus the destination rect in canvas pixels.
export function coverFitRect(img, panel, tag, face) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const tagH = tag === 'bottom' || tag === 'top' ? 40 * (panel.h / 243) : 0;
  const uy = tag === 'top' ? panel.y + tagH : panel.y;
  const uh = panel.h - tagH;
  let s = Math.max(panel.w / iw, uh / ih);
  if (face) {
    const fw = (face[2] - face[0]) * iw;
    const fh = (face[3] - face[1]) * ih;
    // Zoom out until the face fits the crop window with a 12% margin.
    s = Math.min(s, panel.w / (fw * 1.12), uh / (fh * 1.12));
  }
  let cw = panel.w / s;
  let ch = uh / s;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;
  let cx = 0;
  let cy = 0;
  if (face) {
    const fcx = ((face[0] + face[2]) / 2) * iw;
    const fcy = ((face[1] + face[3]) / 2) * ih;
    cx = Math.min(Math.max(fcx - cw / 2, 0), iw - cw);
    cy = Math.min(Math.max(fcy - ch / 2, 0), ih - ch);
  } else {
    cx = (iw - cw) / 2;
    cy = (ih - ch) / 2;
  }
  return { sx: cx, sy: cy, sw: cw, sh: ch, dx: panel.x, dy: uy, dw: panel.w, dh: uh };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitFont(ctx, text, start, maxWidth, family, weight = '') {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

export function billingNames(state) {
  const film = FILMS[state.film];
  const names = [];
  const seen = new Set();
  const push = (slot) => {
    const cast = state.cast[slot];
    if (!cast || !cast.name) return;
    const n = cast.name.trim().toUpperCase();
    if (n && !seen.has(n)) {
      seen.add(n);
      names.push(n);
    }
  };
  push(film.heroSlot);
  for (const slot of SLOT_ORDER) {
    if (slot === 'hero' || slot === 'standoff' || slot === 'backdrop') continue;
    push(slot);
  }
  return names;
}

// Effective cast entry for a slot in this film (OMERTA swaps the Don photo).
// The swap applies only while the Don still holds his default still, so a
// deliberate user swap is never hijacked.
export function slotPhoto(state, slot) {
  if (state.film === 'omerta' && slot === 'don' && state.photos.don === 'don-table') return 'hero-don';
  return state.photos[slot] || null;
}

export function slotCast(state, slot) {
  const base = state.cast[slot];
  const ov = state.film === 'omerta' ? FILM_DON_OVERRIDE.omerta : null;
  if (slot === 'don' && ov && state.photos.don === 'don-table') {
    return { ...base, place: ov.place, time: ov.time };
  }
  return base;
}

// Draws the cover onto `canvas` (any size, same 16:9 picture).
// `images` maps photo id -> HTMLImageElement (or {img} with naturalWidth).
export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const k = W / CW;
  const film = FILMS[state.film];
  const grade = GRADES[state.grade || film.grade];
  const layout = LAYOUTS[state.layout || film.layout];
  const words = state.words;

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0817';
  ctx.fillRect(0, 0, W, H);

  const imgOf = (id) => images[id] || null;

  // --- Backdrop: darkened neon street behind everything. ---
  const street = imgOf(state.photos.backdrop || 'street');
  if (street) {
    const r = coverFitRect(street, { x: 0, y: 0, w: CW, h: CH }, 'none', null);
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.drawImage(street, r.sx, r.sy, r.sw, r.sh, r.dx * k, r.dy * k, r.dw * k, r.dh * k);
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(9, 6, 18, 0.46)';
  ctx.fillRect(0, 0, W, H);

  // --- Panels. ---
  for (const p of layout.panels) {
    const photoId = slotPhoto(state, p.slot);
    const img = photoId ? imgOf(photoId) : null;
    const face = photoId ? FACES[photoId] : null;
    if (img) {
      const r = coverFitRect(img, p, p.tag, face);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, r.dx * k, r.dy * k, r.dw * k, r.dh * k);
    } else {
      ctx.fillStyle = '#241a33';
      ctx.fillRect(p.x * k, p.y * k, p.w * k, p.h * k);
    }
    ctx.strokeStyle = 'rgba(216, 178, 74, 0.55)';
    ctx.lineWidth = 1.5 * k;
    ctx.strokeRect(p.x * k, p.y * k, p.w * k, p.h * k);
  }

  // Wide layout: dark street strip under the short hero panel.
  if (layout.streetStrip) {
    const s = layout.streetStrip;
    if (street) {
      const r = coverFitRect(street, s, 'none', null);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(street, r.sx, r.sy, r.sw, r.sh, r.dx * k, r.dy * k, r.dw * k, r.dh * k);
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(216, 178, 74, 0.55)';
    ctx.lineWidth = 1.5 * k;
    ctx.strokeRect(s.x * k, s.y * k, s.w * k, s.h * k);
  }

  // --- Gang label tabs. ---
  for (const lab of layout.labels) {
    const tw = 96 * k;
    const th = 28 * k;
    const lx = (lab.cx - 48) * k;
    ctx.fillStyle = 'rgba(12, 8, 22, 0.92)';
    ctx.fillRect(lx, lab.y * k, tw, th);
    ctx.strokeStyle = '#d8b24a';
    ctx.lineWidth = 1.5 * k;
    ctx.strokeRect(lx, lab.y * k, tw, th);
    ctx.fillStyle = '#f7c948';
    ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lab.text, lab.cx * k, (lab.y + 15) * k);
  }

  // --- Cast tags. ---
  for (const p of layout.panels) {
    const cast = slotCast(state, p.slot);
    if (!cast || !cast.name) continue;
    const name = cast.name.trim().toUpperCase();
    const sub = `${cast.place.trim().toUpperCase()} · ${cast.time.trim().toUpperCase()}`;
    if (p.tag === 'hero') {
      const bw = 196 * k;
      const bh = 40 * k;
      const bx = (p.x + p.w - 204) * k;
      const by = (p.y + 6) * k;
      ctx.fillStyle = 'rgba(10, 6, 18, 0.88)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(216, 178, 74, 0.7)';
      ctx.lineWidth = 1.2 * k;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
      ctx.fillText(name, bx + bw / 2, by + bh * 0.30);
      ctx.fillStyle = '#ffd76a';
      ctx.font = `${Math.round(10.5 * k)}px Anton, sans-serif`;
      ctx.fillText(sub, bx + bw / 2, by + bh * 0.72);
      continue;
    }
    const tagH = 40 * (p.h / 243) * k;
    const ty = p.tag === 'top' ? p.y * k : (p.y + p.h) * k - tagH;
    const grad = ctx.createLinearGradient(0, ty, 0, ty + tagH);
    if (p.tag === 'top') {
      grad.addColorStop(0, 'rgba(5, 3, 10, 0.88)');
      grad.addColorStop(1, 'rgba(5, 3, 10, 0)');
    } else {
      grad.addColorStop(0, 'rgba(5, 3, 10, 0)');
      grad.addColorStop(1, 'rgba(5, 3, 10, 0.88)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(p.x * k, ty, p.w * k, tagH);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tx = (p.x + 8) * k;
    const nameSize = fitFont(ctx, name, 15 * k, (p.w - 16) * k, 'Anton, sans-serif');
    ctx.fillStyle = '#ffffff';
    ctx.font = `${nameSize}px Anton, sans-serif`;
    const cy = p.tag === 'top' ? ty + tagH * 0.30 : ty + tagH * 0.32;
    ctx.fillText(name, tx, cy);
    ctx.fillStyle = '#ffd76a';
    ctx.font = `${Math.round(10.5 * k)}px Anton, sans-serif`;
    const sy = p.tag === 'top' ? ty + tagH * 0.72 : ty + tagH * 0.74;
    ctx.fillText(sub, tx, sy);
  }

  // --- Starburst (OMERTA / BLOOD & SILK). ---
  if (film.starburst && layout.starburstAt) {
    const cx = layout.starburstAt.x * k;
    const cy = layout.starburstAt.y * k;
    const R = 62 * k;
    const r = 48 * k;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 === 0 ? R : r;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#f7c948';
    ctx.fill();
    ctx.strokeStyle = '#7a5200';
    ctx.lineWidth = 2 * k;
    ctx.stroke();
    ctx.fillStyle = '#1c1005';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
    const words2 = film.starburst.split(' ');
    if (words2.length === 2) {
      ctx.fillText(words2[0], 0, -9 * k);
      ctx.fillText(words2[1], 0, 9 * k);
    } else {
      ctx.fillText(film.starburst, 0, 0);
    }
    ctx.restore();
  }

  // --- Top bar: stars, quote, newspaper, VOL ticket. ---
  const barH = 46 * k;
  const barGrad = ctx.createLinearGradient(0, 0, 0, barH);
  barGrad.addColorStop(0, '#241239');
  barGrad.addColorStop(1, '#12081f');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, barH);
  ctx.fillStyle = '#f7c948';
  ctx.font = `${Math.round(17 * k)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', 18 * k, barH * 0.52);
  ctx.fillStyle = '#ffffff';
  const qSize = fitFont(ctx, `“${words.quote}”`, 21 * k, 880 * k, 'Anton, sans-serif');
  ctx.font = `${qSize}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`“${words.quote}”`, (W / 2) * 0.96, barH * 0.52);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#e8ddff';
  ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
  ctx.fillText(`— ${words.paper}`, 1370 * k, barH * 0.52);
  const volW = 108 * k;
  const volH = 30 * k;
  const volX = W - volW - 14 * k;
  roundRect(ctx, volX, (barH - volH) / 2, volW, volH, 5 * k);
  ctx.fillStyle = '#f7c948';
  ctx.fill();
  ctx.fillStyle = '#1c1005';
  ctx.font = `${Math.round(17 * k)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`VOL. ${words.vol}`, volX + volW / 2, barH * 0.52);

  // --- Giant gradient title. ---
  const title = words.title.trim().toUpperCase();
  const tBase = film.titleBase || 748;
  let tSize = fitFont(ctx, title, film.titleSize * k, 1500 * k, 'Anton, sans-serif');
  const tGrad = ctx.createLinearGradient(0, (tBase - film.titleSize) * k, 0, tBase * k);
  film.titleGrad.forEach((c, i) => tGrad.addColorStop(i / (film.titleGrad.length - 1), c));
  ctx.font = `${tSize}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 14 * k;
  ctx.shadowOffsetY = 4 * k;
  ctx.lineWidth = 3 * k;
  ctx.strokeStyle = 'rgba(24, 8, 2, 0.9)';
  ctx.strokeText(title, W / 2, tBase * k);
  ctx.fillStyle = tGrad;
  ctx.fillText(title, W / 2, tBase * k);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // --- Glowing script subtitle. ---
  ctx.font = `${Math.round(56 * k)}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.shadowColor = film.titleGrad[1];
  ctx.shadowBlur = 20 * k;
  ctx.fillStyle = '#fff6d8';
  ctx.fillText(words.subtitle, W / 2, 808 * k);
  ctx.shadowBlur = 0;

  // --- Tagline pill. ---
  ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
  const tagW = ctx.measureText(words.tagline) + 44 * k;
  const pillX = (W - tagW) / 2;
  const pillY = 820 * k;
  const pillH = 28 * k;
  roundRect(ctx, pillX, pillY, tagW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(12, 8, 22, 0.92)';
  ctx.fill();
  ctx.strokeStyle = '#d8b24a';
  ctx.lineWidth = 1.4 * k;
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words.tagline, W / 2, pillY + pillH / 2 + 1 * k);

  // --- Billing line (fits between the FAM box and the barcode). ---
  const billing = `${film.billingPrefix} · STARRING ${billingNames(state).join(' · ')}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const bSize = fitFont(ctx, billing, 13 * k, 1330 * k, 'Anton, sans-serif');
  ctx.font = `${bSize}px Anton, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.fillText(billing, W / 2, 860 * k);

  // --- NOW SHOWING. ---
  ctx.fillStyle = '#f7c948';
  ctx.font = `${Math.round(15 * k)}px Anton, sans-serif`;
  ctx.fillText('NOW SHOWING ON YOUR FEED', W / 2, 884 * k);

  // --- FAM box, bottom-left. ---
  const famX = 16 * k;
  const famY = 838 * k;
  const famW = 88 * k;
  const famH = 54 * k;
  ctx.fillStyle = 'rgba(12, 8, 22, 0.92)';
  ctx.fillRect(famX, famY, famW, famH);
  ctx.strokeStyle = '#d8b24a';
  ctx.lineWidth = 1.4 * k;
  ctx.strokeRect(famX, famY, famW, famH);
  ctx.fillStyle = '#f7c948';
  ctx.font = `${Math.round(19 * k)}px Anton, sans-serif`;
  ctx.fillText(film.fam, famX + famW / 2, famY + famH * 0.32);
  ctx.fillStyle = '#e8ddff';
  ctx.font = `${Math.round(8 * k)}px Anton, sans-serif`;
  ctx.fillText('BLOOD · HONOR · CODE', famX + famW / 2, famY + famH * 0.72);

  // --- Barcode, bottom-right (deterministic bars). ---
  const bcX = 1468 * k;
  const bcY = 838 * k;
  const bcW = 116 * k;
  const bcH = 54 * k;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bcX, bcY, bcW, bcH);
  const rnd = lcg(GRAIN_SEED + 7);
  ctx.fillStyle = '#111111';
  let bx = bcX + 6 * k;
  while (bx < bcX + bcW - 8 * k) {
    const bw = (1 + Math.floor(rnd() * 3)) * k;
    const gap = (1 + Math.floor(rnd() * 2)) * k;
    ctx.fillRect(bx, bcY + 5 * k, bw, bcH - 18 * k);
    bx += bw + gap;
  }
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.round(9 * k)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('8 901234 567890', bcX + bcW / 2, bcY + bcH - 6 * k);

  // --- Finishing pass: grade wash, rain, vignette, grain. ---
  ctx.fillStyle = grade.wash;
  ctx.fillRect(0, 0, W, H);
  if (grade.rain) {
    const rr = lcg(GRAIN_SEED + 31);
    ctx.strokeStyle = 'rgba(190, 220, 255, 0.10)';
    ctx.lineWidth = 1 * k;
    for (let i = 0; i < 110; i++) {
      const x = rr() * W;
      const y = rr() * H;
      const len = (18 + rr() * 26) * k;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3 * k, y + len);
      ctx.stroke();
    }
  }
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, `rgba(0, 0, 0, ${grade.vig})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  const tile = getGrainTile();
  const pat = ctx.createPattern(tile, 'repeat');
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // --- Gold frame. ---
  ctx.strokeStyle = 'rgba(216, 178, 74, 0.85)';
  ctx.lineWidth = 2.5 * k;
  ctx.strokeRect(5 * k, 5 * k, W - 10 * k, H - 10 * k);
  ctx.strokeStyle = 'rgba(216, 178, 74, 0.28)';
  ctx.lineWidth = 1 * k;
  ctx.strokeRect(11 * k, 11 * k, W - 22 * k, H - 22 * k);

  ctx.restore();
  return canvas;
}

// Renders the cover at 1600x900, then composites the 1080x1080 square:
// the 16:9 cover whole, centred on a blurred blow-up of itself.
export function drawSquare(canvas, state, images) {
  const off = document.createElement('canvas');
  off.width = 1600;
  off.height = 900;
  drawCover(off, state, images);
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = '#0d0817';
  ctx.fillRect(0, 0, W, H);
  ctx.filter = 'blur(30px) brightness(0.5)';
  const s = Math.max(W / 1600, H / 900);
  const dw = 1600 * s;
  const dh = 900 * s;
  ctx.drawImage(off, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.filter = 'none';
  const cw = W;
  const ch = (W * 9) / 16;
  ctx.drawImage(off, 0, (H - ch) / 2, cw, ch);
  ctx.restore();
  return canvas;
}
