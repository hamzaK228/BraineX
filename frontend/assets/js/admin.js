// Admin Dashboard JavaScript
// Integrated with Backend API and AuthAPI

// Global admin state
let adminData = {
    scholarships: [],
    mentors: [],
    fields: [],
    events: [],
    users: []
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
        console.error('AuthAPI not loaded');
        window.location.href = 'main.html';
        return false;
    }

    if (!window.authAPI.isAuthenticated()) {
        // Not logged in at all
        window.location.href = 'main.html#login';
        return false;
    }

    if (!window.authAPI.isAdmin()) {
        // Logged in but not admin
        showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 2000);
        return false;
    }

    return true;
}

// Sidebar navigation
function initializeSidebarNavigation() {
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchAdminSection(section);
        });
    });
}

function switchAdminSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionId).classList.add('active');

    // Update sidebar active link
    document.querySelectorAll('.menu-link').forEach(link => {
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
            case 'events':
                // await loadEventsTable(); // API for events not fully implemented yet
                break;
        }
    } catch (error) {
        console.error(`Error loading ${sectionId}:`, error);
        showNotification(`Failed to load ${sectionId} data`, 'error');
    } finally {
        showLoading(false);
    }
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
    if (document.getElementById('totalUsers')) document.getElementById('totalUsers').textContent = stats.users || 0;
    if (document.getElementById('totalScholarships')) document.getElementById('totalScholarships').textContent = stats.scholarships || 0;
    if (document.getElementById('totalMentors')) document.getElementById('totalMentors').textContent = stats.mentors || 0;
    if (document.getElementById('monthlyRevenue')) document.getElementById('monthlyRevenue').textContent = '$45,250'; // Mock
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;

    const activities = [
        { icon: '👤', text: 'New user registration', time: 'Recently' },
        { icon: '💰', text: 'System stats updated', time: 'Just now' }
    ];

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
        </div>
    `).join('');
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

    tableBody.innerHTML = scholarships.map(scholarship => `
        <tr>
            <td>${scholarship.name}</td>
            <td>${scholarship.organization}</td>
            <td>${scholarship.amount}</td>
            <td>${new Date(scholarship.deadline).toLocaleDateString()}</td>
            <td><span class="status-badge status-${scholarship.status}">${scholarship.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" onclick="editScholarship('${scholarship.id || scholarship._id}')">Edit</button>
                    <button class="btn-table btn-view" onclick="viewScholarship('${scholarship.id || scholarship._id}')">View</button>
                    <button class="btn-table btn-delete" onclick="deleteScholarship('${scholarship.id || scholarship._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
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

    tableBody.innerHTML = mentors.map(mentor => `
        <tr>
            <td>${mentor.name}</td>
            <td>${mentor.field}</td>
            <td>${mentor.company}</td>
            <td>${mentor.rating || 'N/A'}⭐</td>
            <td>${mentor.mentees || 0}</td>
            <td><span class="status-badge status-${mentor.status}">${mentor.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" onclick="editMentor('${mentor.id || mentor._id}')">Edit</button>
                    <button class="btn-table btn-view" onclick="viewMentor('${mentor.id || mentor._id}')">View</button>
                    <button class="btn-table btn-delete" onclick="deleteMentor('${mentor.id || mentor._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
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

    fieldsGrid.innerHTML = fields.map(field => `
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
                <button class="btn-table btn-edit" onclick="editField('${field.id || field._id}')">Edit</button>
                <button class="btn-table btn-delete" onclick="deleteField('${field.id || field._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// --- Users ---

async function loadUsersTable() {
    try {
        const response = await window.authAPI.request('/admin/users');
        const data = await response.json();

        if (data.success) {
            adminData.users = data.data;
            // Render logic would go here if UI supports it
        }
    } catch (error) {
        console.log('Users load skipped');
    }
}


// --- Forms & CRUD ---

function initializeFormHandlers() {
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
                status: formData.get('status') || 'active'
            };

            try {
                let response;
                if (editId) {
                    response = await window.authAPI.request(`/admin/scholarships/${editId}`, {
                        method: 'PUT',
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await window.authAPI.request('/admin/scholarships', {
                        method: 'POST',
                        body: JSON.stringify(payload)
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
                status: formData.get('status') || 'pending'
            };

            try {
                let response;
                if (editId) {
                    response = await window.authAPI.request(`/admin/mentors/${editId}`, {
                        method: 'PUT',
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await window.authAPI.request('/admin/mentors', {
                        method: 'POST',
                        body: JSON.stringify(payload)
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
                careers: formData.get('careers')
            };

            try {
                let response;
                if (editId) {
                    response = await window.authAPI.request(`/admin/fields/${editId}`, {
                        method: 'PUT',
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await window.authAPI.request('/admin/fields', {
                        method: 'POST',
                        body: JSON.stringify(payload)
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

function closeAdminModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
}

// Place on global window object for HTML event handlers
window.closeAdminModal = closeAdminModal;

// Edit functions
window.editScholarship = function (id) {
    const scholarship = adminData.scholarships.find(s => s.id == id || s._id == id);
    if (!scholarship) return;

    showAddScholarshipModal(); // Opens and resets
    const form = document.getElementById('addScholarshipForm');
    if (!form) return;

    // Fill data
    form.name.value = scholarship.name;
    form.organization.value = scholarship.organization;
    form.amount.value = scholarship.amount;
    form.category.value = scholarship.category;
    form.deadline.value = scholarship.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : '';
    form.country.value = scholarship.country || '';
    form.description.value = scholarship.description;
    form.website.value = scholarship.website || '';
    form.status.value = scholarship.status;

    // Set edit ID
    form.setAttribute('data-edit-id', scholarship.id || scholarship._id);
};

window.editMentor = function (id) {
    const mentor = adminData.mentors.find(m => m.id == id || m._id == id);
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
    const field = adminData.fields.find(f => f.id == id || f._id == id);
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
                method: 'DELETE'
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
                method: 'DELETE'
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
                method: 'DELETE'
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
    window.location.href = 'main.html';
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
