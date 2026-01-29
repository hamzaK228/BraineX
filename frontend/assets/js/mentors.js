/**
 * Mentors Page Logic
 * Handles rendering, filtering, sorting, and booking flow.
 */

(function () {
  'use strict';

  // State
  let allMentors = [];
  let filteredMentors = [];
  let savedMentors = new Set();

  // Elements
  const el = {
    grid: document.getElementById('mentorsGrid'),
    carousel: document.getElementById('featuredCarousel'),
    emptyState: document.getElementById('emptyState'),
    mentorCount: document.getElementById('mentorCount'),

    // Filters
    expertiseList: document.getElementById('expertiseFilters'),
    priceRange: document.getElementById('priceRange'),
    priceValue: document.getElementById('priceValue'),
    verifiedOnly: document.getElementById('verifiedToggle'),
    availRadios: document.querySelectorAll('input[name="availability"]'),
    langChecks: document.querySelectorAll('input[name="lang"]'),
    clearBtn: document.getElementById('clearFilters'),

    // Controls
    sortSelect: document.getElementById('sortSelect'),
    myMentorsToggle: document.getElementById('myMentorsToggle'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),

    // Modal
    bookingModal: document.getElementById('bookingModal'),
    bookingBody: document.getElementById('bookingBody')
  };

  // --- Initialization ---
  function init() {
    // Load saved
    const saved = localStorage.getItem('brainex_mentors_saved');
    if (saved) {
      try { JSON.parse(saved).forEach(id => savedMentors.add(String(id))); } catch (e) { }
    }

    allMentors = getMockMentors();
    filteredMentors = [...allMentors];

    renderExpertiseFilters();
    renderCarousel();
    applyFilters();

    setupListeners();
  }

  // --- Mock Data ---
  function getMockMentors() {
    // 12 Mentors Mock
    const names = ["Dr. Sarah Johnson", "Michael Chen", "Emily Wu", "David Kim", "Jessica Wong", "Robert Fox", "Anita Patel", "James Wilson", "Maria Garcia", "Tom Baker"];
    const roles = ["AI Research Lead", "Senior Product Manager", "Staff Engineer", "UX Director", "Founder & CEO", "Data Scientist", "Marketing VP", "Solutions Architect", "Frontend Lead", "VC Partner"];
    const companies = ["Google", "Stripe", "Netflix", "Airbnb", "Y Combinator", "Meta", "Spotify", "AWS", "Vercel", "Sequoia"];
    const exper = ["Technology", "Business", "Technology", "Design", "Business", "Technology", "Business", "Technology", "Technology", "Business"];

    return names.map((name, i) => ({
      id: `m${i + 1}`,
      name,
      role: roles[i],
      company: companies[i],
      avatar: `https://i.pravatar.cc/150?u=${i + 10}`,
      price: 50 + (i * 20),
      rating: (4.5 + (Math.random() * 0.5)).toFixed(1),
      reviews: 20 + (i * 15),
      verified: i % 2 === 0,
      topRated: i < 3,
      available: i % 3 === 0 ? 'now' : (i % 3 === 1 ? 'week' : 'busy'),
      expertise: [exper[i], i % 2 === 0 ? 'React' : 'Leadership', 'Career'].slice(0, 3),
      lang: i % 4 === 0 ? ['en', 'es'] : ['en'],
      bio: `Experienced ${roles[i]} with a passion for mentorship. Helping students navigate careers in ${companies[i]} and beyond. Let's chat about your goals.`,
      stats: { sessions: 50 + i * 10, response: '< 24h' }
    }));
  }

  // --- Rendering ---
  function renderExpertiseFilters() {
    const experts = ['Technology', 'Business', 'Design', 'Data Science', 'Marketing', 'Product'];
    el.expertiseList.innerHTML = experts.map(e => `
        <label class="custom-checkbox">
            <input type="checkbox" name="expertise" value="${e}">
            <span class="checkmark"></span> ${e}
        </label>
      `).join('');
  }

  function renderCarousel() {
    const topRated = allMentors.filter(m => m.topRated);
    el.carousel.innerHTML = topRated.map(m => `
          <div class="f-card" onclick="window.bookMentor('${m.id}')">
              <div class="f-badge">⭐ ${m.rating}</div>
              <div class="f-header">
                  <img src="${m.avatar}" class="f-avatar">
                  <div class="f-info">
                      <h4>${m.name}</h4>
                      <span>${m.company}</span>
                  </div>
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary);">
                  <i class="fas fa-check-circle" style="color:var(--verified-color)"></i> Expert in ${m.expertise[0]}
              </div>
          </div>
      `).join('');
  }

  function renderGrid() {
    if (filteredMentors.length === 0) {
      el.grid.style.display = 'none';
      el.emptyState.style.display = 'block';
      el.mentorCount.textContent = 0;
      return;
    }

    el.grid.style.display = 'grid';
    el.emptyState.style.display = 'none';
    el.mentorCount.textContent = filteredMentors.length;

    // Show first 9, handle load more later
    el.grid.innerHTML = filteredMentors.map(m => createCard(m)).join('');
  }

  function createCard(m) {
    const isSaved = savedMentors.has(m.id);
    const availClass = m.available; // now, week, busy

    const tags = m.expertise.map(t => `<span class="m-tag">${t}</span>`).join('');

    return `
        <div class="m-card">
            <div class="m-header">
                <div class="m-avatar-container">
                    <img src="${m.avatar}" class="m-avatar">
                    <div class="avail-dot ${availClass}" title="Availability: ${availClass}"></div>
                </div>
                <div class="m-rate">
                    ⭐ ${m.rating} <small>(${m.reviews})</small>
                </div>
            </div>
            
            <div class="m-info">
                <h3>${m.name} ${m.verified ? '<i class="fas fa-check-circle verified-badge" title="Verified Mentor"></i>' : ''}</h3>
                <p class="m-role">${m.role}</p>
                <p class="m-company"><i class="fas fa-building"></i> ${m.company}</p>
            </div>
            
            <p class="m-bio">${m.bio}</p>
            
            <div class="m-tags">${tags}</div>
            
            <div class="m-stats">
                 <span class="m-stat"><i class="far fa-calendar-check"></i> ${m.stats.sessions} Sessions</span>
                 <span class="m-stat"><i class="far fa-clock"></i> ${m.stats.response}</span>
            </div>
            
            <div class="m-actions">
                <button class="btn-book" onclick="window.bookMentor('${m.id}')">Book ($${m.price})</button>
                <button class="btn-save ${isSaved ? 'active' : ''}" onclick="window.toggleSave('${m.id}', this)">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        </div>
      `;
  }

  // --- Filtering ---
  window.applyFilters = function () {
    const expertChecks = Array.from(document.querySelectorAll('input[name="expertise"]:checked')).map(c => c.value);
    const maxPrice = parseInt(el.priceRange.value);
    const verified = el.verifiedOnly.checked;
    const avail = document.querySelector('input[name="availability"]:checked').value;
    const langs = Array.from(el.langChecks).filter(c => c.checked).map(c => c.value);

    const myMentors = el.myMentorsToggle.checked;

    filteredMentors = allMentors.filter(m => {
      // My Mentors
      if (myMentors && !savedMentors.has(m.id)) return false;

      // Price
      if (m.price > maxPrice) return false;

      // Verified
      if (verified && !m.verified) return false;

      // Expertise (OR logic)
      if (expertChecks.length > 0) {
        const hasExp = expertChecks.some(e => m.expertise.includes(e));
        if (!hasExp) return false;
      }

      // Availability
      if (avail === 'today' && m.available !== 'now') return false;
      if (avail === 'week' && m.available === 'busy') return false;

      // Language
      if (langs.length > 0) {
        const hasLang = langs.some(l => m.lang.includes(l));
        if (!hasLang) return false;
      }

      return true;
    });

    // Sort
    const sort = el.sortSelect.value;
    filteredMentors.sort((a, b) => {
      if (sort === 'price_low') return a.price - b.price;
      if (sort === 'price_high') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return 0; // recommended
    });

    renderGrid();
  };

  // --- Actions ---
  window.toggleSave = (id, btn) => {
    if (savedMentors.has(id)) {
      savedMentors.delete(id);
      btn.classList.remove('active');
      btn.querySelector('i').className = 'far fa-heart';
    } else {
      savedMentors.add(id);
      btn.classList.add('active');
      btn.querySelector('i').className = 'fas fa-heart';
    }
    localStorage.setItem('brainex_mentors_saved', JSON.stringify(Array.from(savedMentors)));

    if (el.myMentorsToggle.checked) window.applyFilters();
  };

  window.bookMentor = (id) => {
    const m = allMentors.find(x => x.id === id);
    if (!m) return;

    el.bookingModal.style.display = 'block';
    el.bookingBody.innerHTML = `
          <div class="b-header">
              <img src="${m.avatar}" class="b-avatar">
              <div>
                  <h3 style="margin:0;">${m.name}</h3>
                  <span style="color:var(--text-secondary);">${m.role} at ${m.company}</span>
              </div>
          </div>
          
          <h4>Select Session Type</h4>
          <div class="b-types">
              <div class="b-type-btn selected">1:1 Mentorship<br><small>$${m.price}</small></div>
              <div class="b-type-btn">Resume Review<br><small>$${Math.floor(m.price * 0.8)}</small></div>
          </div>
          
          <h4>Available Slots</h4>
          <div class="b-slots">
              <div class="b-slot selected">Tomorrow 10AM</div>
              <div class="b-slot">Tomorrow 2PM</div>
              <div class="b-slot">Fri 4PM</div>
          </div>
          
          <button class="btn-book" style="width:100%; margin-top:1rem;" onclick="alert('Booking confirmed!')">Confirm Booking</button>
      `;
  };

  // --- Listeners ---
  function setupListeners() {
    // Filters
    el.expertiseList.addEventListener('change', window.applyFilters);
    el.priceRange.addEventListener('input', (e) => {
      el.priceValue.textContent = `Max $${e.target.value}`;
      window.applyFilters();
    });
    el.verifiedOnly.addEventListener('change', window.applyFilters);
    el.availRadios.forEach(r => r.addEventListener('change', window.applyFilters));
    el.langChecks.forEach(c => c.addEventListener('change', window.applyFilters));

    // Controls
    el.sortSelect.addEventListener('change', window.applyFilters);
    el.myMentorsToggle.addEventListener('change', window.applyFilters);
    el.clearBtn.addEventListener('click', () => {
      // Reset all inputs
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      document.querySelectorAll('input[type="radio"]')[0].checked = true;
      el.priceRange.value = 300;
      el.priceValue.textContent = 'Max $300';
      window.applyFilters();
    });

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
      el.bookingModal.style.display = 'none';
    });
    window.onclick = (e) => {
      if (e.target == el.bookingModal) el.bookingModal.style.display = 'none';
    };
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
