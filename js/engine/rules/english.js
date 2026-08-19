import { ENGLISH_WORDS } from './english-words.js';

const EXTRA = [
  'topbar',
  'workspace',
  'visually',
  'shortcut',
  'kbd',
  'translit',
  'nowrap',
  'favicon',
];

const ENGLISH = new Set([...ENGLISH_WORDS, ...EXTRA]);

const ALLOW = new Set([
  'btn',
  'col',
  'lg',
  'md',
  'sm',
  'xs',
  'xl',
  'xxl',
  'xxs',
  'cta',
  'faq',
  'nav',
  'img',
  'pic',
  'bg',
  'fg',
  'ui',
  'ux',
  'id',
  'ok',
  'ltr',
  'rtl',
  'sso',
  'sku',
  'pdf',
  'svg',
  'png',
  'jpg',
  'gif',
  'webp',
  'html',
  'css',
  'js',
  'bem',
  'flex',
  'grid',
  'gap',
  'row',
  'col',
  'mod',
  'el',
  'elem',
  'min',
  'max',
  'alt',
  'src',
  'href',
  'tel',
  'sms',
  'www',
  'http',
  'https',
  'cdn',
  'api',
  'seo',
  'cms',
  'crm',
  'faq',
  'toc',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pt',
  'pb',
  'pl',
  'pr',
  'mt',
  'mb',
  'ml',
  'mr',
  'mx',
  'my',
  'px',
  'py',
  'vw',
  'vh',
  'em',
  'rem',
  'swiper',
  'slick',
  'wow',
  'aos',
  'nojs',
  'is',
  'has',
  'js',
  'dev',
  'prod',
  'qa',
  'ui',
  'ux',
]);

const TRANSLIT_FIX = {
  knopka: 'button',
  knopki: 'button',
  knopochka: 'button',
  knopochku: 'button',
  knopochnyj: 'button',
  knopochnaya: 'button',
  knopkaotpravit: 'submit',
  zagolovok: 'title',
  zagolovki: 'title',
  zagolovka: 'title',
  podzagolovok: 'subtitle',
  spisok: 'list',
  spiski: 'list',
  spiska: 'list',
  shapka: 'header',
  shapki: 'header',
  shapochka: 'header',
  podval: 'footer',
  podvala: 'footer',
  podvalo: 'footer',
  futer: 'footer',
  futera: 'footer',
  ssylka: 'link',
  ssylki: 'link',
  ssylku: 'link',
  ssilka: 'link',
  kartochka: 'card',
  kartochki: 'card',
  kartochku: 'card',
  kartinka: 'image',
  kartinki: 'image',
  forma: 'form',
  formy: 'form',
  blok: 'block',
  bloka: 'block',
  bloki: 'block',
  menyu: 'menu',
  menju: 'menu',
  menushka: 'menu',
  navigaciya: 'navigation',
  navigatsiya: 'navigation',
  navigacija: 'navigation',
  kontejner: 'container',
  konteyner: 'container',
  konteiner: 'container',
  obertka: 'wrapper',
  obolochka: 'wrapper',
  soderzhimoe: 'content',
  soderzhimoye: 'content',
  kontent: 'content',
  sekciya: 'section',
  sektsiya: 'section',
  sekcija: 'section',
  stranica: 'page',
  stranitsa: 'page',
  stranicy: 'page',
  stranitsy: 'page',
  pole: 'field',
  polya: 'field',
  vvod: 'input',
  vybor: 'select',
  perekluchatel: 'switch',
  pereklyuchatel: 'switch',
  chekboks: 'checkbox',
  chekbox: 'checkbox',
  radioknopka: 'radio',
  vkladka: 'tab',
  vkladki: 'tab',
  okno: 'modal',
  okna: 'modal',
  okoshko: 'modal',
  modalnoe: 'modal',
  modalnoye: 'modal',
  moadal: 'modal',
  vsplyvayushchee: 'popup',
  vsplyvajushchee: 'popup',
  podskazka: 'hint',
  podskazki: 'hint',
  oshibka: 'error',
  oshibki: 'error',
  uspeh: 'success',
  preduprezhdenie: 'warning',
  preduprezhdeniye: 'warning',
  zagruzka: 'loading',
  zagruzki: 'loading',
  ikonka: 'icon',
  ikonki: 'icon',
  slajder: 'slider',
  slayder: 'slider',
  karusel: 'carousel',
  galereya: 'gallery',
  galereja: 'gallery',
  tovar: 'product',
  tovary: 'product',
  korzina: 'cart',
  korziny: 'cart',
  cena: 'price',
  tsena: 'price',
  skidka: 'discount',
  zakaz: 'order',
  zakaza: 'order',
  oplata: 'payment',
  dostavka: 'delivery',
  polzovatel: 'user',
  polzovatelya: 'user',
  polzovatelskiy: 'user',
  parol: 'password',
  parolya: 'password',
  pochta: 'email',
  imya: 'name',
  imja: 'name',
  familiya: 'surname',
  familiia: 'surname',
  telefon: 'phone',
  adres: 'address',
  gorod: 'city',
  strana: 'country',
  otpravit: 'submit',
  otpravka: 'submit',
  otpravki: 'submit',
  vhod: 'login',
  vkhod: 'login',
  vyhod: 'logout',
  vykhod: 'logout',
  poisk: 'search',
  filtr: 'filter',
  tablica: 'table',
  tablitsa: 'table',
  stroka: 'row',
  stroki: 'row',
  stolbec: 'column',
  stolbets: 'column',
  stolbtsa: 'column',
  izobrazhenie: 'image',
  izobrazheniye: 'image',
  tekst: 'text',
  abzac: 'paragraph',
  abzats: 'paragraph',
  punkt: 'item',
  punkty: 'item',
  modifikator: 'modifier',
  modifikatora: 'modifier',
  klass: 'class',
  klassy: 'class',
  sayt: 'site',
  sajt: 'site',
  sait: 'site',
  osnovnoj: 'primary',
  osnovnoy: 'primary',
  osnovnaya: 'primary',
  levyj: 'left',
  leviy: 'left',
  levaya: 'left',
  pravyj: 'right',
  praviy: 'right',
  pravaya: 'right',
  verh: 'top',
  verkh: 'top',
  verhniy: 'top',
  niz: 'bottom',
  nizhniy: 'bottom',
  shirokij: 'wide',
  uzkij: 'narrow',
  krasnyj: 'red',
  chernyj: 'black',
  belyj: 'white',
  siniy: 'blue',
  zelyonyj: 'green',
  oranzhevyj: 'orange',
  vnutrenniy: 'inner',
  vneshniy: 'outer',
  tsentralnyj: 'center',
  dopolnitelnyj: 'extra',
  aktivnyj: 'active',
  aktivnaya: 'active',
  otklyuchen: 'disabled',
  vklyuchen: 'enabled',
  skrytyj: 'hidden',
  vidimyj: 'visible',
  formaoplashki: 'banner',
  plashka: 'banner',
  plashki: 'banner',
  ochered: 'queue',
  spisochered: 'queue',
  zayavka: 'request',
  zayavki: 'request',
  otzyv: 'review',
  otzyvy: 'review',
  kommentariy: 'comment',
  kommentarii: 'comment',
  avtorizaciya: 'login',
  avtorizatsiya: 'login',
  registraciya: 'signup',
  registratsiya: 'signup',
  kapcha: 'captcha',
  galochka: 'check',
  krestik: 'close',
  strelka: 'arrow',
  strelki: 'arrow',
  sloy: 'layer',
  sloi: 'layer',
  fon: 'background',
  obvodka: 'outline',
  ramka: 'border',
  teni: 'shadow',
  otstup: 'gap',
  otstupy: 'gap',
  shirina: 'width',
  vysota: 'height',
  razmer: 'size',
  razmery: 'size',
  tsvet: 'color',
  cvet: 'color',
  shrift: 'font',
  zaglavnaya: 'heading',
  bukva: 'letter',
  slovo: 'word',
  fraza: 'phrase',
  paneli: 'panel',
  skroll: 'scroll',
  prokrutka: 'scroll',
  prokrutki: 'scroll',
  zvezda: 'star',
  zvezdy: 'star',
  zvezdoczka: 'star',
  paragraf: 'paragraph',
  paragrafa: 'paragraph',
  centr: 'center',
  centra: 'center',
  tsentr: 'center',
  tsentra: 'center',
  buton: 'button',
  butona: 'button',
  mobil: 'mobile',
  recers: 'reverse',
  revers: 'reverse',
};

const TRANSLIT = new Set(Object.keys(TRANSLIT_FIX));

const TRANSLIT_HINT = [
  /zh/,
  /shch/,
  /yo/,
  /aya$/,
  /oye$/,
  /enie$/,
  /aniye$/,
  /aniye$/,
  /ost$/,
  /skiy$/,
  /skij$/,
  /nyy$/,
  /niy$/,
  /naya$/,
  /chka$/,
  /shka$/,
  /schik$/,
  /nik$/,
  /ov$/,
  /ev$/,
  /ova$/,
  /eva$/,
  /ogo$/,
  /emu$/,
  /yuyu$/,
  /tsya$/,
  /tsiya$/,
  /cija$/,
  /chnyy/,
  /chniy/,
  /zhenn/,
  /vshiy/,
  /yusch/,
  /jushch/,
];

const HEURISTIC_ALLOW = new Set([
  'school',
  'schedule',
  'scheme',
  'schema',
  'overlay',
  'preview',
  'review',
  'yellow',
  'beyond',
  'layout',
  'about',
  'above',
  'below',
  'follow',
  'shadow',
  'show',
  'november',
  'cover',
  'hover',
  'over',
  'overflow',
  'discover',
  'recovery',
  'remove',
  'move',
  'love',
  'above',
  'nova',
  'promo',
  'hero',
  'video',
  'audio',
  'auto',
  'modal',
  'social',
  'material',
  'serial',
  'tutorial',
  'official',
  'special',
  'horizontal',
  'vertical',
  'digital',
  'original',
  'optional',
  'national',
  'personal',
  'professional',
]);

const SIZE_TOKEN = /^(?:\d+xl|\d+x|\d+|xl|xxl|xxs|xs|sm|md|lg)$/;
const SINGLE_LETTER = /^[a-z]$/;
const PRIORITY = new Set([
  'button',
  'header',
  'footer',
  'center',
  'centre',
  'mobile',
  'paragraph',
  'star',
  'reverse',
  'image',
  'container',
  'section',
  'title',
  'link',
  'menu',
  'block',
  'page',
  'content',
  'wrapper',
  'card',
  'form',
  'input',
  'text',
  'icon',
  'slider',
  'gallery',
  'product',
  'cart',
  'price',
  'search',
  'filter',
  'table',
  'modal',
  'popup',
  'error',
  'success',
  'warning',
  'loading',
  'background',
  'color',
  'font',
  'width',
  'height',
  'size',
  'active',
  'disabled',
  'hidden',
  'visible',
]);

const BY_LENGTH = new Map();
for (const word of ENGLISH) addCandidate(word);
for (const word of ALLOW) addCandidate(word);

function addCandidate(word) {
  if (!word || word.length < 2) return;
  let bucket = BY_LENGTH.get(word.length);
  if (!bucket) {
    bucket = [];
    BY_LENGTH.set(word.length, bucket);
  }
  bucket.push(word);
}

const SUGGEST_CACHE = new Map();

export function tokenize(className) {
  return className
    .split(/__|--|_/)
    .flatMap((part) => part.split('-'))
    .filter(Boolean);
}

function looksLikeTranslit(token) {
  if (HEURISTIC_ALLOW.has(token) || ENGLISH.has(token) || ALLOW.has(token)) {
    return false;
  }
  return TRANSLIT_HINT.some((re) => re.test(token));
}

function levenshtein(a, b, max) {
  if (a === b) return 0;
  const n = a.length;
  const m = b.length;
  if (Math.abs(n - m) > max) return max + 1;
  if (!n) return m;
  if (!m) return n;

  let prev = new Uint16Array(m + 1);
  let curr = new Uint16Array(m + 1);
  for (let j = 0; j <= m; j += 1) prev[j] = j;

  for (let i = 1; i <= n; i += 1) {
    curr[0] = i;
    let rowMin = i;
    const code = a.charCodeAt(i - 1);
    for (let j = 1; j <= m; j += 1) {
      const cost = code === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    const swap = prev;
    prev = curr;
    curr = swap;
  }

  return prev[m];
}

function betterCandidate(token, next, current, nextDist, currentDist) {
  if (!current) return true;
  if (nextDist !== currentDist) return nextDist < currentDist;
  const nextPriority = PRIORITY.has(next);
  const currentPriority = PRIORITY.has(current);
  if (nextPriority !== currentPriority) return nextPriority;
  const nextStart = next[0] === token[0];
  const currentStart = current[0] === token[0];
  if (nextStart !== currentStart) return nextStart;
  return next.length < current.length;
}

function closestEnglish(token) {
  const max = token.length <= 4 ? 1 : 2;
  let best = '';
  let bestDist = max + 1;
  const minLen = Math.max(2, token.length - max);
  const maxLen = token.length + max;

  for (let len = minLen; len <= maxLen; len += 1) {
    const bucket = BY_LENGTH.get(len);
    if (!bucket) continue;
    for (const word of bucket) {
      const dist = levenshtein(token, word, max);
      if (dist > max) continue;
      if (betterCandidate(token, word, best, dist, bestDist)) {
        best = word;
        bestDist = dist;
        if (dist === 0) return word;
      }
    }
  }

  return bestDist <= max ? best : '';
}

export function suggestWord(token) {
  if (SUGGEST_CACHE.has(token)) return SUGGEST_CACHE.get(token);
  const mapped = TRANSLIT_FIX[token];
  const value = mapped || closestEnglish(token);
  SUGGEST_CACHE.set(token, value);
  return value;
}

function replaceToken(className, token, replacement) {
  return className.replace(
    new RegExp(`(^|__|--|_|-)(${token})(?=__|--|_|-|$)`, 'g'),
    (_, sep) => `${sep}${replacement}`,
  );
}

function formatMessage(kind, token, className) {
  const suggest = suggestWord(token);
  const rewritten = suggest ? replaceToken(className, token, suggest) : '';
  const suggestClass = suggest && rewritten && rewritten !== className ? rewritten : '';

  if (kind === 'translit') {
    return {
      suggest,
      suggestClass,
      message: suggest
        ? `«${token}» похоже на транслит с русского. Правильно: ${suggest}${suggestClass ? ` → .${suggestClass}` : ''}.`
        : `«${token}» похоже на транслит с русского.`,
    };
  }

  return {
    suggest,
    suggestClass,
    message: suggest
      ? `«${token}» не распознано как английское слово. Правильно: ${suggest}${suggestClass ? ` → .${suggestClass}` : ''}.`
      : `«${token}» не распознано как английское слово.`,
  };
}

export function checkEnglish(item) {
  const { className, file, line } = item;
  if (!/^[a-z0-9_-]+$/.test(className)) {
    return [];
  }

  const errors = [];
  const tokens = tokenize(className);

  for (const token of tokens) {
    if (SIZE_TOKEN.test(token) || SINGLE_LETTER.test(token) || /^\d+$/.test(token)) {
      continue;
    }

    if (TRANSLIT.has(token) || looksLikeTranslit(token)) {
      const { suggest, suggestClass, message } = formatMessage('translit', token, className);
      errors.push({
        file,
        line,
        className,
        rule: 'translit',
        suggest,
        suggestClass,
        message,
      });
      continue;
    }

    if (!ENGLISH.has(token) && !ALLOW.has(token)) {
      const { suggest, suggestClass, message } = formatMessage('english', token, className);
      errors.push({
        file,
        line,
        className,
        rule: 'english',
        suggest,
        suggestClass,
        message,
      });
    }
  }

  return errors;
}
