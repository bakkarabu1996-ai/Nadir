#!/usr/bin/env node
/**
 * Nadir / Optimait Lead Finder — V1 "First Build Target"
 *
 * Given a location + business category, discovers local businesses via the
 * Google Places API, does a lightweight website-reachability check, and
 * scores each business as a sales opportunity, per the build plan:
 *   business discovery -> website verification -> opportunity score -> lead database
 *
 * Usage:
 *   node find.js --location "Norwich" --category "Plumbers" [--radius 20000] [--out norwich-plumbers]
 *
 * Requires GOOGLE_PLACES_API_KEY in the environment or a .env file (see .env.example).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

function parseArgs(argv) {
  const args = { radius: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--location') args.location = argv[++i];
    else if (a === '--category') args.category = argv[++i];
    else if (a === '--radius') args.radius = Number(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function textSearch(query) {
  const results = [];
  let url = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  let pageToken = null;

  do {
    const fetchUrl = pageToken ? `${url}&pagetoken=${pageToken}` : url;
    const res = await fetch(fetchUrl);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places Text Search failed: ${data.status} ${data.error_message || ''}`);
    }

    results.push(...(data.results || []));
    pageToken = data.next_page_token || null;

    // Google requires a short delay before a next_page_token becomes valid.
    if (pageToken) await sleep(2000);
  } while (pageToken);

  return results;
}

async function placeDetails(placeId) {
  const fields = [
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'url',
  ].join(',');
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') {
    throw new Error(`Place Details failed for ${placeId}: ${data.status}`);
  }
  return data.result;
}

async function checkWebsite(websiteUrl) {
  if (!websiteUrl) return 'NO_WEBSITE';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    let res;
    try {
      res = await fetch(websiteUrl, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    } catch {
      // Some servers reject HEAD; fall back to GET.
      res = await fetch(websiteUrl, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return res.ok ? 'WEBSITE_GOOD' : 'WEBSITE_BROKEN';
  } catch {
    return 'WEBSITE_BROKEN';
  } finally {
    clearTimeout(timeout);
  }
}

// Best-effort split of "123 High St, Norwich, NR1 1AA, UK" into town/postcode.
function splitAddress(formattedAddress) {
  if (!formattedAddress) return { town: '', postcode: '' };
  const parts = formattedAddress.split(',').map((p) => p.trim());
  const postcodeMatch = formattedAddress.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
  const postcode = postcodeMatch ? postcodeMatch[0] : '';
  const town = parts.length >= 3 ? parts[parts.length - 3] : parts[0] || '';
  return { town, postcode };
}

// Optimait Opportunity Score — section 6 of the build plan.
// Only factors computable from Places data + a basic reachability check are applied.
function scoreOpportunity({ websiteStatus, reviewCount, rating }) {
  let score = 0;
  if (websiteStatus === 'NO_WEBSITE') score += 35;
  else if (websiteStatus === 'WEBSITE_BROKEN') score += 30;

  if (reviewCount >= 100) score += 20;
  else if (reviewCount >= 50) score += 15;

  if (rating >= 4.5) score += 10;

  return Math.min(score, 100);
}

function priorityBand(score) {
  if (score >= 80) return 'HOT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'POTENTIAL';
  return 'LOW';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!API_KEY) {
    console.error('Missing GOOGLE_PLACES_API_KEY. Copy .env.example to .env and add your key.');
    process.exit(1);
  }
  if (!args.location || !args.category) {
    console.error('Usage: node find.js --location "Norwich" --category "Plumbers" [--radius 20000] [--out name]');
    process.exit(1);
  }

  const query = `${args.category} in ${args.location}`;
  console.log(`Discovering businesses for: "${query}"`);

  const rawResults = await textSearch(query);
  console.log(`Found ${rawResults.length} candidate businesses. Fetching details...`);

  const dateFound = new Date().toISOString().slice(0, 10);
  const leads = [];

  for (const [i, place] of rawResults.entries()) {
    const details = await placeDetails(place.place_id);
    const { town, postcode } = splitAddress(details.formatted_address);
    const reviewCount = details.user_ratings_total || 0;
    const rating = details.rating || 0;
    const websiteStatus = await checkWebsite(details.website);
    const opportunityScore = scoreOpportunity({ websiteStatus, reviewCount, rating });

    leads.push({
      lead_id: `${dateFound}-${i + 1}`,
      business_name: details.name,
      category: args.category,
      address: details.formatted_address || '',
      town,
      postcode,
      phone: details.formatted_phone_number || '',
      google_rating: rating,
      review_count: reviewCount,
      google_url: details.url || '',
      website: details.website || '',
      website_status: websiteStatus,
      opportunity_score: opportunityScore,
      priority: priorityBand(opportunityScore),
      source: 'Google Places',
      date_found: dateFound,
    });

    process.stdout.write(`  [${i + 1}/${rawResults.length}] ${details.name} — ${websiteStatus} — score ${opportunityScore}\n`);
  }

  leads.sort((a, b) => b.opportunity_score - a.opportunity_score);

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const outName = args.out || `${args.location}-${args.category}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const csvPath = path.join(outDir, `${outName}.csv`);
  const jsonPath = path.join(outDir, `${outName}.json`);

  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: Object.keys(leads[0] || {
      lead_id: '', business_name: '', category: '', address: '', town: '', postcode: '',
      phone: '', google_rating: '', review_count: '', google_url: '', website: '',
      website_status: '', opportunity_score: '', priority: '', source: '', date_found: '',
    }).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(leads);
  fs.writeFileSync(jsonPath, JSON.stringify(leads, null, 2));

  const hot = leads.filter((l) => l.priority === 'HOT').length;
  const good = leads.filter((l) => l.priority === 'GOOD').length;
  const noWebsite = leads.filter((l) => l.website_status === 'NO_WEBSITE').length;

  console.log(`\nDone. ${leads.length} leads written to:`);
  console.log(`  ${csvPath}`);
  console.log(`  ${jsonPath}`);
  console.log(`\nSummary: ${hot} HOT, ${good} GOOD, ${noWebsite} with no website.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
