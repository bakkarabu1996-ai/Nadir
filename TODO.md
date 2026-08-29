# Before going live — outstanding items

Tracked placeholders and open decisions. Update this file as items get resolved.

## Blocking — placeholder contact details still in the code
- [ ] **Real business email** — `hello@nadirstudio.io` is a placeholder and does
      not exist. Appears in `index.html`, `privacy.html`, `terms.html`,
      `questionnaire.html`, and `CONTACT_EMAIL` in `assets/js/script.js`.
      Also update the Formspree form's notification address to match.
- [ ] **Real phone number** — `+44 7000 123456` is a placeholder (an unassigned
      Ofcom drama number). Appears in `index.html` contact section, all four
      page footers, `tel:` links, and the form placeholder.
- [ ] **Legal name on the legal pages** — `[Your Name, trading as Nadir Studios]`
      in `privacy.html` and `terms.html` needs your actual name. Required for a
      valid UK privacy policy.

## Business basics
- [ ] **Custom domain** — site currently lives at the GitHub Pages default URL.
      Once a domain is bought: add a `CNAME` file, point DNS at GitHub Pages,
      then update the canonical/OG URLs in all four pages plus `sitemap.xml`
      and `robots.txt`.
- [ ] **ICO Data Protection Fee** (~£52/yr) — very likely required, since the
      site collects client personal data via the forms.
- [ ] **VAT-registration status** — confirms or removes the VAT note under Pricing.
- [ ] **Founding-client counter** ("10/10 spots open") — update manually in
      `index.html` as spots fill (hero stat, founding section, slot markers).

## Open decisions
- [ ] **Sanity-check pricing** (Starter £499 / Growth £999 / Pro £1,799 /
      Care £29mo / Amplify £119mo) — researched UK small-studio estimates,
      not confirmed final prices.
- [ ] **Payment collection** — no processor connected. Terms currently state
      bank transfer/invoice. Revisit if card payment is wanted (Stripe UK is
      1.5% + £0.20 per transaction, no monthly fee).
- [x] **Analytics** — Plausible (cookieless, privacy-friendly) wired into all
      four pages via `data-domain="nadirstudios.co.uk"`. **Placeholder domain
      — update the `data-domain` attribute in `index.html`, `privacy.html`,
      `terms.html`, and `questionnaire.html` once the real domain is
      registered**, and create the site in your Plausible account. Privacy
      policy updated to disclose it; no cookie banner needed since Plausible
      doesn't use cookies or collect personal data.

## Nice to have, not blocking
- [ ] Custom logo/wordmark beyond the current text-based mark
- [ ] Real photos / founding-client testimonials once first customers exist
      (no fake social proof included intentionally)
- [ ] Social profiles — none exist yet; footer/contact links were removed
      rather than left pointing at `#`

## Done
- [x] Hosting — GitHub Pages, auto-deploying from `main` via GitHub Actions
- [x] Contact form + questionnaire wired to Formspree, with `mailto:` fallback
- [x] Privacy Policy and Terms of Service written
- [x] Brand renamed to Nadir Studios across the site
- [x] SEO — canonical tags, sitemap, robots.txt, JSON-LD structured data
- [x] Social share image (`assets/img/og-image.png`) + OG/Twitter tags
- [x] Branded 404 page
- [x] Responsive + keyboard-accessibility pass — every page checked at
      320/390/768/1280/1600px for overflow, clipped content and tab order
