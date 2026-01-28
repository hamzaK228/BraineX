/* eslint-disable no-console, no-unused-vars */
document.addEventListener('DOMContentLoaded', function () {
  initializeMentorsPage();
});

let allMentors = [];
let filteredMentors = [];

function initializeMentorsPage() {
  loadMentorsData();
  setupMentorFilters();
  setupMentorActions();
  setupSearchFunctionality();
}

async function loadMentorsData() {
  if (window.showLoading) window.showLoading('mentorsGrid');
  try {
    const response = await fetch('/api/mentors');
    if (!response.ok) throw new Error('Failed to fetch mentors');

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allMentors = result.data.map((m) => ({
        ...m,
        id: m.id || m._id,
        image:
          m.image ||
          (m.name
            ? m.name
              .split(' ')
              .map((n) => n[0])
              .join('')
            : '?'),
        tags: m.tags || m.expertise || [],
      }));
    } else {
      console.warn('Invalid mentors data, using fallback');
      allMentors = getFallbackMentors();
    }
  } catch (error) {
    console.error('Error loading mentors:', error);
    allMentors = getFallbackMentors();
  }

  filteredMentors = [...allMentors];
  renderMentors(filteredMentors);
}

function getFallbackMentors() {
  return [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'AI Research Director',
      company: 'Google DeepMind',
      image: 'SJ',
      field: 'technology',
      experience: '15+ years',
      location: 'usa',
      mentees: 200,
      rating: 5.0,
      price: 150,
      bio: 'Leading AI researcher helping students get into top PhD programs and tech companies.',
      tags: ['Machine Learning', 'PhD Applications', 'Research'],
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Investment Banking VP',
      company: 'Goldman Sachs',
      image: 'MC',
      field: 'business',
      experience: '10+ years',
      location: 'usa',
      mentees: 150,
      rating: 4.9,
      price: 120,
      bio: 'Finance expert specializing in IB recruiting and MBA admissions.',
      tags: ['Investment Banking', 'Finance', 'MBA'],
    },
    {
      id: 3,
      name: 'Dr. Aisha Patel',
      role: 'Medical Researcher',
      company: 'Johns Hopkins',
      image: 'AP',
      field: 'medicine',
      experience: '12+ years',
      location: 'usa',
      mentees: 120,
      rating: 5.0,
      price: 140,
      bio: 'Expert in medical school admissions and healthcare career paths.',
      tags: ['Medical School', 'Healthcare', 'Research'],
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Senior Software Engineer',
      company: 'Meta',
      image: 'JW',
      field: 'technology',
      experience: '8 years',
      location: 'uk',
      mentees: 85,
      rating: 4.8,
      price: 90,
      bio: 'Full stack developer passionate about mentoring junior engineers.',
      tags: ['Web Development', 'System Design', 'Career Growth'],
    },
    {
      id: 5,
      name: 'Emily Wong',
      role: 'Product Design Lead',
      company: 'Airbnb',
      image: 'EW',
      field: 'arts',
      experience: '7 years',
      location: 'canada',
      mentees: 60,
      rating: 4.9,
      price: 100,
      bio: 'Design leader helping students build portfolios and land design roles.',
      tags: ['UX/UI Design', 'Portfolio Review', 'Product Design'],
    },
    {
      id: 6,
      name: 'David Mueller',
      role: 'Corporate Lawyer',
      company: 'Clifford Chance',
      image: 'DM',
      field: 'law',
      experience: '15+ years',
      location: 'germany',
      mentees: 40,
      rating: 4.7,
      price: 180,
      bio: 'International law expert guiding law students and graduates.',
      tags: ['Corporate Law', 'Law School', 'Legal Career'],
    },
  ];
}

function renderMentors(mentors) {
  const grid = document.getElementById('mentorsGrid');
  if (!grid) return;

  if (mentors.length === 0) {
    grid.innerHTML = '<div class="no-results">No mentors found matching your criteria.</div>';
    return;
  }

  grid.innerHTML = mentors
    .map(
      (mentor) => `
        <div class="mentor-card" data-mentor-id="${mentor.id}" style="cursor: pointer;">
            <div class="mentor-header">
                <div class="mentor-avatar-small" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.3rem;">${mentor.image}</div>
                <div>
                    <h3>${mentor.name}</h3>
                    <p class="mentor-role">${mentor.role}</p>
                    <p class="mentor-company">🏢 ${mentor.company}</p>
                </div>
            </div>
            
            <p class="mentor-bio">${mentor.bio}</p>
            
            <div class="mentor-tags">
                ${mentor.tags.map((tag) => `<span class="tag" style="background: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; color: #64748b;">${tag}</span>`).join('')}
            </div>
            
            <div class="mentor-details" style="display: flex; gap: 1rem; margin: 1rem 0; justify-content: space-between; flex-wrap: wrap;">
                <div class="detail-item">
                    <span>⭐ ${mentor.rating}</span>
                </div>
                <div class="detail-item">
                    <span>👥 ${mentor.mentees} mentees</span>
                </div>
                <div class="detail-item">
                    <span>💰 $${mentor.price}/hr</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn-view-profile" data-id="${mentor.id}" style="flex: 1; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">View Profile</button>
                <button class="btn-book-session" data-id="${mentor.id}" style="flex: 1; padding: 0.75rem; background: #48bb78; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Book Session</button>
            </div>
        </div>
    `
    )
    .join('');
}

function setupMentorFilters() {
  const fieldFilter = document.getElementById('fieldFilter');
  const experienceFilter = document.getElementById('experienceFilter');
  const locationFilter = document.getElementById('locationFilter');
  const sortSelect = document.querySelector('.sort-select');
  const searchBtn = document.querySelector('.btn-search-mentors');

  // Search Button
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }

  // Direct changes
  [fieldFilter, experienceFilter, locationFilter, sortSelect].forEach((el) => {
    if (el) el.addEventListener('change', applyFilters);
  });

  // View Toggle
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      viewBtns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const view = this.dataset.view;
      const grid = document.getElementById('mentorsGrid');
      if (grid) {
        if (view === 'list') grid.classList.add('list-view');
        else grid.classList.remove('list-view');
      }
    });
  });
}

function setupMentorActions() {
  // Featured buttons
  document.querySelectorAll('.btn-connect-featured').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const card = this.closest('.mentor-featured-card');
      const name = card.querySelector('h3').innerText;
      if (window.BraineX && BraineX.showNotification) {
        BraineX.showNotification(`Request sent to ${name}!`, 'success');
      } else {
        alert(`Request sent to ${name}!`);
      }
    });
  });

  // Become a Mentor Modal
  const becomeBtn = document.querySelector('.btn-become-mentor');
  const modal = document.getElementById('becomeMentorModal');
  const closeBtn = modal?.querySelector('.close-modal');
  const form = document.getElementById('becomeMentorForm');

  if (becomeBtn && modal) {
    becomeBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      modal.classList.add('show');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.classList.remove('show');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.BraineX && BraineX.showNotification) {
        BraineX.showNotification('Application submitted successfully!', 'success');
      } else {
        alert('Application submitted successfully!');
      }
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
      form.reset();
    });
  }

  // View Profile and Book Session button delegation
  const grid = document.getElementById('mentorsGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      // View Profile button
      if (e.target.classList.contains('btn-view-profile')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        openProfileModal(id);
      }

      // Book Session button
      if (e.target.classList.contains('btn-book-session')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        openBookingModal(id);
      }

      // Card click (legacy support)
      if (e.target.classList.contains('btn-connect')) {
        const id = e.target.getAttribute('data-id');
        window.connectWithMentor(parseInt(id));
      }
    });
  }
}

function applyFilters() {
  const field = document.getElementById('fieldFilter')?.value;
  const experience = document.getElementById('experienceFilter')?.value; // entry, mid, senior
  const location = document.getElementById('locationFilter')?.value;
  const sortBy = document.querySelector('.sort-select')?.value;

  filteredMentors = allMentors.filter((mentor) => {
    if (field && mentor.field !== field) return false;
    if (location && mentor.location !== location) return false;

    if (experience) {
      const expYears = parseInt(mentor.experience);
      if (experience === 'entry' && expYears > 5) return false;
      if (experience === 'mid' && (expYears <= 5 || expYears > 10)) return false;
      if (experience === 'senior' && expYears <= 10) return false;
    }

    return true;
  });

  // Sorting
  if (sortBy) {
    filteredMentors.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price; // Low to high?
      if (sortBy === 'reviews') return b.mentees - a.mentees; // Use mentees count as proxy
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      return 0;
    });
  }

  renderMentors(filteredMentors);
}

// ========================================
// Search Functionality
// ========================================
function setupSearchFunctionality() {
  const searchInput = document.getElementById('mentorSearch') || document.querySelector('.search-input');
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim().toLowerCase();
      applyFilters(query);
    }, 300);
  });
}

// Enhanced applyFilters to include search
function applyFiltersWithSearch(searchQuery = '') {
  const field = document.getElementById('fieldFilter')?.value;
  const experience = document.getElementById('experienceFilter')?.value;
  const location = document.getElementById('locationFilter')?.value;
  const sortBy = document.querySelector('.sort-select')?.value;
  const availabilityOnly = document.getElementById('availabilityFilter')?.checked;

  filteredMentors = allMentors.filter((mentor) => {
    // Search filter
    if (searchQuery) {
      const searchableText = `${mentor.name} ${mentor.role} ${mentor.company} ${mentor.tags.join(' ')} ${mentor.bio}`.toLowerCase();
      if (!searchableText.includes(searchQuery)) return false;
    }

    // Field filter
    if (field && mentor.field !== field) return false;

    // Location filter
    if (location && mentor.location !== location) return false;

    // Experience filter
    if (experience) {
      const expYears = parseInt(mentor.experience);
      if (experience === 'entry' && expYears > 5) return false;
      if (experience === 'mid' && (expYears <= 5 || expYears > 10)) return false;
      if (experience === 'senior' && expYears <= 10) return false;
    }

    // Availability filter (simulate - assume some mentors are available)
    if (availabilityOnly && mentor.id % 2 === 0) return false; // Simple simulation

    return true;
  });

  // Sorting
  if (sortBy) {
    filteredMentors.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'reviews') return b.mentees - a.mentees;
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      return 0;
    });
  }

  renderMentors(filteredMentors);
}

// ========================================
// Profile Modal
// ========================================
function openProfileModal(mentorId) {
  const mentor = allMentors.find(m => m.id === mentorId);
  if (!mentor) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'mentorProfileModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px; max-height: 85vh; overflow-y: auto;">
      <button class="close-modal" onclick="this.closest('.modal').remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #64748b;">&times;</button>
      
      <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px 12px 0 0; margin: -1.5rem -1.5rem 0;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: white; color: #667eea; display: inline-flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">${mentor.image}</div>
        <h2 style="margin: 0.5rem 0; color: white;">${mentor.name}</h2>
        <p style="margin: 0.25rem 0; opacity: 0.9;">${mentor.role} at ${mentor.company}</p>
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">⭐ ${mentor.rating} Rating</span>
          <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">👥 ${mentor.mentees} Mentees</span>
          <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">💰 $${mentor.price}/hr</span>
        </div>
      </div>

      <div style="padding: 2rem;">
        <h3 style="margin-bottom: 1rem; color: #1f2937;">About</h3>
        <p style="line-height: 1.7; color: #64748b;">${mentor.bio}</p>

        <h3 style="margin: 2rem 0 1rem; color: #1f2937;">Expertise</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${mentor.tags.map(tag => `<span style="background: #ebf4ff; color: #4299e1; padding: 0.5rem 1rem; border-radius: 12px; font-weight: 600;">${tag}</span>`).join('')}
        </div>

        <h3 style="margin: 2rem 0 1rem; color: #1f2937;">Experience</h3>
        <p style="color: #64748b;">${mentor.experience} in ${mentor.field}</p>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button onclick="openBookingModal(${mentor.id})" style="flex: 1; padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">📅 Book Session</button>
          <button onclick="openMessagingModal(${mentor.id})" style="flex: 1; padding: 1rem; background: #48bb78; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">💬 Send Message</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// ========================================
// Booking Modal with Calendar
// ========================================
function openBookingModal(mentorId) {
  // Close profile modal if open
  document.getElementById('mentorProfileModal')?.remove();

  const mentor = allMentors.find(m => m.id === mentorId);
  if (!mentor) return;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'bookingModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <button class="close-modal" onclick="this.closest('.modal').remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #64748b;">&times;</button>
      
      <div style="padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
        <h2 style="margin: 0 0 0.5rem 0; color: #1f2937;">Book a Session with ${mentor.name}</h2>
        <p style="margin: 0; color: #64748b;">$${mentor.price}/hour</p>
      </div>

      <form id="bookingForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Select Date *</label>
          <input type="date" id="bookingDate" required min="${today.toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Select Time *</label>
          <select id="bookingTime" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
            <option value="">Choose a time slot</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">01:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="17:00">05:00 PM</option>
          </select>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Duration *</label>
          <select id="bookingDuration" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
            <option value="">Choose duration</option>
            <option value="30">30 minutes ($${mentor.price / 2})</option>
            <option value="60">1 hour ($${mentor.price})</option>
            <option value="90">1.5 hours ($${mentor.price * 1.5})</option>
            <option value="120">2 hours ($${mentor.price * 2})</option>
          </select>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Session Topic *</label>
          <input type="text" id="bookingTopic" required placeholder="e.g., Career advice, Resume review, Interview prep" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Additional Notes</label>
          <textarea id="bookingNotes" rows="3" placeholder="Any specific questions or topics you'd like to cover?" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
        </div>

        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Selected Time:</span>
            <span id="selectedTimeDisplay" style="font-weight: 600;">Not selected</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 0.5rem;">
            <span style="font-weight: 600;">Total Cost:</span>
            <span id="totalCostDisplay" style="font-weight: 700; color: #667eea; font-size: 1.2rem;">$0</span>
          </div>
        </div>

        <button type="submit" style="padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">Confirm Booking</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Setup form interactions
  const form = document.getElementById('bookingForm');
  const dateInput = document.getElementById('bookingDate');
  const timeInput = document.getElementById('bookingTime');
  const durationSelect = document.getElementById('bookingDuration');
  const timeDisplay = document.getElementById('selectedTimeDisplay');
  const costDisplay = document.getElementById('totalCostDisplay');

  function updateSummary() {
    const date = dateInput.value;
    const time = timeInput.value;
    const duration = durationSelect.value;

    if (date && time) {
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      timeDisplay.textContent = `${formattedDate} at ${time}`;
    } else {
      timeDisplay.textContent = 'Not selected';
    }

    if (duration) {
      const hours = parseInt(duration) / 60;
      const cost = mentor.price * hours;
      costDisplay.textContent = `$${cost}`;
    } else {
      costDisplay.textContent = '$0';
    }
  }

  dateInput.addEventListener('change', updateSummary);
  timeInput.addEventListener('change', updateSummary);
  durationSelect.addEventListener('change', updateSummary);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = dateInput.value;
    const time = timeInput.value;
    const duration = durationSelect.value;
    const topic = document.getElementById('bookingTopic').value;
    const notes = document.getElementById('bookingNotes').value;

    // Validation
    if (!date || !time || !duration || !topic) {
      if (window.BraineX?.showNotification) {
        BraineX.showNotification('Please fill in all required fields', 'error');
      } else {
        alert('Please fill in all required fields');
      }
      return;
    }

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('mentor_bookings') || '[]');
    bookings.push({
      mentorId: mentor.id,
      mentorName: mentor.name,
      date,
      time,
      duration,
      topic,
      notes,
      cost: mentor.price * (parseInt(duration) / 60),
      bookedAt: new Date().toISOString()
    });
    localStorage.setItem('mentor_bookings', JSON.stringify(bookings));

    modal.remove();
    if (window.BraineX?.showNotification) {
      BraineX.showNotification(`Session booked with ${mentor.name}!`, 'success');
    } else {
      alert(`Session booked with ${mentor.name} on ${date} at ${time}!`);
    }
  });
}

// ========================================
// Messaging Modal
// ========================================
function openMessagingModal(mentorId) {
  // Close profile modal if open
  document.getElementById('mentorProfileModal')?.remove();

  const mentor = allMentors.find(m => m.id === mentorId);
  if (!mentor) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'messagingModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <button class="close-modal" onclick="this.closest('.modal').remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #64748b;">&times;</button>
      
      <div style="padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
        <h2 style="margin: 0 0 0.5rem 0; color: #1f2937;">Message ${mentor.name}</h2>
        <p style="margin: 0; color: #64748b;">${mentor.role} at ${mentor.company}</p>
      </div>

      <form id="messageForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Subject *</label>
          <input type="text" id="messageSubject" required placeholder="e.g., Seeking career guidance" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Message *</label>
          <textarea id="messageContent" required rows="6" placeholder="Write your message here..." style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
          <small style="color: #64748b;">Be specific about what you're looking for help with</small>
        </div>

        <button type="submit" style="padding: 1rem; background: #48bb78; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">Send Message</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;

    if (!subject || !content) {
      if (window.BraineX?.showNotification) {
        BraineX.showNotification('Please fill in all fields', 'error');
      }
      return;
    }

    // Save message to localStorage
    const messages = JSON.parse(localStorage.getItem('mentor_messages') || '[]');
    messages.push({
      mentorId: mentor.id,
      mentorName: mentor.name,
      subject,
      content,
      sentAt: new Date().toISOString()
    });
    localStorage.setItem('mentor_messages', JSON.stringify(messages));

    modal.remove();
    if (window.BraineX?.showNotification) {
      BraineX.showNotification(`Message sent to ${mentor.name}!`, 'success');
    } else {
      alert(`Message sent to ${mentor.name}!`);
    }
  });
}

// Make functions globally accessible
window.openProfileModal = openProfileModal;
window.openBookingModal = openBookingModal;
window.openMessagingModal = openMessagingModal;

// Global Actions
window.connectWithMentor = function (id) {
  openProfileModal(id);
};
