// game.js — UI for all modes: daily | unlimited | classic | generator.
// Vanilla ES modules, no dependencies. All progress lives in localStorage.
import {
  GRAPH, generateChain, dailyFromPool, puzzleNumber, localISO, isCorrect,
  score, rowEmoji, shareText, classicValid, computerMove,
} from './core.js';

// ---------------------------------------------------------------- helpers
const root = document.getElementById('game');
const MODE = root?.dataset.mode;
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: ignore */ } },
};
const live = document.getElementById('live');
const announce = msg => { if (live) { live.textContent = ''; setTimeout(() => (live.textContent = msg), 30); } };
const settings = Object.assign({ sound: false }, store.get('wc-settings', {}));
const saveSettings = () => store.set('wc-settings', settings);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let audio;
function beep(ok) {
  if (!settings.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = ok ? 660 : 180; g.gain.value = 0.06;
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + (ok ? 0.12 : 0.2));
  } catch { /* audio not available */ }
}
function flash(el, cls) {
  if (reducedMotion) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}
function modal(title, ...content) {
  const d = h('dialog', { 'aria-labelledby': 'dlg-t' },
    h('h2', { id: 'dlg-t' }, title), ...content,
    h('p', {}, h('button', { class: 'primary', onclick: () => d.close() }, 'Close')));
  d.addEventListener('close', () => d.remove());
  document.body.append(d); d.showModal();
  return d;
}
async function share(text) {
  try {
    if (navigator.share && matchMedia('(pointer:coarse)').matches) { await navigator.share({ text }); return; }
    await navigator.clipboard.writeText(text); announce('Result copied to clipboard'); toast('Copied to clipboard');
  } catch { toast('Could not share — copy it manually'); }
}
let toastEl;
function toast(msg) {
  toastEl ||= root.querySelector('.msg');
  if (toastEl) toastEl.textContent = msg;
  announce(msg);
}
function themeToggle() {
  const cur = document.documentElement.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('wc-theme', next); } catch {}
}
function topBar(title, extra = []) {
  const snd = h('button', { 'aria-pressed': String(settings.sound), 'aria-label': 'Sound', title: 'Sound' }, settings.sound ? '🔊' : '🔈');
  snd.onclick = () => { settings.sound = !settings.sound; saveSettings(); snd.textContent = settings.sound ? '🔊' : '🔈'; snd.setAttribute('aria-pressed', String(settings.sound)); };
  return h('div', { class: 'g-bar' },
    h('span', { class: 'g-title' }, title),
    h('div', { class: 'g-icons' }, ...extra,
      h('button', { 'aria-label': 'How to play', title: 'How to play', onclick: showHelp }, '?'),
      snd,
      h('button', { 'aria-label': 'Toggle dark mode', title: 'Dark mode', onclick: themeToggle }, '🌓')));
}
function showHelp() {
  modal('How to play',
    h('p', {}, 'Fill in each hidden word so it joins the word above AND the word below to make a compound word or phrase.'),
    h('p', {}, h('strong', {}, 'Example: '), 'FIRE → WORK → SHOP (firework, workshop).'),
    h('p', {}, 'Type with your keyboard or the on-screen keys, then press Enter. A wrong guess or a hint reveals one letter. Use ↑ ↓ or tap to switch rows.'),
    h('p', {}, h('a', { href: '/how-to-play/' }, 'Full rules and tips')));
}

// ================================================================ CHAIN GAME
/**
 * Renders a playable chain. `saved` restores progress. Calls onChange(state) after
 * every move and onFinish(state) once when complete.
 */
function chainGame(mount, { chain, title, saved, onChange, onFinish, extraButtons = [] }) {
  const n = chain.length;
  const st = saved || { reveals: Array(n).fill(0), words: chain.map((w, i) => (i === 0 || i === n - 1 ? w : null)), done: false };
  let typed = '', active = -1;

  const isHidden = i => i > 0 && i < n - 1;
  const known = i => st.words[i] != null;
  const selectable = i => isHidden(i) && !known(i) && (known(i - 1) || known(i + 1));
  const prefix = i => chain[i].slice(0, st.reveals[i]);
  const pickActive = (pref = active) => {
    if (pref >= 0 && selectable(pref)) return pref;
    for (let i = 1; i < n - 1; i++) if (selectable(i)) return i;
    return -1;
  };

  const list = h('ol', { class: 'chain', 'aria-label': 'Word chain' });
  const msg = h('p', { class: 'msg', role: 'status' });
  toastEl = msg;
  const hintBtn = h('button', { onclick: () => hint() }, '💡 Hint (reveal a letter)');
  const actions = h('div', { class: 'g-actions' }, hintBtn, ...extraButtons);
  const kbd = keyboard(k => press(k));
  mount.replaceChildren(topBar(title), list, msg, actions, kbd);

  function render() {
    active = pickActive();
    list.replaceChildren(...chain.map((w, i) => {
      const word = st.words[i];
      const cls = ['row', !isHidden(i) ? 'given' : word ? 'solved' : selectable(i) ? 'selectable' : 'locked', i === active ? 'active' : ''].join(' ');
      const tiles = [];
      const len = (word || w).length;
      for (let j = 0; j < len; j++) {
        let ch = '', tc = 'tile';
        if (word) ch = word[j];
        else if (j < st.reveals[i]) { ch = w[j]; tc += ' rev'; }
        else if (i === active && j - st.reveals[i] < typed.length) { ch = typed[j - st.reveals[i]]; tc += ' typed'; }
        tiles.push(h('span', { class: tc }, ch));
      }
      const label = word ? `Row ${i + 1}: ${word}` : `Row ${i + 1}: ${len} letters, ${st.reveals[i]} revealed${selectable(i) ? ', selectable' : ', locked'}`;
      const li = h('li', { class: cls, 'aria-label': label, 'data-i': i }, ...tiles);
      if (selectable(i)) { li.tabIndex = 0; li.onclick = () => select(i); li.onkeydown = e => { if (e.key === ' ') { e.preventDefault(); select(i); } }; }
      return li;
    }));
    hintBtn.disabled = st.done || active < 0;
  }
  function select(i) { if (selectable(i) && i !== active) { active = i; typed = ''; render(); } }
  function moveActive(dir) {
    for (let i = active + dir; i > 0 && i < n - 1; i += dir) if (selectable(i)) return select(i);
  }
  function reveal(i) {
    st.reveals[i]++;
    if (st.reveals[i] >= chain[i].length) { st.words[i] = chain[i]; announce(`Revealed: ${chain[i]}`); }
  }
  function hint() {
    if (st.done || active < 0) return;
    reveal(active); typed = ''; afterMove(false);
  }
  function submit() {
    if (active < 0) return;
    const i = active, need = chain[i].length - st.reveals[i];
    if (typed.length < need) { toast(`Type ${need} letter${need > 1 ? 's' : ''}`); flash(rowEl(i), 'shake'); return; }
    const guess = prefix(i) + typed;
    const ctx = chain.map((w, j) => st.words[j] || w);
    if (isCorrect(ctx, i, guess, GRAPH)) {
      st.words[i] = guess; typed = ''; beep(true); toast(`✓ ${guess.toUpperCase()}`);
      afterMove(true, i);
    } else {
      beep(false); flash(rowEl(i), 'shake'); toast(`✗ Not ${guess.toUpperCase()} — one letter revealed`);
      reveal(i); typed = ''; afterMove(false);
    }
  }
  function afterMove(ok, i) {
    render(); if (ok) flash(rowEl(i), 'pop');
    if (!st.done && st.words.every(Boolean)) {
      st.done = true; render();
      onChange?.(st); onFinish?.(st);
    } else onChange?.(st);
  }
  const rowEl = i => list.querySelector(`[data-i="${i}"]`);
  function press(k) {
    if (st.done) return;
    if (k === 'enter') return submit();
    if (k === 'back') { typed = typed.slice(0, -1); return render(); }
    if (k === 'up') return moveActive(-1);
    if (k === 'down') return moveActive(1);
    if (/^[a-z]$/.test(k) && active >= 0 && typed.length < chain[active].length - st.reveals[active]) { typed += k; render(); }
  }
  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
    if (e.target.closest?.('input,select,textarea')) return;
    const map = { Enter: 'enter', Backspace: 'back', ArrowUp: 'up', ArrowDown: 'down' };
    const k = map[e.key] || (e.key.length === 1 ? e.key.toLowerCase() : null);
    if (k) { if (map[e.key]) e.preventDefault(); press(k); }
  };
  document.removeEventListener('keydown', document._wcKey || (() => {}));
  document._wcKey = onKey; document.addEventListener('keydown', onKey);
  render();
  return { state: st };
}

function keyboard(onKey) {
  const rows = ['qwertyuiop', 'asdfghjkl', '⏎zxcvbnm⌫'];
  return h('div', { class: 'kbd', 'aria-label': 'On-screen keyboard' }, rows.map(r => h('div', { class: 'kbd-row' },
    [...r].map(c => {
      const k = c === '⏎' ? 'enter' : c === '⌫' ? 'back' : c;
      return h('button', { type: 'button', class: k.length > 1 ? 'wide' : '', 'aria-label': k === 'enter' ? 'Enter' : k === 'back' ? 'Backspace' : c, onclick: () => onKey(k) }, k === 'enter' ? 'Enter' : c);
    }))));
}

// ================================================================ DAILY
async function daily() {
  const today = localISO();
  const q = new URLSearchParams(location.search).get('d');
  const iso = q && /^\d{4}-\d{2}-\d{2}$/.test(q) && q <= today && puzzleNumber(q) >= 1 ? q : today;
  const isToday = iso === today;
  let pool;
  try { pool = await (await fetch('/data/daily.json', { cache: 'no-cache' })).json(); }
  catch { root.textContent = 'Could not load today’s puzzle. Check your connection and reload.'; return; }
  const chain = dailyFromPool(pool, iso), num = puzzleNumber(iso);
  const key = 'wc-daily-' + iso;
  const statsBtn = h('button', { onclick: showStats }, '📊 Stats');
  const g = chainGame(root, {
    chain, title: `#${num} · ${isToday ? 'Today' : iso}`, saved: store.get(key),
    extraButtons: [statsBtn],
    onChange: st => store.set(key, st),
    onFinish: st => { if (isToday) recordDaily(iso, score(st.reveals.slice(1, -1))); showResult(st); },
  });
  if (g.state.done) showResult(g.state, true);

  function recordDaily(day, pts) {
    const s = store.get('wc-stats', { played: 0, total: 0, streak: 0, maxStreak: 0, last: null, perfect: 0 });
    if (s.last === day) return;
    const yesterday = localISO(new Date(Date.now() - 864e5));
    s.streak = s.last === yesterday ? s.streak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
    s.played++; s.total += pts; if (pts === 100) s.perfect++; s.last = day;
    store.set('wc-stats', s);
  }
  function showStats() {
    const s = store.get('wc-stats', { played: 0, total: 0, streak: 0, maxStreak: 0, perfect: 0 });
    modal('Your stats', h('div', { class: 'stats-grid' },
      ...[['Played', s.played], ['Avg score', s.played ? Math.round(s.total / s.played) : 0], ['Streak', s.streak], ['Best streak', s.maxStreak]]
        .map(([l, v]) => h('div', {}, h('b', {}, String(v)), l))),
      h('p', { class: 'small' }, `Perfect chains: ${s.perfect}. Stats are stored only on this device.`));
  }
  function showResult(st, quiet = false) {
    const rev = st.reveals.slice(1, -1), pts = score(rev);
    const text = shareText({ number: num, reveals: rev, url: location.origin + '/' });
    const countdown = h('p', { class: 'small' });
    const tick = () => {
      const m = new Date(); m.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((m - Date.now()) / 1000));
      countdown.textContent = `Next chain in ${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    };
    tick(); const t = setInterval(tick, 1000);
    const body = [
      h('p', { class: 'result-grid', 'aria-label': `Score ${pts} out of 100` }, rev.map(rowEmoji).join('')),
      h('p', { style: 'text-align:center;font-size:1.3rem' }, h('strong', {}, `${pts}/100`)),
      h('p', {}, chain.map(w => w.toUpperCase()).join(' → ')),
      h('p', {}, h('button', { class: 'primary', onclick: () => share(text) }, 'Share result'), ' ', h('a', { class: 'btn', href: '/unlimited/' }, 'Play unlimited')),
      isToday ? countdown : h('p', {}, h('a', { href: '/' }, 'Play today’s chain')),
    ];
    if (quiet) { const p = h('div', { class: 'g-actions' }, h('button', { class: 'primary', onclick: () => share(text) }, `Share ${pts}/100`), h('a', { class: 'btn', href: '/unlimited/' }, 'Play unlimited')); root.append(p, countdown); return; }
    const d = modal(pts === 100 ? 'Perfect chain! 🎉' : 'Chain complete!', ...body);
    d.addEventListener('close', () => clearInterval(t));
  }
}

// ================================================================ UNLIMITED
function unlimited() {
  const opts = store.get('wc-unl', { len: 7, played: 0, total: 0 });
  const lenSel = h('select', { 'aria-label': 'Chain length' }, [5, 7, 9].map(v => h('option', { value: v, selected: v === opts.len }, `${v} words`)));
  const newBtn = h('button', { class: 'primary' }, '↻ New chain');
  const bar = h('div', { class: 'g-opts' }, lenSel, newBtn);
  const area = h('div');
  root.replaceChildren(bar, area);
  function start() {
    opts.len = +lenSel.value; store.set('wc-unl', opts);
    const chain = generateChain((Math.random() * 2 ** 31) | 0, opts.len);
    chainGame(area, {
      chain, title: `Unlimited · ${opts.played} played`,
      onFinish: st => {
        const rev = st.reveals.slice(1, -1), pts = Math.round(score(rev) * 5 / rev.length);
        opts.played++; opts.total += pts; store.set('wc-unl', opts);
        modal('Chain complete!', h('p', { class: 'result-grid' }, rev.map(rowEmoji).join('')),
          h('p', {}, `${pts}/100 · average ${Math.round(opts.total / opts.played)} over ${opts.played} chains`),
          h('p', {}, chain.map(w => w.toUpperCase()).join(' → ')),
          h('p', {}, h('button', { class: 'primary', onclick: e => { e.target.closest('dialog').close(); start(); } }, 'Next chain')));
      },
    });
  }
  newBtn.onclick = start; lenSel.onchange = start;
  start();
}

// ================================================================ CLASSIC
async function classic() {
  root.replaceChildren(topBar('Classic · loading words…'), h('p', { class: 'msg' }, 'Loading dictionary…'));
  let data;
  try { data = await (await fetch('/data/dict.json')).json(); }
  catch { root.querySelector('.msg').textContent = 'Could not load the dictionary. Reload to try again.'; return; }
  const dict = new Set(data.words);
  const best = () => store.get('wc-classic-best', 0);
  const speed = h('select', { 'aria-label': 'Time per turn' },
    h('option', { value: 30 }, 'Relaxed (30s)'), h('option', { value: 15, selected: true }, 'Normal (15s)'), h('option', { value: 8 }, 'Fast (8s)'));
  const startBtn = h('button', { class: 'primary' }, 'Start');
  const word = h('div', { class: 'cl-word', 'aria-live': 'polite' }, '—');
  const timer = h('div', { class: 'timer', role: 'progressbar', 'aria-label': 'Time left' }, h('i'));
  const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Your word', placeholder: 'Your word…', disabled: true });
  const go = h('button', { class: 'primary', type: 'submit', disabled: true }, 'Play');
  const form = h('form', { class: 'cl-form' }, input, go);
  const msg = h('p', { class: 'msg', role: 'status' });
  const used = h('ul', { class: 'used', 'aria-label': 'Words played' });
  const scoreEl = h('span', { class: 'g-title' });
  root.replaceChildren(topBar('Classic word chain'), h('div', { class: 'g-opts' }, speed, startBtn, scoreEl), word, timer, form, msg, used);
  toastEl = msg;

  let usedSet, last, myCount, deadline, raf, playing = false;
  const showScore = () => (scoreEl.textContent = `Score ${myCount ?? 0} · Best ${best()}`);
  showScore();
  function showWord(w) {
    word.replaceChildren(w.slice(0, -1), h('span', { class: 'last' }, w.at(-1)));
  }
  function addUsed(w, me) { used.prepend(h('li', { class: me ? 'me' : '' }, w)); }
  function startTurn() {
    deadline = performance.now() + speed.value * 1000;
    cancelAnimationFrame(raf);
    const bar = timer.firstChild;
    const step = () => {
      const left = (deadline - performance.now()) / (speed.value * 1000);
      bar.style.transform = `scaleX(${Math.max(0, left)})`;
      if (left <= 0) return end('⏰ Time’s up!');
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    input.value = ''; input.focus();
  }
  function computer() {
    const w = computerMove(last, usedSet, data.byLetter);
    if (!w) return end('🏆 The computer is out of words — you win!');
    usedSet.add(w); last = w; showWord(w); addUsed(w, false);
    announce(`Computer plays ${w}. Your word must start with ${w.at(-1)}.`);
    startTurn();
  }
  function start() {
    usedSet = new Set(); myCount = 0; playing = true; used.replaceChildren(); msg.textContent = '';
    input.disabled = go.disabled = false; startBtn.textContent = 'Restart';
    const letters = 'abcdefghilmnoprstw';
    last = letters[Math.floor(Math.random() * letters.length)]; // computer's first word starts with this letter
    showScore(); computer();
  }
  function end(reason) {
    playing = false; cancelAnimationFrame(raf);
    input.disabled = go.disabled = true;
    if (myCount > best()) store.set('wc-classic-best', myCount);
    showScore();
    const text = `I chained ${myCount} words in Classic Word Chain ⛓️\n${location.origin}/classic/`;
    modal(reason, h('p', {}, `You played ${myCount} word${myCount === 1 ? '' : 's'}. Best: ${best()}.`),
      h('p', {}, h('button', { class: 'primary', onclick: e => { e.target.closest('dialog').close(); start(); } }, 'Play again'), ' ',
        h('button', { onclick: () => share(text) }, 'Share')));
  }
  form.onsubmit = e => {
    e.preventDefault();
    if (!playing) return;
    const v = classicValid(input.value, last, usedSet, dict);
    if (!v.ok) { toast(v.why); flash(input, 'shake'); beep(false); return; }
    const w = input.value.trim().toLowerCase();
    usedSet.add(w); last = w; myCount++; addUsed(w, true); beep(true); showScore(); toast(`✓ ${w}`);
    cancelAnimationFrame(raf); input.value = '';
    setTimeout(computer, 500);
  };
  startBtn.onclick = start;
}

// ================================================================ GENERATOR
function generator() {
  const len = h('select', { 'aria-label': 'Words per chain' }, [4, 5, 6, 7, 8, 9, 10].map(v => h('option', { value: v, selected: v === 6 }, `${v} words`)));
  const count = h('select', { 'aria-label': 'Number of chains' }, [1, 5, 10, 20].map(v => h('option', { value: v, selected: v === 5 }, `${v} chains`)));
  const hide = h('input', { type: 'checkbox', id: 'hide' });
  const out = h('div', { class: 'gen-out', 'aria-live': 'polite' });
  let chains = [];
  const draw = () => {
    out.replaceChildren(...chains.map((c, i) => h('div', { class: 'gen-item' }, h('strong', {}, `${i + 1}. `),
      c.map((w, j) => (hide.checked && j > 0 && j < c.length - 1 ? '_ '.repeat(w.length).trim() : w.toUpperCase())).join(' → '))));
    if (hide.checked) out.append(h('details', { class: 'gen-item', open: true }, h('summary', {}, 'Answer key'),
      h('ol', {}, chains.map(c => h('li', {}, c.map(w => w.toUpperCase()).join(' → '))))));
  };
  const gen = () => {
    chains = Array.from({ length: +count.value }, () => generateChain((Math.random() * 2 ** 31) | 0, +len.value)).filter(Boolean);
    draw();
  };
  hide.onchange = draw;
  root.replaceChildren(
    h('div', { class: 'g-opts' }, len, count, h('label', {}, hide, ' Hide middle words')),
    h('div', { class: 'g-actions' },
      h('button', { class: 'primary', onclick: gen }, 'Generate'),
      h('button', { onclick: () => share(chains.map((c, i) => `${i + 1}. ${c.map(w => w.toUpperCase()).join(' → ')}`).join('\n')) }, 'Copy'),
      h('button', { onclick: () => print() }, 'Print')),
    h('p', { class: 'msg', role: 'status' }), out);
  toastEl = root.querySelector('.msg');
  gen();
}

// ---------------------------------------------------------------- boot
({ daily, unlimited, classic, generator })[MODE]?.();
