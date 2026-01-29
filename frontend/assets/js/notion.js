/**
 * Goals Page Logic
 * Handles Dashboard Stats, View Switching, CRUD, and Confetti
 */

(function () {
  'use strict';

  // --- State ---
  let goals = JSON.parse(localStorage.getItem('brainex_goals')) || getMockGoals();
  let currentView = 'list';
  let filters = { priority: null, status: null, tag: null };
  let currentDate = new Date();

  // --- Initializers ---
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (goals.length === 0) { goals = getMockGoals(); saveGoals(); }

    renderDashboard();
    renderCurrentView();
    populateFilterPills();

    setupEventListeners();
  }

  function getMockGoals() {
    return [
      { id: 'g1', title: 'Complete Frontend Course', desc: 'Finish React and CSS modules', priority: 'high', status: 'inprogress', date: '2026-02-15', progress: 60, tags: ['Study', 'Work'], subtasks: [{ text: 'Watch videos', done: true }, { text: 'Build project', done: false }] },
      { id: 'g2', title: 'Gym Workout', desc: 'Hit the gym 4 times a week', priority: 'medium', status: 'todo', date: '2026-01-30', progress: 20, tags: ['Health'], subtasks: [{ text: 'Leg day', done: false }] },
      { id: 'g3', title: 'Read Atomic Habits', desc: 'Read 10 pages daily', priority: 'low', status: 'completed', date: '2026-01-10', progress: 100, tags: ['Personal'], subtasks: [] }
    ];
  }

  function saveGoals() {
    localStorage.setItem('brainex_goals', JSON.stringify(goals));
    renderDashboard();
    renderCurrentView();
  }

  // --- Dashboard Stats ---
  function renderDashboard() {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed' || g.progress === 100).length;
    const progress = goals.filter(g => g.status === 'inprogress').length;
    const overdue = goals.filter(g => new Date(g.date) < new Date() && g.status !== 'completed').length;

    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    setText('statTotal', total);
    setText('statCompleted', completed);
    setText('statProgress', progress);
    setText('statOverdue', overdue);
    setText('statRate', rate + '%');
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }


  // --- View Rendering ---
  function renderCurrentView() {
    // 1. Filter Logic
    let displayGoals = goals.filter(g => {
      if (filters.priority && g.priority !== filters.priority) return false;
      if (filters.status && g.status !== filters.status) return false;
      // Simple tag match
      // if(filters.tag && !g.tags.includes(filters.tag)) return false; 
      return true;
    });

    // 2. Sort Logic
    const sort = document.getElementById('sortSelect').value;
    displayGoals.sort((a, b) => {
      if (sort === 'date') return new Date(a.date) - new Date(b.date);
      if (sort === 'priority') { const map = { high: 1, medium: 2, low: 3 }; return map[a.priority] - map[b.priority]; }
      if (sort === 'progress') return a.progress - b.progress;
      return b.id.localeCompare(a.id); // created/newest roughly
    });

    // 3. Render
    if (currentView === 'list') renderList(displayGoals);
    else if (currentView === 'board') renderBoard(displayGoals);
    else if (currentView === 'calendar') renderCalendar(displayGoals);
  }

  // LIST VIEW
  function renderList(list) {
    document.getElementById('viewList').style.display = 'block';
    document.getElementById('viewBoard').style.display = 'none';
    document.getElementById('viewCalendar').style.display = 'none';

    const container = document.getElementById('goalsList');
    const empty = document.getElementById('emptyState');

    if (list.length === 0) {
      container.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    container.innerHTML = list.map(g => createGoalCard(g, false)).join('');
  }

  // BOARD VIEW
  function renderBoard(list) {
    document.getElementById('viewList').style.display = 'none';
    document.getElementById('viewBoard').style.display = 'block';
    document.getElementById('viewCalendar').style.display = 'none';

    const cols = ['todo', 'inprogress', 'completed'];
    cols.forEach(status => {
      const items = list.filter(g => g.status === status);
      document.getElementById('board-' + status).innerHTML = items.map(g => createGoalCard(g, true)).join('');
      document.getElementById('count-' + status).textContent = items.length;
    });
  }

  function createGoalCard(g, isMini) {
    const isCompleted = g.status === 'completed' || g.progress === 100;
    const overdue = new Date(g.date) < new Date() && !isCompleted;

    // Determine badges
    const pBadge = `<span class="badge ${g.priority}">${g.priority}</span>`;
    const dBadge = `<span class="badge date" style="${overdue ? 'color:red' : ''}"><i class="far fa-calendar"></i> ${formatDate(g.date)}</span>`;

    // Subtasks HTML
    let subtasksHtml = '';
    if (!isMini && g.subtasks) {
      subtasksHtml = g.subtasks.map((st, i) => `
              <div class="subtask-item">
                  <div class="cb-custom ${st.done ? 'checked' : ''}" onclick="window.toggleSubtask('${g.id}', ${i})">
                      ${st.done ? '<i class="fas fa-check"></i>' : ''}
                  </div>
                  <input class="st-text ${st.done ? 'checked' : ''}" value="${st.text}" onchange="window.updateSubtask('${g.id}', ${i}, this.value)">
                  <button class="btn-icon delete" onclick="window.deleteSubtask('${g.id}', ${i})">×</button>
              </div>
          `).join('');
      subtasksHtml += `<button class="add-subtask-btn" onclick="window.addSubtask('${g.id}')">+ Add Subtask</button>`;
    }

    // Progress bar
    const bar = `
          <div class="gc-progress">
              <div class="progress-text"><span>Progress</span><span>${g.progress}%</span></div>
              <div class="progress-bar"><div class="pb-fill" style="width:${g.progress}%"></div></div>
          </div>
      `;

    return `
        <div class="goal-card priority-${g.priority} ${isCompleted ? 'completed' : ''}">
            <div class="gc-header">
                <div class="gc-badges">${pBadge} ${dBadge}</div>
                <div class="gc-actions">
                    <button class="btn-icon" onclick="window.editGoal('${g.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="window.deleteGoal('${g.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            
            <div class="gc-title-row">
                <input value="${g.title}" onchange="window.updateGoalField('${g.id}', 'title', this.value)">
            </div>
            
            ${!isMini ? `
            <div class="gc-desc">
                 <input value="${g.desc || ''}" placeholder="Add description..." onchange="window.updateGoalField('${g.id}', 'desc', this.value)">
            </div>
            ${bar}
            <div class="gc-subtasks">${subtasksHtml}</div>
            <div class="gc-tags">
                ${(g.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('')}
            </div>
            ` : ''}
        </div>
      `;
  }

  // CALENDAR VIEW
  function renderCalendar(list) {
    document.getElementById('viewList').style.display = 'none';
    document.getElementById('viewBoard').style.display = 'none';
    document.getElementById('viewCalendar').style.display = 'block';

    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calTitle');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    title.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0-6

    let html = '';
    // Empty cells
    for (let i = 0; i < startDay; i++) html += `<div class="cal-cell"></div>`;

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayGoals = list.filter(g => g.date === dateStr);

      let itemsHtml = dayGoals.map(g => {
        const pClass = g.priority === 'high' ? 'p-high' : g.priority === 'medium' ? 'p-med' : 'p-low';
        return `<div class="cal-item ${pClass}" onclick="window.editGoal('${g.id}')">${g.title}</div>`;
      }).join('');

      html += `
              <div class="cal-cell ${isToday(d, month, year) ? 'today' : ''}">
                  <div class="cal-num">${d}</div>
                  <div>${itemsHtml}</div>
              </div>
          `;
    }
    grid.innerHTML = html;
  }

  function isToday(d, m, y) { const n = new Date(); return d === n.getDate() && m === n.getMonth() && y === n.getFullYear(); }
  function formatDate(s) { if (!s) return ''; const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()}`; }


  // --- Actions ---
  window.updateGoalField = (id, field, val) => {
    const g = goals.find(x => x.id === id);
    if (g) { g[field] = val; saveGoals(); }
  };

  window.toggleSubtask = (id, idx) => {
    const g = goals.find(x => x.id === id);
    if (g && g.subtasks[idx]) {
      g.subtasks[idx].done = !g.subtasks[idx].done;
      // Auto progress calc
      const doneC = g.subtasks.filter(s => s.done).length;
      g.progress = Math.round((doneC / g.subtasks.length) * 100);
      if (g.progress === 100 && g.status !== 'completed') {
        g.status = 'completed';
        triggerConfetti();
      } else if (g.progress < 100 && g.status === 'completed') {
        g.status = 'inprogress';
      }
      saveGoals();
    }
  };

  window.addSubtask = (id) => {
    const g = goals.find(x => x.id === id);
    if (g) {
      if (!g.subtasks) g.subtasks = [];
      g.subtasks.push({ text: 'New task', done: false });
      saveGoals();
    }
  };

  window.deleteSubtask = (id, idx) => {
    const g = goals.find(x => x.id === id);
    if (g && g.subtasks) {
      g.subtasks.splice(idx, 1);
      saveGoals();
    }
  };

  window.deleteGoal = (id) => {
    if (confirm('Delete this goal?')) {
      goals = goals.filter(x => x.id !== id);
      saveGoals();
    }
  };

  window.editGoal = (id) => {
    // For now simple alert or could open modal
    // Ideally re-use add modal for edit
    alert('Editing not fully implemented in this demo, straightforward to match creation logic.');
  };

  function triggerConfetti() {
    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }


  // --- Modal & Create ---
  const modal = document.getElementById('goalModal');
  const btnAdd = document.getElementById('btnAddGoal');
  const btnCancel = document.getElementById('cancelGoal');
  const btnSave = document.getElementById('saveGoal');
  const btnClose = document.getElementById('closeModal');

  btnAdd.onclick = () => { modal.classList.add('active'); };
  const closeModal = () => { modal.classList.remove('active'); document.getElementById('goalForm').reset(); };
  btnCancel.onclick = closeModal;
  btnClose.onclick = closeModal;

  btnSave.onclick = (e) => {
    e.preventDefault();
    const title = document.getElementById('goalTitle').value;
    if (!title) return alert('Title required');

    const desc = document.getElementById('goalDesc').value;
    const priority = document.getElementById('goalPriority').value;
    const date = document.getElementById('goalDate').value;
    const tagStr = document.getElementById('goalTags').value;
    const tags = tagStr ? tagStr.split(',').map(s => s.trim()) : [];

    const newGoal = {
      id: 'g' + Date.now(),
      title, desc, priority, date, tags,
      progress: 0, status: 'todo', subtasks: []
    };

    goals.unshift(newGoal); // Add to top
    saveGoals();
    closeModal();
    triggerConfetti(); // Create celebration for setting goal!
  };


  // --- Event Listeners and Filters UI ---
  function setupEventListeners() {
    // View Toggles
    document.querySelectorAll('.v-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        renderCurrentView();
      });
    });

    // Filter Toggle
    const fToggle = document.getElementById('filterToggle');
    const fPanel = document.getElementById('filterPanel');
    fToggle.addEventListener('click', () => {
      fPanel.style.display = fPanel.style.display === 'none' ? 'grid' : 'none';
    });

    // Filter Pills
    document.querySelectorAll('.fp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filter;
        const val = btn.dataset.val;

        // Toggle
        if (filters[type] === val) filters[type] = null;
        else filters[type] = val;

        // Visual update
        const siblings = btn.parentElement.querySelectorAll('.fp-btn');
        siblings.forEach(s => s.classList.remove('active'));
        if (filters[type]) btn.classList.add('active');

        renderCurrentView();
      });
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
      filters = { priority: null, status: null, tag: null };
      document.querySelectorAll('.fp-btn').forEach(b => b.classList.remove('active'));
      renderCurrentView();
    });

    document.getElementById('sortSelect').addEventListener('change', renderCurrentView);

    // Calendar Nav
    document.getElementById('calPrev').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(goals);
    });
    document.getElementById('calNext').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(goals);
    });
  }

  function populateFilterPills() {
    // Populate unique tags logic (omitted for brevity, assume manual filter for now or pre-defined)
  }

})();