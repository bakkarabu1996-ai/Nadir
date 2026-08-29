(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Set by the nav-highlight block below, used by the scroll-spy block further down
  let activeNavLink = null;
  let moveNavHighlight = null;

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Logo link: #top targets the sticky header, which never moves, so the
  // browser's default anchor scroll is a no-op. Scroll the page instead.
  const brandHome = document.querySelector('a.brand[href="#top"]');
  if (brandHome) {
    brandHome.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // Mobile nav is an overlay panel below this width; above it the links sit
  // inline in the header and none of the open/lock handling applies.
  const mobileNav = window.matchMedia('(max-width: 760px)');

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  let navOpen = false;

  // Nav shrinks/solidifies after scrolling past the hero.
  // Skipped while the panel is open: the scroll lock parks the page at
  // scrollY 0, which would otherwise snap the header back to full height
  // and pull the panel's top edge away from it mid-animation.
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const updateHeaderState = () => {
      if (navOpen) return;
      siteHeader.classList.toggle('scrolled', window.scrollY > 40);
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  // Mobile nav toggle
  if (navToggle && navLinks) {
    let savedScrollY = 0;

    const setNav = (open) => {
      if (open === navOpen) return;

      // Lock the body before flagging open, unlock after clearing it, so the
      // scroll handler sees the correct state on the events each one fires.
      if (open && mobileNav.matches) {
        savedScrollY = window.scrollY;
        document.body.style.top = `-${savedScrollY}px`;
        document.body.classList.add('nav-open');
      }

      navOpen = open;
      navLinks.classList.toggle('open', open);
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));

      if (!open && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        document.body.style.top = '';
        // Must be instant: html has scroll-behavior:smooth, which would
        // otherwise animate the page back from 0 in full view of the user.
        window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
      }
    };

    navToggle.addEventListener('click', () => setNav(!navOpen));

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setNav(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navOpen) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Rotating to landscape crosses the breakpoint and the panel reverts to an
    // inline row — drop the open state and the scroll lock with it.
    const handleBreakpoint = (e) => { if (!e.matches) setNav(false); };
    if (mobileNav.addEventListener) mobileNav.addEventListener('change', handleBreakpoint);
    else mobileNav.addListener(handleBreakpoint);
  }

  // Sliding nav highlight — desktop only, follows hover then rests on the active section
  const navHighlight = document.getElementById('navHighlight');
  if (navLinks && navHighlight) {
    moveNavHighlight = (link) => {
      // The highlight is hidden in the stacked mobile panel; measuring there
      // would cache column coordinates that are wrong once the links return
      // to a row, so leave it alone until the layout is horizontal again.
      if (mobileNav.matches) return;
      if (!link) { navHighlight.style.opacity = '0'; return; }
      navHighlight.style.left = `${link.offsetLeft}px`;
      navHighlight.style.width = `${link.offsetWidth}px`;
      navHighlight.style.opacity = '1';
    };
    navLinks.querySelectorAll('.nav-link:not(.nav-cta)').forEach(link => {
      link.addEventListener('mouseenter', () => moveNavHighlight(link));
    });
    navLinks.addEventListener('mouseleave', () => moveNavHighlight(activeNavLink));

    // Re-measure after a resize or rotation, since link positions shift.
    let highlightTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(() => moveNavHighlight(activeNavLink), 150);
    }, { passive: true });
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

  // Hero stat count-up, once each is in view
  const countEls = document.querySelectorAll('.count[data-target]');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (countEls.length && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach(el => countIo.observe(el));
  } else {
    countEls.forEach(el => { el.textContent = el.getAttribute('data-target'); });
  }

  // Magnetic buttons — nudge toward the cursor, desktop only
  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      let rect = null;
      btn.addEventListener('mouseenter', () => { rect = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', (e) => {
        if (!rect) rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        rect = null;
      });
    });
  }

  // Cursor-reactive glow in the hero, desktop only
  const hero = document.querySelector('.hero');
  const cursorGlow = document.getElementById('cursorGlow');
  if (hero && cursorGlow && hasFinePointer && !prefersReducedMotion) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = null;

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    hero.addEventListener('mouseenter', () => {
      cursorGlow.classList.add('active');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('active');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
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
          activeNavLink = link;
          if (moveNavHighlight) moveNavHighlight(link);
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
  //  - Set to a form endpoint: forms submit silently in-page, with the
  //    mailto link kept as a fallback if the request fails.
  //  - Empty: forms fall back to a pre-filled mailto: link, zero
  //    backend required.
  //
  // Each form passes `fields` — an array of [label, value] pairs, in
  // the order they should appear. A null entry means a blank line in
  // the email body. The same array builds both the posted payload and
  // the mailto fallback, so the two stay in sync.
  // ---------------------------------------------------------------
  const CONTACT_EMAIL = 'hello@nadirstudio.io';
  const FORM_ENDPOINT = 'https://formspree.io/f/xeaqqwoa';

  const buildBody = (fields) =>
    fields
      .map((field) => {
        if (!field) return '';
        const [label, value] = field;
        return value.includes('\n') ? `${label}:\n${value}` : `${label}: ${value}`;
      })
      .join('\n');

  const buildMailto = (subject, fields) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody(fields))}`;

  async function submitForm({ form, statusEl, subject, fields, replyTo, sentMessage }) {
    if (FORM_ENDPOINT) {
      const payload = { _subject: subject };
      if (replyTo) payload._replyto = replyTo;
      fields.forEach((field) => {
        if (field) payload[field[0]] = field[1];
      });

      statusEl.textContent = 'Sending…';
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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

    window.location.href = buildMailto(subject, fields);
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
      const fields = [
        ['Business name', business],
        ['Contact name', name],
        ['Email', email],
        ['Phone', phone || 'n/a'],
        ['Looking for', need],
        ['Existing site/domain', existing],
        null,
        ['Message', message]
      ];

      submitForm({
        form,
        statusEl: status,
        subject,
        fields,
        replyTo: email,
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
      const email = get('email');
      const subject = `Project questionnaire: ${business}`;
      const fields = [
        ['Business name', business],
        ['Industry', get('industry')],
        ['Contact name', get('name')],
        ['Email', email],
        ['Phone', get('phone') || 'n/a'],
        ['Current website', get('currentSite') || 'n/a'],
        null,
        ['Main goals', getAll('goal')],
        ['Pages needed', getAll('pages')],
        null,
        ['Design style', get('style') || 'Not specified'],
        ['Inspiration links', get('inspiration') || 'n/a'],
        null,
        ['Assets ready', getAll('assets')],
        ['Features wanted', getAll('features')],
        null,
        ['Timeline', get('timeline')],
        ['Budget range', get('budget')],
        null,
        ['Additional notes', get('notes') || 'n/a']
      ];

      submitForm({
        form: qForm,
        statusEl: qStatus,
        subject,
        fields,
        replyTo: email,
        sentMessage: 'Thanks — your answers are in! We\'ll follow up within one business day.'
      });
    });
  }

  // Back to top
  const toTop = document.getElementById('toTop');
  if (toTop) {
    let toTopTicking = false;
    const updateToTop = () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
      toTopTicking = false;
    };
    updateToTop();
    window.addEventListener('scroll', () => {
      if (!toTopTicking) {
        requestAnimationFrame(updateToTop);
        toTopTicking = true;
      }
    }, { passive: true });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
