// scripts/config.mjs — edit these before the first deploy.
export const SITE = {
  url: 'https://wordchaingame.fun',        // ← your final domain, https, no trailing slash
  name: 'Word Chain Game',               // brand shown in titles and header
  shortName: 'Word Chain',
  tagline: 'Free daily word chain game',
  locale: 'en_US',
  themeColor: '#5b3df5',
  twitter: '',                            // optional, e.g. '@wordchaindaily'
  contactEmail: 'hello@wordchaingame.fun',
  // Cookieless analytics. Leave '' to disable. Example for Plausible:
  // analyticsScript: '<script defer data-domain="example.com" src="https://plausible.io/js/script.js"></script>'
  analyticsScript: '',
  // How many past days of answer pages to publish (older ones stay live, this only caps the first build)
  answersBackfillDays: 60,
};
