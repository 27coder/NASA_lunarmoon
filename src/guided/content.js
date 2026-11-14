// Words and settings for the guided flow. Keep science claims here short and
// sourced; the numbers on screen always come from src/core.

// Sites shown as cards on the "Pick a site" step. Blurbs ask a question rather
// than state a result, because the answer depends on the date the user picks.
export const FEATURED = [
  { id: 'ridge', tag: 'South pole', blurb: 'A high ridge between two craters near the pole. Does being high up help catch the low Sun?' },
  { id: 'peak-shackleton', tag: 'South pole', blurb: 'A tall massif about 30 km from Shackleton crater. Plenty of Sun, but can it see Earth?' },
  { id: 'shackleton', tag: 'South pole', blurb: 'The floor of a deep polar crater, the kind of place where water ice hides. Can sunlight reach the bottom?' },
  { id: 'im1', tag: 'Landed 2024', blurb: 'Intuitive Machines’ Odysseus landed here near the south pole in February 2024.' },
  { id: 'ch3', tag: 'Landed 2023', blurb: 'India’s Vikram lander touched down here in August 2023.' },
  { id: 'ce4', tag: 'Far side', blurb: 'China’s Chang’e 4, the first landing on the Moon’s far side (2019).' },
  { id: 'a11', tag: 'Apollo', blurb: 'Where Apollo 11 landed in 1969, near the Moon’s equator. A good comparison with the pole.' },
];

export const LESSON = {
  title: 'Every Moon lander needs two things',
  cards: [
    {
      icon: 'sun',
      title: 'Sunlight for power',
      text: 'Solar panels charge the batteries. When the Sun goes down, the lander has to live on its battery through a long, freezing night.',
    },
    {
      icon: 'earth',
      title: 'Earth in view to talk home',
      text: 'Without a relay satellite, a lander can only send data when Earth is above its horizon. Landers also need to talk to Earth while they land.',
    },
    {
      icon: 'ice',
      title: 'Why everyone wants the south pole',
      text: 'Some polar craters never see sunlight. They are cold enough to trap water ice, which future explorers could use. But the pole is also where Sun and Earth are hardest to see.',
    },
  ],
};

export const QUIZ = [
  {
    id: 'q1',
    prompt: 'At the Moon’s south pole, how high does the Sun climb in the sky?',
    options: ['Straight overhead', 'About halfway up the sky', 'Only a few degrees above the horizon'],
    answer: 2,
    explain:
      'The Moon’s axis is tilted only about 1.5°, so near the pole the Sun skims along the horizon and circles all the way around once every 29.5 days. NASA says the Sun and Earth only rise about 2–7° above the horizon in the south-pole landing regions.',
  },
  {
    id: 'q2',
    prompt: 'Your lander sits at the bottom of a deep crater near the pole. What is the problem?',
    options: ['It is too hot', 'The crater walls block the low Sun and Earth', 'There is no problem'],
    answer: 1,
    explain:
      'With the Sun and Earth so low, a crater wall or a hill a few kilometres away can hide them for days. That is why this app uses NASA’s real terrain heights to draw the skyline around each site.',
  },
];

// Simple rules of thumb for the traffic lights. They are our own choices for
// a beginner-friendly verdict, not NASA requirements, and the app says so.
export const RULES = {
  sunDays: 7, // want at least this many days of sunlight after landing
  earthDays: 3, // want Earth in view for at least this long after landing
  earthClearanceDeg: 2, // Earth's centre this far above the terrain for a clean radio link
  scanDays: 30,
  findDays: 60,
};

// Spot checks of this app's engine against NASA JPL Horizons (observer placed
// on the Moon's surface, QUANTITIES=4, retrieved 14 Nov 2026). The unit test
// test/horizons.spec.js re-checks the engine against these values, and
// scripts/verify-horizons.mjs fetches them again live.
export const HORIZONS_CHECKS = [
  {
    label: 'Sun at Apollo 11, at the moment of landing (20 Jul 1969 20:17:40 UTC)',
    body: 'sun',
    lat: 0.67416,
    lon: 23.47315,
    iso: '1969-07-20T20:17:39.840Z',
    jd: '2440423.3456',
    horizons: { az: 88.805495, el: 10.7033 },
  },
  {
    label: 'Earth from the Shackleton connecting ridge (1 Jan 2027 00:00 UTC)',
    body: 'earth',
    lat: -89.45,
    lon: -137.31,
    iso: '2027-01-01T00:00:00Z',
    jd: '2461406.5',
    horizons: { az: 144.46073, el: -6.695661 },
  },
  {
    label: 'Sun at Reiner Gamma (1 Jan 2027 00:00 UTC)',
    body: 'sun',
    lat: 7.5,
    lon: -59.0,
    iso: '2027-01-01T00:00:00Z',
    jd: '2461406.5',
    horizons: { az: 258.890951, el: 51.266196 },
  },
];

export const SOURCES = [
  { label: 'NASA JPL Horizons (used to check the Sun and Earth positions)', url: 'https://ssd.jpl.nasa.gov/horizons/' },
  { label: 'NASA LRO Lunar Orbiter Laser Altimeter (LOLA) terrain heights', url: 'https://lola.gsfc.nasa.gov/' },
  { label: 'NASA Artemis Human Landing System overview, Space Apps 2025 (south-pole lighting facts)', url: 'https://ntrs.nasa.gov/api/citations/20250009323/downloads/ArtemisOverview2025IntSPAPPSChallenge.pdf' },
  { label: 'astronomy-engine (Sun, Earth and Moon positions, MIT licence)', url: 'https://github.com/cosinekitty/astronomy' },
];
