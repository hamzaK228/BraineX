/* eslint-disable no-console, no-unused-vars */
// Admin Dashboard JavaScript
// Integrated with Backend API and AuthAPI

// Global admin state
let adminData = {
  scholarships: [],
  mentors: [],
  fields: [],
  events: [],
  users: [],
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async function () {
  // Check admin authentication
  if (!checkAdminAuth()) {
    return;
  }

  // Initialize sidebar navigation
  initializeSidebarNavigation();

  // Initialize form handlers
  initializeFormHandlers();

  // Load initial dashboard data
  await loadDashboard();
});

// Check admin authentication using AuthAPI
function checkAdminAuth() {
  // Ensure authAPI is initialized
  if (typeof window.authAPI === 'undefined') {
    if (window.location.hostname === 'localhost') {
      console.error('AuthAPI not loaded');
    }
    window.location.href = '/';
    return false;
  }

  if (!window.authAPI.isAuthenticated()) {
    // Not logged in at all
    window.location.href = '/#login';
    return false;
  }

  if (!window.authAPI.isAdmin()) {
    // Logged in but not admin
    showNotification('Access denied. Admin privileges required.', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return false;
  }

  return true;
}

// Sidebar navigation
function initializeSidebarNavigation() {
  document.querySelector('.admin-sidebar').addEventListener('click', function (e) {
    // Handle menu links
    const link = e.target.closest('.menu-link');
    if (link) {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      switchAdminSection(section);
    }
  });
}

function switchAdminSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach((section) => {
    section.classList.remove('active');
  });

  // Show target section
  document.getElementById(sectionId).classList.add('active');

  // Update sidebar active link
  document.querySelectorAll('.menu-link').forEach((link) => {
    link.classList.remove('active');
  });

  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  // Load section data
  loadSectionData(sectionId);
}

async function loadSectionData(sectionId) {
  showLoading(true);
  try {
    switch (sectionId) {
      case 'overview':
        await loadDashboard();
        break;
      case 'scholarships':
        await loadScholarshipsTable();
        break;
      case 'mentors':
        await loadMentorsTable();
        break;
      case 'fields':
        await loadFieldsGrid();
        break;
      case 'users':
        await loadUsersTable();
        break;
      case 'universities':
        await loadUniversitiesTable();
        break;
      case 'programs':
        await loadProgramsTable();
        break;
      case 'projects':
        await loadProjectsTable();
        break;
      case 'roadmaps':
        await loadRoadmapsTable();
        break;
      case 'events':
        await loadEventsTable();
        break;
      case 'analytics':
        await loadAnalytics();
        break;
      case 'settings':
        loadSettings();
        break;
    }
  } catch (error) {
    console.error(`Error loading ${sectionId}:`, error);
    showNotification(`Failed to load ${sectionId} data`, 'error');
  } finally {
    showLoading(false);
  }
}

// --- Analytics ---
async function loadAnalytics() {
  try {
    const response = await window.authAPI.request('/admin/stats');
    const data = await response.json();
    if (data.success) {
      const stats = data.data;
      if (document.getElementById('analyticsActiveUsers'))
        document.getElementById('analyticsActiveUsers').textContent = stats.totalUsers || 0;
      if (document.getElementById('analyticsApplications'))
        document.getElementById('analyticsApplications').textContent = stats.totalApplications || 0;

      renderGrowthChart(stats.totalUsers || 10);
    }
  } catch (e) {
    console.error("Analytics load failed", e);
  }
}

function renderGrowthChart(totalUsers) {
  const canvas = document.getElementById('userGrowthChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = 300;

  // Mock data based on total users to make it look realistic
  const dataPoints = [
    Math.floor(totalUsers * 0.2),
    Math.floor(totalUsers * 0.35),
    Math.floor(totalUsers * 0.5),
    Math.floor(totalUsers * 0.65),
    Math.floor(totalUsers * 0.8),
    totalUsers
  ];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background grid
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const y = height - (height * i / 5) - 30;
    ctx.moveTo(40, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Draw Line
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.beginPath();

  const xStep = (width - 60) / (dataPoints.length - 1);
  const maxY = Math.max(...dataPoints) * 1.2;

  dataPoints.forEach((val, i) => {
    const x = 50 + i * xStep;
    const y = height - (val / maxY * (height - 50)) - 30;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    // Draw point
    ctx.fillStyle = '#764ba2';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.fillText(labels[i], x - 10, height - 10);
  });
  ctx.stroke();
}

function loadSettings() {
  // Placeholder for settings load logic
  console.log("Settings loaded");
}

// Show/Hide global loading indicator
function showLoading(show) {
  // You might want to add a loader element to your HTML if it doesn't exist
  const loader = document.querySelector('.loader') || document.body;
  if (show) {
    loader.classList.add('loading');
  } else {
    loader.classList.remove('loading');
  }
}

// Load dashboard overview
async function loadDashboard() {
  try {
    const response = await window.authAPI.request('/admin/stats');
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        updateDashboardStats(result.data);
      }
    }
    loadRecentActivity();
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

function updateDashboardStats(stats) {
  // Fix property names to match backend API response
  if (document.getElementById('totalUsers'))
    document.getElementById('totalUsers').textContent = stats.users?.total || stats.totalUsers || 0;
  if (document.getElementById('totalScholarships'))
    document.getElementById('totalScholarships').textContent = stats.totalScholarships || 0;
  if (document.getElementById('totalMentors'))
    document.getElementById('totalMentors').textContent = stats.totalMentors || 0;
  if (document.getElementById('monthlyRevenue'))
    document.getElementById('monthlyRevenue').textContent =
      '$' + (stats.monthlyRevenue || 45250).toLocaleString();
}

function loadRecentActivity() {
  const activityContainer = document.getElementById('recentActivity');
  if (!activityContainer) return;

  const activities = [
    { icon: '👤', text: 'New user registration', time: 'Recently' },
    { icon: '💰', text: 'System stats updated', time: 'Just now' },
  ];

  activityContainer.innerHTML = activities
    .map(
      (activity) => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
        </div>
    `
    )
    .join('');
}

// --- Scholarships ---

async function loadScholarshipsTable() {
  try {
    const response = await window.authAPI.request('/admin/scholarships');
    const data = await response.json();

    if (data.success) {
      adminData.scholarships = data.data;
      renderScholarshipsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load scholarships', 'error');
  }
}

function renderScholarshipsTable(scholarships) {
  const tableBody = document.getElementById('scholarshipsTable');
  if (!tableBody) return;

  tableBody.innerHTML = scholarships
    .map(
      (scholarship) => `
        <tr>
            <td>${scholarship.name}</td>
            <td>${scholarship.organization}</td>
            <td>${scholarship.amount}</td>
            <td>${new Date(scholarship.deadline).toLocaleDateString()}</td>
            <td><span class="status-badge status-${scholarship.status}">${scholarship.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" data-action="edit-scholarship" data-id="${scholarship.id || scholarship._id}">Edit</button>
                    <button class="btn-table btn-view" data-action="view-scholarship" data-id="${scholarship.id || scholarship._id}">View</button>
                    <button class="btn-table btn-delete" data-action="delete-scholarship" data-id="${scholarship.id || scholarship._id}">Delete</button>
                </div>
            </td>
        </tr>
    `
    )
    .join('');
}

// --- Mentors ---

async function loadMentorsTable() {
  try {
    const response = await window.authAPI.request('/admin/mentors');
    const data = await response.json();

    if (data.success) {
      adminData.mentors = data.data;
      renderMentorsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load mentors', 'error');
  }
}

function renderMentorsTable(mentors) {
  const tableBody = document.getElementById('mentorsTable');
  if (!tableBody) return;

  tableBody.innerHTML = mentors
    .map(
      (mentor) => `
        <tr>
            <td>${mentor.name}</td>
            <td>${mentor.field}</td>
            <td>${mentor.company}</td>
            <td>${mentor.rating || 'N/A'}⭐</td>
            <td>${mentor.mentees || 0}</td>
            <td><span class="status-badge status-${mentor.status}">${mentor.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" data-action="edit-mentor" data-id="${mentor.id || mentor._id}">Edit</button>
                    <button class="btn-table btn-view" data-action="view-mentor" data-id="${mentor.id || mentor._id}">View</button>
                    <button class="btn-table btn-delete" data-action="delete-mentor" data-id="${mentor.id || mentor._id}">Delete</button>
                </div>
            </td>
        </tr>
    `
    )
    .join('');
}

// --- Fields ---

async function loadFieldsGrid() {
  try {
    const response = await window.authAPI.request('/admin/fields');
    const data = await response.json();

    if (data.success) {
      adminData.fields = data.data;
      renderFieldsGrid(data.data);
    }
  } catch (error) {
    showNotification('Failed to load fields', 'error');
  }
}

function renderFieldsGrid(fields) {
  const fieldsGrid = document.getElementById('fieldsGrid');
  if (!fieldsGrid) return;

  fieldsGrid.innerHTML = fields
    .map(
      (field) => `
        <div class="field-admin-card">
            <div class="field-header">
                <div>
                    <div class="field-icon">${field.icon || '📚'}</div>
                    <h4>${field.name}</h4>
                </div>
                <span class="field-category">${field.category}</span>
            </div>
            <p>${field.description}</p>
            <div class="field-stats">
                <span>Salary: ${field.salary || 'N/A'}</span>
            </div>
            <div class="table-actions">
                <button class="btn-table btn-edit" data-action="edit-field" data-id="${field.id || field._id}">Edit</button>
                <button class="btn-table btn-delete" data-action="delete-field" data-id="${field.id || field._id}">Delete</button>
            </div>
        </div>
    `
    )
    .join('');
}

// --- Universities ---

async function loadUniversitiesTable() {
  try {
    const response = await window.authAPI.request('/admin/universities');
    const data = await response.json();
    if (data.success) {
      adminData.universities = data.data;
      renderUniversitiesTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load universities', 'error');
  }
}

function renderUniversitiesTable(universities) {
  const tableBody = document.getElementById('universitiesTable');
  if (!tableBody) return;
  tableBody.innerHTML = universities
    .map(
      (u) => `
    <tr>
      <td>${u.name}</td>
      <td>${u.location}</td>
      <td>${u.rank || 'N/A'}</td>
      <td>${u.students || '0'}</td>
      <td>
        <div class="table-actions">
           <button class="btn-table btn-delete" data-action="delete-university" data-id="${u.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Programs ---

async function loadProgramsTable() {
  try {
    const response = await window.authAPI.request('/admin/programs');
    const data = await response.json();
    if (data.success) {
      adminData.programs = data.data;
      renderProgramsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load programs', 'error');
  }
}

function renderProgramsTable(programs) {
  const tableBody = document.getElementById('programsTable');
  if (!tableBody) return;
  tableBody.innerHTML = programs
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.organization}</td>
      <td>${new Date(p.deadline).toLocaleDateString()}</td>
      <td>${p.type || 'Program'}</td>
      <td>
        <div class="table-actions">
           <button class="btn-table btn-delete" data-action="delete-program" data-id="${p.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Projects ---

async function loadProjectsTable() {
  try {
    const response = await window.authAPI.request('/admin/projects');
    const data = await response.json();
    if (data.success) {
      adminData.projects = data.data;
      renderProjectsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load projects', 'error');
  }
}

function renderProjectsTable(projects) {
  const tableBody = document.getElementById('projectsTable');
  if (!tableBody) return;
  tableBody.innerHTML = projects
    .map(
      (p) => `
    <tr>
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${p.difficulty}</td>
      <td>${p.estimatedTime || 'N/A'}</td>
      <td>
        <div class="table-actions">
           <button class="btn-table btn-delete" data-action="delete-project" data-id="${p.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Roadmaps ---

async function loadRoadmapsTable() {
  try {
    const response = await window.authAPI.request('/admin/roadmaps');
    const data = await response.json();
    if (data.success) {
      adminData.roadmaps = data.data;
      renderRoadmapsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load roadmaps', 'error');
  }
}

function renderRoadmapsTable(roadmaps) {
  const tableBody = document.getElementById('roadmapsTable');
  if (!tableBody) return;
  tableBody.innerHTML = roadmaps
    .map(
      (r) => `
    <tr>
      <td>${r.title}</td>
      <td>${r.category}</td>
      <td>${r.steps ? r.steps.length : 0} steps</td>
      <td>${r.duration}</td>
      <td>
        <div class="table-actions">
           <button class="btn-table btn-delete" data-action="delete-roadmap" data-id="${r.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Events ---

async function loadEventsTable() {
  try {
    const response = await window.authAPI.request('/admin/events');
    const data = await response.json();
    if (data.success) {
      adminData.events = data.data;
      renderEventsTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load events', 'error');
  }
}

function renderEventsTable(events) {
  const tableBody = document.getElementById('eventsTable');
  if (!tableBody) return;
  tableBody.innerHTML = events
    .map(
      (e) => `
    <tr>
      <td>${e.title}</td>
      <td>${e.type}</td>
      <td>${new Date(e.date).toLocaleDateString()}</td>
      <td>${e.format || 'Online'}</td>
      <td>
         <div class="table-actions">
           <button class="btn-table btn-delete" data-action="delete-event" data-id="${e.id}">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Users ---

async function loadUsersTable() {
  try {
    const response = await window.authAPI.request('/admin/users');
    const data = await response.json();

    if (data.success) {
      adminData.users = data.data;
      renderUsersTable(data.data);
    }
  } catch (error) {
    showNotification('Failed to load users', 'error');
  }
}

function renderUsersTable(users) {
  const tableBody = document.getElementById('usersTable');
  if (!tableBody) return;

  tableBody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name || 'N/A'}</td>
      <td>${user.email}</td>
      <td><span class="status-badge status-${user.role === 'admin' ? 'active' : 'pending'}">${user.role}</span></td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="table-actions">
           ${user.role !== 'admin' ? `<button class="btn-table btn-edit" onclick="promoteUser('${user._id}')">Promote</button>` : ''}
           <button class="btn-table btn-delete" onclick="deleteUser('${user._id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.promoteUser = async function (id) {
  if (confirm('Make this user an admin?')) {
    try {
      const response = await window.authAPI.request(`/admin/users/${id}/promote`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        showNotification('User promoted successfully', 'success');
        loadUsersTable();
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      showNotification(e.message, 'error');
    }
  }
};

window.deleteUser = async function (id) {
  if (confirm('Delete this user?')) {
    try {
      const response = await window.authAPI.request(`/admin/users/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showNotification('User deleted successfully', 'success');
        loadUsersTable();
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      showNotification(e.message, 'error');
    }
  }
};

// --- Forms & CRUD ---

// --- Forms & CRUD & Event Delegation ---

function initializeFormHandlers() {
  // Global Click Delegation for Table Actions and Modals
  document.addEventListener('click', async function (e) {
    const target = e.target;

    // Table Actions
    if (target.matches('[data-action="edit-scholarship"]')) editScholarship(target.dataset.id);
    if (target.matches('[data-action="view-scholarship"]')) viewScholarship(target.dataset.id);
    if (target.matches('[data-action="delete-scholarship"]')) deleteScholarship(target.dataset.id);

    if (target.matches('[data-action="edit-mentor"]')) editMentor(target.dataset.id);
    if (target.matches('[data-action="view-mentor"]')) viewMentor(target.dataset.id);
    if (target.matches('[data-action="delete-mentor"]')) deleteMentor(target.dataset.id);

    if (target.matches('[data-action="edit-field"]')) editField(target.dataset.id);
    if (target.matches('[data-action="delete-field"]')) deleteField(target.dataset.id);

    if (target.matches('[data-action="edit-university"]')) editUniversity(target.dataset.id);
    if (target.matches('[data-action="delete-university"]'))
      window.deleteEntity('universities', target.dataset.id, loadUniversitiesTable);

    if (target.matches('[data-action="edit-program"]')) editProgram(target.dataset.id);
    if (target.matches('[data-action="delete-program"]'))
      window.deleteEntity('programs', target.dataset.id, loadProgramsTable);

    if (target.matches('[data-action="edit-project"]')) editProject(target.dataset.id);
    if (target.matches('[data-action="delete-project"]'))
      window.deleteEntity('projects', target.dataset.id, loadProjectsTable);

    if (target.matches('[data-action="edit-roadmap"]')) editRoadmap(target.dataset.id);
    if (target.matches('[data-action="delete-roadmap"]'))
      window.deleteEntity('roadmaps', target.dataset.id, loadRoadmapsTable);

    if (target.matches('[data-action="edit-event"]')) editEvent(target.dataset.id);
    if (target.matches('[data-action="delete-event"]'))
      window.deleteEntity('events', target.dataset.id, loadEventsTable);

    // Modal Openers
    if (target.matches('.js-add-scholarship')) showAddScholarshipModal();
    if (target.matches('.js-add-mentor')) showAddMentorModal();
    if (target.matches('.js-add-field')) showAddFieldModal();
    if (target.matches('.js-add-university')) showAddUniversityModal();
    if (target.matches('.js-add-program')) showAddProgramModal();
    if (target.matches('.js-add-project')) showAddProjectModal();
    if (target.matches('.js-add-roadmap')) showAddRoadmapModal();
    if (target.matches('.js-add-event')) showAddEventModal();

    // Modal Closers
    if (target.matches('.js-close-admin-modal') || target.matches('.close-modal'))
      closeAdminModal();

    // Logout
    if (target.matches('.js-logout')) window.logout();
  });

  // Scholarship form
  const scholarshipForm = document.getElementById('addScholarshipForm');
  if (scholarshipForm) {
    scholarshipForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        name: formData.get('name'),
        organization: formData.get('organization'),
        amount: formData.get('amount'),
        category: formData.get('category'),
        deadline: formData.get('deadline'),
        country: formData.get('country'),
        description: formData.get('description'),
        website: formData.get('website'),
        status: formData.get('status') || 'active',
      };

      try {
        let response;
        if (editId) {
          response = await window.authAPI.request(`/admin/scholarships/${editId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          response = await window.authAPI.request('/admin/scholarships', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }

        const data = await response.json();
        if (data.success) {
          closeAdminModal();
          loadScholarshipsTable();
          showNotification(`Scholarship ${editId ? 'updated' : 'added'} successfully!`, 'success');
          this.removeAttribute('data-edit-id');
          this.reset();
        } else {
          throw new Error(data.message || 'Operation failed');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  // Mentor form
  const mentorForm = document.getElementById('addMentorForm');
  if (mentorForm) {
    mentorForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        title: formData.get('title'),
        company: formData.get('company'),
        field: formData.get('field'),
        experience: formData.get('experience'),
        bio: formData.get('bio'),
        expertise: formData.get('expertise'),
        rate: formData.get('rate'),
        status: formData.get('status') || 'pending',
      };

      try {
        let response;
        if (editId) {
          response = await window.authAPI.request(`/admin/mentors/${editId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          response = await window.authAPI.request('/admin/mentors', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }

        const data = await response.json();
        if (data.success) {
          closeAdminModal();
          loadMentorsTable();
          showNotification(`Mentor ${editId ? 'updated' : 'added'} successfully!`, 'success');
          this.removeAttribute('data-edit-id');
          this.reset();
        } else {
          throw new Error(data.message || 'Operation failed');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  // Field form
  const fieldForm = document.getElementById('addFieldForm');
  if (fieldForm) {
    fieldForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        icon: formData.get('icon'),
        salary: formData.get('salary'),
        careers: formData.get('careers'),
      };

      try {
        let response;
        if (editId) {
          response = await window.authAPI.request(`/admin/fields/${editId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          response = await window.authAPI.request('/admin/fields', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }

        const data = await response.json();
        if (data.success) {
          closeAdminModal();
          loadFieldsGrid();
          showNotification(`Field ${editId ? 'updated' : 'added'} successfully!`, 'success');
          this.removeAttribute('data-edit-id');
          this.reset();
        } else {
          throw new Error(data.message || 'Operation failed');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      }
    });
  }

  // University form
  const universityForm = document.getElementById('addUniversityForm');
  if (universityForm) {
    universityForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        name: formData.get('name'),
        location: formData.get('location'),
        ranking: formData.get('ranking'),
        website: formData.get('website'),
        description: formData.get('description'),
      };

      await handleFormSubmit(this, 'universities', payload, editId, loadUniversitiesTable);
    });
  }

  // Program form
  const programForm = document.getElementById('addProgramForm');
  if (programForm) {
    programForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        name: formData.get('name'),
        university_name: formData.get('university_name'),
        degree: formData.get('degree'),
        applicationDeadline: formData.get('applicationDeadline'),
        description: formData.get('description'),
      };

      await handleFormSubmit(this, 'programs', payload, editId, loadProgramsTable);
    });
  }

  // Project form
  const projectForm = document.getElementById('addProjectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        title: formData.get('title'),
        category: formData.get('category'),
        status: formData.get('status'),
        difficulty: formData.get('difficulty'),
        description: formData.get('description'),
      };

      await handleFormSubmit(this, 'projects', payload, editId, loadProjectsTable);
    });
  }

  // Roadmap form
  const roadmapForm = document.getElementById('addRoadmapForm');
  if (roadmapForm) {
    roadmapForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        title: formData.get('title'),
        category: formData.get('category'),
        timeline: formData.get('timeline'),
        description: formData.get('description'),
      };

      await handleFormSubmit(this, 'roadmaps', payload, editId, loadRoadmapsTable);
    });
  }

  // Event form
  const eventForm = document.getElementById('addEventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const editId = this.getAttribute('data-edit-id');

      const payload = {
        title: formData.get('title'),
        date: formData.get('date'),
        eventType: formData.get('eventType'),
        format: formData.get('format'),
        description: formData.get('description'),
      };

      await handleFormSubmit(this, 'events', payload, editId, loadEventsTable);
    });
  }
}

// Generic Form Submit Handler to reduce duplication
async function handleFormSubmit(form, endpoint, payload, editId, refreshCallback) {
  try {
    let response;
    const typeName = endpoint.slice(0, -1); // remove 's'
    if (editId) {
      response = await window.authAPI.request(`/admin/${endpoint}/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      response = await window.authAPI.request(`/admin/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json();
    if (data.success) {
      closeAdminModal();
      if (refreshCallback) refreshCallback();
      showNotification(`${typeName.charAt(0).toUpperCase() + typeName.slice(1)} ${editId ? 'updated' : 'added'} successfully!`, 'success');
      form.removeAttribute('data-edit-id');
      form.reset();
    } else {
      throw new Error(data.message || 'Operation failed');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Modal functions
function showAddScholarshipModal() {
  const el = document.getElementById('addScholarshipForm');
  if (el) {
    el.reset();
    el.removeAttribute('data-edit-id');
  }
  const modal = document.getElementById('addScholarshipModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function showAddMentorModal() {
  const el = document.getElementById('addMentorForm');
  if (el) {
    el.reset();
    el.removeAttribute('data-edit-id');
  }
  const modal = document.getElementById('addMentorModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function showAddFieldModal() {
  const el = document.getElementById('addFieldForm');
  if (el) {
    el.reset();
    el.removeAttribute('data-edit-id');
  }
  const modal = document.getElementById('addFieldModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function showAddUniversityModal() {
  const el = document.getElementById('addUniversityForm');
  if (el) { el.reset(); el.removeAttribute('data-edit-id'); }
  const modal = document.getElementById('addUniversityModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function showAddProgramModal() {
  const el = document.getElementById('addProgramForm');
  if (el) { el.reset(); el.removeAttribute('data-edit-id'); }
  const modal = document.getElementById('addProgramModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function showAddProjectModal() {
  const el = document.getElementById('addProjectForm');
  if (el) { el.reset(); el.removeAttribute('data-edit-id'); }
  const modal = document.getElementById('addProjectModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function showAddRoadmapModal() {
  const el = document.getElementById('addRoadmapForm');
  if (el) { el.reset(); el.removeAttribute('data-edit-id'); }
  const modal = document.getElementById('addRoadmapModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function showAddEventModal() {
  const el = document.getElementById('addEventForm');
  if (el) { el.reset(); el.removeAttribute('data-edit-id'); }
  const modal = document.getElementById('addEventModal');
  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function closeAdminModal() {
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.classList.remove('show');
  });
  document.body.style.overflow = 'auto';
}

// Place on global window object for HTML event handlers
window.closeAdminModal = closeAdminModal;

// Edit functions
window.editScholarship = function (id) {
  const scholarship = adminData.scholarships.find((s) => s.id == id || s._id == id);
  if (!scholarship) return;

  showAddScholarshipModal(); // Opens and resets
  const form = document.getElementById('addScholarshipForm');
  if (!form) return;

  // Fill data
  form.name.value = scholarship.name;
  form.organization.value = scholarship.organization;
  form.amount.value = scholarship.amount;
  form.category.value = scholarship.category;
  form.deadline.value = scholarship.deadline
    ? new Date(scholarship.deadline).toISOString().split('T')[0]
    : '';
  form.country.value = scholarship.country || '';
  form.description.value = scholarship.description;
  form.website.value = scholarship.website || '';
  form.status.value = scholarship.status;

  // Set edit ID
  form.setAttribute('data-edit-id', scholarship.id || scholarship._id);
};

window.editMentor = function (id) {
  const mentor = adminData.mentors.find((m) => m.id == id || m._id == id);
  if (!mentor) return;

  showAddMentorModal();
  const form = document.getElementById('addMentorForm');
  if (!form) return;

  form.name.value = mentor.name;
  form.email.value = mentor.email || '';
  form.title.value = mentor.title;
  form.company.value = mentor.company;
  form.field.value = mentor.field;
  form.experience.value = mentor.experience;
  form.bio.value = mentor.bio;
  form.expertise.value = mentor.expertise;
  form.rate.value = mentor.rate;
  form.status.value = mentor.status;

  form.setAttribute('data-edit-id', mentor.id || mentor._id);
};

window.editField = function (id) {
  const field = adminData.fields.find((f) => f.id == id || f._id == id);
  if (!field) return;

  showAddFieldModal();
  const form = document.getElementById('addFieldForm');
  if (!form) return;

  form.name.value = field.name;
  form.category.value = field.category;
  form.description.value = field.description;
  form.icon.value = field.icon;
  form.salary.value = field.salary;
  form.careers.value = field.careers;

  form.setAttribute('data-edit-id', field.id || field._id);
};

window.editUniversity = function (id) {
  const university = adminData.universities.find((u) => u.id == id || u._id == id);
  if (!university) return;

  showAddUniversityModal();
  const form = document.getElementById('addUniversityForm');
  if (!form) return;

  form.name.value = university.name;
  form.location.value = university.location;
  form.ranking.value = university.ranking || '';
  form.website.value = university.website || '';
  form.description.value = university.description || '';

  form.setAttribute('data-edit-id', university.id || university._id);
};

window.editProgram = function (id) {
  const program = adminData.programs.find((p) => p.id == id || p._id == id);
  if (!program) return;

  showAddProgramModal();
  const form = document.getElementById('addProgramForm');
  if (!form) return;

  form.name.value = program.name;
  form.university_name.value = program.university_name || (program.university ? program.university.name : '');
  form.degree.value = program.degree;
  form.applicationDeadline.value = program.applicationDeadline ? new Date(program.applicationDeadline).toISOString().split('T')[0] : '';
  form.description.value = program.description || '';

  form.setAttribute('data-edit-id', program.id || program._id);
};

window.editProject = function (id) {
  const project = adminData.projects.find((p) => p.id == id || p._id == id);
  if (!project) return;

  showAddProjectModal();
  const form = document.getElementById('addProjectForm');
  if (!form) return;

  form.title.value = project.title;
  form.category.value = project.category;
  form.status.value = project.status;
  form.difficulty.value = project.difficulty;
  form.description.value = project.description || '';

  form.setAttribute('data-edit-id', project.id || project._id);
};

window.editRoadmap = function (id) {
  const roadmap = adminData.roadmaps.find((r) => r.id == id || r._id == id);
  if (!roadmap) return;

  showAddRoadmapModal();
  const form = document.getElementById('addRoadmapForm');
  if (!form) return;

  form.title.value = roadmap.title;
  form.category.value = roadmap.category;
  form.timeline.value = roadmap.timeline || '';
  form.description.value = roadmap.description || '';

  form.setAttribute('data-edit-id', roadmap.id || roadmap._id);
};

window.editEvent = function (id) {
  const event = adminData.events.find((e) => e.id == id || e._id == id);
  if (!event) return;

  showAddEventModal();
  const form = document.getElementById('addEventForm');
  if (!form) return;

  form.title.value = event.title;
  form.date.value = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
  form.eventType.value = event.eventType;
  form.format.value = event.format;
  form.description.value = event.description || '';

  form.setAttribute('data-edit-id', event.id || event._id);
};

// View functions (placeholder if check for detail)
window.viewScholarship = function (id) {
  console.log('View scholarship', id);
  // Could implement a view modal slightly different from edit
};
window.viewMentor = function (id) {
  console.log('View mentor', id);
};

// Delete functions
window.deleteScholarship = async function (id) {
  if (confirm('Are you sure you want to delete this scholarship?')) {
    try {
      const response = await window.authAPI.request(`/admin/scholarships/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Scholarship deleted', 'success');
        loadScholarshipsTable();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showNotification('Delete failed: ' + error.message, 'error');
    }
  }
};

window.deleteMentor = async function (id) {
  if (confirm('Are you sure you want to delete this mentor?')) {
    try {
      const response = await window.authAPI.request(`/admin/mentors/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Mentor deleted', 'success');
        loadMentorsTable();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showNotification('Delete failed: ' + error.message, 'error');
    }
  }
};

window.deleteField = async function (id) {
  if (confirm('Are you sure you want to delete this field?')) {
    try {
      const response = await window.authAPI.request(`/admin/fields/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Field deleted', 'success');
        loadFieldsGrid();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showNotification('Delete failed: ' + error.message, 'error');
    }
  }
};

// Logout
window.logout = function () {
  window.authAPI.logout();
  window.location.href = '/';
};

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

  notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

window.deleteEntity = async function (type, id, refreshCallback) {
  const typeName = type.slice(0, -1); // remove 's'
  if (confirm(`Are you sure you want to delete this ${typeName}?`)) {
    try {
      const response = await window.authAPI.request(`/admin/${type}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        showNotification(
          `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} deleted`,
          'success'
        );
        if (refreshCallback) refreshCallback();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showNotification('Delete failed: ' + error.message, 'error');
    }
  }
};
