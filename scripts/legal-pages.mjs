// scripts/legal-pages.mjs — About, Contact and all policy pages (Privacy, Cookies, Terms, Disclaimer).
// Each page is plain data; build.mjs wraps it in the site layout. Facts here must match how the site
// actually works: no accounts, progress in localStorage, Google Tag Manager + Google Analytics 4.
import { SITE } from './config.mjs';

const mail = `<a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>`;
const updated = new Date(SITE.policyUpdated + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const stamp = `<p class="small">Last updated: ${updated}</p>`;
const team = `the ${SITE.name} team`;
const ga = Boolean(SITE.gtmId);
const sec = (h, body) => `<section><h2>${h}</h2>${body}</section>`;

// one table used by both the Privacy and Cookie pages
const storageTable = `<div class="table-wrap"><table>
<thead><tr><th>Name</th><th>Type</th><th>Set by</th><th>Purpose</th><th>Expires</th></tr></thead>
<tbody>
<tr><td><code>wc-daily-YYYY-MM-DD</code></td><td>Local storage</td><td>${SITE.name}</td><td>Saves your progress on that day's chain</td><td>Until you clear it</td></tr>
<tr><td><code>wc-stats</code></td><td>Local storage</td><td>${SITE.name}</td><td>Games played, average score, streak</td><td>Until you clear it</td></tr>
<tr><td><code>wc-unl</code>, <code>wc-classic-best</code></td><td>Local storage</td><td>${SITE.name}</td><td>Unlimited stats and Classic best score</td><td>Until you clear it</td></tr>
<tr><td><code>wc-settings</code>, <code>wc-theme</code></td><td>Local storage</td><td>${SITE.name}</td><td>Sound on/off and light/dark mode</td><td>Until you clear it</td></tr>
${ga ? `<tr><td><code>_ga</code></td><td>Cookie (analytics)</td><td>Google Analytics</td><td>Tells visits apart so we can count unique visitors</td><td>2 years</td></tr>
<tr><td><code>_ga_&lt;ID&gt;</code></td><td>Cookie (analytics)</td><td>Google Analytics</td><td>Keeps the state of the current visit (session)</td><td>2 years</td></tr>` : ''}
</tbody></table></div>
<p class="small">Local storage stays in your browser and is never sent to us. ${ga ? 'Google Tag Manager itself does not set cookies; it only loads the Google Analytics tag.' : ''}</p>`;

export const legalPages = [
  // ------------------------------------------------------------------ ABOUT
  {
    path: '/about/', crumb: 'About',
    title: `About ${SITE.name} – Who Makes This Free Word Chain Game`,
    description: `${SITE.name} is a free, independent word chain game. Learn who makes it, how every chain is built and checked, and what we promise players.`,
    h1: `About ${SITE.name}`,
    schema: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: `About ${SITE.name}`, url: SITE.url + '/about/',
      mainEntity: { '@type': 'Organization', name: SITE.name, url: SITE.url, email: SITE.contactEmail, foundingDate: String(SITE.launchYear) } }],
    body: `
${sec('What this site is', `<p>${SITE.name} is a free word game you can play in any web browser. You link words together so that every neighbouring pair makes a compound word or an everyday phrase, for example <strong>SUN → FLOWER → POT</strong> (sunflower, flowerpot). There is a new shared chain every day, unlimited practice chains, the classic “last letter” word chain game, and a generator teachers can use to print puzzles.</p>
<p>No account, no download and no payment are needed. Your scores and streaks are saved only in your own browser.</p>`)}
${sec('Who makes it', `<p>${SITE.name} was launched in ${SITE.launchYear} by a small, independent team of word-game fans. We are not owned by a game studio, publisher or TV network, and the site is supported by its players.</p>
<p>We built it because we love daily word puzzles but wanted one you can practise without waiting a day, that teachers can use in class, and that explains the game properly with real examples.</p>`)}
${sec('How every chain is made and checked', `<ol>
<li><strong>A hand-built word list.</strong> Every link (for example FIRE + WORK = FIREWORK) comes from a list we write and review by hand. We only use compound words and phrases an average English speaker knows. We leave out brand names, slang, offensive terms and very regional words.</li>
<li><strong>Chains are built from that list.</strong> A program walks through the list to make each chain, so every neighbouring pair is a link we have already approved.</li>
<li><strong>Daily chains are scheduled in advance</strong> so that the same chain is never repeated within the schedule and the same middle word does not keep coming back.</li>
<li><strong>Fair answers.</strong> If you type a different word that still makes a real link with the words above and below it, the game accepts it.</li>
<li><strong>You can report mistakes.</strong> If a link looks wrong, <a href="/contact/">tell us</a> and we will fix it.</li></ol>`)}
${sec('Ways to play', `<ul>
<li><a href="/">Daily Word Chain</a>: one chain a day for everyone, with streaks and a spoiler-free share grid.</li>
<li><a href="/unlimited/">Unlimited Word Chain</a>: endless chains of 5, 7 or 9 words.</li>
<li><a href="/classic/">Classic Word Chain</a>: each word starts with the last letter of the previous one, against a timer.</li>
<li><a href="/word-chain-generator/">Word Chain Generator</a>: printable chains with an answer key for classrooms and parties.</li>
<li><a href="/word-chain-examples/">Word chain examples with answers</a> and a <a href="/how-to-play/">full how-to-play guide</a>.</li></ul>`)}
${sec('Our promises to players', `<ul>
<li><strong>Free to play</strong>, with no sign-up and no paywall.</li>
<li><strong>Your progress stays with you:</strong> it is stored in your browser, not on our servers. See our <a href="/privacy-policy/">Privacy Policy</a>.</li>
<li><strong>Accessible:</strong> you can play fully by keyboard, it works with screen readers, it has a dark mode and it respects “reduce motion” settings.</li>
<li><strong>Family friendly:</strong> no offensive words in the puzzles.</li></ul>`)}
${sec('Credits', `<p>The dictionary used in Classic mode is based on SCOWL (Spell Checker Oriented Word Lists), Copyright 2000–2016 Kevin Atkinson, used under its permissive licence. The compound-word chains were written for this site.</p>
<p>${SITE.name} is not affiliated with, endorsed by or connected to any television show, newspaper, publisher or other word game. Names of other games or shows belong to their owners.</p>`)}
${sec('Get in touch', `<p>Questions, ideas, a bad link, or a school that wants to use the game? Email ${mail} or use our <a href="/contact/">contact page</a>. We usually reply within ${SITE.responseTime}.</p>`)}`,
  },

  // ---------------------------------------------------------------- CONTACT
  {
    path: '/contact/', crumb: 'Contact',
    title: `Contact ${SITE.name} – Report a Puzzle, Feedback & Enquiries`,
    description: `Contact the ${SITE.name} team: report a wrong word link, send feedback or ideas, ask about classroom use, or make a business or privacy request.`,
    h1: 'Contact Us',
    schema: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: `Contact ${SITE.name}`, url: SITE.url + '/contact/',
      mainEntity: { '@type': 'Organization', name: SITE.name, url: SITE.url, contactPoint: { '@type': 'ContactPoint', email: SITE.contactEmail, contactType: 'customer support', availableLanguage: ['English'] } } }],
    body: `
${sec('The quickest way to reach us', `<p>Email: <strong>${mail}</strong></p><p>We read every message and usually reply within <strong>${SITE.responseTime}</strong>. We are a small team, so please send each request once.</p>`)}
${sec('Send us a message', `<p>Fill in the form below. It opens your own email app with the message ready to send (we do not store anything you type here).</p>
<form class="contact-form" id="contact-form">
<label>Your name<input type="text" name="name" autocomplete="name" required></label>
<label>Reason
<select name="topic">
<option>Report a wrong word or link</option>
<option>Bug or problem with the game</option>
<option>Feedback or an idea</option>
<option>Classroom or school use</option>
<option>Business or partnership</option>
<option>Privacy or data request</option>
<option>Something else</option>
</select></label>
<label>Puzzle number or page (optional)<input type="text" name="ref" placeholder="e.g. Word Chain #326 or /classic/"></label>
<label>Message<textarea name="message" rows="6" required></textarea></label>
<button class="primary" type="submit">Open email to send</button>
</form>
<script>
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var f = e.target, subject = '[${SITE.shortName}] ' + f.topic.value + (f.ref.value ? ' – ' + f.ref.value : '');
  var body = f.message.value + '\\n\\n— ' + f.name.value;
  location.href = 'mailto:${SITE.contactEmail}?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});
</script>`)}
${sec('Reporting a wrong link or answer', `<p>Please tell us:</p><ul><li>the <strong>puzzle number</strong> (for example #326) or the mode (Unlimited, Classic, Generator);</li><li>the <strong>two words</strong> that don't link correctly;</li><li>what you think is wrong. For example, the pair is not a real compound word, it is spelled differently where you live, or it is not suitable for children.</li></ul><p>When we fix a link it is changed for future chains. We do not change past daily chains, so everyone's results stay comparable.</p>`)}
${sec('Bugs and technical problems', `<p>Tell us your device (for example iPhone 14, Windows laptop), your browser (Chrome, Safari, Firefox…) and what happened. A screenshot helps. A quick fix you can try first: reload the page, and if your progress looks wrong, clear this site's data in your browser settings.</p>`)}
${sec('Teachers and schools', `<p>You are welcome to use the game, the <a href="/word-chain-generator/">generator</a> and the <a href="/word-chain-examples/">examples</a> in class for free. You don't need to ask permission, but we love to hear how you use it.</p>`)}
${sec('Privacy requests', `<p>We hold almost no personal data. Game progress stays in your browser. To ask about, get a copy of, or delete any personal data we may hold (for example emails you sent us), email ${mail} with the subject “Privacy request”. See our <a href="/privacy-policy/">Privacy Policy</a> for your rights.</p>`)}
${sec('About the team', `<p>${SITE.name} is run by a small independent team. We do not have a public office, so please use email for all enquiries, including privacy and copyright requests.</p>`)}`,
  },

  // --------------------------------------------------------- PRIVACY POLICY
  {
    path: '/privacy-policy/', crumb: 'Privacy Policy',
    title: `Privacy Policy – ${SITE.name}`,
    description: `How ${SITE.name} handles your data: no accounts, game progress saved only in your browser, ${ga ? 'Google Analytics via Google Tag Manager, ' : ''}your rights and how to contact us.`,
    h1: 'Privacy Policy',
    body: `${stamp}
${sec('Summary', `<ul>
<li>You don't need an account, and we never ask for your name, email or payment details to play.</li>
<li>Your scores, streaks and settings are saved <strong>only in your own browser</strong> (local storage). They are not sent to us.</li>
${ga ? '<li>We use <strong>Google Analytics 4</strong>, loaded through <strong>Google Tag Manager</strong>, to count visits and see which features are used. Google Analytics uses cookies.</li>' : '<li>We do not use analytics cookies.</li>'}
<li>We do not sell your personal information and we do not show personalised ads.</li>
<li>Questions or requests: ${mail}.</li></ul>`)}
${sec('1. Who we are', `<p>This website, ${SITE.url} (“${SITE.name}”, “we”, “us”), is operated by ${team} (“we”, “us”). We are responsible for the personal information described in this policy. Contact: ${mail}.</p><p>This policy is written for users in the United States and is designed to meet US federal and state privacy laws, including the California Consumer Privacy Act as amended by the CPRA (CCPA), the California Online Privacy Protection Act (CalOPPA), the Children's Online Privacy Protection Act (COPPA), and the consumer privacy laws of other US states such as Virginia, Colorado, Connecticut, Utah and Texas.</p>`)}
${sec('2. Information we collect', `<h3>a) Information stored only on your device</h3><p>To remember your game progress, stats and settings, the game saves small pieces of data in your browser's local storage (see the table in section 6). This data stays on your device. We cannot see it, and you can delete it at any time by clearing this site's data in your browser.</p>
${ga ? `<h3>b) Analytics information (Google Analytics)</h3><p>When you visit, Google Analytics collects information such as: pages viewed, how long you stay, the website that referred you, your approximate location (country/city, worked out from your IP address), device type, browser, operating system, screen size and language. It also collects game events we send: for example when you finish a chain (with your score and the game mode), use a hint, share a result, finish a Classic game or use the generator. These events contain <strong>no</strong> names, emails or typed words. Google Analytics 4 does not log or store full IP addresses. It sets cookies (<code>_ga</code>, <code>_ga_&lt;ID&gt;</code>) with a random identifier to tell visits apart.</p>` : ''}
<h3>${ga ? 'c' : 'b'}) Information you send us</h3><p>If you email us, we receive your email address, name (if you give it) and whatever you write. We use it only to reply and to fix any problem you report.</p>
<h3>${ga ? 'd' : 'c'}) Server logs</h3><p>Like every website, our hosting provider automatically records technical data when pages are requested (IP address, date and time, page requested, browser). These logs are used for security and to keep the site working, and are deleted on the provider's normal schedule.</p>`)}
${sec('3. How we use information', `<ul>
<li><strong>To run the game and remember your progress</strong> on your device.</li>
${ga ? '<li><strong>To measure and improve the site</strong>: which modes people use, where players get stuck, which pages are useful.</li>' : ''}
<li><strong>To answer your messages</strong> and fix problems you report.</li>
<li><strong>To keep the site secure</strong>, prevent abuse and comply with the law.</li></ul><p>We do not use your information for targeted advertising, profiling or automated decisions that have legal or similarly significant effects on you.</p>`)}
${sec('3a. Categories of personal information (CCPA notice at collection)', `<p>In the last 12 months we have collected these categories of personal information, as defined by the CCPA:</p><ul>
${ga ? '<li><strong>Identifiers:</strong> online identifiers such as the random Google Analytics cookie ID; IP address (seen by Google and our host, not stored in full by Google Analytics).</li><li><strong>Internet or other electronic network activity:</strong> pages viewed, game events, referring site, browser and device information.</li><li><strong>Geolocation data:</strong> approximate location (country, region, city) derived from IP address. We do not collect precise geolocation.</li>' : '<li><strong>Identifiers:</strong> IP address in our host\'s server logs.</li>'}
<li><strong>Identifiers you give us:</strong> your email address and name, only if you email us.</li></ul>
<p>Sources: you, your browser and device${ga ? ', and Google Analytics' : ''}. Purposes: those listed in section 3. We do <strong>not</strong> collect sensitive personal information, and we do <strong>not</strong> sell or share (for cross-context behavioural advertising) any personal information. We have not done so in the past 12 months.</p>`)}
${sec('4. Sharing your information', `<p>We do not sell or rent personal information. We share data only with service providers who help us run the site:</p><ul>
${ga ? '<li><strong>Google LLC / Google Ireland Ltd</strong>: Google Tag Manager and Google Analytics. See <a href="https://policies.google.com/privacy" rel="noopener">Google\'s Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>. We have not enabled Google Signals or advertising features in Analytics.</li>' : ''}
<li><strong>Our web hosting provider</strong>: stores the website files and server logs.</li>
<li><strong>Authorities</strong>: only if the law requires it.</li></ul>`)}
${sec('5. Where data is processed', `<p>The site is intended for users in the United States, and our service providers (including Google) process data mainly in the United States. If you visit from outside the US, your information will be transferred to and processed in the US.</p>`)}
${sec('6. Cookies and local storage', `<p>Here is everything this site stores on your device:</p>${storageTable}<p>More details and how to control them are in our <a href="/cookie-policy/">Cookie Policy</a>.</p>`)}
${sec('7. How long we keep data', `<ul><li>Local storage: until you clear it. It never reaches us.</li>${ga ? '<li>Google Analytics: user-level data is kept for 14 months, then deleted automatically. Aggregated reports (with no individual data) may be kept longer.</li>' : ''}<li>Emails: up to 24 months after the conversation ends, unless we need them longer to resolve an issue.</li></ul>`)}
${sec('8. Your choices and rights', `<ul>
${ga ? '<li><strong>Block analytics:</strong> block cookies in your browser settings, use a privacy browser or extension, or install the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics Opt-out Browser Add-on</a>. The game works fully without analytics.</li>' : ''}
<li><strong>Delete your game data:</strong> clear this site's data in your browser settings.</li></ul>
<h3>California residents (CCPA/CPRA)</h3><p>You have the right to: (1) <strong>know</strong> what personal information we collect, use and disclose; (2) <strong>delete</strong> personal information we hold about you; (3) <strong>correct</strong> inaccurate information; (4) <strong>opt out of the sale or sharing</strong> of personal information. We do not sell or share it, so there is nothing to opt out of, but you may still send a request; (5) <strong>limit the use of sensitive personal information</strong>. We do not collect any; and (6) <strong>not be discriminated against</strong> for using these rights. You may use an authorised agent to make a request on your behalf.</p>
<h3>Residents of other US states</h3><p>If you live in Virginia, Colorado, Connecticut, Utah, Texas, Oregon or another state with a consumer privacy law, you have similar rights to access, correct, delete and get a copy of your personal data, and to opt out of targeted advertising, sale and profiling (which we do not do). If we deny your request, you may appeal by replying to our decision email with the subject “Privacy appeal”. If the appeal is denied, you may contact your state Attorney General.</p>
<h3>How to make a request</h3><p>Email ${mail} with the subject “Privacy request”. We will confirm receipt within 10 business days, may ask a simple question to verify your request, and will respond within 45 days (extendable once by 45 days where the law allows).</p>
<h3>Do Not Track and Global Privacy Control</h3><p>If your browser sends a <strong>Global Privacy Control (GPC)</strong> or <strong>Do Not Track (DNT)</strong> signal, our site does <strong>not</strong> load Google Tag Manager or Google Analytics for you, and we treat the signal as a request to opt out of any sale or sharing of your information.</p>
<h3>Visitors outside the United States</h3><p>If you are in another country (for example the UK or EU) you may have additional rights under your local law. Email us and we will help.</p>`)}
${sec('9. Children', `<p>${SITE.name} is a general-audience word game. It is not directed at children under 13, and in line with the Children's Online Privacy Protection Act (COPPA) we do not knowingly collect personal information from children under 13. Teachers who use the game in class can use the <a href="/word-chain-generator/">generator</a>, which does not need anything to be typed or stored. If you are a parent or guardian and believe your child under 13 has sent us personal information, email ${mail} and we will delete it promptly.</p>`)}
${sec('10. Security', `<p>The site is served only over HTTPS. We collect very little data, and there are no accounts or passwords that could leak. No method of transmission or storage is 100% secure, but we take reasonable steps to protect what we hold.</p>`)}
${sec('11. Advertising', `<p>We do not currently show adverts. If we add advertising (for example Google AdSense) in future, we will update this policy before it goes live. It will explain the advertising cookies used and how to opt out, and how to opt out, including through the GPC signal.</p>`)}
${sec('12. Changes to this policy', `<p>If we change this policy, we will update the “Last updated” date at the top. Please check this page from time to time.</p>`)}
${sec('13. Contact', `<p>${SITE.name} team · ${mail}</p>`)}`,
  },

  // ---------------------------------------------------------- COOKIE POLICY
  {
    path: '/cookie-policy/', crumb: 'Cookie Policy',
    title: `Cookie Policy – ${SITE.name}`,
    description: `The cookies and local storage ${SITE.name} uses, why we use them, how long they last, and how to block or delete them.`,
    h1: 'Cookie Policy',
    body: `${stamp}
${sec('What are cookies and local storage?', `<p>Cookies are small text files a website saves in your browser. Local storage is a similar browser feature that lets a website save data on your device. Unlike cookies, it is never sent automatically to a server.</p>`)}
${sec('What we use', `${storageTable}
<ul><li><strong>Strictly necessary / functional (local storage):</strong> these remember your progress, stats and settings. Without them, the game would forget your progress every time you reload.</li>
${ga ? '<li><strong>Analytics (Google Analytics cookies):</strong> these help us understand how many people play and which features they use, so we can improve the game. They do not identify you by name.</li>' : ''}
<li><strong>Advertising cookies:</strong> we do not use any.</li></ul>`)}
${sec('How to control cookies', `<ul>
<li><strong>Browser settings:</strong> every browser lets you block or delete cookies and site data. Look under Settings → Privacy (Chrome, Edge, Firefox) or Settings → Safari → Advanced → Website Data (iPhone/iPad).</li>
${ga ? '<li><strong>Google Analytics opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics Opt-out Browser Add-on</a>.</li>' : ''}
<li>Blocking analytics cookies does not affect the game. Clearing local storage resets your streak and stats.</li></ul>`)}
${sec('Changes and contact', `<p>We will update this page if the cookies we use change. Questions: ${mail}. See also our <a href="/privacy-policy/">Privacy Policy</a>.</p>`)}`,
  },

  // ------------------------------------------------------------------ TERMS
  {
    path: '/terms/', crumb: 'Terms & Conditions',
    title: `Terms and Conditions – ${SITE.name}`,
    description: `The terms for using ${SITE.name}: free personal and classroom use, acceptable use, intellectual property, disclaimers, liability and governing law.`,
    h1: 'Terms and Conditions',
    body: `${stamp}
${sec('1. Agreement', `<p>These terms apply to your use of ${SITE.url} and all of its games, tools and pages (the “Site”), operated by ${team} (“we”, “us”). By using the Site you agree to these terms and to our <a href="/privacy-policy/">Privacy Policy</a>. If you do not agree, please do not use the Site.</p>`)}
${sec('2. Using the Site', `<ul><li>The Site is free. You may play the games and use the tools for personal, non-commercial and classroom purposes.</li>
<li>You may print chains from the <a href="/word-chain-generator/">generator</a> and the <a href="/word-chain-examples/">examples page</a> for teaching, family or party use. Please don't sell them.</li>
<li>You may share your results and link to any page.</li></ul>`)}
${sec('3. Things you must not do', `<ul><li>Copy, scrape or republish our puzzle lists, daily schedule, answers pages or site design in bulk, or use them to build a competing product or train AI models, without our written permission.</li>
<li>Interfere with the Site's security or performance, for example with excessive automated requests, attacks, or attempts to access parts of the Site not meant to be public.</li>
<li>Frame the Site or present it as your own, or use our name or logo in a way that suggests we endorse you.</li>
<li>Use the Site for anything unlawful.</li></ul>`)}
${sec('4. Intellectual property', `<p>The Site's design, code, text, compound-word chains, puzzle schedule, logo and the name “${SITE.name}” belong to us or our licensors and are protected by copyright and other laws. The Classic mode dictionary is based on SCOWL, Copyright 2000–2016 Kevin Atkinson, used under its licence. Individual everyday words and phrases are of course free for anyone to use. Our protection covers our selection, arrangement and presentation of them.</p>`)}
${sec('5. Your messages and feedback', `<p>If you send us ideas, puzzle suggestions or corrections, you allow us to use them to improve the Site, free of charge and without any obligation to you.</p>`)}
${sec('6. Availability and changes', `<p>We aim to keep the Site available, but we do not guarantee it will always be online, error-free or that your locally saved progress will never be lost (for example if your browser clears its data). We may change, pause or remove any feature, and update these terms, at any time. The “Last updated” date shows the latest version.</p>`)}
${sec('7. Third-party links and services', `<p>The Site may link to other websites and uses third-party services such as ${ga ? 'Google Tag Manager and Google Analytics' : 'our hosting provider'}. We are not responsible for third-party sites or services, and their own terms apply.</p>`)}
${sec('8. Disclaimer of warranties', `<p>The Site is provided “as is” and “as available”, for entertainment and general educational purposes. To the fullest extent the law allows, we make no warranties of any kind, express or implied, including fitness for a particular purpose. See also our <a href="/disclaimer/">Disclaimer</a>.</p>`)}
${sec('9. Limitation of liability', `<p>To the fullest extent the law allows, we are not liable for any indirect, incidental or consequential loss, or for loss of data, progress, streaks or scores, arising from your use of the Site. Our total liability for any claim is limited to USD 50. Some US states do not allow the exclusion of certain warranties or the limitation of certain damages, so some of the above may not apply to you.</p>`)}
${sec('10. Governing law and disputes', `<p>These terms are governed by the laws of ${SITE.governingLaw}, and applicable US federal law, without regard to conflict-of-law rules. Any dispute that cannot be resolved informally by first emailing us at ${mail} shall be brought exclusively in the state or federal courts located in ${SITE.governingLaw}, and you consent to their jurisdiction. Nothing in these terms takes away rights you have under the consumer protection laws of your US state that cannot be waived.</p>`)}
${sec('11. Copyright complaints (DMCA)', `<p>We respect intellectual property rights. If you believe material on the Site infringes your copyright, send a notice under the Digital Millennium Copyright Act (17 U.S.C. § 512) to ${mail} including: your contact details; a description of the copyrighted work; the URL of the material; a statement that you have a good-faith belief the use is not authorised; a statement, under penalty of perjury, that your notice is accurate and that you are the owner or authorised to act for the owner; and your physical or electronic signature. We will remove infringing material promptly.</p>`)}
${sec('12. Contact', `<p>Questions about these terms: ${mail}.</p>`)}`,
  },

  // ------------------------------------------------------------- DISCLAIMER
  {
    path: '/disclaimer/', crumb: 'Disclaimer',
    title: `Disclaimer – ${SITE.name}`,
    description: `${SITE.name} disclaimer: entertainment and educational use, accuracy of puzzles and answers, no affiliation with other games or shows, and external links.`,
    h1: 'Disclaimer',
    body: `${stamp}
${sec('Entertainment and general education only', `<p>${SITE.name} is a word game made for fun and general learning. Puzzles, answers, examples and articles are not professional, educational-assessment or language-certification advice.</p>`)}
${sec('Accuracy of puzzles and answers', `<p>We review every word link by hand, but English varies by country and over time, and mistakes can happen. Some compound words are written as one word, with a hyphen, or as two words depending on the dictionary. We accept these as the same link. If you spot an error, please <a href="/contact/">tell us</a>. We are not responsible for any loss of scores, streaks or bets that come from a puzzle error.</p>`)}
${sec('No affiliation', `<p>${SITE.name} is an independent website. It is not affiliated with, endorsed by or sponsored by any television programme, game show, newspaper, publisher, app or other word game, including any with “chain” in its name. All trademarks belong to their owners and are mentioned only to describe or compare.</p>`)}
${sec('Answers pages', `<p>Our answers pages cover <strong>${SITE.name}'s own</strong> daily chains only. They are not answers for puzzles published by other websites or apps.</p>`)}
${sec('External links', `<p>Links to other websites are provided for convenience. We do not control those sites and are not responsible for their content, availability or privacy practices.</p>`)}
${sec('Advertising and affiliate links', `<p>The Site does not currently contain adverts or affiliate links. If we add them, we will label them clearly and update this page.</p>`)}
${sec('Contact', `<p>${mail}</p>`)}`,
  },
];
