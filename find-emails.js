// import axios from 'axios';
// import { load as cheerioLoad } from 'cheerio';
// import pLimit from 'p-limit';

// const USER_AGENT = 'EmailFinderBot/1.0 (+https://codegrin.com)';
// const REQUEST_TIMEOUT = 15000;
// const CONCURRENCY = 3;
// const DELAY_MS = 500;

// const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// async function fetchUrl(url) {
//   try {
//     const res = await axios.get(url, {
//       timeout: REQUEST_TIMEOUT,
//       headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
//       maxRedirects: 5,
//     });
//     return { html: res.data, finalUrl: res.request?.res?.responseUrl || url, status: res.status };
//   } catch (err) {
//     return { error: err.message };
//   }
// }

// function extractEmailsFromText(text) {
//   if (!text) return [];
//   const matches = text.match(EMAIL_REGEX);
//   if (!matches) return [];
//   return [...new Set(matches.map(m => m.trim().toLowerCase()))];
// }

// function findCandidateContactLinks($, baseUrl) {
//   const links = new Set();
//   $('a[href]').each((i, el) => {
//     const hrefRaw = $(el).attr('href');
//     if (!hrefRaw) return;
//     const href = hrefRaw.trim();
//     const lower = href.toLowerCase();
//     if (lower.startsWith('mailto:')) {
//       links.add(href);
//       return;
//     }
//     if (lower.includes('contact') || lower.includes('about') || lower.includes('team') || lower.includes('support') || lower.includes('careers')) {
//       try {
//         const resolved = new URL(href, baseUrl).href;
//         links.add(resolved);
//       } catch {}
//     }
//   });
//   return Array.from(links);
// }

// async function probeCommonPaths(baseUrl) {
//   const tryPaths = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/contactus'];
//  const urls = [
//   'bluestripes.com',
//   'ecomid.com',
//   'mattoespresso.com',
//   'hopehydration.com',
//   'rebind.com',
//   'thumbtack.com',
//   'elementum.com',
//   'simplea.com',
//   'dataprise.com',
//   'tmnas.com',
//   'itconvergence.com',
//   'appliedpredictive.com',
//   'autoleap.com',
//   'lumindigital.com',
//   'vanta.com',
//   'geckorobotics.com',
//   'chainguard.dev',
//   'qventus.com',
//   'current.com',
//   'researchgate.net',
//   'infineon.com',
//   'aboutyou.de',
//   'appollo-systems.de',
//   'boldare.com',
//   'kevych-solutions.com',
//   'colobridge.com',
//   'palark.com',
//   'itcraft.de',
//   'makersden.io',
//   'altar.io',
//   'digis.com',
//   'firstlinesoftware.com',
//   'voypost.com',
//   'elinext.com',
//   'youarelaunched.com',
//   'aleph-engineering.de',
//   'sts-software.de',
//   'pwrteams.com',
//   'innowise-group.com',
//   'dbbsoftware.de',
//   'simform.com',
//   'coherent-solutions.de',
//   'fulcrum.rocks',
//   'alliancetek.de',
//   'plavno.io',
//   'appx.de',
//   'exlrt.com',
//   'benchling.com',
//   'grammarly.com',
//   'ashbyhq.com',
//   'tulip.co',
//   'industriousoffice.com',
//   'lilt.com',
//   'aircall.io',
//   'amplitude.com',
//   'rapid7.com',
//   'here.com',
//   'celonis.com',
//   'imprivala.com',
//   'magna.com',
//   'hibob.com',
//   'altium.com',
//   'blackline.com',
// ];

//   try {
//     const u = new URL(baseUrl);
//     const origin = u.origin;
//     for (const p of tryPaths) urls.push(origin + p);
//   } catch {}
//   return urls;
// }

// async function extractFromPage(url) {
//   const res = await fetchUrl(url);
//   if (res.error || !res.html) return { emails: [], candidateLinks: [], finalUrl: url, error: res.error };
//   const html = res.html;
//   const $ = cheerioLoad(html);

//   const mailtos = [];
//   $('a[href^="mailto:"]').each((i, el) => {
//     const href = $(el).attr('href');
//     if (!href) return;
//     const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
//     if (email) mailtos.push(email.toLowerCase());
//   });

//   const rawEmails = extractEmailsFromText(html);
//   const candidateLinks = findCandidateContactLinks($, res.finalUrl || url);
//   const emails = [...new Set([...mailtos, ...rawEmails])];

//   return { emails, candidateLinks, finalUrl: res.finalUrl || url };
// }

// async function findEmailsForSite(siteUrl) {
//   const results = { siteUrl, emails: new Set(), triedUrls: [], errors: [] };

//   let base;
//   try {
//     base = new URL(siteUrl).href;
//   } catch (e) {
//     try {
//       base = new URL('https://' + siteUrl).href;
//     } catch (err) {
//       results.errors.push('Invalid URL');
//       return results;
//     }
//   }

//   await sleep(DELAY_MS);
//   const homepage = await extractFromPage(base);
//   if (homepage.error) results.errors.push({ url: base, error: homepage.error });
//   homepage.emails.forEach(e => results.emails.add(e));
//   results.triedUrls.push(homepage.finalUrl || base);

//   const queue = [];
//   if (homepage.candidateLinks && homepage.candidateLinks.length) {
//     for (const l of homepage.candidateLinks) queue.push(l);
//   }

//   const common = await probeCommonPaths(base);
//   for (const c of common) queue.push(c);

//   const qUnique = [...new Set(queue)];
//   const MAX_EXTRA_PAGES = 6;
//   const toProbe = qUnique.slice(0, MAX_EXTRA_PAGES);

//   for (const u of toProbe) {
//     await sleep(DELAY_MS);
//     const p = await extractFromPage(u);
//     if (p.error) {
//       results.errors.push({ url: u, error: p.error });
//       continue;
//     }
//     p.emails.forEach(e => results.emails.add(e));
//     results.triedUrls.push(p.finalUrl || u);
//   }

//   results.emails = [...results.emails];
//   return results;
// }

// async function main() {
//   const inputUrls = process.argv.slice(2);
//   if (!inputUrls.length) {
//     console.log('Usage: node find-emails.js <url1> <url2> ...');
//     process.exit(1);
//   }

//   const limit = pLimit(CONCURRENCY);
//   const jobs = inputUrls.map(url => limit(() => findEmailsForSite(url)));
//   const all = await Promise.all(jobs);

//   // ONLY print the found emails, one per line, prefixed by the site
//   // Format: <siteUrl> - <email>
//   for (const r of all) {
//     if (r.emails && r.emails.length) {
//       for (const e of r.emails) {
//         console.log(`${e}`);
//       }
//     }
//     // if you want to show a "no email" line, uncomment the following:
//     // else { console.log(`${r.siteUrl} - NO_EMAIL_FOUND`); }
//   }
// }

// main().catch(err => {
//   console.error('Fatal error', err);
//   process.exit(1);
// });




// find-emails.js (ESM)
// import axios from 'axios';
// import { load as cheerioLoad } from 'cheerio';
// import pLimit from 'p-limit';

// const USER_AGENT = 'EmailFinderBot/1.0 (+https://codegrin.com)';
// const REQUEST_TIMEOUT = 15000;
// const CONCURRENCY = 3;
// const DELAY_MS = 500;

// const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// async function fetchUrl(url) {
//   try {
//     const res = await axios.get(url, {
//       timeout: REQUEST_TIMEOUT,
//       headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
//       maxRedirects: 5,
//     });
//     return { html: res.data, finalUrl: res.request?.res?.responseUrl || url, status: res.status };
//   } catch (err) {
//     return { error: err.message || String(err) };
//   }
// }

// function extractEmailsFromText(text) {
//   if (!text) return [];
//   const matches = text.match(EMAIL_REGEX);
//   if (!matches) return [];
//   return [...new Set(matches.map(m => m.trim().toLowerCase()))];
// }

// function findCandidateContactLinks($, baseUrl) {
//   const links = new Set();
//   $('a[href]').each((i, el) => {
//     const hrefRaw = $(el).attr('href');
//     if (!hrefRaw) return;
//     const href = hrefRaw.trim();
//     const lower = href.toLowerCase();
//     if (lower.startsWith('mailto:')) {
//       links.add(href);
//       return;
//     }
//     if (lower.includes('contact') || lower.includes('about') || lower.includes('team') || lower.includes('support') || lower.includes('careers')) {
//       try {
//         const resolved = new URL(href, baseUrl).href;
//         links.add(resolved);
//       } catch {}
//     }
//   });
//   return Array.from(links);
// }

// async function probeCommonPaths(baseUrl) {
//   // Only produce full absolute probe URLs derived from baseUrl
//   const tryPaths = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/support', '/help', '/contactus'];
//   const urls = [
//   'bluestripes.com',
//   'ecomid.com',
//   'mattoespresso.com',
//   'hopehydration.com',
//   'rebind.com',
//   'thumbtack.com',
//   'elementum.com',
//   'simplea.com',
//   'dataprise.com',
//   'tmnas.com',
//   'itconvergence.com',
//   'appliedpredictive.com',
//   'autoleap.com',
//   'lumindigital.com',
//   'vanta.com',
//   'geckorobotics.com',
//   'chainguard.dev',
//   'qventus.com',
//   'current.com',
//   'researchgate.net',
//   'infineon.com',
//   'aboutyou.de',
//   'appollo-systems.de',
//   'boldare.com',
//   'kevych-solutions.com',
//   'colobridge.com',
//   'palark.com',
//   'itcraft.de',
//   'makersden.io',
//   'altar.io',
//   'digis.com',
//   'firstlinesoftware.com',
//   'voypost.com',
//   'elinext.com',
//   'youarelaunched.com',
//   'aleph-engineering.de',
//   'sts-software.de',
//   'pwrteams.com',
//   'innowise-group.com',
//   'dbbsoftware.de',
//   'simform.com',
//   'coherent-solutions.de',
//   'fulcrum.rocks',
//   'alliancetek.de',
//   'plavno.io',
//   'appx.de',
//   'exlrt.com',
//   'benchling.com',
//   'grammarly.com',
//   'ashbyhq.com',
//   'tulip.co',
//   'industriousoffice.com',
//   'lilt.com',
//   'aircall.io',
//   'amplitude.com',
//   'rapid7.com',
//   'here.com',
//   'celonis.com',
//   'imprivala.com',
//   'magna.com',
//   'hibob.com',
//   'altium.com',
//   'blackline.com',
// ];

//   try {
//     const u = new URL(baseUrl);
//     const origin = u.origin;
//     for (const p of tryPaths) urls.push(origin + p);
//     // also include origin root (homepage) again as a sanity option
//     urls.push(origin + '/');
//   } catch (e) {
//     // invalid baseUrl -> return empty
//   }
//   return urls;
// }

// async function extractFromPage(url) {
//   const res = await fetchUrl(url);
//   if (res.error || !res.html) return { emails: [], candidateLinks: [], finalUrl: url, error: res.error };
//   const html = res.html;
//   const $ = cheerioLoad(html);

//   const mailtos = [];
//   $('a[href^="mailto:"]').each((i, el) => {
//     const href = $(el).attr('href');
//     if (!href) return;
//     const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
//     if (email) mailtos.push(email.toLowerCase());
//   });

//   const rawEmails = extractEmailsFromText(html);
//   const candidateLinks = findCandidateContactLinks($, res.finalUrl || url);
//   const emails = [...new Set([...mailtos, ...rawEmails])];

//   return { emails, candidateLinks, finalUrl: res.finalUrl || url };
// }

// async function findEmailsForSite(siteUrl) {
//   const results = { siteUrl, emails: new Set(), triedUrls: [], errors: [] };

//   // normalize siteUrl to full URL with protocol
//   let base;
//   try {
//     base = new URL(siteUrl).href;
//   } catch (e) {
//     try {
//       base = new URL('https://' + siteUrl).href;
//     } catch (err) {
//       results.errors.push('Invalid URL');
//       return results;
//     }
//   }

//   // homepage
//   await sleep(DELAY_MS);
//   const homepage = await extractFromPage(base);
//   if (homepage.error) results.errors.push({ url: base, error: homepage.error });
//   homepage.emails.forEach(e => results.emails.add(e));
//   results.triedUrls.push(homepage.finalUrl || base);

//   // candidate links from homepage
//   const queue = [];
//   if (homepage.candidateLinks && homepage.candidateLinks.length) {
//     for (const l of homepage.candidateLinks) queue.push(l);
//   }

//   // only probe common paths derived from base (NO raw hostnames)
//   const common = await probeCommonPaths(base);
//   for (const c of common) queue.push(c);

//   // dedupe and ensure absolute URLs
//   const qUnique = [...new Set(queue)];

//   const MAX_EXTRA_PAGES = 6;
//   const toProbe = qUnique.slice(0, MAX_EXTRA_PAGES);

//   for (const u of toProbe) {
//     await sleep(DELAY_MS);
//     const p = await extractFromPage(u);
//     if (p.error) {
//       results.errors.push({ url: u, error: p.error });
//       continue;
//     }
//     p.emails.forEach(e => results.emails.add(e));
//     results.triedUrls.push(p.finalUrl || u);
//   }

//   results.emails = [...results.emails];
//   return results;
// }

// async function main() {
//   const inputUrls = process.argv.slice(2);
//   if (!inputUrls.length) {
//     console.log('Usage: node find-emails.js <url1> <url2> ...');
//     process.exit(1);
//   }

//   const limit = pLimit(CONCURRENCY);
//   const jobs = inputUrls.map(url => limit(() => findEmailsForSite(url)));
//   const all = await Promise.all(jobs);

//   // Print only found emails, one per line (just the email)
//   for (const r of all) {
//     if (r.emails && r.emails.length) {
//       for (const e of r.emails) {
//         console.log(e);
//       }
//     } else {
//       // Uncomment this line if you want to see "no email found" info
//       // console.log(`${r.siteUrl} - NO_EMAIL_FOUND (tried: ${JSON.stringify(r.triedUrls)})`);
//     }
//     // optionally log errors to stderr so they don't mix with email output
//     if (r.errors && r.errors.length) {
//       console.error('PROBE_ERRORS for', r.siteUrl, JSON.stringify(r.errors));
//     }
//   }
// }

// main().catch(err => {
//   console.error('Fatal error', err);
//   process.exit(1);
// });
// find-emails.js (ESM) -- paste your sites into the `urls` array below
import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import pLimit from 'p-limit';

const USER_AGENT = 'EmailFinderBot/1.0 (+https://codegrin.com)';
const REQUEST_TIMEOUT = 20000;
const CONCURRENCY = 3;
const DELAY_MS = 500;

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const urls = [
"https://www.secoda.co",
  "https://www.avironactive.com",
  "https://www.truenorth.co",
  "https://www.payd.ca",
  "https://www.perfectrecall.app",
  "https://www.dirtmarket.ca",
  "https://www.nugget.ai",
  "https://www.justo.ca",
  "https://www.lucid.audio",
  "https://www.bounceapp.co",
  "https://www.wingmateapp.com",
  "https://www.birdseye.global",
  "https://www.xgcsoftware.com",
  "https://www.mycaribou.com",
  "https://www.ada.support",
  "https://www.waabi.ai",
  "https://www.bluedot.global",
  "https://www.choosemuse.com",
  "https://www.nuralogix.ai",
  "https://www.shabodi.com",
  "https://247labs.com",
  "https://www.qmo.io",
  "https://www.larax.ca",
  "https://www.ectostar.com",
  "https://www.technoyuga.com",
  "https://www.cleffex.com",
  "https://www.roobinium.io",
  "https://www.shapesoft.ca",
  "https://www.360appservices.com",
  "https://www.virtualcoders.ca",
  "https://www.hipo.io",
  "https://www.happenize.com",
  "https://www.websharx.ca",
  "https://www.srhsoftware.com",
  "https://www.canadiansoftware.agency",
  "https://www.totalmom.ca",
  "https://www.trulyfinancial.com",
  "https://www.42technologies.com",
  "https://www.mindsea.com",
  "https://www.essentialdesigns.net",
  "https://www.datarockets.com",
  "https://www.optasy.com",
  "https://www.myplanet.com",
  "https://www.netsolutions.com",
  "https://www.synergogroup.net",
  "https://www.cleveroad.com",
  "https://www.twg.io",
  "https://www.blanclabs.com",
  "https://www.williamthomasdigital.com",
  "https://www.dealer-fx.com"
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isValidHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchUrl(url) {
  if (!isValidHttpUrl(url)) return { error: 'invalid url format' };
  try {
    const res = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      maxRedirects: 5,
    });
    return { html: res.data, finalUrl: res.request?.res?.responseUrl || url, status: res.status };
  } catch (err) {
    return { error: err?.message || String(err) };
  }
}

function extractEmailsFromText(text) {
  if (!text) return [];
  const matches = text.match(EMAIL_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.trim().toLowerCase()))];
}

function findCandidateContactLinks($, baseUrl) {
  const links = new Set();
  $('a[href]').each((i, el) => {
    const hrefRaw = $(el).attr('href');
    if (!hrefRaw) return;
    const href = hrefRaw.trim();
    const lower = href.toLowerCase();
    if (lower.startsWith('mailto:')) {
      links.add(href);
      return;
    }
    if (lower.includes('contact') || lower.includes('about') || lower.includes('team') || lower.includes('support') || lower.includes('careers')) {
      try {
        const resolved = new URL(href, baseUrl).href;
        links.add(resolved);
      } catch {}
    }
  });
  return Array.from(links);
}

async function probeCommonPaths(baseUrl) {
  const tryPaths = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/support', '/help', '/contactus'];
  const out = [];
  try {
    const u = new URL(baseUrl);
    const origin = u.origin;
    for (const p of tryPaths) out.push(origin + p);
    out.push(origin + '/'); // homepage as fallback
  } catch (e) {
    // invalid base -> return empty
  }
  return out;
}

async function extractFromPage(url) {
  const res = await fetchUrl(url);
  if (res.error || !res.html) return { emails: [], candidateLinks: [], finalUrl: url, error: res.error };
  const html = res.html;
  const $ = cheerioLoad(html);

  const mailtos = [];
  $('a[href^="mailto:"]').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
    if (email) mailtos.push(email.toLowerCase());
  });

  const rawEmails = extractEmailsFromText(html);
  const candidateLinks = findCandidateContactLinks($, res.finalUrl || url);
  const emails = [...new Set([...mailtos, ...rawEmails])];

  return { emails, candidateLinks, finalUrl: res.finalUrl || url };
}

async function findEmailsForSite(siteUrl) {
  const results = { siteUrl, emails: new Set(), triedUrls: [], errors: [] };

  let base;
  try {
    base = new URL(siteUrl).href;
  } catch (e) {
    try {
      base = new URL(siteUrl).href;
    } catch (err) {
      results.errors.push('Invalid URL');
      return results;
    }
  }

  await sleep(DELAY_MS);
  const homepage = await extractFromPage(base);
  if (homepage.error) results.errors.push({ url: base, error: homepage.error });
  homepage.emails.forEach(e => results.emails.add(e));
  results.triedUrls.push(homepage.finalUrl || base);

  const queue = [];
  if (homepage.candidateLinks && homepage.candidateLinks.length) {
    for (const l of homepage.candidateLinks) queue.push(l);
  }

  const common = await probeCommonPaths(base);
  for (const c of common) queue.push(c);

  const qUnique = [...new Set(queue)].filter(u => isValidHttpUrl(u));

  const MAX_EXTRA_PAGES = 6;
  const toProbe = qUnique.slice(0, MAX_EXTRA_PAGES);

  for (const u of toProbe) {
    await sleep(DELAY_MS);
    const p = await extractFromPage(u);
    if (p.error) {
      results.errors.push({ url: u, error: p.error });
      continue;
    }
    p.emails.forEach(e => results.emails.add(e));
    results.triedUrls.push(p.finalUrl || u);
  }

  results.emails = [...results.emails];
  return results;
}

async function main() {
  // If urls array is empty, fallback to CLI args; otherwise use array
  const inputUrls = (urls && urls.length) ? urls : process.argv.slice(2);
  if (!inputUrls.length) {
    console.log('Usage: populate urls[] inside the file or run: node find-emails.js <url1> <url2> ...');
    process.exit(1);
  }

  const limit = pLimit(CONCURRENCY);
  const jobs = inputUrls.map(url => limit(() => findEmailsForSite(url)));
  const all = await Promise.all(jobs);

  for (const r of all) {
    if (r.emails && r.emails.length) {
      for (const e of r.emails) console.log(e);
    }
    if (r.errors && r.errors.length) {
      console.error('PROBE_ERRORS for', r.siteUrl, JSON.stringify(r.errors));
    }
  }
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});



// find-emails.js (Verbose debug version)
// import axios from 'axios';
// import { load as cheerioLoad } from 'cheerio';
// import pLimit from 'p-limit';

// const USER_AGENT = 'EmailFinderBot/1.0 (+https://codegrin.com)';
// const REQUEST_TIMEOUT = 20000;
// const CONCURRENCY = 2;
// const DELAY_MS = 400;
// const VERBOSE = true; // set false to reduce logs

// const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// /**
//  * Put your sites here (full URLs with https://). If empty, script will use CLI args.
//  */
// const urls = [
//  "https://a1technologies.com.au",
//   "https://sensible.com.au",
//   "https://worldteam.com.au",
//   "https://ezlicence.com.au",
//   "https://gridware.com.au",
//   "https://digitalthrive.com.au",
//   "https://goodwipes.com.au",
//   "https://makeupcartel.com.au",
//   "https://reflowhub.com.au",
//   "https://athletic.com.au",
//   "https://ashbyhq.com/au",
//   "https://netskope.com/au",
//   "https://turo.com/au",
//   "https://dataiku.com/au",
//   "https://gitlab.com/au",
//   "https://labelbox.com/au",
//   "https://konghq.com/au",
//   "https://instinctools.com/au",
//   "https://sdlccorp.com/au",
//   "https://packetlabs.net/au",
//   "https://stssoftware.com.au",
//   "https://anadea.info/au",
//   "https://pwrteams.com/au",
//   "https://solulab.com/au",
//   "https://safetyculture.com",
//   "https://realestate.com.au",
//   "https://atlassian.com",
//   "https://canva.com",
//   "https://cultureamp.com",
//   "https://servicenow.com/au",
//   "https://commbank.com.au",
//   "https://katana1.com.au",
//   "https://adobe.com/au",
//   "https://salesforce.com/au",
//   "https://splunk.com/au",
//   "https://cloudflare.com/au"
// ];

// function log(...args) { if (VERBOSE) console.log(...args); }
// function logErr(...args) { console.error(...args); }

// async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// function isValidHttpUrl(s) {
//   try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
//   catch { return false; }
// }

// async function fetchUrl(url) {
//   if (!isValidHttpUrl(url)) return { error: 'invalid url format', url };
//   try {
//     const res = await axios.get(url, {
//       timeout: REQUEST_TIMEOUT,
//       headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
//       maxRedirects: 5,
//     });
//     return { html: res.data, finalUrl: res.request?.res?.responseUrl || url, status: res.status, url };
//   } catch (err) {
//     return { error: err?.message || String(err), url };
//   }
// }

// function extractEmailsFromText(text) {
//   if (!text) return [];
//   const matches = text.match(EMAIL_REGEX);
//   if (!matches) return [];
//   return [...new Set(matches.map(m => m.trim().toLowerCase()))];
// }

// function findCandidateContactLinks($, baseUrl) {
//   const links = new Set();
//   $('a[href]').each((i, el) => {
//     const hrefRaw = $(el).attr('href');
//     if (!hrefRaw) return;
//     const href = hrefRaw.trim();
//     const lower = href.toLowerCase();
//     if (lower.startsWith('mailto:')) { links.add(href); return; }
//     if (lower.includes('contact') || lower.includes('about') || lower.includes('team') || lower.includes('support') || lower.includes('careers')) {
//       try { links.add(new URL(href, baseUrl).href); } catch {}
//     }
//   });
//   return Array.from(links);
// }

// async function probeCommonPaths(baseUrl) {
//   const tryPaths = ['/contact','/contact-us','/about','/about-us','/team','/support','/help','/contactus','/'];
//   const out = [];
//   try {
//     const u = new URL(baseUrl);
//     const origin = u.origin;
//     for (const p of tryPaths) out.push(origin + p);
//   } catch {}
//   return out;
// }

// async function extractFromPage(url) {
//   const res = await fetchUrl(url);
//   if (res.error || !res.html) return { emails: [], candidateLinks: [], finalUrl: res.finalUrl || res.url || url, error: res.error };
//   const html = res.html;
//   const $ = cheerioLoad(html);

//   const mailtos = [];
//   $('a[href^="mailto:"]').each((i, el) => {
//     const href = $(el).attr('href');
//     if (!href) return;
//     const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
//     if (email) mailtos.push(email.toLowerCase());
//   });

//   const rawEmails = extractEmailsFromText(html);
//   const candidateLinks = findCandidateContactLinks($, res.finalUrl || url);
//   const emails = [...new Set([...mailtos, ...rawEmails])];

//   return { emails, candidateLinks, finalUrl: res.finalUrl || url, html };
// }

// async function findEmailsForSite(siteUrl) {
//   const results = { siteUrl, emails: new Set(), triedUrls: [], errors: [] };

//   // normalize
//   let base;
//   try { base = new URL(siteUrl).href; }
//   catch {
//     try { base = new URL('https://' + siteUrl).href; }
//     catch { results.errors.push('Invalid URL'); return results; }
//   }

//   log(`\n=== START ${base} ===`);
//   await sleep(DELAY_MS);

//   // homepage
//   log(`Fetching homepage: ${base}`);
//   const homepage = await extractFromPage(base);
//   if (homepage.error) {
//     results.errors.push({ url: base, error: homepage.error });
//     logErr(`  > homepage error: ${homepage.error}`);
//   } else {
//     log(`  > homepage OK (${homepage.finalUrl}). Emails on page: ${homepage.emails.length}`);
//     // preview first 300 chars so we see if it's JS app / block page
//     log(`  > HTML preview: ${String(homepage.html).slice(0,300).replace(/\n/g,' ') }${homepage.html.length>300 ? '...':''}`);
//     if (homepage.candidateLinks.length) log(`  > candidate links found: ${homepage.candidateLinks.slice(0,10).join(', ')}`);
//   }

//   homepage.emails.forEach(e => results.emails.add(e));
//   results.triedUrls.push(homepage.finalUrl || base);

//   // prepare probes: candidate links + common paths
//   const queue = [];
//   if (homepage.candidateLinks && homepage.candidateLinks.length) queue.push(...homepage.candidateLinks);

//   const common = await probeCommonPaths(base);
//   queue.push(...common);

//   // dedupe + ensure valid absolute urls
//   const qUnique = [...new Set(queue)].filter(u => isValidHttpUrl(u));
//   log(`  > will probe ${qUnique.length} pages (max 6 by default).`);

//   const MAX_EXTRA_PAGES = 6;
//   const toProbe = qUnique.slice(0, MAX_EXTRA_PAGES);

//   for (const u of toProbe) {
//     log(`  Fetching probe: ${u}`);
//     await sleep(DELAY_MS);
//     const p = await extractFromPage(u);
//     if (p.error) {
//       results.errors.push({ url: u, error: p.error });
//       logErr(`    probe error: ${p.error}`);
//       continue;
//     }
//     log(`    probe OK. emails: ${p.emails.length}; candidate links: ${p.candidateLinks.length}`);
//     // optionally preview
//     log(`    preview: ${String(p.html).slice(0,200).replace(/\n/g,' ')}${p.html.length>200 ? '...':''}`);
//     p.emails.forEach(e => results.emails.add(e));
//     results.triedUrls.push(p.finalUrl || u);
//   }

//   results.emails = [...results.emails];
//   if (results.emails.length) log(`  >>> FOUND ${results.emails.length} EMAIL(s) for ${base}`);
//   else log(`  >>> NO EMAIL FOUND for ${base} (tried ${results.triedUrls.length} pages)`);

//   return results;
// }

// async function main() {
//   const inputUrls = (urls && urls.length) ? urls : process.argv.slice(2);
//   if (!inputUrls.length) { console.log('Populate urls[] or pass sites as CLI args'); process.exit(1); }

//   const limit = pLimit(CONCURRENCY);
//   const jobs = inputUrls.map(url => limit(() => findEmailsForSite(url)));
//   const all = await Promise.all(jobs);

//   // Final output: per-site emails (or NO EMAIL)
//   console.log('\n\n=== RESULTS ===');
//   for (const r of all) {
//     if (r.emails && r.emails.length) {
//       for (const e of r.emails) console.log(`${r.siteUrl} - ${e}`);
//     } else {
//       console.log(`${r.siteUrl} - NO_EMAIL_FOUND`);
//     }
//     if (r.errors && r.errors.length) logErr('PROBE_ERRORS for', r.siteUrl, JSON.stringify(r.errors));
//   }
// }

// main().catch(err => { console.error('Fatal error', err); process.exit(1); });
