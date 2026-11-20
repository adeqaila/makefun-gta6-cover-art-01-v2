// The Family Cover Studio — editor wiring.
// Loads the 18 local stills and the two local fonts, then keeps a live
// landscape preview in sync with the film, words, cast, grade and layout
// controls. Exports PNGs at 1600x900, 1200x675 and 1080x1080.
import { FILMS, FILM_ORDER, GRADES, LAYOUTS, PHOTOS, SLOTS, SLOT_ORDER } from './data.js';
import { drawCover, drawSquare } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const statusEl = $('status');

export const images = {};

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function loadAll() {
  const jobs = PHOTOS.map(async (id) => {
    images[id] = await loadImage(`./photos/${id}.jpg`);
  });
  await Promise.all(jobs);
  try {
    await Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('60px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    // Fallbacks keep the app working even if a font fails to load.
  }
}

function defaultState(filmId) {
  const film = FILMS[filmId];
  const cast = {};
  for (const slot of SLOT_ORDER) {
    cast[slot] = { ...SLOTS[slot] };
  }
  const photos = {};
  for (const slot of SLOT_ORDER) photos[slot] = SLOTS[slot].photo;
  return {
    film: filmId,
    grade: film.grade,
    layout: film.layout,
    words: {
      title: film.title,
      subtitle: film.subtitle,
      quote: film.quote,
      paper: film.paper,
      tagline: film.tagline,
      vol: film.vol,
    },
    cast,
    photos,
    upload: {}, // slot -> object URL of an uploaded photo
  };
}

let state = defaultState('family');
let exportSize = { w: 1600, h: 900, square: false };
let selectedPhoto = 'main-hero';
let selectedSlot = 'hero';

function imageFor(photoId) {
  return images[photoId] || null;
}

// The renderer reads photos by slot through state.photos; uploaded images
// are stored under a synthetic id so the same path is used.
function effectiveImages() {
  const out = {};
  for (const id of PHOTOS) out[id] = images[id];
  for (const [slot, url] of Object.entries(state.upload)) {
    out[`upload:${slot}`] = uploadImages[slot] || null;
  }
  return out;
}

const uploadImages = {};

function redraw() {
  const imgs = effectiveImages();
  drawCover(preview, state, imgs);
  const film = FILMS[state.film];
  statusEl.textContent =
    `Ready — ${film.title} · ${layoutName(state.layout)} · ${gradeName(state.grade)} · ${exportSize.w} × ${exportSize.h}`;
  document.querySelectorAll('#filmBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.film === state.film);
  });
  document.querySelectorAll('#gradeBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  document.querySelectorAll('#layoutBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('#sizeBtns button').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.w) === exportSize.w && Number(b.dataset.h) === exportSize.h);
  });
}

function layoutName(id) {
  return { center: 'Center Hero', wide: 'Wide Hero', mirrored: 'Mirrored' }[id] || id;
}
function gradeName(id) {
  return { noir: 'Noir', rain: 'Rain Noir', crimson: 'Crimson' }[id] || id;
}

function renderThumbs() {
  const wrap = $('thumbs');
  wrap.innerHTML = '';
  const imgs = effectiveImages();
  for (const id of FILM_ORDER) {
    const film = FILMS[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (id === state.film ? ' active' : '');
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 180;
    const st = defaultState(id);
    st.photos = { ...state.photos };
    st.cast = state.cast;
    st.upload = state.upload;
    drawCover(c, st, imgs);
    const cap = document.createElement('span');
    cap.textContent = `${film.title} — ${film.subtitle}`;
    btn.append(c, cap);
    btn.addEventListener('click', () => setFilm(id));
    wrap.append(btn);
  }
}

function setFilm(id) {
  const film = FILMS[id];
  state.film = id;
  state.grade = film.grade;
  state.layout = film.layout;
  state.words = {
    title: film.title,
    subtitle: film.subtitle,
    quote: film.quote,
    paper: film.paper,
    tagline: film.tagline,
    vol: film.vol,
  };
  syncWordInputs();
  redraw();
  renderThumbs();
}

function syncWordInputs() {
  $('wTitle').value = state.words.title;
  $('wSubtitle').value = state.words.subtitle;
  $('wQuote').value = state.words.quote;
  $('wPaper').value = state.words.paper;
  $('wTagline').value = state.words.tagline;
  $('wVol').value = state.words.vol;
}

function syncCastInputs() {
  const c = state.cast[selectedSlot];
  $('castSlot').value = selectedSlot;
  $('castName').value = c.name;
  $('castPlace').value = c.place;
  $('castTime').value = c.time;
  $('castPhoto').textContent = `Photo: ${state.photos[selectedSlot]}`;
}

function buildStrip() {
  const strip = $('strip');
  strip.innerHTML = '';
  for (const id of PHOTOS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'still' + (id === selectedPhoto ? ' active' : '');
    btn.dataset.photo = id;
    const im = document.createElement('img');
    im.src = `./photos/${id}.jpg`;
    im.alt = id;
    const cap = document.createElement('span');
    cap.textContent = id.replace(/-/g, ' ');
    btn.append(im, cap);
    btn.addEventListener('click', () => {
      selectedPhoto = id;
      document.querySelectorAll('#strip .still').forEach((el) => {
        el.classList.toggle('active', el.dataset.photo === id);
      });
    });
    strip.append(btn);
  }
}

function applyPhotoToSlot(slot, photoId) {
  state.photos[slot] = photoId;
  delete state.upload[slot];
  delete uploadImages[slot];
  syncCastInputs();
  redraw();
}

function download(canvas, name) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved ${name}`;
  }, 'image/png');
}

function exportOne(w, h, square) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const imgs = effectiveImages();
  if (square) drawSquare(c, state, imgs);
  else drawCover(c, state, imgs);
  const slug = state.words.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  download(c, `${slug}-${w}x${h}.png`);
}

function exportAll() {
  exportOne(1600, 900, false);
  setTimeout(() => exportOne(1200, 675, false), 350);
  setTimeout(() => exportOne(1080, 1080, true), 700);
}

function bindUI() {
  $('filmBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-film]');
    if (b) setFilm(b.dataset.film);
  });
  $('gradeBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-grade]');
    if (!b) return;
    state.grade = b.dataset.grade;
    redraw();
  });
  $('layoutBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-layout]');
    if (!b) return;
    state.layout = b.dataset.layout;
    redraw();
  });
  $('sizeBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-w]');
    if (!b) return;
    exportSize = { w: Number(b.dataset.w), h: Number(b.dataset.h), square: b.dataset.square === '1' };
    redraw();
  });

  const wordMap = { wTitle: 'title', wSubtitle: 'subtitle', wQuote: 'quote', wPaper: 'paper', wTagline: 'tagline', wVol: 'vol' };
  for (const [id, key] of Object.entries(wordMap)) {
    $(id).addEventListener('input', (e) => {
      state.words[key] = e.target.value;
      redraw();
    });
  }

  const slotSel = $('castSlot');
  for (const slot of SLOT_ORDER) {
    const o = document.createElement('option');
    o.value = slot;
    o.textContent = slot === 'backdrop' ? 'BACKDROP (street)' : SLOTS[slot].name || slot;
    slotSel.append(o);
  }
  slotSel.addEventListener('change', (e) => {
    selectedSlot = e.target.value;
    syncCastInputs();
  });
  $('castName').addEventListener('input', (e) => { state.cast[selectedSlot].name = e.target.value; redraw(); });
  $('castPlace').addEventListener('input', (e) => { state.cast[selectedSlot].place = e.target.value; redraw(); });
  $('castTime').addEventListener('input', (e) => { state.cast[selectedSlot].time = e.target.value; redraw(); });
  $('applyPhoto').addEventListener('click', () => applyPhotoToSlot(selectedSlot, selectedPhoto));

  $('exportOne').addEventListener('click', () => exportOne(exportSize.w, exportSize.h, exportSize.square));
  $('exportAll').addEventListener('click', exportAll);

  $('upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await loadImage(URL.createObjectURL(file));
    if (!img) return;
    uploadImages[selectedSlot] = img;
    state.upload[selectedSlot] = true;
    state.photos[selectedSlot] = `upload:${selectedSlot}`;
    syncCastInputs();
    redraw();
    statusEl.textContent = `Uploaded a photo for ${selectedSlot}`;
  });

  // Click a panel in the preview to put the selected strip photo there.
  preview.addEventListener('click', (e) => {
    const rect = preview.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1600;
    const y = ((e.clientY - rect.top) / rect.height) * 900;
    const layout = LAYOUTS[state.layout];
    const hit = layout.panels.find((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (!hit) return;
    selectedSlot = hit.slot;
    applyPhotoToSlot(hit.slot, selectedPhoto);
  });
}

export const app = {
  get state() { return state; },
  setFilm,
  redraw,
  renderThumbs,
  syncWordInputs,
  syncCastInputs,
  exportOne,
};

await loadAll();
bindUI();
buildStrip();
syncWordInputs();
syncCastInputs();
redraw();
renderThumbs();

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, app);
}
