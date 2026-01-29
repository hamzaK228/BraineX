// Goals Page Complete Enhancement System
// Adds: Tags, Due Dates, Search/Filter, Show/Hide Completed, Empty States, Overdue Highlighting

(function () {
    'use strict';

    // ============================================
    // 1. ENHANCE GOAL DATA STRUCTURE
    // ============================================

    function enhanceGoalData() {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        let updated = false;

        goals.forEach(goal => {
            if (!goal.tags) { goal.tags = []; updated = true; }
            if (!goal.dueDate) { goal.dueDate = null; updated = true; }
            if (!goal.createdAt) { goal.createdAt = new Date().toISOString(); updated = true; }
            if (!goal.updatedAt) { goal.updatedAt = new Date().toISOString(); updated = true; }
        });

        if (updated) {
            localStorage.setItem('edugateway_goals', JSON.stringify(goals));
        }
    }

    // ============================================
    // 2. ADD UI CONTROLS TO GOALS SECTION
    // ============================================

    function addGoalsPageControls() {
        const goalsSection = document.querySelector('#goals .page-header');
        if (!goalsSection || document.getElementById('goalsEnhancementsAdded')) return;

        // Add marker to prevent duplicate additions
        const marker = document.createElement('div');
        marker.id = 'goalsEnhancementsAdded';
        marker.style.display = 'none';
        goalsSection.appendChild(marker);

        // Search input
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'margin: 1rem 0; padding: 0.5rem; background: rgba(102, 126, 234, 0.05); border-radius: 8px;';
        searchContainer.innerHTML = `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <input type="text" id="goalSearch" placeholder="🔍 Search goals..." 
               style="flex: 1; min-width: 200px; padding: 0.6rem 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
        
        <select id="tagFilter" style="padding: 0.6rem 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
          <option value="">All Tags</option>
        </select>
        
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 14px;">
          <input type="checkbox" id="hideCompleted" style="width: 18px; height: 18px; cursor: pointer;">
          <span>Hide Completed</span>
        </label>
        
        <button id="clearFilters" class="btn-secondary" style="padding: 0.6rem 1rem; font-size: 14px;">
          Clear Filters
        </button>
      </div>
    `;

        goalsSection.appendChild(searchContainer);

        // Set up event listeners
        document.getElementById('goalSearch').addEventListener('input', applyFilters);
        document.getElementById('tagFilter').addEventListener('change', applyFilters);
        document.getElementById('hideCompleted').addEventListener('change', applyFilters);
        document.getElementById('clearFilters').addEventListener('click', () => {
            document.getElementById('goalSearch').value = '';
            document.getElementById('tagFilter').value = '';
            document.getElementById('hideCompleted').checked = false;
            applyFilters();
        });

        updateTagFilter();
    }

    // ============================================
    // 3. APPLY FILTERS FUNCTION
    // ============================================

    function applyFilters() {
        const searchTerm = document.getElementById('goalSearch')?.value.toLowerCase() || '';
        const tagFilter = document.getElementById('tagFilter')?.value || '';
        const hideCompleted = document.getElementById('hideCompleted')?.checked || false;

        let goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];

        // Apply filters
        const filtered = goals.filter(goal => {
            // Search filter
            const matchesSearch = !searchTerm ||
                goal.title.toLowerCase().includes(searchTerm) ||
                (goal.category && goal.category.toLowerCase().includes(searchTerm)) ||
                (goal.tags && goal.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

            // Tag filter
            const matchesTag = !tagFilter || (goal.tags && goal.tags.includes(tagFilter));

            // Completed filter
            const matchesCompleted = !hideCompleted || goal.status !== 'completed';

            return matchesSearch && matchesTag && matchesCompleted;
        });

        renderFilteredGoals(filtered);
    }

    // ============================================
    // 4. RENDER FILTERED GOALS
    // ============================================

    function renderFilteredGoals(goals) {
        const container = document.getElementById('goalsContainer');
        if (!container) return;

        if (goals.length === 0) {
            container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem 2rem; color: #718096;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🎯</div>
          <h3 style="font-size: 1.5rem; color: #2d3748; margin-bottom: 0.5rem;">No Goals Found</h3>
          <p style="color: #a0aec0; margin-bottom: 1.5rem;">Clear filters or create your first goal to get started!</p>
          <button class="btn-primary js-open-goal-modal" onclick="document.querySelector('.js-open-goal-modal').click()">
            + Create Your First Goal
          </button>
        </div>
      `;
            return;
        }

        container.innerHTML = goals.map(createEnhancedGoalCard).join('');
        attachGoalEventListeners();
    }

    // ============================================
    // 5. CREATE ENHANCED GOAL CARD WITH TAGS & DUE DATES
    // ============================================

    function createEnhancedGoalCard(goal) {
        const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && goal.progress < 100;
        const daysRemaining = goal.dueDate ? Math.ceil((new Date(goal.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        return `
      <div class="goal-card ${isOverdue ? 'overdue' : ''}" data-goal-id="${goal.id}">
        <div class="goal-header">
          <h3>${goal.title}</h3>
          <span class="goal-priority ${goal.priority}">${goal.priority.toUpperCase()}</span>
        </div>
        
        ${goal.dueDate ? `
          <div class="goal-due-date ${isOverdue ? 'overdue' : ''}" style="margin: 0.75rem 0; padding: 0.5rem; background: ${isOverdue ? 'rgba(220, 38, 38, 0.1)' : 'rgba(66, 153, 225, 0.1)'}; border-radius: 6px; font-size: 0.875rem;">
            <i class="fas fa-calendar"></i>
            ${isOverdue ? '⚠️ OVERDUE: ' : '📅 Due: '}
            ${new Date(goal.dueDate).toLocaleDateString()}
            ${daysRemaining !== null && !isOverdue ? ` (${daysRemaining}d remaining)` : ''}
          </div>
        ` : ''}
        
        ${goal.tags && goal.tags.length > 0 ? `
          <div class="goal-tags" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0;">
            ${goal.tags.map(tag => `
              <span class="tag" style="padding: 0.25rem 0.75rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); color: #667eea; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                #${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${goal.progress}%"></div>
          </div>
          <div class="progress-text">${goal.progress}% complete</div>
        </div>
        
        <div class="goal-actions">
          <button class="btn-action edit-goal-btn" data-goal-id="${goal.id}">✏️</button>
          <div class="progress-control">
            <input type="range" class="progress-slider" min="0" max="100" value="${goal.progress}" 
                   onchange="updateProgressImmediate(${goal.id}, this.value)" data-old-value="${goal.progress}">
          </div>
          <button class="btn-action delete-goal-btn" data-goal-id="${goal.id}">🗑️</button>
        </div>
      </div>
    `;
    }

    // ============================================
    // 6. ATTACH EVENT LISTENERS
    // ============================================

    function attachGoalEventListeners() {
        document.querySelectorAll('.edit-goal-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const goalId = parseInt(this.getAttribute('data-goal-id'));
                openEditGoalModal(goalId);
            });
        });

        document.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const goalId = parseInt(this.getAttribute('data-goal-id'));
                if (typeof window.deleteGoal === 'function') {
                    window.deleteGoal(goalId);
                }
            });
        });
    }

    // ============================================
    // 7. OPEN EDIT MODAL WITH TAGS & DUE DATE
    // ============================================

    function openEditGoalModal(goalId) {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        // Check if enhanced modal already exists
        let modal = document.getElementById('enhancedGoalModal');
        if (!modal) {
            modal = createEnhancedGoalModal();
            document.body.appendChild(modal);
        }

        // Fill form with goal data
        document.getElementById('enhGoalTitle').value = goal.title || '';
        document.getElementById('enhGoalCategory').value = goal.category || '';
        document.getElementById('enhGoalPriority').value = goal.priority || 'medium';
        document.getElementById('enhGoalProgress').value = goal.progress || 0;
        document.getElementById('enhGoalDueDate').value = goal.dueDate || '';
        document.getElementById('enhGoalTags').value = goal.tags ? goal.tags.join(', ') : '';

        // Store goal ID for saving
        modal.setAttribute('data-goal-id', goalId);
        modal.classList.add('show');
    }

    // ============================================
    // 8. CREATE ENHANCED MODAL
    // ============================================

    function createEnhancedGoalModal() {
        const modal = document.createElement('div');
        modal.id = 'enhancedGoalModal';
        modal.className = 'modal';
        modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Edit Goal</h2>
          <button class="close-modal" onclick="document.getElementById('enhancedGoalModal').classList.remove('show')">&times;</button>
        </div>
        <form id="enhancedGoalForm">
          <div class="form-group">
            <label>Goal Title *</label>
            <input type="text" id="enhGoalTitle" required placeholder="e.g., Complete Full-Stack Project">
          </div>
          
          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Category</label>
              <select id="enhGoalCategory">
                <option value="">Select Category</option>
                <option value="career">Career</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="personal">Personal</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Priority</label>
              <select id="enhGoalPriority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" id="enhGoalDueDate">
            </div>
            
            <div class="form-group">
              <label>Progress</label>
              <input type="number" id="enhGoalProgress" min="0" max="100" value="0">
            </div>
          </div>
          
          <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" id="enhGoalTags" placeholder="e.g., urgent, work, learning">
            <small style="color: #718096; font-size: 0.875rem;">Separate tags with commas</small>
          </div>
          
          <div class="form-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn-secondary" onclick="document.getElementById('enhancedGoalModal').classList.remove('show')" style="flex: 1;">
              Cancel
            </button>
            <button type="submit" class="btn-primary" style="flex: 1;">
              Save Goal
            </button>
          </div>
        </form>
      </div>
    `;

        // Form submit handler
        modal.querySelector('#enhancedGoalForm').addEventListener('submit', function (e) {
            e.preventDefault();
            saveEnhancedGoal();
        });

        // Close on background click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        return modal;
    }

    // ============================================
    // 9. SAVE ENHANCED GOAL
    // ============================================

    function saveEnhancedGoal() {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const modal = document.getElementById('enhancedGoalModal');
        const goalId = parseInt(modal.getAttribute('data-goal-id'));
        const goal = goals.find(g => g.id === goalId);

        if (!goal) return;

        // Update goal data
        goal.title = document.getElementById('enhGoalTitle').value;
        goal.category = document.getElementById('enhGoalCategory').value;
        goal.priority = document.getElementById('enhGoalPriority').value;
        goal.progress = parseInt(document.getElementById('enhGoalProgress').value);
        goal.dueDate = document.getElementById('enhGoalDueDate').value || null;

        // Parse tags
        const tagsInput = document.getElementById('enhGoalTags').value;
        goal.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        goal.updatedAt = new Date().toISOString();

        // Save to localStorage
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));

        // Close modal
        modal.classList.remove('show');

        // Refresh display
        applyFilters();
        updateTagFilter();

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`✅ Goal "${goal.title}" updated successfully!`, 'success');
        }

        // Trigger autosave if available
        if (typeof autosaveData === 'function') {
            autosaveData();
        }
    }

    // ============================================
    // 10. UPDATE TAG FILTER DROPDOWN
    // ============================================

    function updateTagFilter() {
        const tagSelect = document.getElementById('tagFilter');
        if (!tagSelect) return;

        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const allTags = new Set();

        goals.forEach(goal => {
            if (goal.tags) {
                goal.tags.forEach(tag => allTags.add(tag));
            }
        });

        const currentValue = tagSelect.value;
        tagSelect.innerHTML = '<option value="">All Tags</option>';

        Array.from(allTags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = `#${tag}`;
            tagSelect.appendChild(option);
        });

        if (currentValue && allTags.has(currentValue)) {
            tagSelect.value = currentValue;
        }
    }

    // ============================================
    // 11. CSS FOR OVERDUE GOALS
    // ============================================

    function addOverdueStyles() {
        if (document.getElementById('overdueStyles')) return;

        const style = document.createElement('style');
        style.id = 'overdueStyles';
        style.textContent = `
      .goal-card.overdue {
        border-left: 4px solid #f56565 !important;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(220, 38, 38, 0.01) 100%);
      }
      
      .goal-due-date.overdue {
        color: #c53030;
        font-weight: 600;
        animation: pulse-overdue 2s ease-in-out infinite;
      }
      
      @keyframes pulse-overdue {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
        document.head.appendChild(style);
    }

    // ============================================
    // 12. INITIALIZE EVERYTHING
    // ============================================

    function initialize() {
        // Wait for DOM and original scripts to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
            return;
        }

        // Small delay to ensure other scripts are loaded
        setTimeout(() => {
            enhanceGoalData();
            addOverdueStyles();
            addGoalsPageControls();
            applyFilters(); // Initial render

            console.log('✅ Goals enhancements loaded: Tags, Due Dates, Filters, Overdue Alerts');
        }, 500);
    }

    initialize();

})();
