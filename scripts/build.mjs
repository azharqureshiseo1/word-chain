// scripts/build.mjs — builds the whole static site into /dist.
// Run: npm run build   (Node 18+). Re-run once a day (cron / CI) so new answer pages appear.
import { mkdir, writeFile, cp, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import words from 'wordlist-english';
import { SITE } from './config.mjs';
import { buildDailyPool, generateChain, puzzleNumber, isoFromNumber, localISO } from '../site/assets/js/core.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const TODAY = process.env.BUILD_DATE || localISO(new Date());
const TODAY_N = puzzleNumber(TODAY);
const VERSION = Date.now().toString(36); // cache-busting for CSS/JS

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const U = w => w.toUpperCase();
const longDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const shortDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// ---------------------------------------------------------------- data
const POOL = buildDailyPool();
const dailyFor = iso => POOL[((puzzleNumber(iso) - 1) % POOL.length + POOL.length) % POOL.length];

function buildDictionary() {
  const ok = w => /^[a-z]{2,}$/.test(w);
  const dict = new Set();
  for (const k of ['english/10', 'english/20', 'english/35', 'american/10', 'american/20', 'american/35', 'british/10', 'british/20', 'british/35'])
    (words[k] || []).forEach(w => ok(w) && dict.add(w));
  // computer only plays common, friendly words of 3–8 letters
  const byLetter = {};
  for (const k of ['english/10', 'english/20'])
    for (const w of words[k] || []) if (/^[a-z]{3,8}$/.test(w) && !w.endsWith('s')) (byLetter[w[0]] ||= new Set()).add(w);
  return { words: [...dict].sort(), byLetter: Object.fromEntries(Object.entries(byLetter).map(([l, s]) => [l, [...s].sort()])) };
}

// ---------------------------------------------------------------- layout
function layout({ path: p, title, description, h1, intro = '', body, schema = [], mode = null, robots = 'index,follow', crumbs = null, ogType = 'website' }) {
  const canonical = SITE.url + p;
  const allSchema = [...schema];
  if (crumbs) allSchema.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', p: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.url + c.p })),
  });
  const nav = [
    ['/', 'Daily'], ['/unlimited/', 'Unlimited'], ['/classic/', 'Classic'],
    ['/word-chain-examples/', 'Examples'], ['/word-chain-generator/', 'Generator'], ['/answers/', 'Answers'],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="${SITE.themeColor}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/og-image.png">
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary_large_image">
${SITE.twitter ? `<meta name="twitter:site" content="${esc(SITE.twitter)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/css/style.css?v=${VERSION}">
<script>try{var t=localStorage.getItem('wc-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${allSchema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
${SITE.analyticsScript}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="/" aria-label="${esc(SITE.name)} home"><img class="logo" src="/favicon.svg" width="28" height="28" alt="">${esc(SITE.name)}</a>
  <nav aria-label="Main"><ul>${nav.map(([h, t]) => `<li><a href="${h}"${h === p ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>
</header>
<main id="main">
${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs.map((c, i) => i === crumbs.length - 1 ? ` › <span aria-current="page">${esc(c.name)}</span>` : ` › <a href="${c.p}">${esc(c.name)}</a>`).join('')}</nav>` : ''}
<h1>${esc(h1)}</h1>
${intro ? `<p class="lede">${intro}</p>` : ''}
${mode ? `<section id="game" class="game" data-mode="${mode}" aria-label="Game"><noscript><p>This game needs JavaScript. Please enable it to play.</p></noscript></section>` : ''}
<div class="content">
${body}
</div>
</main>
<footer class="site-footer">
  <p><a href="/how-to-play/">How to play</a> · <a href="/word-chain-examples/">Word chain examples</a> · <a href="/answers/">Answers archive</a> · <a href="/about/">About</a> · <a href="/privacy/">Privacy</a></p>
  <p>© ${TODAY.slice(0, 4)} ${esc(SITE.name)}. Free to play, no sign-up. Not affiliated with any TV show or publisher.</p>
</footer>
<div id="live" class="sr-only" aria-live="polite"></div>
${mode ? `<script type="module" src="/assets/js/game.js?v=${VERSION}"></script>` : ''}
</body>
</html>`;
}

const gameSchema = (name, url, description) => ({
  '@context': 'https://schema.org', '@type': ['VideoGame', 'WebApplication'], name, url: SITE.url + url, description,
  applicationCategory: 'GameApplication', genre: ['Word game', 'Puzzle'], gamePlatform: 'Web browser', operatingSystem: 'Any',
  inLanguage: 'en', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
});
const faqSchema = faqs => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
});
const faqHtml = faqs => `<section aria-labelledby="faq"><h2 id="faq">Frequently asked questions</h2>${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</section>`;

const chainHtml = (c, { hide = true } = {}) =>
  `<ol class="ex-chain">${c.map((w, i) => `<li>${hide && i > 0 && i < c.length - 1 ? `<span class="blank">${'_ '.repeat(w.length).trim()}</span>` : U(w)}</li>`).join('')}</ol>` +
  (hide ? `<details class="ex-answer"><summary>Show answer</summary><p>${c.map(U).join(' → ')}</p><p class="small">Links: ${c.slice(1).map((w, i) => `${U(c[i])}+${U(w)}`).join(', ')}</p></details>` : '');

// ---------------------------------------------------------------- pages
const pages = [];
const add = (p, html) => pages.push([p, html]);

// HOME (daily) -----------------------------------------------------------
const homeFaqs = [
  ['How do you play the word chain game?', 'You see the first and last word of a chain. Fill in the hidden words so that every pair of neighbouring words makes a compound word or common phrase, like FIRE → WORK (firework) → SHOP (workshop). A wrong guess reveals one extra letter.'],
  ['What is a word chain game?', 'A word chain game is any game where each word links to the next. In the daily puzzle the link is a compound word or phrase. In the classic version each new word must start with the last letter of the previous word.'],
  ['Is there a new word chain every day?', `Yes. A new daily chain unlocks at midnight in your own time zone. You can also play <a href="/unlimited/">unlimited word chains</a> any time.`],
  ['Is Word Chain free?', 'Yes. It is free, needs no account and no download, and works in any modern browser on phone, tablet or computer.'],
  ['What happens if I am stuck?', 'Use the hint button or make a guess: each wrong guess or hint reveals the next letter of that word. You lose a few points per letter but you can always finish the chain.'],
  ['Can I play word chain online with friends or a class?', `Yes. Share your result grid (it has no spoilers), or use the <a href="/word-chain-generator/">word chain generator</a> to make printable chains for a classroom or party.`],
  ['Are other answers accepted?', 'Yes. If your word makes a real link with both the word above and the word below it, it counts as correct even if it is not the word we had in mind.'],
];
add('/', layout({
  path: '/', title: 'Word Chain Game – Play Free Daily & Unlimited Word Chains',
  description: 'Play a free word chain game online. Link words into compound words and phrases, solve today’s chain, practise unlimited puzzles and see examples with answers.',
  h1: 'Word Chain Game', intro: 'Link each word to the next to make a compound word or phrase. One new chain every day — free, no sign-up.',
  mode: 'daily',
  schema: [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url + '/' },
    { '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: SITE.url, logo: SITE.url + '/icon-512.png' },
    gameSchema('Word Chain – Daily Word Chain Game', '/', 'Free daily word chain puzzle: fill in the missing words so each pair forms a compound word or phrase.'),
    faqSchema(homeFaqs),
  ],
  body: `
<section aria-labelledby="how"><h2 id="how">How to play the word chain game</h2>
<ol class="steps"><li><strong>Read the chain.</strong> The first and last words are given.</li>
<li><strong>Find the missing words.</strong> Each word must join the word above it and the word below it, e.g. <em>FIRE + WORK = FIREWORK</em>, <em>WORK + SHOP = WORKSHOP</em>.</li>
<li><strong>Use as few letters as you can.</strong> Each wrong guess or hint reveals one letter. A perfect chain scores 100.</li></ol>
<p>Example: <strong>SNOW → BALL → GAME → PLAN</strong> (snowball, ball game, game plan). <a href="/how-to-play/">Full rules and tips</a>.</p></section>
<section aria-labelledby="modes"><h2 id="modes">Three ways to play</h2>
<div class="cards">
<a class="card" href="/"><h3>Daily chain</h3><p>One shared puzzle a day. Keep your streak and share your score.</p></a>
<a class="card" href="/unlimited/"><h3>Unlimited</h3><p>Endless random chains for practice. No waiting for tomorrow.</p></a>
<a class="card" href="/classic/"><h3>Classic word chain</h3><p>The last-letter game: beat the computer before the timer runs out.</p></a>
</div></section>
<section aria-labelledby="ex"><h2 id="ex">Word chain game examples</h2>
<p>Try these, then open the answers. More in our <a href="/word-chain-examples/">word chain examples with answers</a>.</p>
${[11, 22, 33].map(s => chainHtml(generateChain(900000 + s))).join('')}
</section>
<section aria-labelledby="tips"><h2 id="tips">Tips for solving word chains</h2>
<ul><li>Work from both ends: the last word often narrows the options fastest.</li>
<li>Say the words out loud — compound words like <em>BACKYARD</em> or <em>SUNFLOWER</em> jump out when spoken.</li>
<li>Think of everyday objects (doorbell, keyboard, toothbrush) and common phrases (time off, game plan).</li>
<li>Short link words such as UP, OUT, DAY, LINE and HOUSE appear often.</li></ul></section>
${faqHtml(homeFaqs)}`,
}));

// UNLIMITED --------------------------------------------------------------
const unlimitedFaqs = [
  ['Is unlimited word chain really unlimited?', 'Yes. Press “New chain” as often as you like. Every chain is built from hundreds of real compound words and phrases.'],
  ['Does unlimited mode affect my daily streak?', 'No. Unlimited games have their own stats and never change your daily streak.'],
  ['Can I make chains longer or shorter?', 'Yes. Pick 5, 7 or 9 words: shorter chains are quicker, longer chains are harder.'],
];
add('/unlimited/', layout({
  path: '/unlimited/', title: 'Unlimited Word Chain – Play Endless Word Chain Puzzles Free',
  description: 'Play unlimited word chain puzzles online for free. Endless random chains of compound words and phrases, three lengths, no sign-up and no waiting.',
  h1: 'Unlimited Word Chain', intro: 'Endless practice chains. Choose a length and press “New chain” whenever you like.',
  mode: 'unlimited', crumbs: [{ name: 'Unlimited', p: '/unlimited/' }],
  schema: [gameSchema('Unlimited Word Chain', '/unlimited/', 'Endless random word chain puzzles.'), faqSchema(unlimitedFaqs)],
  body: `<section><h2>How unlimited mode works</h2><p>Unlimited uses the same rules as the <a href="/">daily word chain</a>: fill in the missing words so each neighbouring pair forms a compound word or common phrase. The difference is that you can play as many chains as you want and choose how long they are.</p></section>${faqHtml(unlimitedFaqs)}`,
}));

// CLASSIC ----------------------------------------------------------------
const classicFaqs = [
  ['What are the rules of the classic word chain game?', 'Players take turns saying a word that starts with the last letter of the previous word, for example APPLE → EGG → GOAT → TIGER. You cannot repeat a word, and you must answer before the time runs out.'],
  ['What words are allowed?', 'Any real English word of two or more letters from our dictionary (about 38,000 common words). Names, abbreviations and repeats are not allowed.'],
  ['How long do I have for each word?', 'You have 15 seconds per turn. Choose “Relaxed” for 30 seconds or “Fast” for 8 seconds.'],
  ['Is this the same as the Shiritori game?', 'It is the English version of the same idea. Shiritori is the Japanese last-syllable word game.'],
];
add('/classic/', layout({
  path: '/classic/', title: 'Classic Word Chain Game Online – Last Letter Word Game',
  description: 'Play the classic word chain game online: say a word that starts with the last letter of the last word. Beat the computer before the timer runs out. Free.',
  h1: 'Classic Word Chain Game', intro: 'Your word must start with the last letter of the computer’s word. No repeats. Beat the clock.',
  mode: 'classic', crumbs: [{ name: 'Classic', p: '/classic/' }],
  schema: [gameSchema('Classic Word Chain (Last Letter Game)', '/classic/', 'The last-letter word chain game against the computer.'), faqSchema(classicFaqs)],
  body: `<section><h2>Classic word chain rules</h2><ol class="steps"><li>The computer plays a word, e.g. <strong>APPLE</strong>.</li><li>You type a word starting with its last letter: <strong>E</strong> → <strong>EAGLE</strong>.</li><li>The computer answers with a word starting with <strong>E</strong>, and so on.</li><li>You lose if time runs out or you play an invalid or repeated word.</li></ol>
<h3>Classic word chain examples</h3><p>CAT → TABLE → EGG → GREEN → NIGHT → TRAIN → NEST<br>MOON → NOSE → EARTH → HAPPY → YELLOW → WATER → RIVER</p>
<p>Great for kids, ESL classes and car trips. Want compound-word chains instead? Play the <a href="/">daily word chain</a>.</p></section>${faqHtml(classicFaqs)}`,
}));

// GENERATOR --------------------------------------------------------------
const genFaqs = [
  ['What does the word chain generator do?', 'It makes random word chains where every pair of neighbouring words forms a compound word or common phrase. You can show or hide the middle words and print them.'],
  ['Can teachers use the generated chains?', 'Yes. They are free to use in classrooms, worksheets, quizzes and party games.'],
];
add('/word-chain-generator/', layout({
  path: '/word-chain-generator/', title: 'Word Chain Generator – Random Word Chains to Print or Play',
  description: 'Free word chain generator: make random compound-word chains for party games, classrooms and quizzes. Choose length, hide the middle words, copy or print.',
  h1: 'Word Chain Generator', intro: 'Make random word chains for games, quizzes and lessons. Hide the middle words to turn them into puzzles.',
  mode: 'generator', crumbs: [{ name: 'Generator', p: '/word-chain-generator/' }],
  schema: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Word Chain Generator', url: SITE.url + '/word-chain-generator/', applicationCategory: 'EducationalApplication', operatingSystem: 'Any', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }, faqSchema(genFaqs)],
  body: `<section><h2>How to use the generator</h2><p>Choose how many words each chain should have and how many chains you want, then press Generate. Tick “Hide middle words” to make a puzzle sheet, and use Print to get a clean copy with an answer key.</p></section>${faqHtml(genFaqs)}`,
}));

// EXAMPLES ---------------------------------------------------------------
const examples = Array.from({ length: 30 }, (_, i) => generateChain(500000 + i * 13, i < 10 ? 5 : i < 20 ? 6 : 7));
const exFaqs = [
  ['What is an example of a word chain?', 'SUN → FLOWER → POT → HOLE → PUNCH: sunflower, flowerpot, pothole, hole punch. Each pair makes a compound word.'],
  ['What is an example of the classic word chain game?', 'CAT → TIGER → RABBIT → TURTLE → EAGLE: each word starts with the last letter of the word before.'],
];
add('/word-chain-examples/', layout({
  path: '/word-chain-examples/', title: 'Word Chain Game Examples (With Answers) – 30+ Puzzles',
  description: 'Word chain game examples with answers: 30 compound-word chains from easy to hard, plus classic last-letter examples. Free to use for games and classrooms.',
  h1: 'Word Chain Game Examples (With Answers)', intro: 'Thirty ready-made word chains, easy to hard. Try each one, then open the answer.',
  crumbs: [{ name: 'Examples', p: '/word-chain-examples/' }], schema: [faqSchema(exFaqs)],
  body: `<section><h2>Easy word chains (5 words)</h2>${examples.slice(0, 10).map(c => chainHtml(c)).join('')}</section>
<section><h2>Medium word chains (6 words)</h2>${examples.slice(10, 20).map(c => chainHtml(c)).join('')}</section>
<section><h2>Hard word chains (7 words)</h2>${examples.slice(20).map(c => chainHtml(c)).join('')}</section>
<section><h2>Classic word chain examples (last letter)</h2><ul><li>CAT → TIGER → RABBIT → TURTLE → EAGLE → EMU</li><li>APPLE → EGG → GRAPE → ELEPHANT → TRAIN → NUT</li><li>RED → DOG → GREEN → NEST → TOY → YARN</li></ul></section>
<section><h2>Make your own</h2><p>Need more? Use the <a href="/word-chain-generator/">word chain generator</a> or play <a href="/unlimited/">unlimited word chains</a>.</p></section>${faqHtml(exFaqs)}`,
}));

// HOW TO PLAY ------------------------------------------------------------
add('/how-to-play/', layout({
  path: '/how-to-play/', title: 'How to Play the Word Chain Game – Rules, Scoring & Tips',
  description: 'Learn how to play the word chain game: the rules, how compound-word links work, scoring, hints and tips, plus the classic last-letter version.',
  h1: 'How to Play the Word Chain Game', crumbs: [{ name: 'How to play', p: '/how-to-play/' }],
  schema: [{ '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to play the word chain game', step: [
    { '@type': 'HowToStep', text: 'Read the first and last words of the chain.' },
    { '@type': 'HowToStep', text: 'Type a word that joins the word above it to make a compound word or phrase.' },
    { '@type': 'HowToStep', text: 'Check it also joins the word below it, then press Enter.' },
    { '@type': 'HowToStep', text: 'Repeat until every hidden word is found. Fewer revealed letters means a higher score.' }] }],
  body: `<section><h2>The rules</h2><p>A chain has 7 words (5, 7 or 9 in unlimited mode). The first and last words are shown. Every other word must form a compound word or a common two-word phrase with the word directly above it <em>and</em> the word directly below it.</p>
<p><strong>Example:</strong> BOOK → WORM → HOLE → PUNCH → LINE (bookworm, wormhole, hole punch, punchline).</p></section>
<section><h2>Choosing which word to solve</h2><p>You can solve any hidden word that touches a word you already know — start at the top, the bottom, or switch between them. Tap a row (or use the ↑ ↓ keys) to choose it.</p></section>
<section><h2>Scoring</h2><p>Each hidden word is worth 20 points. Every wrong guess or hint reveals one letter and costs 4 points for that word. Your result grid shows 🟩 (no letters revealed), 🟨 (1–2 letters) or 🟥 (3 or more).</p></section>
<section><h2>Alternative answers</h2><p>If your word makes a real link with both neighbours, it is accepted even if it is not the answer we planned.</p></section>
<section><h2>The classic word chain game</h2><p>In the traditional game, each word must start with the last letter of the previous word (APPLE → EGG → GOAT). Play it against the computer in <a href="/classic/">classic mode</a>.</p></section>
<section><h2>Tips</h2><ul><li>Work from whichever end gives you an easier clue.</li><li>Look for very common link words: UP, OUT, DAY, TIME, LINE, HOUSE, WORK, BALL.</li><li>Use a hint early rather than many wrong guesses — both cost the same.</li></ul></section>`,
}));

// ANSWERS ----------------------------------------------------------------
const firstAnswerN = Math.max(1, TODAY_N - SITE.answersBackfillDays + 1);
const answerDays = [];
for (let n = TODAY_N; n >= firstAnswerN; n--) answerDays.push(isoFromNumber(n));
for (const iso of answerDays) {
  const c = dailyFor(iso), n = puzzleNumber(iso), isToday = iso === TODAY;
  const prev = isoFromNumber(n - 1), next = isoFromNumber(n + 1);
  add(`/answers/${iso}/`, layout({
    path: `/answers/${iso}/`, ogType: 'article',
    title: `Word Chain #${n} Answer – ${shortDate(iso)}`,
    description: `Answer and hints for Word Chain #${n} (${shortDate(iso)}): starts with ${U(c[0])} and ends with ${U(c.at(-1))}. Get a hint first or reveal the full chain.`,
    h1: `Word Chain #${n} Answer (${shortDate(iso)})`,
    crumbs: [{ name: 'Answers', p: '/answers/' }, { name: `#${n}`, p: `/answers/${iso}/` }],
    body: `<p>${longDate(iso)} · Start: <strong>${U(c[0])}</strong> · End: <strong>${U(c.at(-1))}</strong> · ${c.length - 2} hidden words.</p>
${isToday ? `<p><a class="btn" href="/">Play today’s chain first</a></p>` : `<p><a class="btn" href="/?d=${iso}">Play this chain</a></p>`}
<section><h2>Hints (first letters)</h2><ol class="ex-chain">${c.map((w, i) => `<li>${i === 0 || i === c.length - 1 ? U(w) : U(w[0]) + ' ' + '_ '.repeat(w.length - 1).trim()}</li>`).join('')}</ol></section>
<section><h2>Full answer</h2><details class="ex-answer"><summary>Reveal the answer</summary><p>${c.map(U).join(' → ')}</p>
<ul>${c.slice(1).map((w, i) => `<li>${U(c[i])} + ${U(w)}</li>`).join('')}</ul></details></section>
<nav class="pager" aria-label="Other days">${n > firstAnswerN ? `<a href="/answers/${prev}/">← #${n - 1}</a>` : '<span></span>'}<a href="/answers/">All answers</a>${!isToday ? `<a href="/answers/${next}/">#${n + 1} →</a>` : '<span></span>'}</nav>`,
  }));
}
add('/answers/', layout({
  path: '/answers/', title: 'Word Chain Answers Today + Past Answers Archive',
  description: `Today’s Word Chain answer (#${TODAY_N}) with hints, plus every past daily word chain answer. Hints first, spoilers hidden until you tap.`,
  h1: 'Word Chain Answers', intro: 'Hints first, full answers hidden until you tap. Newest first.',
  crumbs: [{ name: 'Answers', p: '/answers/' }],
  body: `<ul class="archive">${answerDays.map(iso => `<li><a href="/answers/${iso}/">Word Chain #${puzzleNumber(iso)} – ${shortDate(iso)}</a>${iso === TODAY ? ' <span class="tag">Today</span>' : ''}</li>`).join('')}</ul>`,
}));

// ABOUT / PRIVACY / 404 ----------------------------------------------------
add('/about/', layout({ path: '/about/', title: `About ${SITE.name}`, description: `${SITE.name} is a free, ad-light word chain game you can play in any browser.`, h1: `About ${SITE.name}`, crumbs: [{ name: 'About', p: '/about/' }],
  body: `<p>${SITE.name} is an independent, free word game. Every chain is checked so that each pair of words makes a real compound word or everyday phrase. Spotted a bad link? Email <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a> and we will fix it.</p>` }));
add('/privacy/', layout({ path: '/privacy/', title: 'Privacy Policy', description: `How ${SITE.name} handles data: no accounts, no cookies for tracking, progress saved only on your device.`, h1: 'Privacy Policy', crumbs: [{ name: 'Privacy', p: '/privacy/' }],
  body: `<p>We do not ask for an account or personal details. Your scores, streak and settings are saved only in your own browser (localStorage) and never sent to us. ${SITE.analyticsScript ? 'We use privacy-friendly, cookie-free analytics that count visits without identifying you.' : 'We do not use analytics cookies.'} Questions: <a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>.</p>` }));
add('/404.html', layout({ path: '/404.html', title: 'Page not found', description: 'This page does not exist.', h1: 'Broken chain!', robots: 'noindex', body: `<p>That page is missing. <a href="/">Play today’s word chain</a> instead.</p>` }));

// ---------------------------------------------------------------- write
await rm(DIST, { recursive: true, force: true });
await cp(path.join(ROOT, 'site'), DIST, { recursive: true });
for (const [p, html] of pages) {
  const file = p.endsWith('.html') ? path.join(DIST, p) : path.join(DIST, p, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}
await mkdir(path.join(DIST, 'data'), { recursive: true });
await writeFile(path.join(DIST, 'data', 'daily.json'), JSON.stringify(POOL));
await writeFile(path.join(DIST, 'data', 'dict.json'), JSON.stringify(buildDictionary()));

const sitemapUrls = pages.filter(([p]) => !p.endsWith('.html')).map(([p]) => {
  const pri = p === '/' ? '1.0' : p.startsWith('/answers/2') ? '0.5' : '0.8';
  return `<url><loc>${SITE.url}${p}</loc><lastmod>${TODAY}</lastmod><priority>${pri}</priority></url>`;
});
await writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`);
await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
await writeFile(path.join(DIST, 'site.webmanifest'), JSON.stringify({ name: SITE.name, short_name: SITE.shortName, start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: SITE.themeColor, icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }));
console.log(`Built ${pages.length} pages, ${POOL.length} daily chains, today = #${TODAY_N} (${TODAY}) → dist/`);
if (!existsSync(path.join(DIST, 'og-image.png'))) console.warn('⚠ Add site/og-image.png (1200×630), site/icon-192.png, site/icon-512.png, site/apple-touch-icon.png before launch.');
