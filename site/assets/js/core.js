// core.js — pure game logic. No DOM. Imported by the browser (game.js)
// and by Node (scripts/build.mjs, tests/core.test.mjs).
import { buildGraph } from './links.js';

export const GRAPH = buildGraph();
export const CHAIN_LENGTH = 7;          // words shown in a chain (first + last are given)
export const EPOCH = Date.UTC(2026, 0, 1); // puzzle #1 = 1 Jan 2026
const DAY = 86400000;

// ---------- seeded random (mulberry32) ----------
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- dates ----------
/** "YYYY-MM-DD" in the player's local time zone */
export function localISO(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
/** puzzle number for a "YYYY-MM-DD" string (1-based) */
export function puzzleNumber(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / DAY) + 1;
}
export function isoFromNumber(n) {
  return new Date(EPOCH + (n - 1) * DAY).toISOString().slice(0, 10);
}

// ---------- chain generation ----------
/**
 * Random walk through the link graph. Deterministic for a given seed.
 * Returns an array of CHAIN_LENGTH lowercase words, or null if no chain found.
 */
export function generateChain(seed, length = CHAIN_LENGTH, graph = GRAPH) {
  const r = rng(seed);
  const starts = [...graph.next.keys()].sort();
  for (let attempt = 0; attempt < 400; attempt++) {
    const chain = [starts[Math.floor(r() * starts.length)]];
    while (chain.length < length) {
      const last = chain[chain.length - 1];
      const options = [...(graph.next.get(last) || [])]
        .filter(w => !chain.includes(w) && (chain.length === length - 1 || graph.next.has(w)))
        .sort();
      if (!options.length) break;
      chain.push(weightedPick(options, graph, r));
    }
    if (chain.length === length && isGoodChain(chain)) return chain;
  }
  return null;
}

// Hub words (HOUSE, WORK, TIME…) link to everything; down-weight them so
// chains stay varied and less predictable.
const inDegree = new Map();
for (const set of GRAPH.next.values()) for (const w of set) inDegree.set(w, (inDegree.get(w) || 0) + 1);
function weightedPick(options, graph, r) {
  const weights = options.map(w => 1 / Math.pow(inDegree.get(w) || 1, 1.0) / Math.pow((graph.next.get(w)?.size || 1), 0.3));
  let t = r() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) { t -= weights[i]; if (t <= 0) return options[i]; }
  return options[options.length - 1];
}

/** quality filter: no word repeated, no word that is a substring of a neighbour */
export function isGoodChain(chain) {
  if (new Set(chain).size !== chain.length) return false;
  for (let i = 1; i < chain.length; i++) {
    const a = chain[i - 1], b = chain[i];
    if (a.includes(b) || b.includes(a)) return false;
  }
  return true;
}

/**
 * Build the daily schedule (run at build time, saved to /data/daily.json).
 * Guarantees: no repeated chain, no hidden word used more than `maxUse` times,
 * and the same hidden word is not reused within `gap` days.
 */
export function buildDailyPool(count = 365, { seed = 2026, maxUse = 14, gap = 5 } = {}) {
  const r = rng(seed);
  const pool = [], used = new Map(), lastDay = new Map(), keys = new Set();
  for (let tries = 0; pool.length < count && tries < count * 400; tries++) {
    const c = generateChain(Math.floor(r() * 2 ** 31));
    if (!c) continue;
    const key = c.join(' ');
    const hidden = c.slice(1, -1);
    if (keys.has(key)) continue;
    if (hidden.some(w => (used.get(w) || 0) >= maxUse)) continue;
    if (hidden.some(w => lastDay.has(w) && pool.length - lastDay.get(w) < gap)) continue;
    keys.add(key);
    hidden.forEach(w => { used.set(w, (used.get(w) || 0) + 1); lastDay.set(w, pool.length); });
    pool.push(c);
  }
  return pool;
}

/** daily chain for a date from the pre-built schedule (wraps around if it runs out) */
export function dailyFromPool(pool, iso) {
  const n = puzzleNumber(iso);
  return pool[((n - 1) % pool.length + pool.length) % pool.length];
}

// ---------- answer checking ----------
/**
 * A guess for hidden position i is correct if it is the intended word OR
 * it forms valid links with BOTH visible/solved neighbours (alternative answers are fair).
 */
export function isCorrect(chain, i, guess, graph = GRAPH) {
  const g = guess.trim().toLowerCase();
  if (!g) return false;
  if (g === chain[i]) return true;
  const prev = chain[i - 1], next = chain[i + 1];
  return graph.has(prev, g) && graph.has(g, next);
}

// ---------- scoring & sharing ----------
/** per-row reveals → score out of 100 (5 hidden rows, each starts at 20) */
export function score(reveals) {
  return reveals.reduce((s, r) => s + Math.max(0, 20 - r * 4), 0);
}
export function rowEmoji(r) { return r === 0 ? '🟩' : r <= 2 ? '🟨' : '🟥'; }
export function shareText({ number, reveals, url }) {
  return `Word Chain #${number} — ${score(reveals)}/100\n${reveals.map(rowEmoji).join('')}\n${url}`;
}

/** display helper: shows how two words link, e.g. a "fireworks" style hint */
export function linkLabel(a, b) { return `${a.toUpperCase()} + ${b.toUpperCase()}`; }

// ---------- classic (last-letter) mode helpers ----------
export function classicValid(word, prevWord, used, dict) {
  const w = word.trim().toLowerCase();
  if (!/^[a-z]{2,}$/.test(w)) return { ok: false, why: 'Letters only, 2+ letters.' };
  if (prevWord && w[0] !== prevWord[prevWord.length - 1]) return { ok: false, why: `Must start with “${prevWord.at(-1).toUpperCase()}”.` };
  if (used.has(w)) return { ok: false, why: 'Already used.' };
  if (!dict.has(w)) return { ok: false, why: 'Not in our dictionary.' };
  return { ok: true };
}
export function computerMove(prevWord, used, byLetter, r = Math.random) {
  const letter = prevWord.at(-1);
  const pool = (byLetter[letter] || []).filter(w => !used.has(w));
  if (!pool.length) return null; // computer gives up → player wins
  return pool[Math.floor(r() * pool.length)];
}
