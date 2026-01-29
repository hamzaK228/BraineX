/**
 * Scholarships Page Logic
 * Handles rendering, filtering, urgency calculations, and application tracking.
 */

(function () {
  'use strict';

  // State
  let allScholarships = [];
  let filteredScholarships = [];
  let savedApps = new Set(); // IDs of saved scholarships

  // Elements
  const elements = {
    grid: document.getElementById('scholarshipGrid'),
    emptyState: document.getElementById('emptyState'),
    resultCount: document.getElementById('resultCount'),

    // Filters
    searchInput: document.getElementById('searchInput'),
    fundingFilters: document.getElementById('fundingFilters'),
    amountSlider: document.getElementById('amountSlider'),
    amountDisplay: document.getElementById('amountDisplay'),
    checkboxes: document.querySelectorAll('input[name="eligibility"]'),

    // Sort
    sortSelect: document.getElementById('sortSelect'),
    clearBtn: document.getElementById('clearFilters'),

    // Stats
    statTotal: document.getElementById('statTotal'),
    statFunding: document.getElementById('statFunding'),
    statClosing: document.getElementById('statClosing'),
    statAvg: document.getElementById('statAvg'),

    // Tracker
    trackerList: document.getElementById('trackerList'),
    savedCount: document.getElementById('savedCount'),
    totalSaved: document.getElementById('totalSaved'),
    totalApplied: document.getElementById('totalApplied'),

    // Urgent
    urgentBanner: document.getElementById('urgentBanner'),
    urgentCount: document.getElementById('urgentCount'),
    urgentScroller: document.getElementById('urgentScroller')
  };

  // --- Initialization ---
  async function init() {
    // Load saved state
    loadTrackerState();

    // Fetch Data
    await fetchData();

    // Calculate & Render
    calculateHeroStats();
    checkUrgentDeadlines();
    renderTracker();
    applyFilters();

    // Event Listeners
    setupListeners();
  }

  // --- Data Loading ---
  async function fetchData() {
    try {
      // Attempt API
      const res = await fetch('/api/scholarships');
      if (res.ok) {
        const json = await res.json();
        allScholarships = json.data || [];
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.warn('Using fallback data');
      allScholarships = getFallbackData();
    }
    filteredScholarships = [...allScholarships];
  }

  function getFallbackData() {
    // Generate some rich dummy data
    return [
      {
        id: 's1',
        name: 'Global Future Leaders Scholarship',
        organization: 'Oxford University',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/University_of_Oxford_coat_of_arms.svg/1200px-University_of_Oxford_coat_of_arms.svg.png',
        amount: 50000,
        amountType: 'Full Tuition',
        fundingType: 'full',
        deadline: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days
        tags: ['International', 'Masters', 'Leadership'],
        eligibility: ['international', 'grad'],
        competition: 'High',
        description: 'Full funding for exceptional students demonstrating leadership potential.',
        applyLink: '#'
      },
      {
        id: 's2',
        name: 'Women in Tech Grant',
        organization: 'Google',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2000px-Google_%22G%22_Logo.svg.png',
        amount: 10000,
        amountType: '$10,000',
        fundingType: 'partial',
        deadline: new Date(Date.now() + 25 * 86400000).toISOString(), // 25 days
        tags: ['Women', 'STEM', 'Undergrad'],
        eligibility: ['women', 'undergrad'],
        competition: 'Medium',
        description: 'Supporting the next generation of women leaders in technology.',
        applyLink: '#'
      },
      {
        id: 's3',
        name: 'STEM Research Fellowship',
        organization: 'National Science Foundation',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NSF_Logo.svg/1200px-NSF_Logo.svg.png',
        amount: 35000,
        amountType: '$35,000 / year',
        fundingType: 'merit',
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(), // 60 days
        tags: ['Research', 'PhD', 'STEM'],
        eligibility: ['grad'],
        competition: 'High',
        description: 'Three-year annual stipend for research-based master\'s and doctoral opportunities.',
        applyLink: '#'
      },
      {
        id: 's4',
        name: 'Need-Based Access Grant',
        organization: 'Gates Foundation',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bill_%26_Melinda_Gates_Foundation_logo_2017.svg/2560px-Bill_%26_Melinda_Gates_Foundation_logo_2017.svg.png',
        amount: 25000,
        amountType: 'Full Need Met',
        fundingType: 'need',
        deadline: new Date(Date.now() + 120 * 86400000).toISOString(),
        tags: ['Low Income', 'Undergrad'],
        eligibility: ['undergrad'],
        competition: 'Medium',
        description: 'Ensuring financial barriers do not prevent students from accessing education.',
        applyLink: '#'
      },
      {
        id: 's5',
        name: 'Arts & Design Innovation Award',
        organization: 'Rhode Island School of Design',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/Rhode_Island_School_of_Design_seal.svg/1200px-Rhode_Island_School_of_Design_seal.svg.png',
        amount: 15000,
        amountType: '$15,000',
        fundingType: 'merit',
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(), // 2 days urgent!
        tags: ['Arts', 'Design'],
        eligibility: ['undergrad', 'grad'],
        competition: 'Low',
        description: 'For students pushing the boundaries of creative expression.',
        applyLink: '#'
      }
    ];
  }

  // --- Logic & Stats ---
  function calculateHeroStats() {
    if (!elements.statTotal) return;

    const total = allScholarships.length;
    const fullFunding = allScholarships.filter(s => s.fundingType === 'full').length;
    const closingSoon = allScholarships.filter(s => {
      const diff = new Date(s.deadline) - new Date();
      return diff > 0 && diff < (30 * 86400000);
    }).length;

    const totalAmount = allScholarships.reduce((acc, s) => acc + (s.amount || 0), 0);
    const avg = total > 0 ? Math.round(totalAmount / total) : 0;

    elements.statTotal.textContent = total;
    elements.statFunding.textContent = fullFunding;
    elements.statClosing.textContent = closingSoon;
    elements.statAvg.textContent = '$' + (avg / 1000).toFixed(1) + 'k';
  }

  function checkUrgentDeadlines() {
    const urgent = allScholarships.filter(s => {
      const diff = new Date(s.deadline) - new Date();
      return diff > 0 && diff < (7 * 86400000);
    });

    if (urgent.length > 0 && elements.urgentBanner) {
      elements.urgentBanner.style.display = 'block';
      elements.urgentCount.textContent = urgent.length;

      elements.urgentScroller.innerHTML = urgent.map(s => `
            <div class="urgent-pill" onclick="window.scrollToCard('${s.id}')">
                <img src="${s.logo}" style="width:20px; height:20px; border-radius:50%;">
                <span>${s.name}</span>
                <span style="color:#e53e3e; font-size:0.8em;">(Ends ${new Date(s.deadline).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })})</span>
            </div>
          `).join('');
    }
  }

  // --- Rendering ---
  function renderGrid() {
    if (filteredScholarships.length === 0) {
      elements.grid.style.display = 'none';
      elements.emptyState.style.display = 'block';
      elements.resultCount.textContent = 0;
      return;
    }

    elements.grid.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.resultCount.textContent = filteredScholarships.length;

    elements.grid.innerHTML = filteredScholarships.map(s => createCard(s)).join('');

    // Attach events
    document.querySelectorAll('.btn-save-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSave(btn.dataset.id);
        // Verify visually
        const isSaved = savedApps.has(btn.dataset.id);
        btn.classList.toggle('active', isSaved);
        btn.innerHTML = isSaved ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
      });
    });
  }

  function createCard(s) {
    const isSaved = savedApps.has(String(s.id));
    const deadline = new Date(s.deadline);
    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

    let deadlineColor = 'var(--deadline-normal)';
    let deadlineText = `Ends in ${daysLeft} days`;
    let progress = 100 - Math.min(100, (daysLeft / 120) * 100); // Inverse progress
    let pulse = '';

    if (daysLeft < 7) {
      deadlineColor = 'var(--deadline-critical)';
      progress = 95;
      pulse = `<span style="color:${deadlineColor}; font-weight:bold;">🔥 Urgent</span>`;
    } else if (daysLeft < 30) {
      deadlineColor = 'var(--deadline-urgent)';
      progress = 80;
    } else if (daysLeft < 90) {
      deadlineColor = 'var(--deadline-soon)';
      progress = 50;
    }

    const badgeClass = `bg-${s.fundingType || 'merit'}`;

    return `
        <div class="s-card" id="card-${s.id}">
            <div class="card-badges">
                <div class="badge-funding ${badgeClass}">${s.amountType}</div>
            </div>
            
            <div class="card-header">
                <img src="${s.logo}" class="org-logo" alt="${s.organization}">
                <div class="header-info">
                    <h3>${s.name}</h3>
                    <div class="org-name">${s.organization}</div>
                </div>
            </div>

            <div class="card-metrics">
                 <div class="metric">
                    <span class="metric-label">Competition</span>
                    <span class="metric-val">${s.competition}</span>
                 </div>
                 <div class="metric">
                    <span class="metric-label">Eligibility</span>
                    <span class="metric-val">${s.eligibility?.[0] || 'General'}</span>
                 </div>
                 <div class="metric">
                    <span class="metric-label">Success Rate</span>
                    <span class="metric-val">~15%</span>
                 </div>
            </div>

            <div class="deadline-bar">
                <div class="deadline-text">
                    <span style="color:${deadlineColor}">${deadlineText}</span>
                    ${pulse}
                </div>
                <div class="db-progress">
                    <div class="db-fill" style="width:${progress}%; background:${deadlineColor};"></div>
                </div>
            </div>

            <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.5rem; line-height:1.5;">
                ${s.description}
            </p>

            <div class="card-actions">
                <button class="btn-apply" onclick="window.open('${s.applyLink}', '_blank')">
                    Apply Now <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="btn-icon btn-save-toggle ${isSaved ? 'active' : ''}" data-id="${s.id}">
                    ${isSaved ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
                </button>
            </div>
        </div>
      `;
  }

  // --- Wrapper for interactions ---
  window.scrollToCard = (id) => {
    const el = document.getElementById(`card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.borderColor = 'var(--deadline-critical)';
      setTimeout(() => el.style.borderColor = '', 2000);
    }
  };

  window.resetFilters = () => {
    elements.searchInput.value = '';
    elements.amountSlider.value = 0;
    elements.amountDisplay.textContent = '$0+';
    elements.checkboxes.forEach(c => c.checked = false);
    elements.fundingFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    applyFilters();
  };

  // --- Filtering ---
  function getFilters() {
    const types = Array.from(elements.fundingFilters.querySelectorAll('.active')).map(b => b.dataset.type);
    const eligibility = Array.from(elements.checkboxes).filter(c => c.checked).map(c => c.value);

    return {
      search: elements.searchInput.value.toLowerCase(),
      minAmount: parseInt(elements.amountSlider.value),
      types,
      eligibility
    };
  }

  function applyFilters() {
    const f = getFilters();

    filteredScholarships = allScholarships.filter(s => {
      // Search
      if (f.search && !s.name.toLowerCase().includes(f.search) && !s.organization.toLowerCase().includes(f.search)) {
        return false;
      }
      // Amount
      if ((s.amount || 0) < f.minAmount) return false;
      // Type
      if (f.types.length > 0 && !f.types.includes(s.fundingType)) return false;
      // Eligibility (OR logic)
      if (f.eligibility.length > 0) {
        const hasMatch = f.eligibility.some(e => s.eligibility && s.eligibility.includes(e));
        if (!hasMatch) return false;
      }
      return true;
    });

    // Sort
    const sort = elements.sortSelect.value;
    filteredScholarships.sort((a, b) => {
      if (sort === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sort === 'amount-desc') return b.amount - a.amount;
      return 0; // relevance
    });

    renderGrid();
  }

  // --- Tracker Logic ---
  function loadTrackerState() {
    const saved = localStorage.getItem('brainex_scholarships_saved');
    if (saved) {
      try {
        JSON.parse(saved).forEach(id => savedApps.add(String(id)));
      } catch (e) { }
    }
  }

  function toggleSave(id) {
    const sid = String(id);
    if (savedApps.has(sid)) {
      savedApps.delete(sid);
    } else {
      savedApps.add(sid);
    }
    localStorage.setItem('brainex_scholarships_saved', JSON.stringify(Array.from(savedApps)));
    renderTracker();
  }

  function renderTracker() {
    elements.savedCount.textContent = savedApps.size;
    elements.totalSaved.textContent = savedApps.size;
    elements.totalApplied.textContent = 0; // Placeholder for now

    if (savedApps.size === 0) {
      elements.trackerList.innerHTML = `<div class="empty-tracker"><p style="color:var(--text-secondary); font-size:0.9rem; text-align:center; padding:1rem;">Click ❤️ on scholarships to track them here.</p></div>`;
      return;
    }

    const items = Array.from(savedApps).map(id => allScholarships.find(s => String(s.id) === id)).filter(Boolean);

    elements.trackerList.innerHTML = items.map(s => `
         <div class="t-item">
            <img src="${s.logo}" class="t-thumb">
            <div class="t-info">
                <span class="t-name">${s.name}</span>
                <span class="t-deadline">${new Date(s.deadline).toLocaleDateString()}</span>
            </div>
            <div class="t-remove" onclick="event.stopPropagation(); document.querySelector('.btn-save-toggle[data-id=\\'${s.id}\\']').click()">×</div>
         </div>
      `).join('');
  }

  // --- Events Setup ---
  function setupListeners() {
    // Search
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Funding Pills
    elements.fundingFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-pill')) {
        e.target.classList.toggle('active');
        applyFilters();
      }
    });

    // Slider
    elements.amountSlider.addEventListener('input', (e) => {
      elements.amountDisplay.textContent = '$' + parseInt(e.target.value).toLocaleString() + '+';
      applyFilters();
    });

    // Checkboxes
    elements.checkboxes.forEach(c => c.addEventListener('change', applyFilters));

    // Sort
    elements.sortSelect.addEventListener('change', applyFilters);

    // Clear
    elements.clearBtn.addEventListener('click', window.resetFilters);
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
