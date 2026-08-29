# Lead Finder (V1)

Internal Nadir Studios tool — **not part of the public website**. Implements the
"First Build Target" from the Optimait Lead Finder System build plan: enter a
location and business category, run discovery, and get back a clean batch of
leads with business name, location, phone, rating, reviews, website and
website status, sorted by sales-opportunity score.

## Core workflow

```
business discovery -> website verification -> opportunity score -> lead database (CSV/JSON)
```

## Setup

```
cd tools/lead-finder
npm install
cp .env.example .env
# then edit .env and add a Google Cloud API key with "Places API" enabled
```

## Usage

```
node find.js --location "Norwich" --category "Plumbers"
node find.js --location "Norwich" --category "Plumbers" --out norwich-plumbers
```

Output is written to `output/<name>.csv` and `output/<name>.json` (gitignored),
sorted highest opportunity score first, with a console summary of HOT/GOOD
leads and how many have no website.

## What it does

1. **Discovery** — Google Places Text Search for `"<category> in <location>"`,
   then Place Details for phone, website, rating, review count and address.
2. **Website verification** — if a website is listed, does a live
   HEAD/GET reachability check and marks it `WEBSITE_GOOD` or `WEBSITE_BROKEN`;
   otherwise `NO_WEBSITE`. This is the basic V1 check only — it does not yet
   do the domain-discovery/ownership-verification step from section 4 of the
   build plan (a business could have a site under a different name that
   Places doesn't list).
3. **Opportunity score** — applies the computable factors from the build
   plan's scoring model (no website, broken website, review count, rating)
   and bands leads into `HOT` / `GOOD` / `POTENTIAL` / `LOW`.

## Not yet built (see the build plan for the full roadmap)

- AI website audit (mobile-friendliness, CTAs, trust signals, SEO, etc.)
- Supabase-backed lead database / dashboard / CRM
- AI-generated personalised sales preparation
- Website preview generator
- Outreach automation — any outbound contact must be manual and checked
  against current ICO / PECR guidance before it is automated (see section 13
  of the build plan).
