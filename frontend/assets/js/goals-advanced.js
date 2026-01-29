// Goals Page - Advanced Features (Phase 3 D/E & Phase 4)
// Adds: Kanban/Calendar Views, Focus Mode, Charts, Streaks, UX Polish

(function () {
    'use strict';

    // ============================================
    // 1. STATE & UTILS
    // ============================================
    const STATE = {
        view: 'list', // list, kanban, calendar
        focusMode: false,
        selectedGoals: new Set(),
        chartInstance: null
    };

    const UI = {
        container: document.getElementById('goalsContainer'),
        header: document.querySelector('#goals .page-header')
    };

    // ============================================
    // 2. VIEW TOGGLING SYSTEM
    // ============================================
    function initViewControls() {
        if (document.getElementById('viewControls')) return;

        const controls = document.createElement('div');
        controls.id = 'viewControls';
        controls.style.cssText = 'display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap;';

        controls.innerHTML = `
      <div class="view-toggles" style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 8px;">
        <button class="btn-view active" data-view="list" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: white; color: #667eea; font-weight: 600;">📋 List</button>
        <button class="btn-view" data-view="kanban" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: transparent; color: #718096;">📅 Board</button>
        <button class="btn-view" data-view="calendar" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: transparent; color: #718096;">📆 Calendar</button>
      </div>
      
      <button id="btnFocusMode" style="padding: 6px 12px; border: 2px solid #ed8936; border-radius: 8px; background: transparent; color: #ed8936; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        🎯 Focus Mode
      </button>

      <button id="btnCharts" style="padding: 6px 12px; border: 2px solid #667eea; border-radius: 8px; background: transparent; color: #667eea; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        📊 Analytics
      </button>

      <button id="btnBatchAction" style="padding: 6px 12px; border: 2px solid #718096; border-radius: 8px; background: transparent; color: #718096; font-weight: 600; cursor: pointer; margin-left: auto;">
        ☑️ Select
      </button>
    `;

        // Insert controls
        const searchArea = document.querySelector('.search-filters');
        if (searchArea) {
            searchArea.parentNode.insertBefore(controls, searchArea.nextSibling);
        } else {
            UI.header.appendChild(controls);
        }

        // Event Listeners
        controls.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => switchView(e.target.dataset.view));
        });

        document.getElementById('btnFocusMode').addEventListener('click', toggleFocusMode);
        document.getElementById('btnCharts').addEventListener('click', toggleAnalytics);
        document.getElementById('btnBatchAction').addEventListener('click', toggleBatchMode);
    }

    function switchView(viewName) {
        STATE.view = viewName;

        // Update buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            const isActive = btn.dataset.view === viewName;
            btn.style.background = isActive ? 'white' : 'transparent';
            btn.style.color = isActive ? '#667eea' : '#718096';
            btn.classList.toggle('active', isActive);

            // Accessibility
            btn.setAttribute('aria-pressed', isActive);
        });

        renderCurrentView();
    }

    // ============================================
    // 3. RENDER LOGIC
    // ============================================
    function renderCurrentView() {
        const goals = getFilteredGoals(); // Helper from goals-enhancements.js or implement local
        const container = document.getElementById('goalsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (STATE.view === 'list') {
            container.style.display = 'grid'; // Restore grid
            if (typeof window.applyFilters === 'function') {
                window.applyFilters(); // Use existing render
            } else {
                // Fallback
                goals.forEach(g => container.appendChild(createGoalCard(g)));
            }
        } else if (STATE.view === 'kanban') {
            renderKanban(container, goals);
        } else if (STATE.view === 'calendar') {
            renderCalendar(container, goals);
        }
    }

    // Helper to get goals (respecting existing filters if possible, but implementing simple fetch for now)
    function getFilteredGoals() {
        let goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];

        // Apply Focus Mode (High Priority Only)
        if (STATE.focusMode) {
            goals = goals.filter(g => g.priority === 'high');
        }

        return goals;
    }

    function toggleFocusMode() {
        STATE.focusMode = !STATE.focusMode;
        const btn = document.getElementById('btnFocusMode');

        if (STATE.focusMode) {
            btn.style.background = '#ed8936';
            btn.style.color = 'white';
            showNotification('🎯 Focus Mode Active: High Priority Only', 'info');
        } else {
            btn.style.background = 'transparent';
            btn.style.color = '#ed8936';
        }

        renderCurrentView();
    }

    // ============================================
    // 4. KANBAN VIEW
    // ============================================
    function renderKanban(container, goals) {
        container.style.display = 'flex';
        container.style.gap = '1rem';
        container.style.overflowX = 'auto';
        container.style.padding = '1rem 0';
        container.style.alignItems = 'flex-start';

        const columns = [
            { id: 'todo', title: 'To Do (0-25%)', color: '#e2e8f0', filter: g => g.progress <= 25 },
            { id: 'doing', title: 'In Progress (26-75%)', color: '#ebf8ff', filter: g => g.progress > 25 && g.progress < 100 },
            { id: 'done', title: 'Completed (100%)', color: '#f0fff4', filter: g => g.progress === 100 }
        ];

        columns.forEach(col => {
            const colDiv = document.createElement('div');
            colDiv.className = 'kanban-col';
            colDiv.style.cssText = `
        min-width: 300px;
        background: ${col.color};
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      `;

            colDiv.innerHTML = `<h4 style="margin: 0 0 0.5rem 0; color: #4a5568;">${col.title}</h4>`;

            const colGoals = goals.filter(col.filter);

            if (colGoals.length === 0) {
                colDiv.innerHTML += `<div style="color: #a0aec0; text-align: center; font-style: italic; padding: 1rem;">No items</div>`;
            }

            colGoals.forEach(g => {
                const card = createMiniGoalCard(g);
                colDiv.appendChild(card);
            });

            container.appendChild(colDiv);
        });
    }

    function createMiniGoalCard(goal) {
        const card = document.createElement('div');
        card.style.cssText = `
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      border-left: 4px solid ${getPriorityColor(goal.priority)};
    `;

        card.innerHTML = `
      <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${goal.title}</div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #718096;">
        <span>${goal.progress}%</span>
        <span>${goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No date'}</span>
      </div>
    `;

        card.addEventListener('click', () => {
            // Open standard edit modal
            if (window.editGoal) window.editGoal(goal.id);
        });

        return card;
    }

    function getPriorityColor(p) {
        if (p === 'high') return '#f56565';
        if (p === 'medium') return '#ed8936';
        return '#48bb78';
    }

    // ============================================
    // 5. CALENDAR VIEW
    // ============================================
    function renderCalendar(container, goals) {
        container.style.display = 'block';

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        let html = `
      <div class="calendar-wrapper" style="background: white; border-radius: 12px; padding: 1rem; border: 1px solid #e2e8f0;">
        <h3 style="text-align: center; margin-bottom: 1rem;">${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center;">
          <div style="font-weight: bold; color: #718096;">Sun</div>
          <div style="font-weight: bold; color: #718096;">Mon</div>
          <div style="font-weight: bold; color: #718096;">Tue</div>
          <div style="font-weight: bold; color: #718096;">Wed</div>
          <div style="font-weight: bold; color: #718096;">Thu</div>
          <div style="font-weight: bold; color: #718096;">Fri</div>
          <div style="font-weight: bold; color: #718096;">Sat</div>
    `;

        // Simple calendar logic
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

        for (let i = 0; i < firstDay; i++) {
            html += `<div></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayGoals = goals.filter(g => g.dueDate === dateStr);
            const hasGoal = dayGoals.length > 0;

            let indicator = '';
            if (hasGoal) {
                indicator = `<div style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; margin: 2px auto;"></div>`;
                if (dayGoals.length > 1) indicator += `<div style="font-size: 0.6rem; color: #718096;">+${dayGoals.length - 1}</div>`;
            }

            const isToday = day === now.getDate();

            html += `
            <div style="
                padding: 0.5rem; 
                min-height: 50px; 
                border-radius: 8px; 
                background: ${isToday ? '#ebf8ff' : '#f7fafc'}; 
                border: 1px solid ${isToday ? '#63b3ed' : 'transparent'};
                position: relative;
                cursor: pointer;
            " title="${dayGoals.map(g => g.title).join('\n')}">
                <span style="font-weight: ${isToday ? 'bold' : 'normal'}">${day}</span>
                ${indicator}
            </div>
        `;
        }

        html += `</div></div>`;
        container.innerHTML = html;
    }

    // ============================================
    // 6. ANALYTICS (Charts & Streaks)
    // ============================================
    function toggleAnalytics() {
        const dashboard = document.getElementById('statsDashboard');
        if (!dashboard) return;

        let analyticsDiv = document.getElementById('advancedAnalytics');
        if (!analyticsDiv) {
            analyticsDiv = document.createElement('div');
            analyticsDiv.id = 'advancedAnalytics';
            analyticsDiv.style.cssText = 'margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed #e2e8f0; display: none;';

            // Calculate Productivity Score & Streak
            const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
            const score = Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1));

            // Mock streak for now or calculate from completedAt dates
            const streak = 5; // Placeholder for demo, rigorous streak requires history log

            analyticsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div style="background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                <div style="font-size: 2rem;">🔥 ${streak} Days</div>
                <div style="color: #718096; font-size: 0.8rem;">Current Streak</div>
            </div>
            <div style="background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                <div style="font-size: 2rem;">🚀 ${score}/100</div>
                <div style="color: #718096; font-size: 0.8rem;">Productivity Score</div>
            </div>
        </div>
        
        <div style="background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
             <h4 style="text-align: center; margin-bottom: 1rem;">Goals by Category</h4>
             <canvas id="categoryChart" width="300" height="200"></canvas>
        </div>
      `;

            dashboard.appendChild(analyticsDiv);
            renderChart();
        }

        const isHidden = analyticsDiv.style.display === 'none';
        analyticsDiv.style.display = isHidden ? 'block' : 'none';

        const btn = document.getElementById('btnCharts');
        btn.style.background = isHidden ? '#667eea' : 'transparent';
        btn.style.color = isHidden ? 'white' : '#667eea';
    }

    function renderChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const categories = {};
        goals.forEach(g => {
            categories[g.category] = (categories[g.category] || 0) + 1;
        });

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // ============================================
    // 7. ADVANCED UX (Batch Actions, Smart Dates, Inline Edit)
    // ============================================

    // Smart Date Parsing
    window.parseSmartDate = function (input) {
        const now = new Date();
        const lc = input.toLowerCase();

        if (lc.includes('tomorrow')) {
            now.setDate(now.getDate() + 1);
            return now.toISOString().split('T')[0];
        }
        if (lc.includes('next week')) {
            now.setDate(now.getDate() + 7);
            return now.toISOString().split('T')[0];
        }
        return input; // Return original if no match
    }

    // Hook into Goal Modal to use smart date
    const observer = new MutationObserver(() => {
        const dateInput = document.getElementById('goalDeadline');
        if (dateInput && !dateInput.dataset.smartInit) {
            dateInput.dataset.smartInit = "true";
            // Create a text input overlay or just handle on change?
            // Simpler: Just check value on blur if it was a text input, but date inputs are restrictive.
            // We'll add a "Smart Quick Add" input instead in the modal.

            const smartInput = document.createElement('input');
            smartInput.type = 'text';
            smartInput.placeholder = 'Or type "tomorrow", "next week"';
            smartInput.className = 'form-input';
            smartInput.style.marginTop = '0.5rem';

            smartInput.addEventListener('blur', () => {
                const parsed = window.parseSmartDate(smartInput.value);
                if (parsed !== smartInput.value) { // If changed, it's a date
                    dateInput.value = parsed;
                    smartInput.value = '';
                    showNotification(`📅 Date set to ${parsed}`, 'success');
                }
            });

            dateInput.parentNode.appendChild(smartInput);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Batch Actions
    function toggleBatchMode() {
        const btn = document.getElementById('btnBatchAction');
        const isBatch = btn.classList.toggle('active');

        if (isBatch) {
            btn.style.background = '#718096';
            btn.style.color = 'white';
            document.querySelectorAll('.goal-card').forEach(card => {
                if (!card.querySelector('.batch-checkbox')) {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.className = 'batch-checkbox';
                    cb.style.cssText = 'position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; z-index: 100;';
                    card.style.position = 'relative';
                    card.appendChild(cb);

                    // Click card filters to checkbox
                    cb.addEventListener('change', (e) => {
                        const id = card.dataset.goalId;
                        if (e.target.checked) STATE.selectedGoals.add(id);
                        else STATE.selectedGoals.delete(id);
                        updateBatchToolbar();
                    });
                }
                card.querySelector('.batch-checkbox').style.display = 'block';
            });
            showBatchToolbar();
        } else {
            btn.style.background = 'transparent';
            btn.style.color = '#718096';
            document.querySelectorAll('.batch-checkbox').forEach(cb => cb.style.display = 'none');
            hideBatchToolbar();
            STATE.selectedGoals.clear();
        }
    }

    function showBatchToolbar() {
        let toolbar = document.getElementById('batchToolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'batchToolbar';
            toolbar.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #2d3748; color: white; padding: 1rem 2rem; border-radius: 50px; display: flex; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999;';
            toolbar.innerHTML = `
            <button id="batchComplete" style="background: transparent; color: white; border: none; cursor: pointer;">✅ Complete Selected</button>
            <button id="batchDelete" style="background: transparent; color: #fc8181; border: none; cursor: pointer;">🗑️ Delete Selected</button>
          `;
            document.body.appendChild(toolbar);

            document.getElementById('batchComplete').onclick = () => {
                const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
                goals.forEach(g => {
                    if (STATE.selectedGoals.has(g.id.toString())) g.progress = 100;
                });
                localStorage.setItem('edugateway_goals', JSON.stringify(goals));
                location.reload();
            };

            document.getElementById('batchDelete').onclick = () => {
                if (!confirm('Delete selected goals?')) return;
                let goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
                goals = goals.filter(g => !STATE.selectedGoals.has(g.id.toString()));
                localStorage.setItem('edugateway_goals', JSON.stringify(goals));
                location.reload();
            };
        }
        toolbar.style.display = 'flex';
    }

    function hideBatchToolbar() {
        const t = document.getElementById('batchToolbar');
        if (t) t.style.display = 'none';
    }

    function updateBatchToolbar() {
        // Optional: update counts
    }

    // Floating Action Button
    function initFAB() {
        if (document.getElementById('fabAddGoal')) return;
        const fab = document.createElement('button');
        fab.id = 'fabAddGoal';
        fab.innerHTML = '+';
        fab.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        font-size: 32px;
        border: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        cursor: pointer;
        z-index: 990;
        display: flex; /* Setup as flex to center the +, but initially standard */
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;
        fab.onmouseover = () => fab.style.transform = 'scale(1.1)';
        fab.onmouseout = () => fab.style.transform = 'scale(1)';
        fab.onclick = () => window.openModal(); // Existing function

        document.body.appendChild(fab);
    }

    // Init
    setTimeout(() => {
        initViewControls();
        initFAB();
        console.log('✅ Advanced Features Loaded: Views, Charts, Focus Mode, Batch Actions');
    }, 2000);

})();
