// ====================================================================
// Apertura — Skill Assessment Quiz
// 10 questions → personalized curriculum recommendation
// ====================================================================

const QUESTIONS = [
  {
    id: 'q1',
    category: 'experience',
    text: 'How long have you been seriously pursuing photography?',
    options: [
      { label: "I'm just starting — less than 6 months", score: 1, weight: 1 },
      { label: '6 months to 1 year', score: 2, weight: 1 },
      { label: '1-3 years', score: 3, weight: 1 },
      { label: '3+ years', score: 4, weight: 1 },
    ],
  },
  {
    id: 'q2',
    category: 'gear',
    text: 'What camera do you primarily shoot with today?',
    options: [
      { label: 'Just my phone', score: 1, weight: 0.5 },
      { label: 'A phone + a basic camera (point-and-shoot or entry DSLR/mirrorless)', score: 2, weight: 0.5 },
      { label: 'A dedicated mirrorless or DSLR', score: 3, weight: 0.5 },
      { label: 'A professional full-frame system with multiple lenses', score: 4, weight: 0.5 },
    ],
  },
  {
    id: 'q3',
    category: 'modes',
    text: 'When you shoot, which mode do you usually use?',
    options: [
      { label: 'Full auto — the camera does everything', score: 1, weight: 1.2 },
      { label: 'Scene modes (portrait, landscape, night)', score: 2, weight: 1.2 },
      { label: 'Aperture priority or shutter priority', score: 3, weight: 1.2 },
      { label: 'Full manual — I set ISO, aperture, and shutter myself', score: 4, weight: 1.2 },
    ],
  },
  {
    id: 'q4',
    category: 'concepts',
    text: 'Which of these concepts can you confidently explain to a friend?',
    options: [
      { label: 'None of them', score: 1, weight: 0.8 },
      { label: 'Just the exposure triangle (ISO, aperture, shutter)', score: 2, weight: 0.8 },
      { label: 'The exposure triangle + composition basics', score: 3, weight: 0.8 },
      { label: 'All of them — exposure, depth of field, and white balance', score: 4, weight: 0.8 },
    ],
  },
  {
    id: 'q5',
    category: 'editing',
    text: 'How do you handle post-processing?',
    options: [
      { label: "I don't edit — I just share the photos as they are", score: 1, weight: 0.6 },
      { label: 'Built-in filters on my phone', score: 2, weight: 0.6 },
      { label: 'Lightroom or Snapseed, mostly presets', score: 3, weight: 0.6 },
      { label: 'Lightroom + Photoshop with full RAW workflow', score: 4, weight: 0.6 },
    ],
  },
  {
    id: 'q6',
    category: 'genre',
    text: 'Which genre of photography excites you most?',
    options: [
      { label: 'Portrait, street, or everyday life', score: 1, weight: 0.4 },
      { label: 'Landscape, travel, or nature', score: 1, weight: 0.4 },
      { label: 'Multiple genres — I want to explore', score: 1, weight: 0.4 },
      { label: 'Documentary, fine art, or commercial work', score: 1, weight: 0.4 },
    ],
  },
  {
    id: 'q7',
    category: 'goals',
    text: 'What is your primary goal?',
    options: [
      { label: 'Take better photos of my everyday life', score: 1, weight: 0.7 },
      { label: 'Build a serious hobby and develop a personal style', score: 2, weight: 0.7 },
      { label: 'Build a portfolio and start getting paid work', score: 3, weight: 0.7 },
      { label: 'Build or grow a professional photography business', score: 4, weight: 0.7 },
    ],
  },
  {
    id: 'q8',
    category: 'practice',
    text: 'How often do you pick up a camera?',
    options: [
      { label: 'A few times a month, when something catches my eye', score: 1, weight: 0.9 },
      { label: 'Weekly, intentionally', score: 2, weight: 0.9 },
      { label: 'Most days, often with intention', score: 3, weight: 0.9 },
      { label: 'Daily — photography is part of how I see the world', score: 4, weight: 0.9 },
    ],
  },
  {
    id: 'q9',
    category: 'projects',
    text: 'Have you ever completed a long-form photography project (30+ days, a body of work, a series)?',
    options: [
      { label: "No — I've never committed to a single project", score: 1, weight: 0.7 },
      { label: "I've started projects but haven't finished one", score: 2, weight: 0.7 },
      { label: "Yes — one or two completed projects", score: 3, weight: 0.7 },
      { label: "Yes — multiple completed projects I can show", score: 4, weight: 0.7 },
    ],
  },
  {
    id: 'q10',
    category: 'voice',
    text: 'When you look at your last 100 photos, do you see a recognizable style emerging?',
    options: [
      { label: "No — they're a mix of different subjects and looks", score: 1, weight: 0.6 },
      { label: "Starting to see a few patterns", score: 2, weight: 0.6 },
      { label: "Yes — a clear preference for certain subjects and light", score: 3, weight: 0.6 },
      { label: "Yes — a recognizable voice others can identify", score: 4, weight: 0.6 },
    ],
  },
];

// Recommendation tiers
function getRecommendation(score) {
  // Score is weighted total, max ~32.5
  if (score <= 12) {
    return {
      level: 1,
      levelName: 'Foundation',
      color: '#22c55e',
      title: 'Start at Level 1: Foundation',
      summary: 'You\'re at the beginning of a great journey. The Foundation level will establish the technical and creative fundamentals that every photographer needs — exposure, composition, light, and the discipline of returning to the camera.',
      nextLessons: [
        { num: 'L1.01', title: 'Camera Anatomy', desc: 'Get fluent with your tool so the technical disappears' },
        { num: 'L1.03', title: 'Composition', desc: 'Learn the visual grammar that turns a snapshot into a photograph' },
        { num: 'L1.04', title: 'Light', desc: 'The single most important variable in photography' },
        { num: 'L1.08', title: 'Photo Walk', desc: 'Tie it all together in the field' },
      ],
      projects: ['30-Day Photography Challenge', 'Photo Walk Bingo', 'Color of the Week'],
      timeToLevelUp: '3-4 months of consistent practice',
    };
  } else if (score <= 18) {
    return {
      level: 2,
      levelName: 'Intermediate',
      color: '#3b82f6',
      title: 'Start at Level 2: Intermediate',
      summary: 'You have the basics. Now it\'s time to build genre skills, develop a personal style, and move from "I take photos" to "I make photographs." The Intermediate level focuses on technical depth and creative voice.',
      nextLessons: [
        { num: 'L2.01', title: 'Advanced Lighting', desc: 'Shape light with strobes and modifiers' },
        { num: 'L2.02', title: 'Color Theory for Photographers', desc: 'Use color deliberately' },
        { num: 'L2.04', title: 'Landscape Techniques', desc: 'Master the genre of patience' },
        { num: 'L2.07', title: 'Visual Storytelling', desc: 'Make photographs that read as narrative' },
      ],
      projects: ['100 Strangers', 'One Location, Twelve Months', 'Local Business Portraits'],
      timeToLevelUp: '4-5 months',
    };
  } else if (score <= 24) {
    return {
      level: 3,
      levelName: 'Advanced',
      color: '#a855f7',
      title: 'Start at Level 3: Advanced',
      summary: 'You have strong technical and creative skills. The Advanced level focuses on long-form projects, developing your distinctive voice, and producing work that stands as a portfolio. This is where photographers become artists.',
      nextLessons: [
        { num: 'L3.01', title: 'Long-Form Projects', desc: 'A single shoot makes a portfolio piece; a project makes a body of work' },
        { num: 'L3.02', title: 'Developing Voice', desc: 'Find what you can\'t help photographing' },
        { num: 'L3.05', title: 'Exhibition & Print', desc: 'A photograph isn\'t finished until it\'s printed' },
      ],
      projects: ['Long-Form Documentary Project', 'A Year in One Place', 'Reinterpret a Master'],
      timeToLevelUp: '5-6 months of deep work',
    };
  } else {
    return {
      level: 4,
      levelName: 'Professional',
      color: '#ff3b30',
      title: 'Start at Level 4: Professional',
      summary: 'You have the craft. Now build the practice. The Professional level focuses on the operational, business, and publication skills that turn a working photographer into a sustainable career. Pricing, licensing, client work, exhibitions, books.',
      nextLessons: [
        { num: 'L4.01', title: 'Building a Practice', desc: 'The structure that turns creative work into a career' },
        { num: 'L4.02', title: 'Pricing & Licensing', desc: 'Stop discounting your work into nothing' },
        { num: 'L4.04', title: 'Portfolio Curation', desc: '12 images that argue for the work you want next' },
        { num: 'L4.07', title: 'The Mentorship Role', desc: 'Teaching deepens your own practice' },
      ],
      projects: ['Solo Exhibition', 'Self-Published Photo Book', 'Grant Application for Project Funding'],
      timeToLevelUp: 'Ongoing — a continuous practice',
    };
  }
}

function renderIntro() {
  return `
    <div class="quiz-intro">
      <h2 style="font-size:32px; font-weight:500; margin-bottom:16px; letter-spacing:-0.01em">Ready to find your level?</h2>
      <p style="color:var(--text-2); font-size:16px; line-height:1.6; margin-bottom:32px">10 questions. About 5 minutes. Honest answers give the best recommendations. There are no wrong answers — just a clearer sense of where you are.</p>
      <div class="quiz-meta">
        <div class="quiz-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>~5 minutes</span>
        </div>
        <div class="quiz-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4M12 3v12M8 7l4-4 4 4"/></svg>
          <span>10 questions</span>
        </div>
        <div class="quiz-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <span>Personalized result</span>
        </div>
      </div>
      <button class="btn btn-primary" id="startQuiz" style="margin-top:32px; padding:16px 32px; font-size:15px">Begin Assessment →</button>
    </div>
  `;
}

function renderQuestion(q, idx, total) {
  const progress = (idx / total) * 100;
  return `
    <div class="quiz-card">
      <div class="quiz-progress">
        <div class="quiz-progress-text">Question ${idx + 1} of ${total}</div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      </div>
      <h2 class="quiz-question">${q.text}</h2>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-score="${opt.score}" data-weight="${opt.weight}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
            <span class="quiz-option-label">${opt.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderResult(score, rec) {
  return `
    <div class="quiz-result">
      <div class="result-tier" style="--tier-color:${rec.color}">
        <div class="result-eyebrow">Your Recommended Starting Point</div>
        <h2 class="result-title">${rec.title}</h2>
        <p class="result-summary">${rec.summary}</p>
      </div>

      <div class="result-section">
        <h3 class="result-section-title">Start with these lessons</h3>
        <div class="result-lessons">
          ${rec.nextLessons.map(l => `
            <a href="curriculum.html#${l.num.toLowerCase().replace('.', '-')}" class="result-lesson">
              <span class="result-lesson-num">${l.num}</span>
              <div>
                <div class="result-lesson-title">${l.title}</div>
                <div class="result-lesson-desc">${l.desc}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <div class="result-section">
        <h3 class="result-section-title">Projects that fit this level</h3>
        <div class="result-projects">
          ${rec.projects.map(p => `<span class="result-project-chip">${p}</span>`).join('')}
        </div>
        <a href="resources.html" class="ai-card-link" style="margin-top:16px">Browse all 32 projects →</a>
      </div>

      <div class="result-section">
        <h3 class="result-section-title">Time to level up</h3>
        <p style="color:var(--text); font-size:18px; line-height:1.5; margin:0">${rec.timeToLevelUp}</p>
      </div>

      <div class="result-actions">
        <a href="curriculum.html" class="btn btn-primary" style="padding:16px 32px; font-size:15px">Open Level ${rec.level} →</a>
        <button class="btn btn-ghost" id="retakeQuiz" style="padding:16px 32px; font-size:15px">Retake Assessment</button>
      </div>
    </div>
  `;
}

// Quiz state
const state = {
  current: 0,
  answers: [],
};

function startQuiz() {
  state.current = 0;
  state.answers = [];
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const mount = document.getElementById('quiz-mount');
  if (state.current < QUESTIONS.length) {
    mount.innerHTML = renderQuestion(QUESTIONS[state.current], state.current, QUESTIONS.length);
    // Wire option clicks
    mount.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const score = parseInt(btn.getAttribute('data-score'), 10);
        const weight = parseFloat(btn.getAttribute('data-weight'));
        state.answers.push({ score, weight });
        state.current++;
        // Animate transition
        const card = mount.querySelector('.quiz-card');
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
        }
        setTimeout(renderCurrentQuestion, 200);
      });
    });
  } else {
    // Calculate score
    const totalScore = state.answers.reduce((sum, a) => sum + (a.score * a.weight), 0);
    const rec = getRecommendation(totalScore);
    // Persist to user profile if signed in
    (async () => {
      if (window.UserStore) {
        const u = await window.UserStore.currentUser();
        if (u) {
          try {
            await window.UserStore.setAssessmentResult(u.id, {
              score: Math.round(totalScore * 10) / 10,
              recommendedLevel: rec.level,
              levelName: rec.levelName,
              takenAt: Date.now(),
            });
          } catch (e) { /* silent */ }
        }
      }
    })();
    mount.innerHTML = renderResult(totalScore, rec);
    // If user is anonymous, show a sign-in nudge
    (async () => {
      if (window.UserStore) {
        const u = await window.UserStore.currentUser();
        if (!u) {
          const actions = mount.querySelector('.result-actions');
          if (actions) {
            const nudge = document.createElement('p');
            nudge.style.cssText = 'margin-top:24px; font-size:13px; color:#888; font-family:"JetBrains Mono", monospace;';
            nudge.innerHTML = '<a href="register.html" style="color:#FF3B30;">Create a free account</a> to save this recommendation to your profile.';
            actions.appendChild(nudge);
          }
        }
      }
    })();
    document.getElementById('retakeQuiz')?.addEventListener('click', () => {
      mount.innerHTML = renderIntro();
      document.getElementById('startQuiz').addEventListener('click', startQuiz);
      mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function init() {
  const mount = document.getElementById('quiz-mount');
  if (!mount) return;
  mount.innerHTML = renderIntro();
  document.getElementById('startQuiz').addEventListener('click', startQuiz);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
