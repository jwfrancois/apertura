// ============ Scroll reveal ============
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
}

// ============ Smooth scroll for in-page anchors ============
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ============ Nav shadow on scroll ============// ============ Nav shadow on scroll ============
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 8) {
      nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
    } else {
      nav.style.borderBottomColor = '';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============ Subtle parallax for hero visual ============
const heroVisual = document.querySelector('.hero-visual img');
if (heroVisual) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < 800) {
      heroVisual.style.transform = `translateY(${y * 0.05}px) scale(${1 + y * 0.0001})`;
    }
  }, { passive: true });
}

// ============ Counter animation for stats ============
function animateCounter(el) {
  const text = el.textContent.trim();
  const match = text.match(/^(\d+)/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = text.replace(match[1], '');
  const duration = 1200;
  const startTime = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const value = Math.floor(ease(t) * target);
    el.innerHTML = value + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.innerHTML = target + suffix;
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('.path-stat .num, .hero-stat .num, .curr-stat-strip .num');
if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterObserver.observe(c));
}

// ============ Mobile menu toggle (simple) ============
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    navLinks.style.cssText = isOpen
      ? 'display:flex; position:absolute; top:72px; left:0; right:0; background:#000; padding:20px; flex-direction:column; border-bottom:1px solid #2a2a2a;'
      : '';
  });
}

// ====================================================================
// LESSON ACCORDION + YOUTUBE LAZY-LOAD + COMPLETION TRACKING
// ====================================================================

(function () {
  // Defer until LESSONS is defined (loaded by lessons.js)
  if (typeof window.LESSONS === 'undefined') {
    const wait = () => {
      if (typeof window.LESSONS === 'undefined') {
        setTimeout(wait, 30);
        return;
      }
      init();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wait);
    } else {
      wait();
    }
    return;
  }
  init();

  function init() {
  const STORAGE_KEY = 'apertura-lesson-progress';
  // Per-user progress when signed in; falls back to localStorage otherwise.
  let _user = null;
  let _completed = {}; // { [lessonId]: timestamp }

  function loadFromLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _completed = raw ? JSON.parse(raw) : {};
    } catch (e) { _completed = {}; }
  }
  function saveToLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_completed)); } catch (e) {}
  }
  async function loadFromUser() {
    if (!_user || !window.UserStore) { loadFromLocal(); return; }
    try {
      const set = await window.UserStore.getCompletedSet(_user.id);
      _completed = {};
      set.forEach((id) => { _completed[id] = Date.now(); });
    } catch (e) { loadFromLocal(); }
  }
  async function syncLessonToUser(lessonId, complete) {
    if (!_user || !window.UserStore) { saveToLocal(); return; }
    try { await window.UserStore.setLessonComplete(_user.id, lessonId, complete); } catch (e) {}
  }

  // -------- Storage helpers --------
  function isCompleted(id) { return !!_completed[id]; }
  async function toggleCompleted(id) {
    const wasDone = !!_completed[id];
    if (wasDone) delete _completed[id]; else _completed[id] = Date.now();
    if (_user && window.UserStore) {
      await syncLessonToUser(id, !wasDone);
    } else {
      saveToLocal();
    }
    return !wasDone;
  }
  function completedCount(level) {
    return window.LESSONS.filter(l => l.level === level && _completed[l.id]).length;
  }
  function totalCompleted() {
    return Object.keys(_completed).length;
  }

  // Initialize storage on start
  (async () => {
    if (window.UserStore) {
      _user = await window.UserStore.currentUser();
      if (_user) await loadFromUser(); else loadFromLocal();
    } else {
      loadFromLocal();
    }
  })();

  // -------- Thumbnail → iframe swap --------
  function makeYouTubeEmbed(videoId) {
    const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
    return `<iframe src="${src}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  function makeThumbnail(videoId, photographer) {
    // YouTube provides maxresdefault.jpg but for safety fall back to hqdefault
    return `
      <div class="video-thumb" data-video-id="${videoId}">
        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Video tutorial thumbnail" loading="lazy" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg';" />
        <div class="video-play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-credit">By ${photographer} · <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Watch on YouTube</a></div>
      </div>
    `;
  }

  // -------- Lesson card renderer --------
  function renderLesson(lesson, locked) {
    const done = isCompleted(lesson.id);
    const lockClass = locked ? ' is-locked' : '';
    const lockBadge = locked ? '<span class="lesson-lock-badge" aria-label="Locked — register to unlock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Locked</span>' : '';
    const bodyContent = locked ? `
      <div class="lesson-locked-overlay">
        <div class="lesson-locked-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h4>This lesson is part of the full curriculum</h4>
        <p>Register a free account to unlock all 30 lessons, track your progress, and earn your certificate of completion.</p>
        <div class="lesson-locked-cta">
          <a class="btn btn-primary" href="register.html">Create free account</a>
          <a class="btn btn-secondary" href="login.html">Already a member? Sign in</a>
        </div>
      </div>
    ` : `
      <div class="lesson-video">
        ${makeThumbnail(lesson.videoId, lesson.photographer)}
      </div>
      <div class="lesson-content">
        <h4>Learning Objectives</h4>
        <ul>${lesson.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
        <h4>Key Concepts</h4>
        <ul>${lesson.concepts.map(c => `<li class="concepts">${c}</li>`).join('')}</ul>
        <h4>Assignment</h4>
        <p>${lesson.assignment}</p>
      </div>
    `;
    return `
      <article class="lesson-card ${done ? 'is-complete' : ''}${lockClass}" data-lesson-id="${lesson.id}" data-level="${lesson.level}">
        <div class="lesson-header" role="button" tabindex="0" aria-expanded="false">
          <div class="lesson-num">${lesson.num}</div>
          <div class="lesson-info">
            <div class="lesson-info-row1">
              <h3 class="lesson-title">${lesson.title}${lockBadge}</h3>
            </div>
            <div class="lesson-meta">
              <span class="lesson-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                ${lesson.duration}
              </span>
              <span class="lesson-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${lesson.photographer}
              </span>
              <span class="lesson-meta-item">${lesson.summary}</span>
            </div>
          </div>
          <div class="lesson-actions">
            <button class="lesson-complete-btn ${done ? 'checked' : ''}" data-complete="${lesson.id}" aria-label="Mark complete" title="Mark as complete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <span class="lesson-expand" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>
        <div class="lesson-body">
          ${bodyContent}
        </div>
      </article>
    `;
  }

  // -------- Render each level section --------
  function renderLevelBlock(level, meta) {
    const lessons = window.LESSONS.filter(l => l.level === level);
    if (!lessons.length) return '';
    const completed = completedCount(level);
    return `
      <section class="level-block" data-level-block="${level}">
        <div class="container">
          <div class="level-grid">
            <div class="level-sidebar">
              <div class="level-num">${String(level).padStart(2, '0')} — ${meta.tier}</div>
              <h2>${meta.title}</h2>
              <h3>${meta.subtitle}</h3>
              <p>${meta.description}</p>
              <div class="level-meta">
                <div><span class="k">Duration</span><span class="v">${meta.duration}</span></div>
                <div><span class="k">Level</span><span class="v">${meta.tier}</span></div>
                <div><span class="k">Lessons</span><span class="v">${lessons.length}</span></div>
              </div>
              <div class="level-progress" style="margin-top:32px">
                <div class="lp-stat">
                  <span class="num">${completed}</span>
                  <span class="total">/ ${lessons.length}</span>
                </div>
                <div class="lp-bar"><div class="lp-bar-fill" data-lp-fill="${level}" style="width:${(completed/lessons.length)*100}%"></div></div>
                <span class="lp-label">Complete</span>
              </div>
            </div>
            <div>
              <div class="lessons-list">
                ${lessons.map((l, idx) => {
                  // Guest (not signed in): unlock first 2 lessons in Level 1; lock the rest
                  let locked = false;
                  if (!_user && (l.level !== 1 || idx >= 2)) locked = true;
                  return renderLesson(l, locked);
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const LEVELS = [
    { level: 1, tier: 'Foundation', title: 'Beginner Foundation', subtitle: 'Essential Technical Competencies', description: 'Establishes essential technical competencies while introducing fundamental concepts of visual composition and photographic seeing. Requiring approximately 10-15 hours weekly for completion.', duration: '3-4 months' },
    { level: 2, tier: 'Intermediate', title: 'Intermediate Development', subtitle: 'Expanded Technical & Creative Skills', description: 'Builds on the foundation with genre-specific techniques, advanced lighting setups, and the beginning of personal style. Students begin developing a portfolio with intention, not just accumulation.', duration: '4-5 months' },
    { level: 3, tier: 'Advanced', title: 'Advanced Practice', subtitle: 'Self-Directed Creative Development', description: 'Students take ownership of their creative direction, working on long-form projects with mentorship. The focus shifts from technical mastery to artistic voice and coherent series work.', duration: '5-6 months' },
    { level: 4, tier: 'Professional', title: 'Professional Development', subtitle: 'Career Advancement & Specialization', description: 'The final stage is ongoing — a continuous practice of professional photography. Pricing, licensing, client work, gallery representation, and the long arc of building a sustainable creative career.', duration: 'Ongoing' },
  ];

  // -------- Mount into page --------
  function mount() {
    const host = document.getElementById('lessons-host');
    if (!host) return;

    // Tabs
    const tabsHtml = `
      <div class="level-tabs" role="tablist">
        <button class="level-tab active" data-tab="all" role="tab">All <span class="tab-count">${window.LESSONS.length}</span></button>
        ${LEVELS.map(l => `<button class="level-tab" data-tab="${l.level}" role="tab">Level ${l.level} <span class="tab-count">${window.LESSONS.filter(x => x.level === l.level).length}</span></button>`).join('')}
      </div>
    `;

    // Overall progress
    const total = window.LESSONS.length;
    const done = totalCompleted();
    const overallHtml = `
      <div class="overall-progress">
        <div class="op-info">
          <h3>Your Progress</h3>
          <p><strong>${done}</strong> of ${total} lessons complete · ${Math.round((done/total)*100)}%</p>
        </div>
        <div class="op-actions">
          <button class="op-btn" data-expand-all>Expand all</button>
          <button class="op-btn" data-collapse-all>Collapse all</button>
          <button class="op-btn" data-reset-progress>Reset progress</button>
        </div>
        <div class="op-bar"><div class="op-bar-fill" data-op-fill style="width:${(done/total)*100}%"></div></div>
      </div>
    `;

    // Levels
    const levelsHtml = LEVELS.map(l => renderLevelBlock(l.level, l)).join('');

    // Guest banner — only shown when not signed in
    const guestBanner = _user ? '' : `
      <div class="guest-banner" role="region" aria-label="Preview mode">
        <div class="guest-banner-inner">
          <div class="guest-banner-text">
            <p class="kicker">PREVIEW MODE</p>
            <h3>You're previewing the curriculum as a guest</h3>
            <p>You can read the first 2 lessons of Level 1. <strong>Register a free account to unlock all 30 lessons</strong>, track your progress, earn your certificate, and access the gear guide and 32 project ideas.</p>
          </div>
          <div class="guest-banner-actions">
            <a class="btn btn-primary" href="register.html">Create free account</a>
            <a class="btn btn-secondary" href="login.html">Sign in</a>
          </div>
        </div>
      </div>
    `;

    host.innerHTML = guestBanner + overallHtml + tabsHtml + levelsHtml;

    attachEvents();
    updateProgress();
  }

  function updateProgress() {
    const total = window.LESSONS.length;
    const done = totalCompleted();
    const opFill = document.querySelector('[data-op-fill]');
    if (opFill) opFill.style.width = `${(done/total)*100}%`;
    const opInfo = document.querySelector('.op-info p');
    if (opInfo) opInfo.innerHTML = `<strong>${done}</strong> of ${total} lessons complete · ${Math.round((done/total)*100)}%`;

    // Per-level fills
    LEVELS.forEach(l => {
      const lessons = window.LESSONS.filter(x => x.level === l.level);
      const c = completedCount(l.level);
      const fill = document.querySelector(`[data-lp-fill="${l.level}"]`);
      if (fill) fill.style.width = `${(c/lessons.length)*100}%`;
      // Update sidebar count
      const block = document.querySelector(`[data-level-block="${l.level}"]`);
      if (block) {
        const numEl = block.querySelector('.lp-stat .num');
        if (numEl) numEl.textContent = c;
      }
    });
  }

  // -------- Event handling --------
  function attachEvents() {
    // Expand/collapse on header click
    document.querySelectorAll('.lesson-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.lesson-complete-btn')) return;
        const card = header.closest('.lesson-card');
        if (card.classList.contains('is-locked')) {
          // Send guests straight to register
          if (!_user) {
            window.location.href = 'register.html?from=lesson&l=' + encodeURIComponent(card.getAttribute('data-lesson-id'));
          } else {
            card.classList.add('is-open');
            header.setAttribute('aria-expanded', 'true');
          }
          return;
        }
        card.classList.toggle('is-open');
        header.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });

    // Mark complete
    document.querySelectorAll('.lesson-complete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const card = btn.closest('.lesson-card');
        if (card && card.classList.contains('is-locked') && !_user) {
          window.location.href = 'register.html';
          return;
        }
        const id = btn.getAttribute('data-complete');
        const nowDone = await toggleCompleted(id);
        btn.classList.toggle('checked', nowDone);
        const completeCard = btn.closest('.lesson-card');
        if (completeCard) completeCard.classList.toggle('is-complete', nowDone);
        updateProgress();
      });
    });

    // YouTube thumbnail click → swap to iframe
    document.querySelectorAll('.video-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const id = thumb.getAttribute('data-video-id');
        thumb.outerHTML = makeYouTubeEmbed(id);
      });
    });

    // Tabs
    document.querySelectorAll('.level-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const level = tab.getAttribute('data-tab');
        document.querySelectorAll('.level-block').forEach(b => {
          if (level === 'all') b.style.display = '';
          else b.style.display = b.getAttribute('data-level-block') === level ? '' : 'none';
        });
        // Scroll the active block into view
        if (level !== 'all') {
          const target = document.querySelector(`[data-level-block="${level}"]`);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: document.querySelector('#lessons-host').offsetTop - 100, behavior: 'smooth' });
        }
      });
    });

    // Expand all / collapse all
    document.querySelector('[data-expand-all]')?.addEventListener('click', () => {
      document.querySelectorAll('.lesson-card').forEach(c => {
        c.classList.add('is-open');
        c.querySelector('.lesson-header').setAttribute('aria-expanded', 'true');
      });
    });
    document.querySelector('[data-collapse-all]')?.addEventListener('click', () => {
      document.querySelectorAll('.lesson-card').forEach(c => {
        c.classList.remove('is-open');
        c.querySelector('.lesson-header').setAttribute('aria-expanded', 'false');
      });
    });
    document.querySelector('[data-reset-progress]')?.addEventListener('click', async () => {
      if (confirm('Reset all lesson progress? This cannot be undone.')) {
        _completed = {};
        if (_user && window.UserStore) {
          for (const l of window.LESSONS) {
            try { await window.UserStore.setLessonComplete(_user.id, l.id, false); } catch (e) {}
          }
        } else {
          saveToLocal();
        }
        document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('is-complete'));
        document.querySelectorAll('.lesson-complete-btn').forEach(b => b.classList.remove('checked'));
        updateProgress();
      }
    });
  }

  // Wait for async user load, then mount
  async function bootstrap() {
    // Wait one tick so the async user-load above can finish
    if (window.UserStore) {
      _user = await window.UserStore.currentUser();
      if (_user) await loadFromUser(); else loadFromLocal();
    } else {
      loadFromLocal();
    }
    mount();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
  } // close init()
})();

// ====================================================================
// AUTH NAV STATE — populate #auth-nav slot on every page
// ====================================================================
(function () {
  async function wireAuthNav() {
    const slots = document.querySelectorAll('[data-auth-nav]');
    if (!slots.length) return;
    if (!window.UserStore) return;
    const u = await window.UserStore.currentUser();
    for (const slot of slots) {
      if (u) {
        if (u.role === 'admin') {
          slot.innerHTML =
            `<a class="nav-pill" href="admin.html">Admin</a>` +
            `<a class="nav-pill nav-pill-muted" href="#" data-action="logout">Sign out</a>`;
        } else {
          slot.innerHTML =
            `<a class="nav-pill" href="profile.html">${u.name.split(' ')[0]}</a>` +
            `<a class="nav-pill nav-pill-muted" href="#" data-action="logout">Sign out</a>`;
        }
        const lo = slot.querySelector('[data-action="logout"]');
        if (lo) lo.addEventListener('click', async (e) => { e.preventDefault(); await window.UserStore.logout(); location.reload(); });
      } else {
        slot.innerHTML =
          `<a class="nav-pill" href="login.html">Sign in</a>` +
          `<a class="nav-pill nav-pill-muted" href="register.html">Register</a>`;
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAuthNav);
  } else {
    wireAuthNav();
  }
})();


// ====================================================================
// MOBILE UX — Bottom nav, drawer menu, PWA install
// ====================================================================
(function () {
  // ---- Build bottom nav (mobile only) ----
  function buildBottomNav() {
    if (document.querySelector('.bottom-nav')) return;
    const path = location.pathname.split('/').pop() || 'index.html';
    const items = [
      { href: 'index.html', icon: 'home', label: 'Home', match: ['index.html', ''] },
      { href: 'curriculum.html', icon: 'book', label: 'Learn', match: ['curriculum.html', 'lessons'] },
      { href: 'resources.html', icon: 'grid', label: 'Resources', match: ['resources.html'] },
      { href: 'history.html', icon: 'globe', label: 'History', match: ['history.html'] },
      { href: 'about.html', icon: 'info', label: 'About', match: ['about.html'] },
    ];
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Primary');
    nav.innerHTML = items.map(item => {
      const active = item.match.includes(path) || (path === '' && item.href === 'index.html');
      return `<a href="${item.href}" class="bn-item ${active ? 'active' : ''}" aria-label="${item.label}">
        <span class="bn-icon">${iconSvg(item.icon)}</span>
        <span class="bn-label">${item.label}</span>
      </a>`;
    }).join('');
    document.body.appendChild(nav);
  }

  function iconSvg(name) {
    const icons = {
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    };
    return icons[name] || '';
  }

  // ---- Build mobile drawer menu ----
  function buildDrawerMenu() {
    if (document.querySelector('.drawer-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.innerHTML = `
      <div class="drawer" role="dialog" aria-label="Menu">
        <div class="drawer-header">
          <a href="index.html" class="brand" style="color:var(--text)">
            <span class="brand-mark">A</span>
            <span class="brand-text">Apertura<small>Photography Curriculum</small></span>
          </a>
          <button class="drawer-close" aria-label="Close menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav class="drawer-nav">
          <a href="index.html" class="drawer-link">Home</a>
          <a href="curriculum.html" class="drawer-link">Curriculum</a>
          <a href="resources.html" class="drawer-link">Resources</a>
          <a href="history.html" class="drawer-link">History</a>
          <a href="careers.html" class="drawer-link">Career Paths</a>
          <a href="glossary.html" class="drawer-link">Glossary</a>
          <a href="assessment.html" class="drawer-link">Skill Assessment</a>
          <a href="about.html" class="drawer-link">About</a>
        </nav>
        <div class="drawer-footer">
          <a href="curriculum.html" class="btn btn-primary" style="width:100%">Start Learning</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.drawer-close')) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function openDrawer() {
    const o = document.querySelector('.drawer-overlay');
    if (o) o.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    const o = document.querySelector('.drawer-overlay');
    if (o) o.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Wire the menu-toggle button to the drawer
  function wireMenuToggle() {
    const toggle = document.querySelector('.menu-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', openDrawer);
  }

  // ---- PWA install prompt ----
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.body.classList.add('can-install');
  });

  // ---- Service worker registration ----
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // ---- Init on DOM ready ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildBottomNav(); buildDrawerMenu(); wireMenuToggle(); });
  } else {
    buildBottomNav();
    buildDrawerMenu();
    wireMenuToggle();
  }
})();

// Expose drawer open/close for direct use
window.openAperturaDrawer = function () { document.querySelector('.drawer-overlay')?.classList.add('open'); document.body.style.overflow = 'hidden'; };

