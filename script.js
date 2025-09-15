/* script.js
   Vanilla JS for:
   - mobile nav toggle
   - theme toggle (persisted)
   - filterable projects
   - simple form validation + fake async submission
   - intersection observer for reveal animations
*/

(() => {
  // DOM helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Elements
  const nav = $('#main-nav');
  const navToggle = $('#nav-toggle');
  const themeToggle = $('#theme-toggle');
  const body = document.body;
  const filters = $$('.filter');
  const projects = $$('.project');
  const yearSpan = $('#year');

  // Set current year
  yearSpan.textContent = new Date().getFullYear();

  // NAV (mobile)
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  // THEME (persist)
  const THEME_KEY = 'aurora:theme';
  const setTheme = (t) => {
    if (t === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
      themeToggle.textContent = '☀️';
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove('dark');
      body.classList.add('light');
      themeToggle.textContent = '🌙';
      themeToggle.setAttribute('aria-pressed', 'false');
    }
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  };
  // initialize
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) setTheme(saved);
    else {
      // respect system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  } catch(e){ setTheme('light') }

  themeToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  // FILTERS (projects)
  function applyFilter(filter) {
    filters.forEach(f => {
      const active = f.dataset.filter === filter;
      f.classList.toggle('active', active);
      f.setAttribute('aria-selected', String(active));
    });
    projects.forEach(p => {
      const cat = p.dataset.category || 'all';
      if (filter === 'all' || cat === filter) {
        p.style.display = '';
        // small "reveal"
        requestAnimationFrame(() => p.classList.add('fade-in','is-visible'));
      } else {
        p.style.display = 'none';
      }
    });
  }
  filters.forEach(f => f.addEventListener('click', () => {
    const filter = f.dataset.filter || 'all';
    applyFilter(filter);
  }));
  // initial filter
  applyFilter('all');

  // CONTACT FORM — client-side validation + fake submit
  const form = $('#contact-form');
  const status = $('#form-status');

  function showError(input, message) {
    const id = input.id;
    const err = $(`#err-${id}`);
    if (err) err.textContent = message;
    input.setAttribute('aria-invalid', !!message);
  }
  function clearErrors() {
    ['name','email','message'].forEach(id => {
      const err = $(`#err-${id}`);
      if (err) err.textContent = '';
      const el = $(`#${id}`);
      if (el) el.removeAttribute('aria-invalid');
    });
  }
  function validateForm(data) {
    clearErrors();
    let ok = true;
    if (!data.name || data.name.trim().length < 2) {
      showError($('#name'), 'Please enter your name (2+ characters).');
      ok = false;
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      showError($('#email'), 'Please enter a valid email address.');
      ok = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      showError($('#message'), 'Message must be at least 10 characters.');
      ok = false;
    }
    return ok;
  }

  form?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };
    if (!validateForm(formData)) return;

    // simulate async submission
    status.textContent = 'Sending…';
    status.classList.remove('success','error');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setTimeout(() => {
      // fake success (in real app, send to your server)
      status.textContent = 'Thanks — your message has been sent.';
      status.classList.add('success');
      submitBtn.disabled = false;
      form.reset();
      // log for developer debugging
      console.info('Contact form (fake submit):', formData);
    }, 900);
  });

  // RESET clears errors/status
  form?.addEventListener('reset', () => {
    clearErrors();
    status.textContent = '';
  });

  // Intersection Observer for reveal effects
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in, .card, .feature, .project, .hero-content, .mock-card').forEach(el => {
    el.classList.add('fade-in');
    io.observe(el);
  });

  // Keyboard accessibility: close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Close mobile nav when clicking a nav link
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
    }
  }));

})();
