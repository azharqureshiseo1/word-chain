// scripts/config.mjs — edit these before the first deploy.
export const SITE = {
  url: 'https://wordchaingame.fun',       // ← your final domain, https, no trailing slash
  name: 'Word Chain Game',                // brand shown in titles and header
  shortName: 'Word Chain',
  tagline: 'Free daily word chain game',
  locale: 'en_US',
  themeColor: '#5b3df5',
  twitter: '',                            // optional, e.g. '@wordchaindaily'
  contactEmail: 'hello@wordchaingame.fun', // ← a real inbox you check (shown on Contact + all policy pages)
  // No personal names are shown anywhere on the site. The site speaks as "the ${name} team".
  governingLaw: 'the State of Delaware, United States', // US law used in the Terms (change the state if you prefer)
  launchYear: 2026,
  policyUpdated: '2026-11-22',            // change whenever you edit a policy page
  responseTime: '2 business days',
  // Cookieless analytics. Leave '' to disable. Example for Plausible:
  // analyticsScript: '<script defer data-domain="example.com" src="https://plausible.io/js/script.js"></script>'
  analyticsScript: '',
  // Google Tag Manager container ID. GA4 is set up INSIDE the GTM container (a "Google tag" with your G- ID).
  gtmId: 'GTM-TGLK5K7L',
  // How many past days of answer pages to publish (older ones stay live, this only caps the first build)
  answersBackfillDays: 60,
};
