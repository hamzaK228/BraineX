// Goals Page - Final Features & Polish
// Adds: Templates, Statistics Dashboard, Data Recovery, Duplicate Goals

(function () {
    'use strict';

    // ============================================
    // 1. GOAL TEMPLATES SYSTEM
    // ============================================

    const goalTemplates = [
        {
            name: '🎓 Academic Goal',
            title: 'Complete [Course/Assignment]',
            category: 'education',
            priority: 'high',
            tags: ['education', 'academic']
        },
        {
            name: '💼 Career Goal',
            title: 'Achieve [Career Milestone]',
            category: 'career',
            priority: 'high',
            tags: ['career', 'professional']
        },
        {
            name: '💪 Fitness Goal',
            title: 'Reach [Fitness Target]',
            category: 'health',
            priority: 'medium',
            tags: ['health', 'fitness']
        },
        {
            name: '📚 Learning Goal',
            title: 'Learn [New Skill]',
            category: 'personal',
            priority: 'medium',
            tags: ['learning', 'growth']
        },
        {
            name: '💰 Financial Goal',
            title: 'Save/Earn [Amount]',
            category: 'finance',
            priority: 'high',
            tags: ['finance', 'money']
        }
    ];

    function addTemplateButtons() {
        const goalsHeader = document.querySelector('#goals .page-header');
        if (!goalsHeader || document.getElementById('templatesAdded')) return;

        const marker = document.createElement('div');
        marker.id = 'templatesAdded';
        marker.style.display = 'none';
        goalsHeader.appendChild(marker);

        const templateSection = document.createElement('div');
        templateSection.style.cssText = 'margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap;';
        templateSection.innerHTML = `
      <div style="width: 100%; margin-bottom: 0.5rem;">
        <strong style="color: #667eea; font-size: 0.875rem;">⚡ Quick Templates:</strong>
      </div>
      ${goalTemplates.map((template, idx) => `
        <button class="btn-template" data-template-idx="${idx}" 
                style="padding: 0.5rem 1rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); 
                       border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s;">
          ${template.name}
        </button>
      `).join('')}
    `;

        goalsHeader.appendChild(templateSection);

        document.querySelectorAll('.btn-template').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.getAttribute('data-template-idx'));
                createGoalFromTemplate(goalTemplates[idx]);
            });
        });
    }

    function createGoalFromTemplate(template) {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;

        const newGoal = {
            id: newId,
            title: template.title,
            category: template.category,
            priority: template.priority,
            progress: 0,
            status: 'active',
            tags: [...template.tags],
            dueDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        goals.push(newGoal);
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));

        if (typeof showNotification === 'function') {
            showNotification(`✅ Created goal from template!`, 'success');
        }

        // Trigger refresh
        if (typeof applyFilters === 'function') {
            applyFilters();
        } else if (typeof loadGoals === 'function') {
            loadGoals();
        }
    }

    // ============================================
    // 2. DUPLICATE GOAL FUNCTIONALITY
    // ============================================

    window.duplicateGoal = function (goalId) {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const original = goals.find(g => g.id === parseInt(goalId));
        if (!original) return;

        const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
        const duplicate = {
            ...original,
            id: newId,
            title: `${original.title} (Copy)`,
            progress: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        goals.push(duplicate);
        localStorage.setItem('edugateway_goals', JSON.stringify(goals));

        if (typeof showNotification === 'function') {
            showNotification(`✅ Goal duplicated!`, 'success');
        }

        if (typeof applyFilters === 'function') {
            applyFilters();
        } else if (typeof loadGoals === 'function') {
            loadGoals();
        }
    };

    // ============================================
    // 3. STATISTICS DASHBOARD
    // ============================================

    function createStatsDashboard() {
        const goalsSection = document.querySelector('#goals');
        if (!goalsSection || document.getElementById('statsDashboard')) return;

        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];

        // Calculate statistics
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.status === 'completed').length;
        const activeGoals = goals.filter(g => g.status === 'active').length;
        const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        const overdueGoals = goals.filter(g =>
            g.dueDate && new Date(g.dueDate) < new Date() && g.progress < 100
        ).length;

        const avgProgress = totalGoals > 0
            ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
            : 0;

        // Get goals completed this week/month
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedThisWeek = goals.filter(g =>
            g.completedAt && new Date(g.completedAt) > weekAgo
        ).length;

        const completedThisMonth = goals.filter(g =>
            g.completedAt && new Date(g.completedAt) > monthAgo
        ).length;

        const dashboard = document.createElement('div');
        dashboard.id = 'statsDashboard';
        dashboard.style.cssText = 'margin: 1.5rem 0; padding: 1.5rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); border-radius: 12px; border: 2px solid #e2e8f0;';

        dashboard.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <h3 style="color: #667eea; margin: 0; font-size: 1.25rem;">📊 Your Progress Dashboard</h3>
        <p style="color: #718096; font-size: 0.875rem; margin: 0.25rem 0 0 0;">Track your goals and celebrate achievements</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <!-- Total Goals -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #667eea;">${totalGoals}</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">Total Goals</div>
        </div>
        
        <!-- Completed -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #48bb78;">${completedGoals}</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">Completed</div>
        </div>
        
        <!-- Active -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #4299e1;">${activeGoals}</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">Active</div>
        </div>
        
        <!-- Completion Rate -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #9f7aea;">${completionRate}%</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">Success Rate</div>
        </div>
        
        <!-- Overdue -->
        ${overdueGoals > 0 ? `
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #fc8181; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #f56565;">⚠️ ${overdueGoals}</div>
          <div style="font-size: 0.875rem; color: #c53030; margin-top: 0.25rem;">Overdue</div>
        </div>
        ` : ''}
        
        <!-- This Week -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #ed8936;">${completedThisWeek}</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">This Week</div>
        </div>
        
        <!-- Avg Progress -->
        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; color: #38b2ac;">${avgProgress}%</div>
          <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">Avg Progress</div>
        </div>
      </div>
      
      ${completedThisWeek >= 3 ? `
        <div style="margin-top: 1rem; padding: 0.75rem; background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%); border-radius: 8px; border: 2px solid #48bb78; text-align: center;">
          <span style="font-size: 1.5rem;">🔥</span>
          <strong style="color: #38a169; margin-left: 0.5rem;">You're on fire! ${completedThisWeek} goals completed this week!</strong>
        </div>
      ` : ''}
    `;

        // Insert before the search controls
        const searchControls = goalsSection.querySelector('#goalsEnhancementsAdded');
        if (searchControls && searchControls.nextSibling) {
            goalsSection.insertBefore(dashboard, searchControls.nextSibling);
        }
    }

    // ============================================
    // 4. DATA BACKUP REMINDER
    // ============================================

    function checkBackupReminder() {
        const lastBackup = localStorage.getItem('lastGoalsBackup');
        const daysSinceBackup = lastBackup
            ? Math.floor((Date.now() - parseInt(lastBackup)) / (1000 * 60 * 60 * 24))
            : 999;

        if (daysSinceBackup >= 7 && !sessionStorage.getItem('backupReminderShown')) {
            setTimeout(() => {
                if (typeof showNotification === 'function') {
                    showNotification(`💾 Reminder: Back up your goals! (${daysSinceBackup} days since last backup)`, 'warning');
                }
                sessionStorage.setItem('backupReminderShown', 'true');
            }, 3000);
        }
    }

    // Hook into export function
    const originalExport = window.exportGoalsToJSON;
    if (typeof originalExport === 'function') {
        window.exportGoalsToJSON = function () {
            originalExport();
            localStorage.setItem('lastGoalsBackup', Date.now().toString());
        };
    }

    // ============================================
    // 5. CLEAR ALL DATA WITH CONFIRMATION
    // ============================================

    window.clearAllGoalsData = function () {
        if (!confirm('⚠️ WARNING: This will delete ALL goals, tasks, notes, and events. Are you sure?')) {
            return;
        }

        if (!confirm('This action cannot be undone. Type YES to confirm.')) {
            return;
        }

        // Clear all data
        localStorage.removeItem('edugateway_goals');
        localStorage.removeItem('edugateway_tasks');
        localStorage.removeItem('edugateway_notes');
        localStorage.removeItem('edugateway_events');
        localStorage.removeItem('lastGoalsBackup');

        if (typeof showNotification === 'function') {
            showNotification('🗑️ All data cleared!', 'info');
        }

        // Refresh page
        setTimeout(() => location.reload(), 1000);
    };

    // ============================================
    // 6. ADD BUTTONS TO UI
    // ============================================

    function addActionButtons() {
        const goalsHeader = document.querySelector('#goals .page-header');
        if (!goalsHeader || document.getElementById('actionButtonsAdded')) return;

        const marker = document.createElement('div');
        marker.id = 'actionButtonsAdded';
        marker.style.display = 'none';
        goalsHeader.appendChild(marker);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;';
        buttonContainer.innerHTML = `
      <button onclick="exportGoalsToJSON()" class="btn-secondary" style="padding: 0.6rem 1rem; font-size: 0.875rem;">
        📤 Export Backup
      </button>
      <button onclick="importGoalsFromJSON()" class="btn-secondary" style="padding: 0.6rem 1rem; font-size: 0.875rem;">
        📥 Import Data
      </button>
      <button onclick="if(confirm('Refresh statistics?')) location.reload()" class="btn-secondary" style="padding: 0.6rem 1rem; font-size: 0.875rem;">
        🔄 Refresh Stats
      </button>
    `;

        const subtitle = goalsHeader.querySelector('.page-subtitle');
        if (subtitle && subtitle.nextSibling) {
            goalsHeader.insertBefore(buttonContainer, subtitle.nextSibling);
        }
    }

    // ============================================
    // 7. ENHANCE GOAL CARDS WITH DUPLICATE BUTTON
    // ============================================

    function enhanceGoalCards() {
        // This will be called by the main rendering function
        setTimeout(() => {
            document.querySelectorAll('.goal-card').forEach(card => {
                if (card.querySelector('.duplicate-goal-btn')) return; // Already enhanced

                const goalId = card.getAttribute('data-goal-id');
                const actionsDiv = card.querySelector('.goal-actions');

                if (actionsDiv && !actionsDiv.querySelector('.duplicate-goal-btn')) {
                    const editBtn = actionsDiv.querySelector('.edit-goal-btn');
                    if (editBtn) {
                        const duplicateBtn = document.createElement('button');
                        duplicateBtn.className = 'btn-action duplicate-goal-btn';
                        duplicateBtn.setAttribute('data-goal-id', goalId);
                        duplicateBtn.innerHTML = '📋';
                        duplicateBtn.title = 'Duplicate Goal';
                        duplicateBtn.addEventListener('click', function () {
                            if (typeof window.duplicateGoal === 'function') {
                                window.duplicateGoal(goalId);
                            }
                        });
                        editBtn.parentNode.insertBefore(duplicateBtn, editBtn.nextSibling);
                    }
                }
            });
        }, 1000);
    }

    // ============================================
    // 8. INITIALIZE ALL FEATURES
    // ============================================

    function initializeAll() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAll);
            return;
        }

        setTimeout(() => {
            addTemplateButtons();
            createStatsDashboard();
            addActionButtons();
            checkBackupReminder();
            enhanceGoalCards();

            // Re-enhance cards after any data change
            const observer = new MutationObserver(() => {
                enhanceGoalCards();
            });

            const goalsContainer = document.getElementById('goalsContainer');
            if (goalsContainer) {
                observer.observe(goalsContainer, { childList: true, subtree: true });
            }

            console.log('✅ Final goals features loaded: Templates, Stats Dashboard, Duplicate, Backup');
        }, 1000);
    }

    initializeAll();

})();
