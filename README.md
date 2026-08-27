# Nadir

Marketing website for **Nadir** — a studio building fast, modern websites for
small local businesses, plus ongoing local SEO / promotion ("Amplify") plans.

> *Nadir: the lowest point on the celestial sphere, directly opposite the
> zenith — the foundation you look up from. Built for the businesses everyone
> else overlooks.*

## Structure

```
index.html            All page sections: hero, services, process, pricing,
                       amplify (promotion), founding clients, FAQ, contact
assets/css/style.css   Full design system (dark/techy theme, tokens, components)
assets/js/script.js    Nav toggle, scroll reveal, active-link tracking,
                       FAQ accordion, contact form handler
```

## Running locally

No build step — it's static HTML/CSS/JS. Serve the folder with any static
server, e.g.:

```
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown).

## Before going live — things to swap in

- **Contact details**: replace the placeholder email (`hello@nadirstudio.io`)
  and phone number in `index.html` (contact section + footer) and in
  `assets/js/script.js` (`CONTACT_EMAIL`).
- **Social links**: the Instagram/Facebook/LinkedIn icons in the contact
  section currently point to `#` — add real profile URLs.
- **Contact form backend**: the form currently opens a pre-filled `mailto:`
  link so it works with zero backend. For a form that submits silently
  in-page, wire it up to a service like Formspree, Netlify Forms, or a small
  serverless endpoint, and swap the submit handler in `script.js`.
- **Pricing**: figures in the Pricing section are researched estimates for a
  solo/small studio serving local small businesses — sanity-check them
  against your own costs and local market before publishing.
- **Founding client counter**: the "10/10 spots open" counter in the
  Founding Clients section is static markup — update it manually (or wire it
  to real data) as spots fill.
- **Domain**: once you register your real domain, update the `og:`/canonical
  tags if you add them, and the footer copyright line.
