#!/usr/bin/env node

import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import pLimit from 'p-limit';
import { URL } from 'url';

// Configuration
const CONFIG = {
  USER_AGENT: 'EmailFinderBot/2.0 (+https://codegrin.com)',
  REQUEST_TIMEOUT: 25000,
  CONCURRENCY: 2,
  DELAY_MS: 800,
  MAX_EXTRA_PAGES: 8,
  MAX_RETRIES: 2,
  VERBOSE: false // Set to true for detailed logging
};

// Enhanced email regex patterns
const EMAIL_PATTERNS = {
  standard: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  encoded: /&#(\d+);/g, // HTML encoded emails
  obfuscated: /\b[a-zA-Z0-9._%+\-]+\s*\[\s*at\s*\]\s*[a-zA-Z0-9.\-]+\s*\[\s*dot\s*\]\s*[a-zA-Z]{2,}/gi
};

// Common email domains to filter out noise
const COMMON_DOMAINS = new Set([
  'example.com', 'test.com', 'localhost', 'domain.com', 'email.com',
  'yoursite.com', 'company.com', 'business.com', 'website.com'
]);

// Predefined URLs - modify this array with your target sites
const PREDEFINED_URLS = [
  "https://kodershop.com",
    "https://confianzit.com",
    "https://shubhitech.com",
    "https://tilsolutionsltd.com",
    "https://concisestudio.com",
    "https://closeloop.com",
    "https://synergytop.com",
    "https://effectivesoft.com",
    "https://hexagonitsolutions.com",
    "https://bairesdev.com",
    "https://simublade.com",
    "https://invozone.com",
    "https://computools.com",
    "https://instinctools.com",
    "https://scalo.io",
    "https://rootstack.com",
    "https://wezom.com",
    "https://attractgroup.com",
    "https://cybersecop.com",
    "https://suscosolutions.com",
    "https://volaresoftware.com",
    "https://lunarbyte.io",
    "https://cloudester.com",
    "https://navecktechnologies.com",
    "https://haystackconsulting.com",
    "https://jetthoughts.com",
    "https://maxiomtech.com",
    "https://noventum.us",
    "https://connexdigital.com",
    "https://activelogic.io",
    "https://unidev.com",
    "https://echannelhub.com",
    "https://solvios.technology",
    "https://reckonsys.com",
    "https://mxpertz.com",
    "https://awsquality.com",
    "https://settinginfotech.com",
    "https://citrusleaf.in",
    "https://steadyrabbit.in",
    "https://hashtrust.io",
    "https://ontoborn.com",
    "https://codeflashinfotech.com",
    "https://immersiveinfotech.com",
    "https://virvainfotech.com",
    "https://reversebits.com",
    "https://adaptnxt.com",
    "https://aguaisolutions.com",
    "https://ncoresoft.com",
    "https://binaryfolks.com",
    "https://protovo.com",
    "https://pitangent.com",
    "https://metwavestech.com",
    "https://aleait.com",
    "https://dreaminnovative.com",
    "https://polestartechconsultancy.com",
    "https://coherentlab.com",
    "https://infocentroid.tech",
    "https://whmcsglobalservices.com",
    "https://nyrostechnologies.com",
    "https://peanutsquare.com",
    "https://codingrippler.com",
    "https://techscholar.in",
    "https://ncodetechnologies.com",
    "https://netclubbed.com",
    "https://technanosoft.com",
    "https://faceretech.com",
    "https://happysoftware.in",
    "https://techaspsolutions.com",
    "https://hashthinktech.com",
    "https://verticalmotion.com",
    "https://evenset.com",
    "https://whitecapcanada.com",
    "https://nectarbits.com",
    "https://devprosoftware.com",
    "https://altoleap.com",
    "https://aloralabs.com",
    "https://nanosofttech.com",
    "https://mindstek.ai",
    "https://meevodigital.com",
    "https://digitalpixeltech.com",
    "https://synergyitsolutions.com",
    "https://canadiansoftware.agency",
    "https://nvisionit.com",
    "https://iqlance.com",
    "https://ecatech.ca",
    "https://pieoneers.com",
    "https://roobinium.io",
    "https://layer7innovations.com",
    "https://ttt.studio",
    "https://cheekymonkeymedia.ca",
    "https://manyhatsdigital.com",
    "https://mobilefolk.com",
    "https://consultica.ca",
    "https://continuumdigital.com",
    "https://aretesoftlabs.com",
    "https://rowebots.com",
    "https://itsolution24x7.com",
    "https://gumlet.com",
    "https://kleptofinder.com",
    "https://oneglimpse.co",
    "https://myblogs.io",
    "https://tikbox.com",
    "https://scoredetect.com"
];

class EmailFinder {
  constructor() {
    this.foundEmails = new Map(); // site -> Set of emails
    this.errors = new Map(); // site -> array of errors
    this.processedUrls = new Set();
  }

  log(...args) {
    if (CONFIG.VERBOSE) console.log('[INFO]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced URL validation
  isValidHttpUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Normalize URL
  normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.href;
    } catch {
      try {
        const withHttps = new URL('https://' + url);
        return withHttps.href;
      } catch {
        return null;
      }
    }
  }

  // Enhanced email validation
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const trimmed = email.trim().toLowerCase();
    
    // Basic format check
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      return false;
    }

    // Check for common fake domains
    const domain = trimmed.split('@')[1];
    if (COMMON_DOMAINS.has(domain)) {
      return false;
    }

    // Filter out obvious non-emails
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return false;
    }

    return true;
  }

  // Decode HTML entities in emails
  decodeHtmlEntities(text) {
    return text.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec);
    }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }

  // Extract emails from text with multiple patterns
  extractEmailsFromText(text) {
    if (!text) return [];
    
    const emails = new Set();
    const decodedText = this.decodeHtmlEntities(text);
    
    // Standard email pattern
    const standardMatches = decodedText.match(EMAIL_PATTERNS.standard) || [];
    standardMatches.forEach(email => {
      if (this.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    // Obfuscated emails (e.g., "name [at] domain [dot] com")
    const obfuscatedMatches = decodedText.match(EMAIL_PATTERNS.obfuscated) || [];
    obfuscatedMatches.forEach(match => {
      const email = match
        .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
        .replace(/\s*\[\s*dot\s*\]\s*/gi, '.')
        .replace(/\s+/g, '');
      if (this.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    return Array.from(emails);
  }

  // Enhanced HTTP request with retry logic
  async fetchUrl(url, retries = CONFIG.MAX_RETRIES) {
    if (!this.isValidHttpUrl(url)) {
      return { error: 'Invalid URL format', url };
    }

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        this.log(`Fetching ${url} (attempt ${attempt})`);
        
        const response = await axios.get(url, {
          timeout: CONFIG.REQUEST_TIMEOUT,
          headers: {
            'User-Agent': CONFIG.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          },
          maxRedirects: 5,
          validateStatus: status => status < 500 // Accept 4xx but retry 5xx
        });

        return {
          html: response.data,
          finalUrl: response.request?.res?.responseUrl || url,
          status: response.status,
          url
        };
      } catch (error) {
        this.log(`Attempt ${attempt} failed for ${url}: ${error.message}`);
        
        if (attempt <= retries && (
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.response?.status >= 500
        )) {
          await this.sleep(CONFIG.DELAY_MS * attempt); // Exponential backoff
          continue;
        }
        
        return { 
          error: error.message || String(error), 
          url,
          status: error.response?.status
        };
      }
    }
  }

  // Find contact-related links
  findCandidateContactLinks($, baseUrl) {
    const links = new Set();
    const contactKeywords = [
      'contact', 'about', 'team', 'support', 'careers', 'jobs',
      'help', 'staff', 'people', 'leadership', 'management',
      'info', 'reach', 'connect', 'get-in-touch'
    ];

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href')?.trim();
      if (!href) return;

      const lower = href.toLowerCase();
      const text = $(el).text().toLowerCase().trim();
      
      // Mailto links
      if (lower.startsWith('mailto:')) {
        links.add(href);
        return;
      }

      // Check if href or link text contains contact keywords
      const hasContactKeyword = contactKeywords.some(keyword => 
        lower.includes(keyword) || text.includes(keyword)
      );

      if (hasContactKeyword) {
        try {
          const resolved = new URL(href, baseUrl).href;
          if (this.isValidHttpUrl(resolved)) {
            links.add(resolved);
          }
        } catch {}
      }
    });

    return Array.from(links);
  }

  // Generate common paths to probe
  generateCommonPaths(baseUrl) {
    const commonPaths = [
      '/', '/contact', '/contact-us', '/contactus', '/contact_us',
      '/about', '/about-us', '/aboutus', '/about_us',
      '/team', '/our-team', '/staff', '/people',
      '/support', '/help', '/customer-service',
      '/careers', '/jobs', '/work-with-us',
      '/info', '/information', '/reach-us',
      '/leadership', '/management', '/executive-team'
    ];

    const urls = [];
    try {
      const parsedUrl = new URL(baseUrl);
      const origin = parsedUrl.origin;
      
      for (const path of commonPaths) {
        urls.push(origin + path);
      }
    } catch {}

    return urls;
  }

  // Extract emails and links from a page
  async extractFromPage(url) {
    const response = await this.fetchUrl(url);
    
    if (response.error || !response.html) {
      return {
        emails: [],
        candidateLinks: [],
        finalUrl: response.finalUrl || response.url || url,
        error: response.error,
        status: response.status
      };
    }

    const html = response.html;
    const $ = cheerioLoad(html);

    // Extract mailto links
    const mailtoEmails = [];
    $('a[href^="mailto:"]').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      const email = href
        .replace(/^mailto:/i, '')
        .split('?')[0]
        .split('&')[0]
        .trim();
        
      if (this.isValidEmail(email)) {
        mailtoEmails.push(email.toLowerCase());
      }
    });

    // Extract emails from text content
    const textEmails = this.extractEmailsFromText(html);
    
    // Find candidate links for further exploration
    const candidateLinks = this.findCandidateContactLinks($, response.finalUrl || url);

    // Combine all emails
    const allEmails = [...new Set([...mailtoEmails, ...textEmails])];

    return {
      emails: allEmails,
      candidateLinks,
      finalUrl: response.finalUrl || url,
      pageTitle: $('title').text().trim().substring(0, 100)
    };
  }

  // Process a single website
  async findEmailsForSite(siteUrl) {
    const normalizedUrl = this.normalizeUrl(siteUrl);
    if (!normalizedUrl) {
      this.error(`Invalid URL: ${siteUrl}`);
      return { siteUrl, emails: [], errors: ['Invalid URL format'] };
    }

    this.log(`\n=== Processing ${normalizedUrl} ===`);
    
    const siteEmails = new Set();
    const siteErrors = [];
    const processedUrls = [];

    // Process homepage
    await this.sleep(CONFIG.DELAY_MS);
    const homepageResult = await this.extractFromPage(normalizedUrl);
    
    if (homepageResult.error) {
      siteErrors.push({ url: normalizedUrl, error: homepageResult.error });
    } else {
      this.log(`Homepage processed: ${homepageResult.emails.length} emails found`);
      if (homepageResult.pageTitle) {
        this.log(`Page title: ${homepageResult.pageTitle}`);
      }
    }

    homepageResult.emails.forEach(email => siteEmails.add(email));
    processedUrls.push(homepageResult.finalUrl);

    // Collect URLs to probe
    const urlsToProbe = new Set();
    
    // Add candidate links from homepage
    if (homepageResult.candidateLinks) {
      homepageResult.candidateLinks.forEach(link => urlsToProbe.add(link));
    }

    // Add common paths
    const commonPaths = this.generateCommonPaths(normalizedUrl);
    commonPaths.forEach(path => urlsToProbe.add(path));

    // Remove already processed URLs and filter valid URLs
    const filteredUrls = Array.from(urlsToProbe)
      .filter(url => this.isValidHttpUrl(url))
      .filter(url => !processedUrls.includes(url))
      .slice(0, CONFIG.MAX_EXTRA_PAGES);

    this.log(`Will probe ${filteredUrls.length} additional pages`);

    // Process additional pages
    for (const url of filteredUrls) {
      await this.sleep(CONFIG.DELAY_MS);
      const result = await this.extractFromPage(url);
      
      if (result.error) {
        siteErrors.push({ url, error: result.error });
      } else {
        this.log(`Processed ${url}: ${result.emails.length} emails found`);
      }
      
      result.emails.forEach(email => siteEmails.add(email));
      processedUrls.push(result.finalUrl);
    }

    const finalEmails = Array.from(siteEmails);
    
    if (finalEmails.length > 0) {
      this.log(`✅ Found ${finalEmails.length} email(s) for ${siteUrl}`);
    } else {
      this.log(`❌ No emails found for ${siteUrl}`);
    }

    return {
      siteUrl: normalizedUrl,
      emails: finalEmails,
      errors: siteErrors,
      processedUrls,
      totalPagesChecked: processedUrls.length
    };
  }

  // Main processing function
  async run(urls) {
    if (!urls || urls.length === 0) {
      this.error('No URLs provided');
      return;
    }

    console.log(`🚀 Starting email extraction for ${urls.length} sites...\n`);

    const limit = pLimit(CONFIG.CONCURRENCY);
    const jobs = urls.map(url => limit(() => this.findEmailsForSite(url)));
    
    const results = await Promise.all(jobs);

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL EXTRACTION RESULTS');
    console.log('='.repeat(60));

    let totalEmails = 0;
    let sitesWithEmails = 0;

    for (const result of results) {
      if (result.emails.length > 0) {
        sitesWithEmails++;
        totalEmails += result.emails.length;
        
        for (const email of result.emails) {
          console.log(email);
        }
      }

      // Log errors if verbose mode or if no emails found
      if (CONFIG.VERBOSE || result.emails.length === 0) {
        if (result.errors.length > 0) {
          this.warn(`Errors for ${result.siteUrl}:`, result.errors.slice(0, 3));
        }
      }
    }

    // Summary
    console.log('\n' + '-'.repeat(60));
    console.log(`📊 SUMMARY:`);
    console.log(`   Total sites processed: ${results.length}`);
    console.log(`   Sites with emails found: ${sitesWithEmails}`);
    console.log(`   Total emails extracted: ${totalEmails}`);
    console.log(`   Success rate: ${((sitesWithEmails / results.length) * 100).toFixed(1)}%`);
    console.log('-'.repeat(60));
  }
}

// Main execution
async function main() {
  try {
    const finder = new EmailFinder();
    
    // Determine which URLs to use
    const cliUrls = process.argv.slice(2);
    const urlsToProcess = cliUrls.length > 0 ? cliUrls : PREDEFINED_URLS;

    if (urlsToProcess.length === 0) {
      console.log('Usage: node email-finder.js <url1> <url2> ...');
      console.log('Or modify the PREDEFINED_URLS array in the script');
      process.exit(1);
    }

    await finder.run(urlsToProcess);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script

  main();

export default EmailFinder;