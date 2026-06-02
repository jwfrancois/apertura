// ====================================================================
// Apertura — Career Paths
// 12 distinct photography career paths
// ====================================================================

const CAREERS = [
  {
    title: 'Wedding & Event Photographer',
    tagline: 'Document one of the most important days of someone\'s life. High-pressure, high-reward, and deeply human.',
    icon: 'camera',
    income: '$50K - $250K+',
    stability: '★★★☆☆',
    startCost: 'Medium',
    demand: 'Stable',
    skills: ['People skills', 'Fast reflexes', 'Lighting', 'Taste'],
    topSkills: ['Client management', 'Tethered shooting', 'Backup workflows', 'Album design'],
    pioneers: ['Joe Buissink', 'Jerry Ghionis', 'Sammy Goh'],
  },
  {
    title: 'Portrait Photographer',
    tagline: 'Capture people — their character, their essence, the moment they become themselves. Studio or environmental.',
    icon: 'user',
    income: '$40K - $150K',
    stability: '★★★★☆',
    startCost: 'Low-Medium',
    demand: 'Steady',
    skills: ['Direction', 'Light', 'Patience', 'Empathy'],
    topSkills: ['Posing', 'Expression', 'Retouching', 'Studio setup'],
    pioneers: ['Annie Leibovitz', 'Peter Hurley', 'Yousuf Karsh'],
  },
  {
    title: 'Photojournalist',
    tagline: 'Bear witness to the events that shape our world. The most ethically demanding, historically important form of the craft.',
    icon: 'newspaper',
    income: '$35K - $120K',
    stability: '★★☆☆☆',
    startCost: 'High (gear + insurance + travel)',
    demand: 'Declining (print), Growing (digital)',
    skills: ['Anticipation', 'Ethics', 'Speed', 'Storytelling'],
    topSkills: ['Access', 'Trust-building', 'Caption writing', 'Filing on deadline'],
    pioneers: ['Sebastião Salgado', 'James Nachtwey', 'Lynsey Addario'],
  },
  {
    title: 'Fine Art Photographer',
    tagline: 'Make photographs as art — for galleries, museums, collectors, and yourself. The slowest path, often the deepest.',
    icon: 'palette',
    income: '$0 - $1M+ (highly variable)',
    stability: '★☆☆☆☆',
    startCost: 'Low',
    demand: 'Niche but real',
    skills: ['Vision', 'Patience', 'Sequencing', 'Writing'],
    topSkills: ['Artist statement', 'Print making', 'Studio practice', 'Self-direction'],
    pioneers: ['Sally Mann', 'Gregory Crewdson', 'Wolfgang Tillmans'],
  },
  {
    title: 'Commercial / Advertising Photographer',
    tagline: 'Make photographs that sell things. The highest-paying, most creatively constrained form of the craft.',
    icon: 'briefcase',
    income: '$75K - $500K+',
    stability: '★★★★☆',
    startCost: 'Very High (studio + assistants + gear)',
    demand: 'Growing (digital + social)',
    skills: ['Concept', 'Direction', 'Art direction', 'Production'],
    topSkills: ['Bidding', 'Estimating', 'Production management', 'Retouching supervision'],
    pioneers: ['Annie Leibovitz', 'David LaChapelle', 'Tim Walker'],
  },
  {
    title: 'Fashion Photographer',
    tagline: 'Tell stories through clothing and the people who wear them. High-fashion runway, editorial, or streetwear.',
    icon: 'shirt',
    income: '$50K - $1M+ (top tier)',
    stability: '★★★☆☆',
    startCost: 'High',
    demand: 'Steady',
    skills: ['Style', 'Direction', 'Collaboration', 'Movement'],
    topSkills: ['Editorial sequencing', 'Model direction', 'Studio + location', 'Beauty retouching'],
    pioneers: ['Richard Avedon', 'Mario Testino', 'Annie Leibovitz', 'Tim Walker'],
  },
  {
    title: 'Landscape & Nature Photographer',
    tagline: 'Capture the natural world — the patience of waiting for light, the discipline of returning to the same place.',
    icon: 'mountain',
    income: '$30K - $200K',
    stability: '★★★☆☆',
    startCost: 'High (travel + gear + prints)',
    demand: 'Stable (fine art + stock + tours)',
    skills: ['Patience', 'Light', 'Planning', 'Weather knowledge'],
    topSkills: ['Location scouting', 'Long exposure', 'Print sales', 'Workshop leading'],
    pioneers: ['Ansel Adams', 'Galen Rowell', 'Thomas Heaton', 'Mads Peter Iversen'],
  },
  {
    title: 'Photo Editor / Curator',
    tagline: 'Shape the visual stories of magazines, agencies, and museums. The person who decides which photographs the world sees.',
    icon: 'layers',
    income: '$55K - $150K',
    stability: '★★★★☆',
    startCost: 'Low',
    demand: 'Steady',
    skills: ['Taste', 'Storytelling', 'Communication', 'Workflow'],
    topSkills: ['Selection', 'Sequencing', 'Caption writing', 'Working with photographers'],
    pioneers: ['Leslie Martin', 'Whitney Johnson', 'Mei-Lin Naitoh'],
  },
  {
    title: 'Photo Educator / Workshop Leader',
    tagline: 'Teach the next generation. Workshops, online courses, YouTube channels, university positions.',
    icon: 'teach',
    income: '$40K - $300K+ (highly variable)',
    stability: '★★★☆☆',
    startCost: 'Low',
    demand: 'Growing',
    skills: ['Communication', 'Empathy', 'Demo ability', 'Writing'],
    topSkills: ['Curriculum design', 'Public speaking', 'Critique delivery', 'Online production'],
    pioneers: ['Mark Wallace', 'Sean Tucker', 'Tony Northrup', 'Ted Forbes'],
  },
  {
    title: 'Photojournalist for Editorial / Magazine',
    tagline: 'Tell the long-form visual story. Travel, work on assignment, build intimate access to subjects over time.',
    icon: 'magazine',
    income: '$45K - $150K',
    stability: '★★☆☆☆',
    startCost: 'Medium-High',
    demand: 'Declining (print), Stable (digital)',
    skills: ['Access', 'Storytelling', 'Sequencing', 'Patience'],
    topSkills: ['Pitching', 'Long-form sequencing', 'On-location work', 'Working with editors'],
    pioneers: ['Steve McCurry', 'Mary Ellen Mark', 'Paul Fusco'],
  },
  {
    title: 'Aerial / Drone Photographer',
    tagline: 'See the world from above. Real estate, surveying, landscape, event coverage — a rapidly growing field.',
    icon: 'drone',
    income: '$45K - $200K+',
    stability: '★★★★☆',
    startCost: 'Medium (drone + license + insurance)',
    demand: 'Growing fast',
    skills: ['Spatial thinking', 'Aviation knowledge', 'Composition', 'Safety'],
    topSkills: ['FAA Part 107', 'Post-production', 'Weather reading', 'Composition for height'],
    pioneers: ['Dirk Dallas', 'Mike Kelley', 'Ryan "Dronemaven" Goren'],
  },
  {
    title: 'Stock & Licensing Photographer',
    tagline: 'Build a library of commercially-licensed images. Passive income from a large body of work. Hard to break in, hard to leave.',
    icon: 'library',
    income: '$20K - $500K+ (highly variable)',
    stability: '★★★☆☆',
    startCost: 'Low',
    demand: 'Stable',
    skills: ['Volume', 'Keyword research', 'Commercial thinking', 'Consistency'],
    topSkills: ['Metadata', 'Market research', 'High-volume shooting', 'Legal knowledge'],
    pioneers: ['Tony Stone', 'Getty Images staff', 'Westend61'],
  },
];

const ICONS = {
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  newspaper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
  mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  teach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
  magazine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
  drone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v.01M3 8l3 3M21 8l-3 3M3 16l3-3M21 16l-3-3M8 3l3 3M16 3l-3 3M8 21l3-3M16 21l-3-3"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14M12 6v14M8 8v12M4 4v16"/></svg>',
};

(function () {
  const mount = document.getElementById('careersMount');
  if (!mount) return;
  mount.innerHTML = CAREERS.map(c => `
    <article class="career-card">
      <div class="career-icon">${ICONS[c.icon] || ''}</div>
      <h3>${c.title}</h3>
      <p class="career-tagline">${c.tagline}</p>
      <div class="career-meta">
        <div class="career-meta-item">
          <div class="career-meta-k">Income Range</div>
          <div class="career-meta-v">${c.income}</div>
        </div>
        <div class="career-meta-item">
          <div class="career-meta-k">Start Cost</div>
          <div class="career-meta-v">${c.startCost}</div>
        </div>
        <div class="career-meta-item">
          <div class="career-meta-k">Stability</div>
          <div class="career-meta-v">${c.stability}</div>
        </div>
        <div class="career-meta-item">
          <div class="career-meta-k">Market Demand</div>
          <div class="career-meta-v">${c.demand}</div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div class="career-meta-k" style="margin-bottom:8px">Core Skills</div>
        <div class="career-skills">
          ${c.skills.map(s => `<span class="career-skill">${s}</span>`).join('')}
        </div>
      </div>
      <div>
        <div class="career-meta-k" style="margin-bottom:8px">Notable Photographers</div>
        <div style="font-size:13px; color:var(--text-2); line-height:1.5">${c.pioneers.join(' · ')}</div>
      </div>
    </article>
  `).join('');
})();
