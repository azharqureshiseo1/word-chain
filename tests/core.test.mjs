// Run: node tests/core.test.mjs
import assert from 'node:assert/strict';
import { parseLinks } from '../site/assets/js/links.js';
import { GRAPH, generateChain, buildDailyPool, dailyFromPool, isCorrect, puzzleNumber, isoFromNumber, score, shareText, classicValid, computerMove, isGoodChain } from '../site/assets/js/core.js';

const pairs = parseLinks();
assert.ok(pairs.length > 500, 'need 500+ links, have ' + pairs.length);
for (const [a, b] of pairs) assert.match(a + b, /^[a-z]+$/, `bad entry ${a} ${b}`);

// daily schedule: deterministic, valid, no repeats
const pool = buildDailyPool();
assert.deepEqual(buildDailyPool(), pool, 'pool must be deterministic');
assert.ok(pool.length >= 340, 'daily pool too small: ' + pool.length + ' (add more links)');
assert.equal(new Set(pool.map(c => c.join())).size, pool.length, 'repeated chain in pool');
for (const c of pool) {
  assert.equal(c.length, 7); assert.ok(isGoodChain(c));
  for (let i = 1; i < c.length; i++) assert.ok(GRAPH.has(c[i - 1], c[i]), `${c[i-1]}-${c[i]}`);
}
for (let n = 1; n <= 800; n++) { const iso = isoFromNumber(n); assert.equal(puzzleNumber(iso), n); assert.ok(dailyFromPool(pool, iso)); }
for (const L of [4, 5, 7, 9, 10]) for (let s = 0; s < 200; s++) { const c = generateChain(s * 31 + L, L); assert.ok(c && c.length === L, 'unlimited gen failed len ' + L); }
const seenChains = new Set(pool.map(c => c.join()));

// answer checking incl. alternatives
const c = ['fire', 'work', 'shop', 'keeper', 'x', 'y', 'z'];
assert.ok(isCorrect(c, 1, 'WORK '));
assert.ok(!isCorrect(c, 1, 'house'));
// alternative: sun ? light -> "flash"? no; build one: snow ? man: "snow ball"? ball man no. use "foot ? mark": foot print? print mark no. "book ? case" -> book "end"? end case no.
// generic alt check: find a real alternative in the graph
let alt = null;
outer: for (const [a, nexts] of GRAPH.next) for (const m of nexts) for (const z of (GRAPH.next.get(m) || [])) {
  for (const m2 of nexts) if (m2 !== m && GRAPH.has(m2, z)) { alt = [a, m, z, m2]; break outer; }
}
assert.ok(alt, 'expected at least one ambiguous triple');
assert.ok(isCorrect([alt[0], alt[1], alt[2]], 1, alt[3]), 'alternative answer should be accepted: ' + alt);

assert.equal(score([0, 0, 0, 0, 0]), 100);
assert.equal(score([1, 0, 0, 0, 5]), 76);
assert.match(shareText({ number: 3, reveals: [0, 1, 3, 0, 0], url: 'u' }), /#3 — 84\/100\n🟩🟨🟥🟩🟩/);

const dict = new Set(['apple', 'egg', 'goat', 'tiger']);
assert.ok(classicValid('egg', 'apple', new Set(), dict).ok);
assert.ok(!classicValid('goat', 'apple', new Set(), dict).ok);
assert.ok(!classicValid('egg', 'apple', new Set(['egg']), dict).ok);
assert.equal(computerMove('egg', new Set(), { g: ['goat'] }), 'goat');
assert.equal(computerMove('egg', new Set(['goat']), { g: ['goat'] }), null);
console.log('OK', pairs.length, 'links,', GRAPH.next.size, 'start words, unique dailies:', seenChains.size);
console.log('sample', dailyFromPool(pool, '2026-11-19').join(' → '));
