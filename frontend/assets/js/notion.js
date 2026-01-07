// Notion-like Goals and Productivity System

// Global state
let goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
let tasks = JSON.parse(localStorage.getItem('edugateway_tasks')) || [];
let notes = JSON.parse(localStorage.getItem('edugateway_notes')) || [];
let events = JSON.parse(localStorage.getItem('edugateway_events')) || [];

// Notion API Integration
const NOTION_API_BASE = window.location.origin + '/api/notion';
let notionConfigured = false;
let currentNotionPage = null;

// Sidebar functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('closed');
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-closed');
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        // Basic handling for invalid section IDs (e.g., 'deadlines')
        showNotification('Section not found. Redirecting to Calendar.', 'info');
        const fallback = document.getElementById('calendar');
        if (fallback) {
            fallback.classList.add('active');
            sectionId = 'calendar';
        } else {
            return; // nothing to show
        }
    } else {
        targetSection.classList.add('active');
    }
    
    // Update sidebar active link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'overview':
            loadDashboard();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'progress':
            loadProgress();
            break;
        case 'notes':
            loadNotes();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'notion-guides':
            initializeNotionSection();
            break;
    }
}

// Dashboard functionality
function loadDashboard() {
    updateDashboardStats();
    loadUpcomingDeadlines();
    loadRecentGoals();
}

function updateDashboardStats() {
    const activeGoals = goals.filter(goal => goal.status !== 'completed').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const overallProgress = goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;
    const streak = calculateStreak();
    
    document.getElementById('totalGoals').textContent = activeGoals;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('progressPercent').textContent = overallProgress + '%';
    document.getElementById('currentStreak').textContent = streak;
}

function calculateStreak() {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        const dailyTasks = tasks.filter(task => 
            task.completedDate && new Date(task.completedDate).toDateString() === dateStr
        );
        
        if (dailyTasks.length > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function loadUpcomingDeadlines() {
    const container = document.getElementById('upcomingDeadlines');
    const upcoming = goals.filter(goal => {
        if (!goal.endDate) return false;
        const endDate = new Date(goal.endDate);
        const today = new Date();
        const daysDiff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff > 0 && daysDiff <= 7;
    }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming deadlines</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(goal => {
        const daysLeft = Math.ceil((new Date(goal.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return `
            <div class="deadline-item">
                <span class="deadline-title">${goal.title}</span>
                <span class="deadline-days">${daysLeft} days</span>
            </div>
        `;
    }).join('');
}

function loadRecentGoals() {
    const container = document.getElementById('recentGoals');
    const recent = goals.slice(-3).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">No goals yet</p>';
        return;
    }
    
    container.innerHTML = recent.map(goal => `
        <div class="goal-preview">
            <div class="goal-preview-title">${goal.title}</div>
            <div class="goal-preview-progress">
                <div class="mini-progress-bar">
                    <div class="mini-progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <span>${goal.progress}%</span>
            </div>
        </div>
    `).join('');
}

function saveQuickNote() {
    const noteText = document.getElementById('quickNote').value.trim();
    if (!noteText) return;
    
    const note = {
        id: Date.now(),
        title: 'Quick Note',
        content: noteText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(note);
    localStorage.setItem('edugateway_notes', JSON.stringify(notes));
    
    document.getElementById('quickNote').value = '';
    showNotification('Quick note saved!', 'success');
}

// Goals functionality
function loadGoals() {
    const container = document.getElementById('goalsContainer');
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No goals yet</h3>
                <p>Create your first goal to start tracking your progress</p>
                <button class="btn-primary" onclick="openGoalModal()">Add Your First Goal</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = goals.map(goal => createGoalCard(goal)).join('');
}

function createGoalCard(goal) {
    const priorityColors = {
        high: 'high',
        medium: 'medium', 
        low: 'low'
    };
    
    const categoryEmojis = {
        academic: '🎓',
        career: '💼',
        personal: '🌟',
        health: '💪'
    };
    
    return `
        <div class="goal-card" data-goal-id="${goal.id}">
            <div class="goal-header">
                <h3 class="goal-title">${categoryEmojis[goal.category] || ''} ${goal.title}</h3>
                <span class="goal-priority ${priorityColors[goal.priority]}">${goal.priority.toUpperCase()}</span>
            </div>
            
            <div class="goal-meta">
                <span>📅 ${goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'No deadline'}</span>
                <span>📊 ${goal.category}</span>
            </div>
            
            ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
            
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="progress-text">${goal.progress}% complete</div>
            </div>
            
            ${goal.milestones && goal.milestones.length > 0 ? `
                <div class="goal-milestones">
                    <h4>Milestones:</h4>
                    <ul>
                        ${goal.milestones.map((milestone, index) => `
                            <li>
                                <label>
                                    <input type="checkbox" ${milestone.completed ? 'checked' : ''} 
                                           onchange="toggleMilestone(${goal.id}, ${index})">
                                    ${milestone.text}
                                </label>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="goal-actions">
                <button class="btn-action btn-edit" onclick="editGoal(${goal.id})">✏️ Edit</button>
                <button class="btn-action" onclick="updateProgress(${goal.id})">📊 Update Progress</button>
                <button class="btn-action btn-delete" onclick="deleteGoal(${goal.id})">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function openGoalModal(goalId = null) {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');
    
    if (goalId) {
        const goal = goals.find(g => g.id === goalId);
        title.textContent = 'Edit Goal';
        populateGoalForm(goal);
    } else {
        title.textContent = 'Create New Goal';
        form.reset();
        // Clear milestones container
        const container = document.getElementById('milestonesContainer');
        container.innerHTML = `
            <div class="milestone-item">
                <input type="text" placeholder="Add a milestone...">
                <button type="button" onclick="removeMilestone(this)">×</button>
            </div>
        `;
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function populateGoalForm(goal) {
    document.getElementById('goalTitle').value = goal.title;
    document.getElementById('goalCategory').value = goal.category;
    document.getElementById('goalPriority').value = goal.priority;
    document.getElementById('goalDescription').value = goal.description || '';
    document.getElementById('goalStartDate').value = goal.startDate || '';
    document.getElementById('goalEndDate').value = goal.endDate || '';
    
    // Populate milestones
    const container = document.getElementById('milestonesContainer');
    if (goal.milestones && goal.milestones.length > 0) {
        container.innerHTML = goal.milestones.map(milestone => `
            <div class="milestone-item">
                <input type="text" value="${milestone.text}">
                <button type="button" onclick="removeMilestone(this)">×</button>
            </div>
        `).join('');
    }
}

function addMilestone() {
    const container = document.getElementById('milestonesContainer');
    const milestoneDiv = document.createElement('div');
    milestoneDiv.className = 'milestone-item';
    milestoneDiv.innerHTML = `
        <input type="text" placeholder="Add a milestone...">
        <button type="button" onclick="removeMilestone(this)">×</button>
    `;
    container.appendChild(milestoneDiv);
}

function removeMilestone(button) {
    button.parentElement.remove();
}

// Goal form submission
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('goalTitle').value,
        category: document.getElementById('goalCategory').value,
        priority: document.getElementById('goalPriority').value,
        description: document.getElementById('goalDescription').value,
        startDate: document.getElementById('goalStartDate').value,
        endDate: document.getElementById('goalEndDate').value,
    };
    
    // Collect milestones
    const milestoneInputs = document.querySelectorAll('.milestone-item input');
    const milestones = Array.from(milestoneInputs)
        .map(input => input.value.trim())
        .filter(text => text)
        .map(text => ({ text, completed: false }));
    
    const title = document.getElementById('goalModalTitle').textContent;
    
    if (title === 'Create New Goal') {
        const goal = {
            id: Date.now(),
            ...formData,
            milestones,
            progress: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        goals.push(goal);
        showNotification('Goal created successfully!', 'success');
    } else {
        // Edit existing goal
        const goalId = parseInt(document.querySelector('.goal-card').dataset.goalId);
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            goals[goalIndex] = {
                ...goals[goalIndex],
                ...formData,
                milestones,
                updatedAt: new Date().toISOString()
            };
            showNotification('Goal updated successfully!', 'success');
        }
    }
    
    localStorage.setItem('edugateway_goals', JSON.stringify(goals));
    closeGoalModal();
    loadGoals();
    updateDashboardStats();
});

function toggleMilestone(goalId, milestoneIndex) {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.milestones && goal.milestones[milestoneIndex]) {
        goal.milestones[milestoneIndex].completed = !goal.milestones[milestoneIndex].completed;
        
        // Update progress based on completed milestones
        const completedMilestones = goal.milestones.filter(m => m.completed).length;
        goal.progress = Math.round((completedMilestones / goal.milestones.length) * 100);
        
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));
        loadGoals();
        updateDashboardStats();
        showNotification('Milestone updated!', 'success');
    }
}

function updateProgress(goalId) {
    const newProgress = prompt('Enter progress percentage (0-100):');
    if (newProgress === null) return;
    
    const progress = parseInt(newProgress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
        alert('Please enter a valid percentage between 0 and 100');
        return;
    }
    
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.progress = progress;
        goal.updatedAt = new Date().toISOString();
        
        if (progress === 100) {
            goal.status = 'completed';
            goal.completedAt = new Date().toISOString();
            showNotification('🎉 Congratulations! Goal completed!', 'success');
        }
        
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));
        loadGoals();
        updateDashboardStats();
    }
}

function editGoal(goalId) {
    openGoalModal(goalId);
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(g => g.id !== goalId);
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));
        loadGoals();
        updateDashboardStats();
        showNotification('Goal deleted', 'info');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Add sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Load initial dashboard
    loadDashboard();
    
    // Setup Notion listeners
    setupNotionListeners();
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeGoalModal();
            closeNoteModal();
        }
    });
    
    // Close modals on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGoalModal();
            closeNoteModal();
        }
    });
});

// Utility function for notifications
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

// Enhanced functionality to fix all dashboard features
function setupPlanningSystem() {
    // Fix the planning section functionality
    const planningBtn = document.querySelector('[onclick*="planning"]') || document.querySelector('.sidebar-item[data-section="planning"]');
    if (planningBtn) {
        planningBtn.addEventListener('click', function() {
            switchSection('planning');
            loadPlanningView();
        });
    }
}

function loadPlanningView() {
    const planningContent = document.getElementById('planning') || document.querySelector('.planning-section');
    if (!planningContent) return;
    
    planningContent.innerHTML = `
        <div class="planning-dashboard">
            <div class="section-header">
                <h2>📋 Academic Planning</h2>
                <button class="btn-primary" onclick="createNewPlan()">+ New Plan</button>
            </div>
            
            <div class="planning-grid">
                <div class="plan-card">
                    <h3>🎓 Semester Planning</h3>
                    <div class="plan-content">
                        <div class="plan-item">
                            <span class="plan-icon">📚</span>
                            <div>
                                <h4>Course Selection</h4>
                                <p>Plan your courses for next semester</p>
                            </div>
                            <button class="btn-small" onclick="openCourseSelector()">Plan Courses</button>
                        </div>
                        <div class="plan-item">
                            <span class="plan-icon">📝</span>
                            <div>
                                <h4>Assignment Tracker</h4>
                                <p>Track all your assignments and deadlines</p>
                            </div>
                            <button class="btn-small" onclick="openAssignmentTracker()">Track Assignments</button>
                        </div>
                    </div>
                </div>
                
                <div class="plan-card">
                    <h3>🚀 Career Planning</h3>
                    <div class="plan-content">
                        <div class="plan-item">
                            <span class="plan-icon">💼</span>
                            <div>
                                <h4>Career Roadmap</h4>
                                <p>Define your career path and milestones</p>
                            </div>
                            <button class="btn-small" onclick="openCareerRoadmap()">Create Roadmap</button>
                        </div>
                        <div class="plan-item">
                            <span class="plan-icon">🎯</span>
                            <div>
                                <h4>Skills Development</h4>
                                <p>Track skills you need to develop</p>
                            </div>
                            <button class="btn-small" onclick="openSkillsTracker()">Track Skills</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupAcademicTracking() {
    // Fix the academic section functionality
    const academicBtn = document.querySelector('[onclick*="academic"]') || document.querySelector('.sidebar-item[data-section="academic"]');
    if (academicBtn) {
        academicBtn.addEventListener('click', function() {
            switchSection('academic');
            loadAcademicView();
        });
    }
}

function loadAcademicView() {
    const academicContent = document.getElementById('academic') || document.querySelector('.academic-section');
    if (!academicContent) return;
    
    academicContent.innerHTML = `
        <div class="academic-dashboard">
            <div class="section-header">
                <h2>🎓 Academic Tracking</h2>
                <button class="btn-primary" onclick="addNewCourse()">+ Add Course</button>
            </div>
            
            <div class="academic-overview">
                <div class="gpa-card">
                    <h3>Current GPA</h3>
                    <div class="gpa-display">3.75</div>
                    <p class="gpa-trend">↗️ +0.12 this semester</p>
                </div>
                
                <div class="credits-card">
                    <h3>Credits</h3>
                    <div class="credits-display">84/120</div>
                    <p class="credits-progress">70% Complete</p>
                </div>
                
                <div class="semester-card">
                    <h3>Current Semester</h3>
                    <div class="semester-display">Fall 2024</div>
                    <p class="semester-info">5 courses, 16 credits</p>
                </div>
            </div>
            
            <div class="courses-section">
                <h3>Current Courses</h3>
                <div class="courses-grid">
                    ${generateSampleCourses()}
                </div>
            </div>
        </div>
    `;
}

function generateSampleCourses() {
    const courses = [
        { name: "Data Structures", grade: "A-", credits: 4, progress: 85 },
        { name: "Calculus III", grade: "B+", credits: 4, progress: 78 },
        { name: "Physics II", grade: "A", credits: 3, progress: 92 },
        { name: "English Literature", grade: "B", credits: 3, progress: 71 },
        { name: "Computer Architecture", grade: "A-", credits: 4, progress: 88 }
    ];
    
    return courses.map(course => `
        <div class="course-card">
            <div class="course-header">
                <h4>${course.name}</h4>
                <span class="grade-badge">${course.grade}</span>
            </div>
            <div class="course-details">
                <p>Credits: ${course.credits}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <p class="progress-text">${course.progress}% Complete</p>
            </div>
            <div class="course-actions">
                <button class="btn-small" onclick="viewCourseDetails('${course.name}')">View Details</button>
                <button class="btn-small" onclick="addAssignment('${course.name}')">Add Assignment</button>
            </div>
        </div>
    `).join('');
}

function setupTemplates() {
    // Fix the +New Page button and templates
    const newPageBtn = document.querySelector('.btn-new-page') || document.querySelector('[onclick*="newPage"]');
    if (newPageBtn) {
        newPageBtn.addEventListener('click', function() {
            showTemplateSelector();
        });
    }
}

function showTemplateSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white; border-radius: 20px; padding: 40px; max-width: 700px;
            max-height: 90vh; overflow-y: auto; margin: 20px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="margin: 0; color: #2d3748;">Choose a Template</h2>
                <button class="close-modal" style="
                    background: none; border: none; font-size: 24px; cursor: pointer; color: #999;
                ">&times;</button>
            </div>
            
            <div class="template-grid" style="
                display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px; margin-bottom: 30px;
            ">
                <div class="template-card" onclick="createFromTemplate('study-planner')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">📚</div>
                    <h3 style="margin: 0 0 10px 0;">Study Planner</h3>
                    <p style="color: #4a5568; margin: 0;">Plan your study schedule and track progress</p>
                </div>
                
                <div class="template-card" onclick="createFromTemplate('project-tracker')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
                    <h3 style="margin: 0 0 10px 0;">Project Tracker</h3>
                    <p style="color: #4a5568; margin: 0;">Manage your projects and deadlines</p>
                </div>
                
                <div class="template-card" onclick="createFromTemplate('research-notes')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔬</div>
                    <h3 style="margin: 0 0 10px 0;">Research Notes</h3>
                    <p style="color: #4a5568; margin: 0;">Organize research and citations</p>
                </div>
                
                <div class="template-card" onclick="createFromTemplate('goal-tracker')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                    <h3 style="margin: 0 0 10px 0;">Goal Tracker</h3>
                    <p style="color: #4a5568; margin: 0;">Set and monitor your goals</p>
                </div>
                
                <div class="template-card" onclick="createFromTemplate('blank')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
                    <h3 style="margin: 0 0 10px 0;">Blank Page</h3>
                    <p style="color: #4a5568; margin: 0;">Start with a clean slate</p>
                </div>
                
                <div class="template-card" onclick="createFromTemplate('daily-journal')" style="
                    border: 2px solid #e2e8f0; border-radius: 15px; padding: 20px;
                    cursor: pointer; transition: all 0.3s ease; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">📔</div>
                    <h3 style="margin: 0 0 10px 0;">Daily Journal</h3>
                    <p style="color: #4a5568; margin: 0;">Track daily thoughts and progress</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function makeAllButtonsFunctional() {
    // Fix calendar functionality
    setTimeout(() => {
        const calendarSection = document.getElementById('calendar');
        if (calendarSection) {
            initializeWorkingCalendar();
        }
        
        // Fix notes functionality
        const notesSection = document.getElementById('notes');
        if (notesSection) {
            enhanceNotesSystem();
        }
        
        // Add click handlers for all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            if (!item.hasAttribute('data-enhanced')) {
                item.setAttribute('data-enhanced', 'true');
                item.addEventListener('click', function() {
                    const section = this.textContent.trim().toLowerCase();
                    switchToSection(section);
                });
            }
        });
    }, 500);
}

function switchToSection(sectionName) {
    const sectionMap = {
        'dashboard': 'dashboard',
        'goals': 'goals',
        'calendar': 'calendar', 
        'notes': 'notes',
        'planning': 'planning',
        'academic': 'academic'
    };
    
    const sectionId = sectionMap[sectionName];
    if (sectionId) {
        switchSection(sectionId);
        
        if (sectionId === 'calendar') {
            initializeWorkingCalendar();
        } else if (sectionId === 'notes') {
            enhanceNotesSystem();
        } else if (sectionId === 'planning') {
            loadPlanningView();
        } else if (sectionId === 'academic') {
            loadAcademicView();
        }
    }
}

// Global functions for template creation
// Map UI buttons used in notion.html to available functions to avoid ReferenceErrors
window.showTemplates = function() { try { showTemplateSelector(); } catch (e) { console.error(e); } };
window.createNewItem = function() { try { showTemplateSelector(); } catch (e) { console.error(e); } };

window.createFromTemplate = function(templateType) {
    const templates = {
        'study-planner': 'Study Planner - Track your study sessions and progress',
        'project-tracker': 'Project Tracker - Manage deadlines and milestones', 
        'research-notes': 'Research Notes - Organize your research findings',
        'goal-tracker': 'Goal Tracker - Set and monitor your objectives',
        'daily-journal': 'Daily Journal - Reflect on your day',
        'blank': 'New Page - Start fresh'
    };
    
    const title = templates[templateType] || 'New Page';
    createNewPage(title, templateType);
    document.querySelector('.modal').remove();
}

function createNewPage(title, templateType) {
    const newPage = {
        id: Date.now(),
        title: title,
        type: templateType,
        content: getTemplateContent(templateType),
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    const pages = JSON.parse(localStorage.getItem('user_pages')) || [];
    pages.push(newPage);
    localStorage.setItem('user_pages', JSON.stringify(pages));
    
    showNotification(`Created new ${title}!`, 'success');
    
    // Add to sidebar
    addPageToSidebar(newPage);
}

function getTemplateContent(templateType) {
    const templates = {
        'study-planner': `
            # Study Planner

            ## Today's Study Goals
            - [ ] Review Chapter 5
            - [ ] Complete practice problems
            - [ ] Study for exam

            ## Study Schedule
            | Time | Subject | Duration |
            |------|---------|----------|
            | 9:00 AM | Math | 2 hours |
            | 2:00 PM | Physics | 1.5 hours |

            ## Notes
            Write your study notes here...
        `,
        'project-tracker': `
            # Project Tracker

            ## Current Projects
            - [ ] **Research Paper** - Due: Nov 30
            - [ ] **Group Presentation** - Due: Dec 5
            - [ ] **Final Exam Prep** - Due: Dec 15

            ## Milestones
            - [x] Choose research topic
            - [ ] Complete first draft
            - [ ] Peer review

            ## Next Actions
            1. Schedule team meeting
            2. Finalize bibliography
            3. Practice presentation
        `,
        'blank': '# New Page\n\nStart writing here...'
    };
    
    return templates[templateType] || templates['blank'];
}

function initializeWorkingCalendar() {
    const calendarSection = document.getElementById('calendar');
    if (!calendarSection) return;
    
    calendarSection.innerHTML = `
        <div class="calendar-container">
            <div class="calendar-header">
                <h2>📅 Calendar</h2>
                <div class="calendar-controls">
                    <button class="btn-secondary" onclick="previousMonth()">‹ Prev</button>
                    <h3 id="currentMonth">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                    <button class="btn-secondary" onclick="nextMonth()">Next ›</button>
                    <button class="btn-primary" onclick="addEvent()">+ Add Event</button>
                </div>
            </div>
            
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="calendar-days" id="calendarDays">
                    ${generateCalendarDays()}
                </div>
            </div>
            
            <div class="upcoming-events">
                <h3>Upcoming Events</h3>
                <div id="upcomingEventsList">
                    ${generateUpcomingEvents()}
                </div>
            </div>
        </div>
    `;
}

function generateCalendarDays() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let days = '';
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isToday = currentDate.toDateString() === today.toDateString();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth();
        
        days += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isCurrentMonth ? '' : 'other-month'}" 
                 onclick="selectDate('${currentDate.toISOString()}')">
                <span class="day-number">${currentDate.getDate()}</span>
                <div class="day-events">
                    ${Math.random() > 0.8 ? '<div class="event-dot"></div>' : ''}
                </div>
            </div>
        `;
    }
    return days;
}

function generateUpcomingEvents() {
    const sampleEvents = [
        { title: "Math Exam", date: "Nov 15, 2024", type: "exam" },
        { title: "Project Deadline", date: "Nov 20, 2024", type: "deadline" },
        { title: "Career Fair", date: "Nov 25, 2024", type: "event" }
    ];
    
    return sampleEvents.map(event => `
        <div class="event-item ${event.type}">
            <div class="event-date">${event.date}</div>
            <div class="event-title">${event.title}</div>
        </div>
    `).join('');
}

// Global calendar functions
window.addEvent = function() {
    showNotification('Event creation modal would open here', 'info');
}

window.selectDate = function(dateStr) {
    const date = new Date(dateStr).toLocaleDateString();
    showNotification(`Selected date: ${date}`, 'info');
}

// Provide basic navigation stubs to prevent reference errors
window.previousMonth = function() {
    showNotification('Calendar navigation not implemented yet', 'info');
}

window.nextMonth = function() {
    showNotification('Calendar navigation not implemented yet', 'info');
}

// ============================================
// NOTION API INTEGRATION
// ============================================
// This section integrates with the Notion API via the backend server
// to display Notion pages, databases, and content within BraineX.
// All API calls go through /api/notion/* endpoints on the server.

/**
 * Check Notion API configuration status
 * @returns {Promise<Object>} Status object with configured and ok flags
 */
async function checkNotionStatus() {
    try {
        const response = await fetch(`${NOTION_API_BASE}/status`);
        const result = await response.json();
        notionConfigured = result.configured && result.ok;
        return result;
    } catch (error) {
        // Keep console.error for debugging API connection issues
        console.error('Failed to check Notion status:', error);
        return { configured: false, error: error.message };
    }
}

/**
 * Search Notion workspace for pages and databases
 * @param {string} query - Search query string (optional)
 * @param {string} filter - Filter type: 'all', 'page', or 'database' (default: 'all')
 * @returns {Promise<Array>} Array of Notion search results
 */
async function searchNotion(query = '', filter = 'all') {
    showNotionLoading();
    
    try {
        const searchBody = {
            query: query,
            sort: { direction: 'descending', timestamp: 'last_edited_time' }
        };
        
        // Add filter if not 'all'
        if (filter !== 'all') {
            searchBody.filter = { property: 'object', value: filter };
        }
        
        const response = await fetch(`${NOTION_API_BASE}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchBody)
        });
        
        const result = await response.json();
        
        if (result.ok && result.data) {
            displayNotionResults(result.data.results || []);
            return result.data.results;
        } else {
            throw new Error(result.error || 'Search failed');
        }
    } catch (error) {
        showNotionError('Failed to search Notion: ' + error.message);
        return [];
    }
}

/**
 * Load and display a specific Notion page with its content blocks
 * @param {string} pageId - The Notion page ID
 * @param {string} title - The page title
 * @param {string} url - The Notion page URL
 * @returns {Promise<void>}
 */
async function loadNotionPage(pageId, title, url) {
    const viewer = document.getElementById('notionViewer');
    const content = document.getElementById('notionContent');
    const titleEl = document.getElementById('notionViewerTitle');
    const linkEl = document.getElementById('notionOpenLink');
    
    // Show viewer and set title
    viewer.style.display = 'block';
    titleEl.textContent = title || 'Loading...';
    linkEl.href = url || '#';
    
    // Show skeleton loader
    content.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-line" style="width: 80%;"></div>
            <div class="skeleton-line" style="width: 60%;"></div>
            <div class="skeleton-line" style="width: 90%;"></div>
            <div class="skeleton-line" style="width: 70%;"></div>
        </div>
    `;
    
    try {
        // Fetch page details
        const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${pageId}`);
        const pageResult = await pageResponse.json();
        
        if (!pageResult.ok) {
            throw new Error('Failed to load page details');
        }
        
        // Fetch page content (blocks)
        const blocksResponse = await fetch(`${NOTION_API_BASE}/blocks/${pageId}/children`);
        const blocksResult = await blocksResponse.json();
        
        if (!blocksResult.ok) {
            throw new Error('Failed to load page content');
        }
        
        // Render page content
        currentNotionPage = { page: pageResult.data, blocks: blocksResult.data.results };
        renderNotionContent(pageResult.data, blocksResult.data.results);
        
    } catch (error) {
        content.innerHTML = `
            <div class="error-message">
                <p>❌ Failed to load page: ${error.message}</p>
                <button class="btn-secondary" onclick="document.getElementById('notionViewer').style.display='none'">Close</button>
            </div>
        `;
    }
}

/**
 * Render Notion blocks into HTML and display in the content viewer
 * @param {Object} page - The Notion page object
 * @param {Array} blocks - Array of Notion block objects
 * @returns {void}
 */
function renderNotionContent(page, blocks) {
    const content = document.getElementById('notionContent');
    
    if (!blocks || blocks.length === 0) {
        content.innerHTML = '<p class="empty-state">This page has no content yet.</p>';
        return;
    }
    
    let html = '';
    
    blocks.forEach(block => {
        html += renderNotionBlock(block);
    });
    
    content.innerHTML = html;
}

/**
 * Render individual Notion block based on type
 * Supports: paragraph, headings, lists, to-do, code, quote, callout, images, etc.
 * @param {Object} block - The Notion block object
 * @returns {string} HTML string representation of the block
 */
function renderNotionBlock(block) {
    const type = block.type;
    const content = block[type];
    
    if (!content) return '';
    
    switch (type) {
        case 'paragraph':
            return `<p class="notion-paragraph">${extractRichText(content.rich_text)}</p>`;
            
        case 'heading_1':
            return `<h1 class="notion-h1">${extractRichText(content.rich_text)}</h1>`;
            
        case 'heading_2':
            return `<h2 class="notion-h2">${extractRichText(content.rich_text)}</h2>`;
            
        case 'heading_3':
            return `<h3 class="notion-h3">${extractRichText(content.rich_text)}</h3>`;
            
        case 'bulleted_list_item':
            return `<ul class="notion-list"><li>${extractRichText(content.rich_text)}</li></ul>`;
            
        case 'numbered_list_item':
            return `<ol class="notion-list"><li>${extractRichText(content.rich_text)}</li></ol>`;
            
        case 'to_do':
            const checked = content.checked ? 'checked' : '';
            return `
                <div class="notion-todo">
                    <input type="checkbox" ${checked} disabled>
                    <span class="${checked ? 'completed' : ''}">${extractRichText(content.rich_text)}</span>
                </div>
            `;
            
        case 'toggle':
            return `
                <details class="notion-toggle">
                    <summary>${extractRichText(content.rich_text)}</summary>
                </details>
            `;
            
        case 'code':
            const language = content.language || 'plain text';
            return `
                <pre class="notion-code"><code class="language-${language}">${extractRichText(content.rich_text)}</code></pre>
            `;
            
        case 'quote':
            return `<blockquote class="notion-quote">${extractRichText(content.rich_text)}</blockquote>`;
            
        case 'divider':
            return '<hr class="notion-divider">';
            
        case 'callout':
            const icon = content.icon?.emoji || '💡';
            return `
                <div class="notion-callout">
                    <span class="callout-icon">${icon}</span>
                    <div>${extractRichText(content.rich_text)}</div>
                </div>
            `;
            
        case 'image':
            const imageUrl = content.external?.url || content.file?.url || '';
            const caption = extractRichText(content.caption || []);
            return `
                <figure class="notion-image">
                    <img src="${imageUrl}" alt="${caption}" loading="lazy">
                    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
                </figure>
            `;
            
        case 'bookmark':
            return `
                <a href="${content.url}" target="_blank" rel="noopener" class="notion-bookmark">
                    🔗 ${content.url}
                </a>
            `;
            
        default:
            return `<p class="notion-unsupported">📦 Unsupported block type: ${type}</p>`;
    }
}

/**
 * Extract and format rich text from Notion rich text array
 * Handles bold, italic, strikethrough, underline, code, and links
 * @param {Array} richTextArray - Array of Notion rich text objects
 * @returns {string} Formatted HTML string
 */
function extractRichText(richTextArray) {
    if (!richTextArray || richTextArray.length === 0) return '';
    
    return richTextArray.map(text => {
        let content = text.plain_text || '';
        
        // Apply annotations
        if (text.annotations) {
            if (text.annotations.bold) content = `<strong>${content}</strong>`;
            if (text.annotations.italic) content = `<em>${content}</em>`;
            if (text.annotations.strikethrough) content = `<s>${content}</s>`;
            if (text.annotations.underline) content = `<u>${content}</u>`;
            if (text.annotations.code) content = `<code>${content}</code>`;
        }
        
        // Add link if present
        if (text.href) {
            content = `<a href="${text.href}" target="_blank" rel="noopener">${content}</a>`;
        }
        
        return content;
    }).join('');
}

/**
 * Display Notion search results in a grid layout
 * @param {Array} results - Array of Notion pages/databases from search
 * @returns {void}
 */
function displayNotionResults(results) {
    const container = document.getElementById('notionResults');
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🔍 No results found</p>
                <p class="empty-state-subtitle">Try a different search term or check your Notion integration</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(item => {
        const title = extractNotionTitle(item);
        const type = item.object === 'database' ? '📊 Database' : '📄 Page';
        const lastEdited = new Date(item.last_edited_time).toLocaleDateString();
        const url = item.url;
        const icon = item.icon?.emoji || (item.object === 'database' ? '📊' : '📄');
        
        return `
            <div class="note-card notion-result-card" onclick="loadNotionPage('${item.id}', '${title.replace(/'/g, "\\'")}', '${url}')">
                <div class="notion-result-header">
                    <span class="notion-icon">${icon}</span>
                    <span class="notion-type">${type}</span>
                </div>
                <h3 class="notion-result-title">${title}</h3>
                <p class="notion-result-meta">Last edited: ${lastEdited}</p>
                <div class="notion-result-actions">
                    <button class="btn-small" onclick="event.stopPropagation(); loadNotionPage('${item.id}', '${title.replace(/'/g, "\\'")}', '${url}')">View</button>
                    <a href="${url}" target="_blank" rel="noopener" class="btn-small btn-outline" onclick="event.stopPropagation()">Open in Notion ↗</a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Extract title from Notion page/database object
 * Handles different title property formats
 * @param {Object} item - Notion page or database object
 * @returns {string} Extracted title or 'Untitled'
 */
function extractNotionTitle(item) {
    if (item.object === 'page') {
        // Try different title properties
        const properties = item.properties;
        if (properties.title?.title) {
            return extractRichText(properties.title.title) || 'Untitled';
        }
        if (properties.Name?.title) {
            return extractRichText(properties.Name.title) || 'Untitled';
        }
    } else if (item.object === 'database') {
        if (item.title) {
            return extractRichText(item.title) || 'Untitled Database';
        }
    }
    return 'Untitled';
}

/**
 * Show skeleton loader in the Notion results section
 * @returns {void}
 */
function showNotionLoading() {
    const container = document.getElementById('notionResults');
    container.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    `;
}

/**
 * Display error message in Notion results section with retry button
 * @param {string} message - Error message to display
 * @returns {void}
 */
function showNotionError(message) {
    const container = document.getElementById('notionResults');
    container.innerHTML = `
        <div class="error-message">
            <p>❌ ${message}</p>
            <button class="btn-secondary" onclick="initializeNotionSection()">Retry</button>
        </div>
    `;
}

/**
 * Show temporary status notification message
 * @param {string} message - Status message to display
 * @param {string} type - Notification type: 'info', 'success', 'warning', or 'error'
 * @returns {void}
 */
function showNotionStatus(message, type = 'info') {
    const statusEl = document.getElementById('notionStatus');
    statusEl.textContent = message;
    statusEl.className = `notification ${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

/**
 * Initialize Notion section when user navigates to it
 * Checks configuration status and loads initial results if configured
 * @returns {Promise<void>}
 */
async function initializeNotionSection() {
    const status = await checkNotionStatus();
    
    if (!status.configured) {
        showNotionStatus('Notion integration is not configured. Please set NOTION_TOKEN in your .env file.', 'warning');
        document.getElementById('notionResults').innerHTML = `
            <div class="empty-state">
                <p>🔌 Notion Not Connected</p>
                <p class="empty-state-subtitle">To use this feature, configure your Notion integration token.</p>
                <ol style="text-align: left; max-width: 600px; margin: 1rem auto;">
                    <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener">notion.so/my-integrations</a></li>
                    <li>Create a new integration and copy the token</li>
                    <li>Add it to your .env file as NOTION_TOKEN</li>
                    <li>Restart the server</li>
                    <li>Share your Notion pages with the integration</li>
                </ol>
            </div>
        `;
        return;
    }
    
    if (!status.ok) {
        showNotionStatus('Failed to connect to Notion. Check your token and try again.', 'error');
        return;
    }
    
    showNotionStatus('✅ Connected to Notion successfully!', 'success');
    
    // Load initial results
    await searchNotion('', 'all');
}

/**
 * Setup event listeners for Notion section UI elements
 * Handles search, filter, and viewer close actions
 * @returns {void}
 */
function setupNotionListeners() {
    const searchBtn = document.getElementById('notionSearchBtn');
    const searchInput = document.getElementById('notionSearchInput');
    const filterType = document.getElementById('notionFilterType');
    const closeViewerBtn = document.getElementById('closeViewerBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            const filter = filterType.value;
            searchNotion(query, filter);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                const filter = filterType.value;
                searchNotion(query, filter);
            }
        });
    }
    
    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', () => {
            document.getElementById('notionViewer').style.display = 'none';
        });
    }
}
