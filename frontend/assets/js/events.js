/**
 * Events Page Logic
 * Handles List/Calendar views, filtering, RSVPs, and Mock Data.
 */

(function () {
  'use strict';

  // State
  let allEvents = [];
  let filteredEvents = [];
  let myRsvps = new Set(); // saved event IDs
  let currentView = 'list';
  let currentDate = new Date(); // for calendar nav

  // Elements
  const el = {
    listContainer: document.getElementById('eventsList'),
    calContainer: document.getElementById('eventsCalendar'),
    emptyState: document.getElementById('emptyState'),
    eventCount: document.getElementById('eventCount'),

    // Controls
    viewBtns: document.querySelectorAll('.view-btn'),
    search: document.getElementById('eventSearch'),
    sortSelect: document.getElementById('sortSelect'),
    myEventsToggle: document.getElementById('myEventsToggle'),

    // Filters
    dateRadios: document.querySelectorAll('input[name="dateFilter"]'),
    typeChecks: document.querySelectorAll('input[name="type"]'),
    locChecks: document.querySelectorAll('input[name="location"]'),
    freeToggle: document.getElementById('freeOnlyToggle'),
    clearBtn: document.getElementById('clearFilters'),

    // Calendar specific
    calMonthYear: document.getElementById('calMonthYear'),
    calBody: document.getElementById('calendarBody'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),

    // Banner
    banner: document.getElementById('upcomingBanner'),
    rsvpList: document.getElementById('rsvpList')
  };

  // --- Initialization ---
  function init() {
    // Load saved
    const saved = localStorage.getItem('brainex_events_rsvp');
    if (saved) {
      try { JSON.parse(saved).forEach(id => myRsvps.add(String(id))); } catch (e) { }
    }

    allEvents = getMockEvents();
    filteredEvents = [...allEvents];

    renderBanner();
    applyFilters();
    setupListeners();
  }

  // --- Mock Data ---
  function getMockEvents() {
    // Generate some dates relative to today
    const today = new Date();
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

    return [
      {
        id: 'e1',
        title: 'Global AI Summit',
        date: addDays(today, 2),
        time: '09:00 AM - 05:00 PM',
        location: 'San Francisco, CA',
        type: 'Conference',
        price: 299,
        attendees: 1200,
        organizer: 'TechForward',
        desc: 'The annual gathering of AI researchers and practitioners.'
      },
      {
        id: 'e2',
        title: 'React Performance Workshop',
        date: addDays(today, 4),
        time: '10:00 AM - 12:00 PM',
        location: 'Online',
        type: 'Workshop',
        price: 0,
        attendees: 450,
        organizer: 'Frontend Masters',
        desc: 'Deep dive into rendering optimization and profiling.'
      },
      {
        id: 'e3',
        title: 'Sustainability Hackathon',
        date: addDays(today, 10),
        time: '48 Hours',
        location: 'Hybrid',
        type: 'Hackathon',
        price: 0,
        attendees: 300,
        organizer: 'GreenTech',
        desc: 'Build solutions for a greener future. $50k in prizes.'
      },
      {
        id: 'e4',
        title: 'Startup Networking Night',
        date: addDays(today, 14),
        time: '06:00 PM - 09:00 PM',
        location: 'New York, NY',
        type: 'Networking',
        price: 25,
        attendees: 80,
        organizer: 'Founders Club',
        desc: 'Meet co-founders and investors in NYC.'
      },
      {
        id: 'e5',
        title: 'Web3 & Blockchain Intro',
        date: addDays(today, 18),
        time: '01:00 PM - 02:00 PM',
        location: 'Online',
        type: 'Webinar',
        price: 0,
        attendees: 600,
        organizer: 'CryptoLearn',
        desc: 'Understanding the fundamentals of decentralized apps.'
      },
      {
        id: 'e6',
        title: 'Product Design Sprint',
        date: addDays(today, 5),
        time: '10:00 AM - 4:00 PM',
        location: 'Online',
        type: 'Workshop',
        price: 150,
        attendees: 40,
        organizer: 'DesignCo',
        desc: 'Practical workshop on running design sprints.'
      }
    ].map(e => ({ ...e, dateObj: e.date }));
  }

  // --- Rendering ---
  function renderList() {
    el.listContainer.style.display = 'flex';
    el.calContainer.style.display = 'none';

    if (filteredEvents.length === 0) {
      el.listContainer.style.display = 'none';
      el.emptyState.style.display = 'block';
      return;
    }

    el.emptyState.style.display = 'none';
    el.eventCount.textContent = filteredEvents.length;

    el.listContainer.innerHTML = filteredEvents.map(e => createEventCard(e)).join('');
  }

  function createEventCard(e) {
    const isRsvp = myRsvps.has(e.id);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const mStr = months[e.date.getMonth()];
    const dStr = e.date.getDate();
    const dowStr = dow[e.date.getDay()];

    const typeClass = `type-${e.type.toLowerCase()}`;

    return `
        <div class="e-card">
            <div class="e-date-badge">
                <span class="ed-month">${mStr}</span>
                <span class="ed-day">${dStr}</span>
                <span class="ed-dow">${dowStr}</span>
            </div>
            
            <div class="e-content">
                <div class="e-header">
                    <span class="e-type ${typeClass}">${e.type}</span>
                    <span class="e-price ${e.price === 0 ? 'free' : ''}">${e.price === 0 ? 'FREE' : '$' + e.price}</span>
                </div>
                
                <h2>${e.title}</h2>
                
                <div class="e-meta">
                    <span><i class="far fa-clock"></i> ${e.time}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>
                </div>
                
                <p style="margin-bottom:1rem; color:var(--text-secondary); line-height:1.5;">${e.desc}</p>
                
                <div class="e-actions">
                    <button class="btn-rsvp" ${isRsvp ? 'disabled' : ''} onclick="window.toggleRsvp('${e.id}')">
                        ${isRsvp ? '<i class="fas fa-check"></i> Attending' : 'RSVP Now'}
                    </button>
                    <div class="attendees">
                         <div class="att-avatars">
                             <div class="att-av"></div><div class="att-av"></div><div class="att-av"></div>
                         </div>
                         +${e.attendees} going
                    </div>
                </div>
            </div>
        </div>
      `;
  }

  // --- Calendar View ---
  function renderCalendarContainer() {
    el.listContainer.style.display = 'none';
    el.emptyState.style.display = 'none';
    el.calContainer.style.display = 'block';

    renderCalendar(currentDate);
  }

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    el.calMonthYear.textContent = `${months[month]} ${year}`;

    // Days generation
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 is Sunday

    let html = '';

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      html += `<div class="c-cell inactive"></div>`;
    }

    // Days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      // Find events for this day
      const dayEvents = filteredEvents.filter(e =>
        e.date.getDate() === d &&
        e.date.getMonth() === month &&
        e.date.getFullYear() === year
      );

      const dots = dayEvents.map(e => {
        const colorMap = { 'Workshop': '#9f7aea', 'Webinar': '#4299e1', 'Conference': '#ed8936', 'Hackathon': '#e53e3e', 'Networking': '#38a169' };
        return `<span class="c-event-dot" style="background:${colorMap[e.type] || '#ccc'}"></span>`;
      }).join('');

      html += `
            <div class="c-cell ${isToday ? 'today' : ''}">
                <div>${d}</div>
                <div class="c-events">${dots}</div>
            </div>
          `;
    }

    el.calBody.innerHTML = html;
  }

  // --- Banner ---
  function renderBanner() {
    const attending = allEvents.filter(e => myRsvps.has(e.id)).sort((a, b) => a.date - b.date);

    if (attending.length === 0) {
      el.banner.style.display = 'none';
      return;
    }

    el.banner.style.display = 'block';
    el.rsvpList.innerHTML = attending.map(e => `
          <div class="mini-card">
              <span class="mini-date">${e.date.getMonth() + 1}/${e.date.getDate()}</span>
              <span>${e.title}</span>
          </div>
      `).join('');
  }

  // --- Actions ---
  window.toggleRsvp = (id) => {
    if (myRsvps.has(id)) {
      // Typically we might un-rsvp, but for this mock let's just assume we add
      return;
    }
    myRsvps.add(id);
    localStorage.setItem('brainex_events_rsvp', JSON.stringify(Array.from(myRsvps)));

    // Re-render
    renderBanner();
    if (currentView === 'list') renderList(); // update button state

    if (el.myEventsToggle.checked) window.applyFilters();
  };

  // --- Filtering ---
  window.applyFilters = function () {
    // Inputs
    const dateVal = document.querySelector('input[name="dateFilter"]:checked').value;
    const types = Array.from(el.typeChecks).filter(c => c.checked).map(c => c.value);
    const locs = Array.from(el.locChecks).filter(c => c.checked).map(c => c.value);
    const freeOnly = el.freeToggle.checked;
    const search = el.search.value.toLowerCase();
    const myEvents = el.myEventsToggle.checked;

    const now = new Date();

    filteredEvents = allEvents.filter(e => {
      // My Events
      if (myEvents && !myRsvps.has(e.id)) return false;

      // Search
      if (search && !e.title.toLowerCase().includes(search) && !e.organizer.toLowerCase().includes(search)) return false;

      // Free
      if (freeOnly && e.price > 0) return false;

      // Types
      if (types.length > 0 && !types.includes(e.type)) return false;

      // Locs
      if (locs.length > 0) {
        const isOnline = e.location.toLowerCase().includes('online');
        const isInPerson = !isOnline;
        const matchOnline = locs.includes('Online') && isOnline;
        const matchInPerson = locs.includes('In-Person') && isInPerson;
        if (!matchOnline && !matchInPerson) return false;
      }

      // Date logic
      const diffDays = (e.date - now) / (1000 * 60 * 60 * 24);
      if (dateVal === 'week' && (diffDays < 0 || diffDays > 7)) return false;
      if (dateVal === 'month' && (diffDays < 0 || diffDays > 30)) return false;

      return true;
    });

    // Sort
    const sort = el.sortSelect.value;
    filteredEvents.sort((a, b) => {
      if (sort === 'date') return a.date - b.date; // already mocked logic usually
      if (sort === 'price_low') return a.price - b.price;
      if (sort === 'popular') return b.attendees - a.attendees;
      return 0;
    });

    if (currentView === 'list') renderList();
    else renderCalendarContainer();
  };

  // --- Listeners ---
  function setupListeners() {
    // Controls
    el.viewBtns.forEach(btn => btn.addEventListener('click', () => {
      el.viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      if (currentView === 'list') renderList();
      else renderCalendarContainer();
    }));

    el.search.addEventListener('input', window.applyFilters);
    el.sortSelect.addEventListener('change', window.applyFilters);
    el.myEventsToggle.addEventListener('change', window.applyFilters);
    el.clearBtn.addEventListener('click', () => {
      el.search.value = '';
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      document.querySelectorAll('input[name="dateFilter"]')[0].checked = true;
      window.applyFilters();
    });

    // Filters
    el.dateRadios.forEach(r => r.addEventListener('change', window.applyFilters));
    el.typeChecks.forEach(c => c.addEventListener('change', window.applyFilters));
    el.locChecks.forEach(c => c.addEventListener('change', window.applyFilters));
    el.freeToggle.addEventListener('change', window.applyFilters);

    // Calendar Nav
    el.prevMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
    el.nextMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
