// Admin Dashboard JavaScript

// Global admin data
let adminData = {
    scholarships: JSON.parse(localStorage.getItem('admin_scholarships')) || [],
    mentors: JSON.parse(localStorage.getItem('admin_mentors')) || [],
    fields: JSON.parse(localStorage.getItem('admin_fields')) || [],
    events: JSON.parse(localStorage.getItem('admin_events')) || [],
    users: JSON.parse(localStorage.getItem('admin_users')) || []
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize sidebar navigation
    initializeSidebarNavigation();
    
    // Load initial dashboard data
    loadDashboard();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Load sample data if empty
    if (adminData.scholarships.length === 0) {
        loadSampleData();
    }
});

// Check admin authentication
function checkAdminAuth() {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (!adminAuth) {
        // Redirect to admin login or show admin login modal
        showAdminLogin();
    }
}

// Admin login function
function showAdminLogin() {
    const password = prompt('Enter Admin Password:');
    if (password === 'admin123') { // Simple demo password
        localStorage.setItem('admin_authenticated', 'true');
        showNotification('Admin login successful!', 'success');
    } else if (password !== null) {
        alert('Invalid admin password!');
        window.location.href = 'main.html';
    } else {
        window.location.href = 'main.html';
    }
}

// Sidebar navigation
function initializeSidebarNavigation() {
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
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

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'overview':
            loadDashboard();
            break;
        case 'scholarships':
            loadScholarshipsTable();
            break;
        case 'mentors':
            loadMentorsTable();
            break;
        case 'fields':
            loadFieldsGrid();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'events':
            loadEventsTable();
            break;
    }
}

// Load dashboard overview
function loadDashboard() {
    updateDashboardStats();
    loadRecentActivity();
}

function updateDashboardStats() {
    document.getElementById('totalUsers').textContent = adminData.users.length;
    document.getElementById('totalScholarships').textContent = adminData.scholarships.length;
    document.getElementById('totalMentors').textContent = adminData.mentors.length;
    document.getElementById('monthlyRevenue').textContent = '$45,250';
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    const activities = [
        { icon: '👤', text: 'New user registration: Sarah Johnson', time: '2 minutes ago' },
        { icon: '💰', text: 'New scholarship added: Gates Foundation', time: '1 hour ago' },
        { icon: '👨‍🏫', text: 'Mentor verified: Dr. Michael Chen', time: '3 hours ago' },
        { icon: '🚀', text: 'New project created: AI Healthcare', time: '5 hours ago' },
        { icon: '🎪', text: 'Event registration spike: Hackathon 2025', time: '1 day ago' }
    ];
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <span class="activity-text">${activity.text}</span>
            <span class="activity-time">${activity.time}</span>
        </div>
    `).join('');
}

// Load scholarships table
function loadScholarshipsTable() {
    const tableBody = document.getElementById('scholarshipsTable');
    
    tableBody.innerHTML = adminData.scholarships.map(scholarship => `
        <tr>
            <td>${scholarship.name}</td>
            <td>${scholarship.organization}</td>
            <td>${scholarship.amount}</td>
            <td>${new Date(scholarship.deadline).toLocaleDateString()}</td>
            <td><span class="status-badge status-${scholarship.status}">${scholarship.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" onclick="editScholarship(${scholarship.id})">Edit</button>
                    <button class="btn-table btn-view" onclick="viewScholarship(${scholarship.id})">View</button>
                    <button class="btn-table btn-delete" onclick="deleteScholarship(${scholarship.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load mentors table
function loadMentorsTable() {
    const tableBody = document.getElementById('mentorsTable');
    
    tableBody.innerHTML = adminData.mentors.map(mentor => `
        <tr>
            <td>${mentor.name}</td>
            <td>${mentor.field}</td>
            <td>${mentor.company}</td>
            <td>${mentor.rating || '4.8'}⭐</td>
            <td>${mentor.mentees || Math.floor(Math.random() * 100) + 20}</td>
            <td><span class="status-badge status-${mentor.status}">${mentor.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-edit" onclick="editMentor(${mentor.id})">Edit</button>
                    <button class="btn-table btn-view" onclick="viewMentor(${mentor.id})">View</button>
                    <button class="btn-table btn-delete" onclick="deleteMentor(${mentor.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load fields grid
function loadFieldsGrid() {
    const fieldsGrid = document.getElementById('fieldsGrid');
    
    fieldsGrid.innerHTML = adminData.fields.map(field => `
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
                <span>Students: ${Math.floor(Math.random() * 1000) + 100}</span>
            </div>
            <div class="table-actions">
                <button class="btn-table btn-edit" onclick="editField(${field.id})">Edit</button>
                <button class="btn-table btn-delete" onclick="deleteField(${field.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Initialize form handlers
function initializeFormHandlers() {
    // Scholarship form
    document.getElementById('addScholarshipForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const scholarship = {
            id: Date.now(),
            name: formData.get('name'),
            organization: formData.get('organization'),
            amount: formData.get('amount'),
            category: formData.get('category'),
            deadline: formData.get('deadline'),
            country: formData.get('country'),
            description: formData.get('description'),
            website: formData.get('website'),
            status: formData.get('status') || 'active',
            createdAt: new Date().toISOString()
        };
        
        adminData.scholarships.push(scholarship);
        localStorage.setItem('admin_scholarships', JSON.stringify(adminData.scholarships));
        localStorage.setItem('scholarships', JSON.stringify(adminData.scholarships)); // For public access
        
        closeAdminModal();
        loadScholarshipsTable();
        showNotification('Scholarship added successfully!', 'success');
    });

    // Mentor form
    document.getElementById('addMentorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const mentor = {
            id: Date.now(),
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
            rating: 4.8,
            mentees: 0,
            createdAt: new Date().toISOString()
        };
        
        adminData.mentors.push(mentor);
        localStorage.setItem('admin_mentors', JSON.stringify(adminData.mentors));
        localStorage.setItem('mentors', JSON.stringify(adminData.mentors)); // For public access
        
        closeAdminModal();
        loadMentorsTable();
        showNotification('Mentor added successfully!', 'success');
    });

    // Field form
    document.getElementById('addFieldForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const field = {
            id: Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            icon: formData.get('icon'),
            salary: formData.get('salary'),
            careers: formData.get('careers'),
            createdAt: new Date().toISOString()
        };
        
        adminData.fields.push(field);
        localStorage.setItem('admin_fields', JSON.stringify(adminData.fields));
        localStorage.setItem('fields', JSON.stringify(adminData.fields)); // For public access
        
        closeAdminModal();
        loadFieldsGrid();
        showNotification('Field added successfully!', 'success');
    });
}

// Modal functions
function showAddScholarshipModal() {
    document.getElementById('addScholarshipModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showAddMentorModal() {
    document.getElementById('addMentorModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showAddFieldModal() {
    document.getElementById('addFieldModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
}

// CRUD operations
function editScholarship(id) {
    const scholarship = adminData.scholarships.find(s => s.id === id);
    if (scholarship) {
        // Populate form with existing data
        showAddScholarshipModal();
        const form = document.getElementById('addScholarshipForm');
        form.name.value = scholarship.name;
        form.organization.value = scholarship.organization;
        form.amount.value = scholarship.amount;
        form.category.value = scholarship.category;
        form.deadline.value = scholarship.deadline;
        form.country.value = scholarship.country || '';
        form.description.value = scholarship.description;
        form.website.value = scholarship.website || '';
        form.status.value = scholarship.status;
        
        // Update form to edit mode
        form.setAttribute('data-edit-id', id);
    }
}

function deleteScholarship(id) {
    if (confirm('Are you sure you want to delete this scholarship?')) {
        adminData.scholarships = adminData.scholarships.filter(s => s.id !== id);
        localStorage.setItem('admin_scholarships', JSON.stringify(adminData.scholarships));
        localStorage.setItem('scholarships', JSON.stringify(adminData.scholarships));
        loadScholarshipsTable();
        showNotification('Scholarship deleted successfully!', 'success');
    }
}

function deleteMentor(id) {
    if (confirm('Are you sure you want to delete this mentor?')) {
        adminData.mentors = adminData.mentors.filter(m => m.id !== id);
        localStorage.setItem('admin_mentors', JSON.stringify(adminData.mentors));
        localStorage.setItem('mentors', JSON.stringify(adminData.mentors));
        loadMentorsTable();
        showNotification('Mentor deleted successfully!', 'success');
    }
}

function deleteField(id) {
    if (confirm('Are you sure you want to delete this field?')) {
        adminData.fields = adminData.fields.filter(f => f.id !== id);
        localStorage.setItem('admin_fields', JSON.stringify(adminData.fields));
        localStorage.setItem('fields', JSON.stringify(adminData.fields));
        loadFieldsGrid();
        showNotification('Field deleted successfully!', 'success');
    }
}

// Load sample data
function loadSampleData() {
    const sampleScholarships = [
        {
            id: 1,
            name: "Gates Cambridge Scholarship",
            organization: "University of Cambridge",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-12-15",
            country: "UK",
            description: "Prestigious scholarship for outstanding applicants from outside the UK",
            website: "https://example.com",
            status: "active",
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: "Rhodes Scholarship",
            organization: "University of Oxford",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-10-06",
            country: "UK",
            description: "The world's oldest graduate scholarship program",
            website: "https://example.com",
            status: "active",
            createdAt: new Date().toISOString()
        }
    ];

    const sampleMentors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            email: "sarah@example.com",
            title: "AI Research Director",
            company: "Google DeepMind",
            field: "technology",
            experience: "senior",
            bio: "Leading AI researcher with 15+ years experience",
            expertise: "Machine Learning, PhD Applications, Research",
            rate: 150,
            status: "verified",
            rating: 4.9,
            mentees: 200,
            createdAt: new Date().toISOString()
        }
    ];

    const sampleFields = [
        {
            id: 1,
            name: "Computer Science",
            category: "stem",
            description: "Study of computational systems and the design of computer systems",
            icon: "💻",
            salary: "$70K - $200K",
            careers: "Software Engineer, Data Scientist, Product Manager",
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: "Business Administration",
            category: "business",
            description: "Study of business operations, management, and strategy",
            icon: "📊",
            salary: "$60K - $180K",
            careers: "Manager, Consultant, Entrepreneur",
            createdAt: new Date().toISOString()
        }
    ];

    adminData.scholarships = sampleScholarships;
    adminData.mentors = sampleMentors;
    adminData.fields = sampleFields;

    // Save to localStorage
    localStorage.setItem('admin_scholarships', JSON.stringify(sampleScholarships));
    localStorage.setItem('admin_mentors', JSON.stringify(sampleMentors));
    localStorage.setItem('admin_fields', JSON.stringify(sampleFields));
    
    // Also save for public access
    localStorage.setItem('scholarships', JSON.stringify(sampleScholarships));
    localStorage.setItem('mentors', JSON.stringify(sampleMentors));
    localStorage.setItem('fields', JSON.stringify(sampleFields));
}

// Logout function
function logout() {
    localStorage.removeItem('admin_authenticated');
    window.location.href = 'main.html';
}

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