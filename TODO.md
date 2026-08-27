# Before going live — outstanding items

Tracked placeholders and open decisions from the initial build. Update this
file as items get resolved.

## Contact details (placeholders in code)
- [ ] Real business email — replace `hello@nadirstudio.io` in `index.html`
      (contact section + footer) and `CONTACT_EMAIL` in `assets/js/script.js`
- [ ] Real phone number — replace `+44 7000 123456` in `index.html`
      (contact section, footer, `tel:` links, form placeholder)
- [ ] Real social profile links — Instagram/Facebook/LinkedIn icons in the
      contact section currently point to `#`

## Business basics
- [ ] Real domain name for the site (for canonical/OG tags once added)
- [ ] VAT-registration status — confirms or removes the VAT note under Pricing
- [ ] Founding-client counter ("10/10 spots open") — update manually as spots
      fill, or decide if it should be wired to real data

## Decisions needed
- [ ] Contact form behavior: currently opens the visitor's email client via a
      pre-filled `mailto:` link (zero backend). Switch to an in-page silent
      submit (e.g. Formspree, Netlify Forms) if preferred — need to pick a
      service and wire up `assets/js/script.js`
- [ ] Sanity-check pricing (Starter £499 / Growth £999 / Pro £1,799 / Care
      £29mo / Amplify £119mo) against target positioning — these are
      researched UK small-studio estimates, not confirmed final prices
- [ ] Hosting/deploy target — Netlify, Vercel, GitHub Pages, or other; no
      deploy pipeline is set up yet

## Nice to have, not blocking
- [ ] Custom logo/wordmark beyond the current text-based "NADIR." mark
- [ ] Real photos / founding-client testimonials once first customers exist
      (no fake social proof included intentionally)
