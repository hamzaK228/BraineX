/**
 * Projects Page Logic
 * Handles rendering, filtering, and GitHub-style interactions.
 */

(function () {
  'use strict';

  // State
  let allProjects = [];
  let filteredProjects = [];
  let starredProjects = new Set();
  let userSkills = ['React', 'JavaScript', 'Python']; // Mock user skills

  // Elements
  const elements = {
    grid: document.getElementById('projectGrid'),
    emptyState: document.getElementById('emptyState'),
    projectCount: document.getElementById('projectCount'),

    // Filters
    techSearch: document.getElementById('techSearch'),
    techStackPills: document.getElementById('techStackPills'),
    diffCheckboxes: document.querySelectorAll('input[name="difficulty"]'),
    roleCheckboxes: document.querySelectorAll('input[name="role"]'),
    remoteToggle: document.getElementById('remoteToggle'),
    clearBtn: document.getElementById('clearFilters'),

    // Controls
    sortSelect: document.getElementById('sortSelect'),
    myProjectsToggle: document.getElementById('myProjectsToggle'),
    catPills: document.querySelectorAll('.cat-pill'),

    // Sidebars
    trendingCarousel: document.getElementById('trendingCarousel'),
    quickMatchList: document.getElementById('quickMatchList'),

    // Stats
    activeProjects: document.getElementById('activeProjects'),
    openPositions: document.getElementById('openPositions'),
    collaborators: document.getElementById('collaborators')
  };

  // --- Initialization ---
  async function init() {
    // Load saved stars
    const saved = localStorage.getItem('brainex_projects_starred');
    if (saved) {
      try { JSON.parse(saved).forEach(id => starredProjects.add(String(id))); } catch (e) { }
    }

    // Fetch
    allProjects = getMockProjects();
    filteredProjects = [...allProjects];

    // Render Initial
    renderTechPills(); // Common tech stacks
    calculateStats();
    renderTrending();
    renderQuickMatch();
    applyFilters();

    // Events
    setupListeners();
  }

  // --- Mock Data ---
  function getMockProjects() {
    return [
      {
        id: 'p1',
        title: 'AI-Powered Study Assistant',
        description: 'Building a VS Code extension that uses LLMs to explain code snippets and generate unit tests automatically. Looking for frontend devs to refine the UI.',
        creator: { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?u=a', role: 'Lead Dev' },
        difficulty: 'advanced', // beginner, intermediate, advanced
        tech: ['TypeScript', 'React', 'Python', 'OpenAI'],
        team: [
          { avatar: 'https://i.pravatar.cc/150?u=b' },
          { avatar: 'https://i.pravatar.cc/150?u=c' }
        ],
        openRoles: ['frontend', 'design'],
        stats: { stars: 124, forks: 12, active: 'High' },
        timeline: '3 months',
        commitment: '10h/week',
        tags: ['ai', 'web'],
        remote: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'p2',
        title: 'EcoTrack: Carbon Footprint Monitor',
        description: 'Mobile app to track personal carbon footprint using bank transaction data. We need data scientists to help model the emission factors.',
        creator: { name: 'Maria Rodriguez', avatar: 'https://i.pravatar.cc/150?u=d', role: 'Product' },
        difficulty: 'intermediate',
        tech: ['Flutter', 'Firebase', 'Python'],
        team: [
          { avatar: 'https://i.pravatar.cc/150?u=e' }
        ],
        openRoles: ['backend', 'data'],
        stats: { stars: 89, forks: 5, active: 'Medium' },
        timeline: '6 months',
        commitment: '5h/week',
        tags: ['mobile', 'data'],
        remote: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'p3',
        title: 'Campus Event Ledger',
        description: 'A decentralized ledger for campus events and ticketing to prevent scalping. Beginner friendly blockchain project.',
        creator: { name: 'James Smith', avatar: 'https://i.pravatar.cc/150?u=f', role: 'Blockchain Dev' },
        difficulty: 'beginner',
        tech: ['Solidity', 'React', 'Web3.js'],
        team: [],
        openRoles: ['frontend', 'backend', 'design'],
        stats: { stars: 45, forks: 2, active: 'Low' },
        timeline: '2 months',
        commitment: '5h/week',
        tags: ['web', 'iot'],
        remote: false,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'p4',
        title: 'Neuromorphic Chip Simulation',
        description: 'Simulating spiking neural networks for edge computing applications. Research heavy project.',
        creator: { name: 'Dr. Emily Wu', avatar: 'https://i.pravatar.cc/150?u=g', role: 'Researcher' },
        difficulty: 'advanced',
        tech: ['C++', 'Python', 'PyTorch'],
        team: [
          { avatar: 'https://i.pravatar.cc/150?u=h' },
          { avatar: 'https://i.pravatar.cc/150?u=i' },
          { avatar: 'https://i.pravatar.cc/150?u=j' }
        ],
        openRoles: ['data'],
        stats: { stars: 210, forks: 45, active: 'High' },
        timeline: '1 year',
        commitment: '15h/week',
        tags: ['ai', 'data'],
        remote: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }

  // --- Rendering ---
  function renderGrid() {
    if (filteredProjects.length === 0) {
      elements.grid.style.display = 'none';
      elements.emptyState.style.display = 'block';
      elements.projectCount.textContent = 0;
      return;
    }

    elements.grid.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.projectCount.textContent = filteredProjects.length;

    elements.grid.innerHTML = filteredProjects.map(p => createCard(p)).join('');

    // Attach Star Events
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStar(btn.dataset.id);
      });
    });
  }

  function createCard(p) {
    const isStarred = starredProjects.has(p.id);

    // Difficulty Badge
    let diffClass = '';
    let diffStars = '';
    if (p.difficulty === 'beginner') { diffClass = 'diff-beginner'; diffStars = '⭐'; }
    if (p.difficulty === 'intermediate') { diffClass = 'diff-intermediate'; diffStars = '⭐⭐'; }
    if (p.difficulty === 'advanced') { diffClass = 'diff-advanced'; diffStars = '⭐⭐⭐'; }

    // Open Roles
    const roleText = p.openRoles.length > 0
      ? `Looking for: <strong>${p.openRoles.join(', ')}</strong>`
      : 'Team Full';

    // Tech Icons (using font awesome or placeholders based on name)
    const techIcons = p.tech.map(t => {
      let icon = 'fas fa-code';
      const lower = t.toLowerCase();
      if (lower.includes('react')) icon = 'fab fa-react';
      else if (lower.includes('python')) icon = 'fab fa-python';
      else if (lower.includes('js') || lower.includes('javascript')) icon = 'fab fa-js';
      else if (lower.includes('node')) icon = 'fab fa-node';
      else if (lower.includes('android')) icon = 'fab fa-android';
      else if (lower.includes('apple') || lower.includes('swift')) icon = 'fab fa-apple';
      return `<i class="${icon}" title="${t}" style="font-size:1.2rem; color:var(--text-secondary);"></i>`;
    }).join('');

    // Team Avatars
    const teamHtml = p.team.map(m => `<img src="${m.avatar}">`).join('') +
      (p.openRoles.length > 0 ? `<div class="open-role" title="Open Position">+${p.openRoles.length}</div>` : '');

    return `
        <div class="p-card">
            <div class="difficulty-badge ${diffClass}">${p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}</div>
            
            <div class="p-header">
                <div class="creator-info">
                    <img src="${p.creator.avatar}" class="creator-avatar">
                    <div class="creator-details">
                        <h4>${p.creator.name}</h4>
                        <span>${p.creator.role}</span>
                    </div>
                </div>
                <button class="star-btn ${isStarred ? 'active' : ''}" data-id="${p.id}">
                    <i class="${isStarred ? 'fas' : 'far'} fa-star"></i> ${p.stats.stars}
                </button>
            </div>

            <div class="p-body">
                <h3>${p.title}</h3>
                <p class="p-desc">${p.description}</p>
                
                <div class="tech-row">
                    ${techIcons}
                </div>

                ${p.openRoles.length > 0 ? `
                <div class="role-banner">
                    <i class="fas fa-search-dollar"></i> ${roleText}
                </div>` : ''}

                <div class="team-section">
                    <span class="team-label">Team & Availability</span>
                    <div class="avatars">
                        ${teamHtml}
                        <span style="font-size:0.8rem; margin-left:auto; color:var(--text-secondary);">
                            <i class="far fa-clock"></i> ${p.commitment}
                        </span>
                    </div>
                </div>
            </div>

            <div class="p-footer">
                <div class="p-stats">
                    <span class="p-stat" title="Forks"><i class="fas fa-code-branch"></i> ${p.stats.forks}</span>
                    <span class="p-stat" title="Timeline"><i class="far fa-calendar-alt"></i> ${p.timeline}</span>
                </div>
                <button class="btn-join" onclick="alert('Joining ${p.title}...')">Details &rarr;</button>
            </div>
        </div>
      `;
  }

  // --- Logic ---
  function calculateStats() {
    elements.activeProjects.textContent = allProjects.length;
    const roles = allProjects.reduce((acc, p) => acc + p.openRoles.length, 0);
    elements.openPositions.textContent = roles;
    const collabs = allProjects.reduce((acc, p) => acc + p.team.length + 1, 0); // +1 creator
    elements.collaborators.textContent = collabs;
  }

  function renderTechPills() {
    const stacks = ['React', 'Python', 'Node', 'Flutter', 'AI', 'Web3'];
    elements.techStackPills.innerHTML = stacks.map(s => `
         <span class="tech-pill" onclick="this.classList.toggle('active'); window.applyProjectFilters();">${s}</span>
      `).join('');
  }

  function renderTrending() {
    // Just take top 3 sorted by stars
    const trending = [...allProjects].sort((a, b) => b.stats.stars - a.stats.stars).slice(0, 3);
    elements.trendingCarousel.innerHTML = trending.map(p => `
        <div class="trending-card">
            <h5 style="margin:0 0 0.5rem; font-size:1rem;">${p.title}</h5>
            <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; gap:0.5rem;">
                <span>⭐ ${p.stats.stars}</span>
                <span>🔥 Trending</span>
            </div>
        </div>
      `).join('');
  }

  function renderQuickMatch() {
    // Find projects matching skills
    const matches = allProjects.filter(p =>
      p.tech.some(t => userSkills.includes(t))
    );

    if (matches.length === 0) {
      elements.quickMatchList.innerHTML = '<div class="empty-app">Update your skills to see matches.</div>';
      return;
    }

    elements.quickMatchList.innerHTML = matches.slice(0, 3).map(p => `
         <div class="quick-item">
             <div style="width:30px; height:30px; background:#e2e8f0; border-radius:6px; display:flex;align-items:center;justify-content:center;">🚀</div>
             <div style="flex:1;">
                 <strong style="display:block; font-size:0.9rem;">${p.title}</strong>
                 <span style="font-size:0.75rem; color:var(--text-secondary);">${p.openRoles[0] || 'Contributor'}</span>
             </div>
             <div class="match-score">95%</div>
         </div>
      `).join('');
  }

  // --- Filtering & Sorting ---
  window.applyProjectFilters = function () {
    const search = elements.techSearch.value.toLowerCase();
    const techPills = Array.from(elements.techStackPills.querySelectorAll('.active')).map(p => p.textContent.toLowerCase());
    const difficulties = Array.from(elements.diffCheckboxes).filter(c => c.checked).map(c => c.value);
    const roles = Array.from(elements.roleCheckboxes).filter(c => c.checked).map(c => c.value);
    const remoteOnly = elements.remoteToggle.checked;
    const activeCat = document.querySelector('.cat-pill.active').dataset.cat;

    filteredProjects = allProjects.filter(p => {
      // Category
      if (activeCat !== 'all' && !p.tags.includes(activeCat)) return false;

      // Difficulty
      if (difficulties.length > 0 && !difficulties.includes(p.difficulty)) return false;

      // Role (OR logic)
      if (roles.length > 0) {
        const hasRole = roles.some(r => p.openRoles.includes(r));
        if (!hasRole) return false;
      }

      // Remote
      if (remoteOnly && !p.remote) return false;

      // Tech Search + Pills
      const pTech = p.tech.map(t => t.toLowerCase());
      if (search && !pTech.some(t => t.includes(search))) return false;
      if (techPills.length > 0 && !techPills.some(tp => pTech.some(pt => pt.includes(tp)))) return false;

      return true;
    });

    // Sorting
    const sort = elements.sortSelect.value;
    filteredProjects.sort((a, b) => {
      if (sort === 'stars') return b.stats.stars - a.stats.stars;
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    renderGrid();
  };

  function toggleStar(id) {
    if (starredProjects.has(id)) starredProjects.delete(id);
    else starredProjects.add(id);
    localStorage.setItem('brainex_projects_starred', JSON.stringify(Array.from(starredProjects)));

    // Update UI button directly
    const btn = document.querySelector(`.star-btn[data-id="${id}"]`);
    if (btn) {
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      icon.className = starredProjects.has(id) ? 'fas fa-star' : 'far fa-star';
    }
  }

  // --- Listeners ---
  function setupListeners() {
    // Tech Search
    elements.techSearch.addEventListener('input', () => window.applyProjectFilters());

    // Checkboxes
    elements.diffCheckboxes.forEach(c => c.addEventListener('change', window.applyProjectFilters));
    elements.roleCheckboxes.forEach(c => c.addEventListener('change', window.applyProjectFilters));
    elements.remoteToggle.addEventListener('change', window.applyProjectFilters);

    // Sort
    elements.sortSelect.addEventListener('change', window.applyProjectFilters);

    // Category Pills
    elements.catPills.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.catPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.applyProjectFilters();
      });
    });

    // Clear
    elements.clearBtn.addEventListener('click', () => {
      elements.techSearch.value = '';
      elements.diffCheckboxes.forEach(c => c.checked = false);
      elements.roleCheckboxes.forEach(c => c.checked = false);
      elements.remoteToggle.checked = false;
      document.querySelectorAll('.tech-pill').forEach(p => p.classList.remove('active'));
      window.applyProjectFilters();
    });

    // Start Project Stub
    window.startProject = () => alert("Start Project Modal - Coming Soon!");
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
