// Events Page Functionality (API Integrated)

const API_BASE_URL = '/api';
let allEvents = [];
let currentEvents = [];

document.addEventListener('DOMContentLoaded', function () {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🚀 Events Page Initializing...');
  }

  // Initialize global state
  initializeEventsPage();

  // Event Listeners
  setupEventFilters();
  setupCalendarNav();
  setupEventActions();
  setupSearchFunctionality();
  setupViewToggle();
});

async function initializeEventsPage() {
  const grid = document.querySelector('.featured-grid');
  if (grid)
    grid.innerHTML =
      '<div class="loading-state"><div class="spinner"></div><p>Loading events...</p></div>';

  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to fetch events');

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allEvents = result.data.map((e) => ({ ...e, id: e.id || e._id }));
    } else {
      console.error('Invalid events data:', result);
      allEvents = [];
    }
  } catch (error) {
    console.error('Error loading events:', error);
    // Fallback sample data
    allEvents = [
      {
        id: '1',
        title: 'Tech Career Fair 2025',
        date: new Date(Date.now() + 86400000).toISOString(),
        type: 'Career',
        location: 'San Francisco, CA',
        organizer: 'TechHub',
        description: 'Meet top employers and find your next role.',
        tags: ['Networking', 'Career'],
        status: 'upcoming',
      },
      {
        id: '2',
        title: 'React Summit',
        date: new Date(Date.now() + 172800000).toISOString(),
        type: 'Conference',
        location: 'Online',
        organizer: 'React Community',
        description: 'Global summit for React developers.',
        tags: ['Dev', 'React'],
        status: 'upcoming',
      },
      {
        id: '3',
        title: 'AI in Education',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: 'Webinar',
        location: 'Online',
        organizer: 'BraineX',
        description: 'Exploring the future of AI in classrooms.',
        tags: ['AI', 'Education'],
        status: 'past',
      },
    ];
    if (grid) grid.innerHTML = ''; // Clear loading/error state provided by previous lines
  }

  currentEvents = [...allEvents];
  renderEvents(currentEvents);
  renderCalendar(new Date());
  renderUpcomingEvents(currentEvents);
}

function renderEvents(events) {
  const grid = document.querySelector('.featured-grid');
  if (!grid) return;

  if (events.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>No events found matching your criteria.</p></div>';
    return;
  }

  grid.innerHTML = events.map((event) => createEventCard(event)).join('');
}

function createEventCard(event) {
  const dateStr = new Date(event.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isUpcoming = new Date(event.date) > new Date();
  const badgeText = isUpcoming
    ? event.status === 'upcoming'
      ? '🚀 Upcoming'
      : event.status
    : '🏁 Past';

  // Placeholder image logic
  const icon = getEventIcon(event.type);

  return `
        <div class="event-featured-card" data-id="${event.id}" style="cursor: pointer;">
            <div class="event-badge">${badgeText}</div>
            <div class="event-image">
                <div class="event-placeholder">${icon}</div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-organizer">by ${event.organizer || 'BraineX'}</p>
                <p class="event-description">${event.description}</p>
                
                <div class="event-details">
                    <div class="detail">
                        <span class="detail-icon">📅</span>
                        <span>${dateStr}</span>
                    </div>
                    <div class="detail">
                         <span class="detail-icon">📍</span>
                         <span>${event.location || 'Online'}</span>
                    </div>
                    ${event.type
      ? `
                    <div class="detail">
                        <span class="detail-icon">🏷️</span>
                        <span>${event.type}</span>
                    </div>`
      : ''
    }
                </div>
                
    <div class="event-tags">
        <span class="tag">${event.type || 'Event'}</span>
        ${(event.tags || []).map((t) => `<span class="tag">${t}</span>`).join('')}
    </div>
    
    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button class="btn-event-primary js-event-action" data-id="${event.id}" data-action="${isUpcoming ? 'register' : 'view'}" style="flex: 1;">
            ${isUpcoming ? 'Register Now' : 'View Details'}
        </button>
        <button class="btn-secondary js-share-event" data-id="${event.id}" style="padding: 0.75rem; border-radius: 8px; cursor: pointer;" title="Share Event">📤</button>
        ${isUpcoming ? `<button class="btn-secondary js-add-calendar" data-id="${event.id}" style="padding: 0.75rem; border-radius: 8px; cursor: pointer;" title="Add to Calendar">📅</button>` : ''}
    </div>
</div>
</div>
`;
}

function setupEventActions() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.js-event-action');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'register') {
        registerForEvent(id);
      } else {
        viewEventDetails(id);
      }
      return;
    }

    // Share button
    const shareBtn = e.target.closest('.js-share-event');
    if (shareBtn) {
      const id = shareBtn.getAttribute('data-id');
      openShareModal(id);
      return;
    }

    // Add to calendar button
    const calBtn = e.target.closest('.js-add-calendar');
    if (calBtn) {
      const id = calBtn.getAttribute('data-id');
      downloadICSFile(id);
      return;
    }

    // Fallback for featured cards if any
    const miniCard = e.target.closest('.mini-event-card');
    if (miniCard) {
      // Mini cards usually imply view details
      const id = miniCard.getAttribute('data-id');
      if (id) viewEventDetails(id);
    }
  });
}

function viewEventDetails(eventId) {
  const event = allEvents.find((e) => e.id == eventId);
  if (!event) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h2>${event.title}</h2>
            <div class="event-meta" style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                 <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                 <p><strong>📍 Location:</strong> ${event.location || 'Online'}</p>
                 <p><strong>🏢 Organizer:</strong> ${event.organizer || 'BraineX'}</p>
            </div>
            <p style="font-size: 1.1rem; line-height: 1.6;">${event.description}</p>
            
            <div class="modal-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                 <button class="btn-secondary close-btn">Close</button>
                 ${new Date(event.date) > new Date()
      ? `<button class="btn-primary" onclick="registerForEvent('${event.id}')">Register Now</button>`
      : '<button class="btn-outline" disabled>Event Ended</button>'
    }
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close handlers
  const close = () => modal.remove();
  modal.querySelector('.close-modal').addEventListener('click', close);
  modal.querySelector('.close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function getEventIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('hackathon')) return '💻';
  if (t.includes('conference')) return '🎤';
  if (t.includes('workshop')) return '🛠️';
  if (t.includes('webinar')) return '📹';
  return '📅';
}

function setupEventFilters() {
  const typeSelect = document.getElementById('eventType');
  const fieldSelect = document.getElementById('eventField');
  const searchBtn = document.querySelector('.btn-search-events');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const type = typeSelect ? typeSelect.value.toLowerCase() : '';
      const field = fieldSelect ? fieldSelect.value.toLowerCase() : '';
      filterEvents(type, field);
    });
  }

  // Auto-filter on change
  [typeSelect, fieldSelect].forEach((select) => {
    if (select) {
      select.addEventListener('change', () => {
        const type = typeSelect ? typeSelect.value.toLowerCase() : '';
        const field = fieldSelect ? fieldSelect.value.toLowerCase() : '';
        filterEvents(type, field);
      });
    }
  });
}

function filterEvents(type, field) {
  currentEvents = allEvents.filter((e) => {
    const typeMatch = !type || type === 'all' || (e.type || '').toLowerCase().includes(type);
    // Field filtering might need tags or description check if field isn't explicit
    const eventTags = (e.tags || []).map((t) => t.toLowerCase());
    const fieldMatch =
      !field ||
      field === 'all' ||
      eventTags.some((t) => t.includes(field)) ||
      (e.description || '').toLowerCase().includes(field);
    return typeMatch && fieldMatch;
  });
  renderEvents(currentEvents);
}

// Global function for category card clicks
window.filterEventsByType = function (type) {
  // Update the dropdown to reflect selection
  const typeSelect = document.getElementById('eventType');
  if (typeSelect) {
    typeSelect.value = type;
  }

  // Scroll to featured events section
  const featuredSection = document.querySelector('.featured-events');
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Filter and show results
  filterEvents(type, '');

  // Show toast notification
  if (window.InteractionHandler) {
    window.InteractionHandler.showToast(`Showing ${type} events`);
  }
};

// Calendar Logic (Simplified)
let currentMonthDate = new Date();

function renderCalendar(date) {
  const grid = document.getElementById('calendarGrid');
  const monthTitle = document.getElementById('currentMonth');
  if (!grid || !monthTitle) return;

  monthTitle.textContent = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Clear grid
  grid.innerHTML = '';

  // Get days in month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells for previous month
  for (let i = 0; i < firstDay; i++) {
    const div = document.createElement('div');
    div.className = 'calendar-day empty';
    grid.appendChild(div);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.textContent = day;

    // precise check
    const checkDate = new Date(year, month, day).toDateString();
    const hasEvent = allEvents.some((e) => new Date(e.date).toDateString() === checkDate);

    if (hasEvent) {
      div.classList.add('has-event');
      div.innerHTML += '<span class="event-dot"></span>';
    }

    grid.appendChild(div);
  }
}

window.nextMonth = function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderCalendar(currentMonthDate);
};

window.previousMonth = function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderCalendar(currentMonthDate);
};

function setupCalendarNav() {
  const prevBtn = document.querySelector('.js-prev-month');
  const nextBtn = document.querySelector('.js-next-month');

  if (prevBtn) prevBtn.addEventListener('click', () => window.previousMonth());
  if (nextBtn) nextBtn.addEventListener('click', () => window.nextMonth());
}

function renderUpcomingEvents(events) {
  const container = document.getElementById('upcomingEvents');
  if (!container) return;

  const upcoming = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Take next 5

  container.innerHTML = upcoming
    .map(
      (e) => `
        <div class="mini-event-card" data-id="${e.id}">
            <div class="mini-date">
                <span class="day">${new Date(e.date).getDate()}</span>
                <span class="month">${new Date(e.date).toLocaleDateString(undefined, { month: 'short' })}</span>
            </div>
            <div class="mini-info">
                <h4>${e.title}</h4>
                <span>${e.type}</span>
            </div>
        </div>
    `
    )
    .join('');
}

window.registerForEvent = function (eventId) {
  const event = allEvents.find((e) => e.id == eventId || e._id == eventId);
  if (!event) return;

  // Show enhanced registration modal with form
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'registrationModal';
  modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="close-modal" onclick="this.closest('.modal').remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #64748b;">&times;</button>
            
            <div style="padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #1f2937;">Register for ${event.title}</h2>
                <p style="margin: 0; color: #64748b;">📅 ${new Date(event.date).toLocaleDateString()} • 📍 ${event.location || 'Online'}</p>
            </div>

            <form id="eventRegistrationForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Full Name *</label>
                    <input type="text" id="regName" required placeholder="Enter your full name" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Email Address *</label>
                    <input type="email" id="regEmail" required placeholder="your.email@example.com" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Phone Number</label>
                    <input type="tel" id="regPhone" placeholder="Optional" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Organization/University</label>
                    <input type="text" id="regOrg" placeholder="Optional" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;">Why do you want to attend? *</label>
                    <textarea id="regReason" required rows="3" placeholder="Tell us why you're interested in this event..." style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                </div>

                <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="regNewsletter" style="width: 18px; height: 18px; margin-right: 10px; cursor: pointer;">
                        <span style="color: #64748b; font-size: 0.95rem;">Send me updates about upcoming events</span>
                    </label>
                </div>

                <button type="submit" style="padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">Complete Registration</button>
            </form>
        </div>
    `;
  document.body.appendChild(modal);

  // Form submit handler
  document.getElementById('eventRegistrationForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const org = document.getElementById('regOrg').value.trim();
    const reason = document.getElementById('regReason').value.trim();
    const newsletter = document.getElementById('regNewsletter').checked;

    // Validation
    if (!name || !email || !reason) {
      if (window.BraineX?.showNotification) {
        BraineX.showNotification('Please fill in all required fields', 'error');
      } else {
        alert('Please fill in all required fields');
      }
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (window.BraineX?.showNotification) {
        BraineX.showNotification('Please enter a valid email address', 'error');
      } else {
        alert('Please enter a valid email address');
      }
      return;
    }

    // Save registration
    const registrations = JSON.parse(localStorage.getItem('event_registrations') || '[]');
    registrations.push({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      name,
      email,
      phone,
      organization: org,
      reason,
      newsletter,
      registeredAt: new Date().toISOString()
    });
    localStorage.setItem('event_registrations', JSON.stringify(registrations));

    // Also save to my_events for backward compatibility
    saveEventToLocalStorage(event);

    modal.remove();
    if (window.BraineX?.showNotification) {
      BraineX.showNotification(`Successfully registered for ${event.title}!`, 'success');
    } else {
      alert(`Successfully registered for ${event.title}!`);
    }
  });
};

window.confirmRegistration = async function (eventId, btn) {
  window.setLoadingState?.(btn, true, 'Registering...');

  const event = allEvents.find((e) => e.id == eventId || e._id == eventId);
  if (!event) {
    window.setLoadingState?.(btn, false);
    return;
  }

  // Try API first if available
  if (window.authAPI && window.authAPI.isAuthenticated()) {
    try {
      const response = await window.authAPI.request('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'event',
          data: { eventId: eventId },
        }),
      });

      const result = await response.json();

      if (result.success) {
        saveEventToLocalStorage(event);
        BraineX.showNotification('Successfully registered!', 'success');
        setTimeout(() => {
          btn.closest('.modal').remove();
        }, 800);
        return;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      console.error('API registration failed, using local fallback:', e);
      // Fall through to local storage
    }
  }

  // Local storage fallback (for demo or when API is unavailable)
  saveEventToLocalStorage(event);
  BraineX.showNotification('Successfully registered! (Saved locally)', 'success');
  setTimeout(() => {
    btn.closest('.modal').remove();
  }, 800);

  window.setLoadingState?.(btn, false);
};

function saveEventToLocalStorage(event) {
  const myEvents = JSON.parse(localStorage.getItem('my_events') || '[]');

  // Check if already registered
  if (myEvents.some((e) => e.id === event.id)) {
    return; // Already registered
  }

  myEvents.push({
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.location,
    registeredAt: new Date().toISOString(),
  });

  localStorage.setItem('my_events', JSON.stringify(myEvents));
}

// ===========================================
// Search Functionality
// ===========================================
function setupSearchFunctionality() {
  const searchInput = document.getElementById('eventSearch') || document.querySelector('.search-input');
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim().toLowerCase();
      searchEvents(query);
    }, 300);
  });
}

function searchEvents(query) {
  if (!query) {
    currentEvents = [...allEvents];
  } else {
    currentEvents = allEvents.filter(event => {
      const searchableText = `${event.title} ${event.description} ${event.organizer} ${event.type} ${(event.tags || []).join(' ')}`.toLowerCase();
      return searchableText.includes(query);
    });
  }
  renderEvents(currentEvents);
}

// ===========================================
// Download .ics Calendar File
// ===========================================
function downloadICSFile(eventId) {
  const event = allEvents.find(e => e.id == eventId);
  if (!event) return;

  const eventDate = new Date(event.date);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const startDate = formatDate(eventDate);
  const endDate = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)); // +2 hours

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BraineX//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:event-${event.id}@brainex.com`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || 'BraineX Event'}`,
    `LOCATION:${event.location || 'Online'}`,
    `ORGANIZER:CN=${event.organizer || 'BraineX'}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\r\\n');

  // Create and download file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  if (window.BraineX?.showNotification) {
    BraineX.showNotification('Calendar file downloaded!', 'success');
  }
}

// ===========================================
// Share Event Modal
// ===========================================
function openShareModal(eventId) {
  const event = allEvents.find(e => e.id == eventId);
  if (!event) return;

  const eventUrl = `${window.location.origin}/events/${event.id}`;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'shareModal';
  modal.innerHTML = `
    <div class=\"modal-content\" style=\"max-width: 500px;\">
      <button class=\"close-modal\" onclick=\"this.closest('.modal').remove()\" style=\"position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #64748b;\">&times;</button>
      
      <div style=\"padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem;\">
        <h2 style=\"margin: 0 0 0.5rem 0; color: #1f2937;\">Share Event</h2>
        <p style=\"margin: 0; color: #64748b;\">${event.title}</p>
      </div>

      <div style=\"display: flex; flex-direction: column; gap: 1rem;\">
        <div>
          <label style=\"display: block; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937;\">Event Link</label>
          <div style=\"display: flex; gap: 0.5rem;\">
            <input type=\"text\" id=\"shareUrl\" value=\"${eventUrl}\" readonly style=\"flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; background: #f9fafb;\">
            <button onclick=\"copyToClipboard('${eventUrl}')\" style=\"padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;\">Copy</button>
          </div>
        </div>

        <div>
          <label style=\"display: block; margin-bottom: 0.75rem; font-weight: 600; color: #1f2937;\">Share on Social Media</label>
          <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;\">
            <a href=\"https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(event.title)}\" target=\"_blank\" style=\"padding: 0.75rem; background: #1da1f2; color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600;\">🐦 Twitter</a>
            <a href=\"https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}\" target=\"_blank\" style=\"padding: 0.75rem; background: #1877f2; color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600;\">📘 Facebook</a>
            <a href=\"https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}\" target=\"_blank\" style=\"padding: 0.75rem; background: #0a66c2; color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600;\">💼 LinkedIn</a>
            <a href=\"mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Check out this event: ${eventUrl}`)}\" style=\"padding: 0.75rem; background: #64748b; color: white; text-align: center; border-radius: 8px; text-decoration: none; font-weight: 600;\">📧 Email</a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (window.BraineX?.showNotification) {
      BraineX.showNotification('Link copied to clipboard!', 'success');
    } else {
      alert('Link copied!');
    }
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

window.copyToClipboard = copyToClipboard;

// ===========================================
// View Toggle (List vs Calendar)
// ===========================================
function setupViewToggle() {
  const listViewBtn = document.querySelector('.js-view-list');
  const calendarViewBtn = document.querySelector('.js-view-calendar');
  const eventsSection = document.querySelector('.featured-grid');
  const calendarSection = document.querySelector('.calendar-container');

  if (!listViewBtn || !calendarViewBtn) return;

  listViewBtn.addEventListener('click', () => {
    listViewBtn.classList.add('active');
    calendarViewBtn.classList.remove('active');
    if (eventsSection) eventsSection.style.display = 'grid';
    if (calendarSection) calendarSection.style.display = 'none';
  });

  calendarViewBtn.addEventListener('click', () => {
    calendarViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    if (eventsSection) eventsSection.style.display = 'none';
    if (calendarSection) calendarSection.style.display = 'block';
  });
}

// ===========================================
// Date Filter (Upcoming/Past/All)
// ===========================================
function setupDateFilter() {
  const dateFilter = document.getElementById('dateFilter');
  if (!dateFilter) return;

  dateFilter.addEventListener('change', (e) => {
    const filter = e.target.value;
    applyDateFilter(filter);
  });
}

function applyDateFilter(filter) {
  const now = new Date();

  if (filter === 'upcoming') {
    currentEvents = allEvents.filter(e => new Date(e.date) >= now);
  } else if (filter === 'past') {
    currentEvents = allEvents.filter(e => new Date(e.date) < now);
  } else {
    currentEvents = [...allEvents];
  }

  renderEvents(currentEvents);
}

// Enhanced filter function with date support
window.filterEventsEnhanced = function (type, field, dateFilter = 'all') {
  let filtered = allEvents;

  // Type filter
  if (type && type !== 'all') {
    filtered = filtered.filter(e => (e.type || '').toLowerCase().includes(type));
  }

  // Field filter
  if (field && field !== 'all') {
    filtered = filtered.filter(e => {
      const eventTags = (e.tags || []).map(t => t.toLowerCase());
      return eventTags.some(t => t.includes(field)) || (e.description || '').toLowerCase().includes(field);
    });
  }

  // Date filter
  if (dateFilter === 'upcoming') {
    filtered = filtered.filter(e => new Date(e.date) >= new Date());
  } else if (dateFilter === 'past') {
    filtered = filtered.filter(e => new Date(e.date) < new Date());
  }

  currentEvents = filtered;
  renderEvents(currentEvents);
};

// Call setup on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDateFilter);
} else {
  setupDateFilter();
}

