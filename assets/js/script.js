(() => {
  'use strict';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  if (sections.length && 'IntersectionObserver' in window) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(sec => navIo.observe(sec));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => {
        open.classList.remove('open');
        open.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------------------------------------------------------------
  // Form submission
  //
  // Two modes, controlled by FORM_ENDPOINT below:
  //  - Empty (default): forms fall back to a pre-filled mailto: link,
  //    zero backend required.
  //  - Set to a Formspree endpoint (sign up free at formspree.io,
  //    create a form, paste its URL here, e.g.
  //    'https://formspree.io/f/abcd1234'): forms submit silently
  //    in-page instead, with the mailto link as a fallback if the
  //    request fails.
  // ---------------------------------------------------------------
  const CONTACT_EMAIL = 'hello@nadirstudio.io';
  const FORM_ENDPOINT = '';

  const buildMailto = (subject, bodyLines) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

  async function submitForm({ form, statusEl, subject, bodyLines, sentMessage }) {
    if (FORM_ENDPOINT) {
      statusEl.textContent = 'Sending…';
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          statusEl.textContent = sentMessage;
          form.reset();
          return;
        }
      } catch (err) {
        // network error — fall through to mailto fallback below
      }
    }

    window.location.href = buildMailto(subject, bodyLines);
    statusEl.textContent = 'Opening your email client to send the request…';
    setTimeout(() => {
      statusEl.textContent = `If nothing opened, email us directly at ${CONTACT_EMAIL}.`;
    }, 2500);
  }

  // Contact form
  const form = document.getElementById('quoteForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const business = (data.get('business') || '').toString().trim();
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const need = (data.get('need') || '').toString().trim();
      const existing = (data.get('existing') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = `Quote request: ${business}`;
      const bodyLines = [
        `Business name: ${business}`,
        `Contact name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'n/a'}`,
        `Looking for: ${need}`,
        `Existing site/domain: ${existing}`,
        '',
        'Message:',
        message
      ];

      submitForm({
        form,
        statusEl: status,
        subject,
        bodyLines,
        sentMessage: 'Thanks — your request is in! We\'ll reply within one business day.'
      });
    });
  }

  // Project questionnaire
  const qForm = document.getElementById('questionnaireForm');
  const qStatus = document.getElementById('qFormStatus');

  if (qForm) {
    qForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(qForm);
      const get = (key) => (data.get(key) || '').toString().trim();
      const getAll = (key) => data.getAll(key).join(', ') || 'None selected';

      const business = get('business');
      const subject = `Project questionnaire: ${business}`;
      const bodyLines = [
        `Business name: ${business}`,
        `Industry: ${get('industry')}`,
        `Contact name: ${get('name')}`,
        `Email: ${get('email')}`,
        `Phone: ${get('phone') || 'n/a'}`,
        `Current website: ${get('currentSite') || 'n/a'}`,
        '',
        `Main goals: ${getAll('goal')}`,
        `Pages needed: ${getAll('pages')}`,
        '',
        `Design style: ${get('style') || 'Not specified'}`,
        `Inspiration links: ${get('inspiration') || 'n/a'}`,
        '',
        `Assets ready: ${getAll('assets')}`,
        `Features wanted: ${getAll('features')}`,
        '',
        `Timeline: ${get('timeline')}`,
        `Budget range: ${get('budget')}`,
        '',
        'Additional notes:',
        get('notes') || 'n/a'
      ];

      submitForm({
        form: qForm,
        statusEl: qStatus,
        subject,
        bodyLines,
        sentMessage: 'Thanks — your answers are in! We\'ll follow up within one business day.'
      });
    });
  }
})();
