// ====================================================================
// Apertura — Resources Page Renderer
// Mounts Projects, Compare, and Tips sections
// ====================================================================

(function () {
  if (typeof window.PROJECTS === 'undefined') return;

  // -------- Project card renderer --------
  function renderProjectCard(p) {
    return `
      <article class="proj-card" data-project-id="${p.id}" data-difficulty="${p.difficulty.toLowerCase()}" data-genre="${p.genre}">
        <div class="proj-card-head">
          <span class="proj-emoji">${p.emoji}</span>
          <div class="proj-badges">
            <span class="proj-badge badge-${p.difficulty.toLowerCase()}">${p.difficulty}</span>
            <span class="proj-badge badge-genre">${p.genre}</span>
          </div>
        </div>
        <div>
          <h3 class="proj-title">${p.title}</h3>
          <div class="proj-duration" style="margin-top:6px">${p.duration}</div>
        </div>
        <p class="proj-desc">${p.description}</p>
        <ul class="proj-concepts">
          ${p.concepts.slice(0, 3).map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div class="proj-deliverable"><strong>Deliverable:</strong> ${p.deliverables}</div>
        <div class="proj-tip">${p.proTip}</div>
      </article>
    `;
  }

  // -------- Projects section mount --------
  function mountProjects() {
    const host = document.getElementById('projects-host');
    if (!host) return;

    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];
    const genres = ['All', ...new Set(window.PROJECTS.map(p => p.genre))].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));
    const durations = ['All', '1 day', '1 weekend', '1 week', '1 month', '3 months', '6 months', '1 year', 'Multi-year'];

    host.innerHTML = `
      <div class="proj-filters">
        <span class="filter-label">Level</span>
        <div class="filter-group" data-filter-group="difficulty">
          ${difficulties.map((d, i) => `<button class="filter-pill ${i === 0 ? 'active' : ''}" data-filter="${d.toLowerCase()}">${d}</button>`).join('')}
        </div>
        <span class="filter-divider"></span>
        <span class="filter-label">Genre</span>
        <select class="filter-pill" data-filter-group="genre" data-filter-type="select">
          ${genres.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
        <span class="filter-divider"></span>
        <span class="filter-label">Duration</span>
        <select class="filter-pill" data-filter-group="duration" data-filter-type="select">
          <option value="all">All</option>
          <option value="1">A day or less</option>
          <option value="7">Up to a week</option>
          <option value="30">Up to a month</option>
          <option value="90">Up to 3 months</option>
          <option value="365">A year or more</option>
        </select>
      </div>
      <div class="proj-grid" data-proj-grid>
        ${window.PROJECTS.map(renderProjectCard).join('')}
      </div>
      <p class="proj-empty" data-proj-empty style="display:none">No projects match your filters. Try clearing some.</p>
    `;

    // Filter logic
    const filters = { difficulty: 'all', genre: 'All', duration: 'all' };
    function applyFilters() {
      const cards = host.querySelectorAll('.proj-card');
      let visible = 0;
      cards.forEach(card => {
        const diff = card.getAttribute('data-difficulty');
        const genre = card.getAttribute('data-genre');
        const days = window.PROJECTS.find(p => p.id === card.getAttribute('data-project-id'))?.durationDays || 0;
        let show = true;
        if (filters.difficulty !== 'all' && diff !== filters.difficulty) show = false;
        if (filters.genre !== 'All' && genre !== filters.genre) show = false;
        if (filters.duration !== 'all') {
          const max = parseInt(filters.duration, 10);
          if (days > max) show = false;
        }
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const empty = host.querySelector('[data-proj-empty]');
      if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    }

    // Difficulty pill clicks
    host.querySelectorAll('[data-filter-group="difficulty"] .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        host.querySelectorAll('[data-filter-group="difficulty"] .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filters.difficulty = btn.getAttribute('data-filter');
        applyFilters();
      });
    });
    // Genre + duration selects
    host.querySelectorAll('select[data-filter-group]').forEach(sel => {
      sel.addEventListener('change', () => {
        const group = sel.getAttribute('data-filter-group');
        filters[group] = sel.value;
        applyFilters();
      });
    });
  }

  // -------- Compare section mount --------
  function mountCompare() {
    const host = document.getElementById('compare-host');
    if (!host || typeof window.COMPARISON === 'undefined') return;
    const c = window.COMPARISON;

    host.innerHTML = `
      <p style="color:var(--text-2); font-size:17px; line-height:1.6; max-width:880px; margin-bottom:48px">${c.intro}</p>

      <div class="compare-grid">
        <div class="compare-card phone">
          <h3>${c.phone.name}</h3>
          <p class="compare-sub">${c.phone.sub}</p>
          <div class="compare-section">
            <div class="compare-section-title">Advantages</div>
            <ul class="compare-list">
              ${c.phone.pros.map(p => `<li><strong>${p.title}</strong><span>${p.desc}</span></li>`).join('')}
            </ul>
          </div>
          <div class="compare-section cons">
            <div class="compare-section-title">Limitations</div>
            <ul class="compare-list">
              ${c.phone.cons.map(c => `<li><strong>${c.title}</strong><span>${c.desc}</span></li>`).join('')}
            </ul>
          </div>
          <div class="compare-bestfor">
            <div class="compare-bestfor-title">Best For</div>
            <ul>${c.phone.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="compare-card pro">
          <h3>${c.pro.name}</h3>
          <p class="compare-sub">${c.pro.sub}</p>
          <div class="compare-section">
            <div class="compare-section-title">Advantages</div>
            <ul class="compare-list">
              ${c.pro.pros.map(p => `<li><strong>${p.title}</strong><span>${p.desc}</span></li>`).join('')}
            </ul>
          </div>
          <div class="compare-section cons">
            <div class="compare-section-title">Limitations</div>
            <ul class="compare-list">
              ${c.pro.cons.map(c => `<li><strong>${c.title}</strong><span>${c.desc}</span></li>`).join('')}
            </ul>
          </div>
          <div class="compare-bestfor">
            <div class="compare-bestfor-title">Best For</div>
            <ul>${c.pro.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="sensor-compare">
        <h3>The Physics Gap: Sensor Size</h3>
        <p class="lead">A flagship phone sensor (1/1.28", about 9.8 × 7.3 mm) is roughly <strong style="color:var(--accent)">12× smaller by area</strong> than a full-frame sensor (36 × 24 mm). Each full-frame pixel collects about <strong style="color:var(--accent)">18× more light</strong> than a phone pixel.</p>
        <div class="sensor-visual">
          <div class="sensor-block phone">
            <div class="sensor-svg">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="35" y="40" width="30" height="20" fill="#3b82f6" opacity="0.8" rx="2" />
                <text x="50" y="55" text-anchor="middle" font-family="JetBrains Mono" font-size="6" fill="white" font-weight="600">PHONE</text>
                <text x="50" y="95" text-anchor="middle" font-family="JetBrains Mono" font-size="5" fill="#3b82f6">1/1.28"</text>
              </svg>
            </div>
            <h4 style="margin-top:16px">Phone (iPhone 16 Pro)</h4>
            <div class="sensor-stat" style="margin-top:4px"><strong>~1.22 µm</strong> pixel pitch</div>
            <div class="sensor-stat">~71 mm² sensor area</div>
          </div>
          <div class="sensor-block pro">
            <div class="sensor-svg">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="20" y="20" width="60" height="40" fill="#ff3b30" opacity="0.8" rx="2" />
                <text x="50" y="44" text-anchor="middle" font-family="JetBrains Mono" font-size="6" fill="white" font-weight="600">FULL-FRAME</text>
                <text x="50" y="95" text-anchor="middle" font-family="JetBrains Mono" font-size="5" fill="#ff3b30">36 × 24 mm</text>
              </svg>
            </div>
            <h4 style="margin-top:16px">Mirrorless (Sony A7 IV)</h4>
            <div class="sensor-stat" style="margin-top:4px"><strong>~5.12 µm</strong> pixel pitch</div>
            <div class="sensor-stat">~864 mm² sensor area</div>
          </div>
        </div>
        <div class="sensor-fact">
          <strong>The bottom line:</strong> Larger pixels are larger "buckets" for light. A 4-9 µm pixel pitch is the sweet spot for noise, detail, and dynamic range — full-frame sensors sit comfortably in this range, while phones rely on computational tricks to compensate. No amount of computational photography fully overcomes the 18× light-gathering disadvantage. <em>(Source: DXOMARK, IEEE computational photography research, 2024-2025.)</em>
        </div>
      </div>

      <h3 style="font-size:clamp(28px, 3.5vw, 40px); font-weight:500; letter-spacing:-0.02em; margin-bottom:8px; margin-top:60px">Decision Guide: When to Use Which</h3>
      <p style="color:var(--text-2); font-size:16px; max-width:720px; line-height:1.55; margin-bottom:32px">Seven real scenarios. The right tool for each one, and the reasoning behind the choice.</p>
      <div class="decision-grid">
        ${c.decisionGuide.map(d => `
          <div class="decision-card">
            <div class="decision-scenario">${d.scenario}</div>
            <span class="decision-pick ${d.choice.toLowerCase().includes('camera') || d.choice === 'Camera' ? 'pro' : 'phone'}">${d.choice}</span>
            <p class="decision-why">${d.why}</p>
          </div>
        `).join('')}
      </div>

      <h3 style="font-size:clamp(28px, 3.5vw, 40px); font-weight:500; letter-spacing:-0.02em; margin-bottom:8px; margin-top:60px">Common Myths, Busted</h3>
      <p style="color:var(--text-2); font-size:16px; max-width:720px; line-height:1.55; margin-bottom:32px">The photography internet is full of half-truths. Here are four that need correcting.</p>
      <div class="myths-grid">
        ${c.commonMyths.map(m => `
          <div class="myth-card">
            <span class="myth-label">The Myth</span>
            <p class="myth-text">${m.myth}</p>
            <span class="truth-label">The Truth</span>
            <p class="truth-text">${m.truth}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // -------- Tips section mount --------
  function mountTips() {
    const host = document.getElementById('tips-host');
    if (!host || typeof window.TIPS === 'undefined') return;

    const tabsHtml = `
      <div class="tips-tabs" role="tablist">
        ${window.TIPS.map((t, i) => `
          <button class="tips-tab ${i === 0 ? 'active' : ''}" data-tab="${i}" role="tab">
            <span class="tips-tab-icon">${t.icon}</span>${t.category}
          </button>
        `).join('')}
      </div>
      <div data-tips-content></div>
    `;

    host.innerHTML = tabsHtml;

    function renderCategory(i) {
      const t = window.TIPS[i];
      return `
        <div class="tips-category-desc">${t.description}</div>
        <div class="tips-grid-2">
          ${t.items.map(item => `
            <div class="tip-block">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    const contentEl = host.querySelector('[data-tips-content]');
    contentEl.innerHTML = renderCategory(0);

    host.querySelectorAll('.tips-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        host.querySelectorAll('.tips-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const i = parseInt(tab.getAttribute('data-tab'), 10);
        contentEl.innerHTML = renderCategory(i);
        contentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  // -------- Mount all --------
  function mount() {
    mountProjects();
    mountCompare();
    mountTips();
  }

  if (typeof window.PROJECTS === 'undefined' || typeof window.COMPARISON === 'undefined' || typeof window.TIPS === 'undefined') {
    const wait = () => {
      if (typeof window.PROJECTS === 'undefined' || typeof window.COMPARISON === 'undefined' || typeof window.TIPS === 'undefined') {
        setTimeout(wait, 30);
        return;
      }
      mount();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wait);
    } else {
      wait();
    }
    return;
  }
  mount();
})();
