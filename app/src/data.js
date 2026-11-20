// Shared data for The Family Cover Studio (round 4 rebuild).
// Single source of truth: cover.js renders from these values, and
// tools/audit-faces.py reads the same literals to verify every face.
// All panel rects are in the 1600 x 900 cover space; the renderer scales
// them by canvas width / 1600. Face boxes are fractions of their photo
// (x0, y0, x1, y1: forehead to chin, cheek to cheek), measured by eye
// from the stills themselves.

export const PHOTOS = [
  'main-hero', 'hero-don', 'don-table', 'consigliere', 'widow', 'enforcer',
  'driver', 'lookout', 'detective', 'sergeant', 'officer', 'riot',
  'racer', 'mentor', 'spark', 'fighter', 'standoff', 'street',
];

export const FACES = {
  'main-hero': [0.42, 0.07, 0.58, 0.43],
  'hero-don': [0.32, 0.15, 0.43, 0.30],
  'don-table': [0.30, 0.08, 0.45, 0.38],
  'consigliere': [0.42, 0.10, 0.62, 0.38],
  'widow': [0.38, 0.10, 0.55, 0.38],
  'enforcer': [0.42, 0.18, 0.62, 0.45],
  'driver': [0.44, 0.20, 0.66, 0.42],
  'lookout': [0.42, 0.18, 0.62, 0.36],
  'detective': [0.42, 0.16, 0.60, 0.38],
  'sergeant': [0.38, 0.18, 0.58, 0.40],
  'officer': [0.40, 0.20, 0.58, 0.40],
  'riot': [0.40, 0.16, 0.55, 0.34],
  'racer': [0.45, 0.10, 0.62, 0.38],
  'mentor': [0.42, 0.20, 0.66, 0.50],
  'spark': [0.40, 0.18, 0.58, 0.42],
  'fighter': [0.40, 0.12, 0.60, 0.38],
  'standoff': [0.47, 0.17, 0.55, 0.31],
  'street': null,
};

// Cast slots: default photo, display name, place, time.
export const SLOTS = {
  hero: { photo: 'main-hero', name: 'THE HERO', place: 'RAIN STREET', time: '11:58 PM' },
  don: { photo: 'don-table', name: 'THE DON', place: 'CANDLELIT TABLE', time: '11:59 PM' },
  consigliere: { photo: 'consigliere', name: 'THE CONSIGLIERE', place: 'JAZZ CLUB', time: '1:12 AM' },
  widow: { photo: 'widow', name: 'THE WIDOW', place: 'CASINO FLOOR', time: '12:30 AM' },
  enforcer: { photo: 'enforcer', name: 'THE ENFORCER', place: 'WAREHOUSE 9', time: '2:03 AM' },
  driver: { photo: 'driver', name: 'THE DRIVER', place: 'GETAWAY CAR', time: '11:59 PM' },
  lookout: { photo: 'lookout', name: 'THE LOOKOUT', place: 'LAMP POST', time: '12:47 AM' },
  detective: { photo: 'detective', name: 'THE DETECTIVE', place: 'LAMP POST', time: '1:20 AM' },
  sergeant: { photo: 'sergeant', name: 'THE SERGEANT', place: 'PATROL CAR', time: '12:03 AM' },
  officer: { photo: 'officer', name: 'THE OFFICER', place: 'PRECINCT DOOR', time: '11:30 PM' },
  riot: { photo: 'riot', name: 'THE RIOT', place: 'BACK ALLEY', time: '2:40 AM' },
  racer: { photo: 'racer', name: 'THE RACER', place: 'VINTAGE COUPE', time: '11:15 PM' },
  mentor: { photo: 'mentor', name: 'THE MENTOR', place: 'CORNER BAR', time: '10:20 PM' },
  spark: { photo: 'spark', name: 'THE SPARK', place: 'RADIO BENCH', time: '1:45 AM' },
  fighter: { photo: 'fighter', name: 'THE FIGHTER', place: 'BOXING GYM', time: '6:30 PM' },
  standoff: { photo: 'standoff', name: 'THE STANDOFF', place: 'RAIN ALLEY', time: '12:00 AM' },
  backdrop: { photo: 'street', name: '', place: '', time: '' },
};

export const SLOT_ORDER = [
  'hero', 'don', 'consigliere', 'widow', 'enforcer', 'driver', 'lookout',
  'detective', 'sergeant', 'officer', 'riot', 'racer', 'mentor', 'spark',
  'fighter', 'standoff', 'backdrop',
];

// In OMERTA the Don appears as the fedora photo by his Cadillac, not the
// candlelit-table Don, so he is never shown twice on one cover.
export const FILM_DON_OVERRIDE = {
  omerta: { photo: 'hero-don', place: 'CADILLAC ROW', time: '11:53 PM' },
};

export const FILMS = {
  family: {
    title: 'THE FAMILY', subtitle: 'Blood Runs Thicker',
    quote: 'EVERY FAMILY HAS ITS PRICE', paper: 'THE DAILY RACKET', vol: '13',
    tagline: 'LOYALTY · SILENCE · VENGEANCE', grade: 'noir', layout: 'center',
    heroSlot: 'hero', titleSize: 138, titleBase: 758,
    titleGrad: ['#ffedb0', '#f7c948', '#e79b00', '#7a5200'],
    starburst: null, billingPrefix: 'A FAMILY PICTURE', fam: 'FAM 13',
  },
  omerta: {
    title: 'OMERTÀ', subtitle: 'The Code of Silence',
    quote: 'SILENCE IS THE ONLY ALIBI', paper: 'THE UNDERWORLD GAZETTE', vol: '07',
    tagline: 'SWEAR IT · KEEP IT · OR ELSE', grade: 'rain', layout: 'wide',
    heroSlot: 'standoff', titleSize: 165, titleBase: 772,
    titleGrad: ['#ffffff', '#dbe4ec', '#9fb0c0', '#4d5d6d'],
    starburst: 'MADE MAN', billingPrefix: 'AN OMERTÀ PICTURE', fam: 'FAM 07',
  },
  blood: {
    title: 'BLOOD & SILK', subtitle: 'Love, Loyalty, Betrayal',
    quote: 'IN THIS FAMILY, TRUST IS A WEAPON', paper: 'THE NOIR HERALD', vol: '21',
    tagline: 'SILK SUITS · BLOOD OATHS · NO WITNESSES', grade: 'crimson', layout: 'mirrored',
    heroSlot: 'hero', titleSize: 136, titleBase: 758,
    titleGrad: ['#ffe3e6', '#ff8fa0', '#e02040', '#6d0817'],
    starburst: 'MOST WANTED', billingPrefix: 'A BLOOD & SILK PICTURE', fam: 'FAM 21',
  },
};

export const FILM_ORDER = ['family', 'omerta', 'blood'];

export const GRADES = {
  noir: { wash: 'rgba(24, 18, 48, 0.20)', vig: 0.40, rain: false },
  rain: { wash: 'rgba(10, 32, 64, 0.24)', vig: 0.44, rain: true },
  crimson: { wash: 'rgba(84, 12, 22, 0.22)', vig: 0.42, rain: false },
};

// Panels: slot, rect in 1600x900 space, tag position.
// tag 'top'/'bottom': full-width cast strip. 'hero': small box, top-right.
// Panels whose bottom the giant title crosses carry their tag on top.
export const LAYOUTS = {
  center: {
    panels: [
      { slot: 'don', x: 8, y: 46, w: 217, h: 243, tag: 'bottom' },
      { slot: 'consigliere', x: 231, y: 46, w: 217, h: 243, tag: 'bottom' },
      { slot: 'widow', x: 8, y: 295, w: 217, h: 243, tag: 'bottom' },
      { slot: 'enforcer', x: 231, y: 295, w: 217, h: 243, tag: 'bottom' },
      { slot: 'driver', x: 8, y: 544, w: 217, h: 243, tag: 'top' },
      { slot: 'lookout', x: 231, y: 544, w: 217, h: 243, tag: 'top' },
      { slot: 'hero', x: 454, y: 46, w: 598, h: 742, tag: 'hero' },
      { slot: 'detective', x: 1058, y: 46, w: 264, h: 181, tag: 'bottom' },
      { slot: 'sergeant', x: 1328, y: 46, w: 264, h: 181, tag: 'bottom' },
      { slot: 'officer', x: 1058, y: 233, w: 264, h: 181, tag: 'bottom' },
      { slot: 'riot', x: 1328, y: 233, w: 264, h: 181, tag: 'bottom' },
      { slot: 'racer', x: 1058, y: 420, w: 264, h: 181, tag: 'bottom' },
      { slot: 'mentor', x: 1328, y: 420, w: 264, h: 181, tag: 'bottom' },
      { slot: 'spark', x: 1058, y: 607, w: 264, h: 181, tag: 'top' },
      { slot: 'fighter', x: 1328, y: 607, w: 264, h: 181, tag: 'top' },
    ],
    labels: [
      { text: 'MAFIA', cx: 228, y: 46 },
      { text: 'POLICE', cx: 1325, y: 46 },
      { text: 'HEROES', cx: 1325, y: 420 },
    ],
    streetStrip: null,
  },
  wide: {
    panels: [
      { slot: 'don', x: 8, y: 46, w: 217, h: 243, tag: 'bottom' },
      { slot: 'consigliere', x: 231, y: 46, w: 217, h: 243, tag: 'bottom' },
      { slot: 'widow', x: 8, y: 295, w: 217, h: 243, tag: 'bottom' },
      { slot: 'enforcer', x: 231, y: 295, w: 217, h: 243, tag: 'bottom' },
      { slot: 'driver', x: 8, y: 544, w: 217, h: 243, tag: 'top' },
      { slot: 'lookout', x: 231, y: 544, w: 217, h: 243, tag: 'top' },
      { slot: 'standoff', x: 454, y: 46, w: 598, h: 600, tag: 'hero' },
      { slot: 'detective', x: 1058, y: 46, w: 264, h: 181, tag: 'bottom' },
      { slot: 'sergeant', x: 1328, y: 46, w: 264, h: 181, tag: 'bottom' },
      { slot: 'officer', x: 1058, y: 233, w: 264, h: 181, tag: 'bottom' },
      { slot: 'riot', x: 1328, y: 233, w: 264, h: 181, tag: 'bottom' },
      { slot: 'racer', x: 1058, y: 420, w: 264, h: 181, tag: 'bottom' },
      { slot: 'mentor', x: 1328, y: 420, w: 264, h: 181, tag: 'bottom' },
      { slot: 'spark', x: 1058, y: 607, w: 264, h: 181, tag: 'top' },
      { slot: 'fighter', x: 1328, y: 607, w: 264, h: 181, tag: 'top' },
    ],
    labels: [
      { text: 'MAFIA', cx: 228, y: 46 },
      { text: 'POLICE', cx: 1325, y: 46 },
      { text: 'HEROES', cx: 1325, y: 420 },
    ],
    streetStrip: { x: 454, y: 652, w: 598, h: 136 },
    starburstAt: { x: 545, y: 118 },
  },
  mirrored: {
    panels: [
      { slot: 'detective', x: 8, y: 46, w: 217, h: 181, tag: 'bottom' },
      { slot: 'sergeant', x: 231, y: 46, w: 217, h: 181, tag: 'bottom' },
      { slot: 'officer', x: 8, y: 233, w: 217, h: 181, tag: 'bottom' },
      { slot: 'riot', x: 231, y: 233, w: 217, h: 181, tag: 'bottom' },
      { slot: 'racer', x: 8, y: 420, w: 217, h: 181, tag: 'bottom' },
      { slot: 'mentor', x: 231, y: 420, w: 217, h: 181, tag: 'bottom' },
      { slot: 'spark', x: 8, y: 607, w: 217, h: 181, tag: 'top' },
      { slot: 'fighter', x: 231, y: 607, w: 217, h: 181, tag: 'top' },
      { slot: 'hero', x: 454, y: 46, w: 598, h: 742, tag: 'hero' },
      { slot: 'don', x: 1058, y: 46, w: 264, h: 243, tag: 'bottom' },
      { slot: 'consigliere', x: 1328, y: 46, w: 264, h: 243, tag: 'bottom' },
      { slot: 'widow', x: 1058, y: 295, w: 264, h: 243, tag: 'bottom' },
      { slot: 'enforcer', x: 1328, y: 295, w: 264, h: 243, tag: 'bottom' },
      { slot: 'driver', x: 1058, y: 544, w: 264, h: 243, tag: 'top' },
      { slot: 'lookout', x: 1328, y: 544, w: 264, h: 243, tag: 'top' },
    ],
    labels: [
      { text: 'POLICE', cx: 228, y: 46 },
      { text: 'HEROES', cx: 228, y: 420 },
      { text: 'MAFIA', cx: 1325, y: 46 },
    ],
    streetStrip: null,
    starburstAt: { x: 545, y: 118 },
  },
};
