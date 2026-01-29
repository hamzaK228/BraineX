/**
 * Goals Page Logic - Enhanced
 * Handles Dashboard Stats, View Switching, CRUD, Confetti, and Advanced Features
 */

(function () {
  'use strict';

  // --- State ---
  let goals = JSON.parse(localStorage.getItem('brainex_goals')) || getMockGoals();
  let currentView = 'list';
  let filters = { priority: null, status: null, tag: null };
  let currentDate = new Date();

  // For Edit Mode
  let isEditing = false;
  let editingId = null;

  // --- Initializers ---
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (goals.length === 0) {
      goals = getMockGoals();
      saveGoals();
    }

    renderDashboard();
    renderCurrentView();
    populateFilterPills(); // Initial population
    setupEventListeners();

    // Check for Confetti lib availability
    if (typeof confetti === 'undefined') {
      console.warn('Confetti library not loaded');
    }
  }

  function getMockGoals() {
    return [
      {
        id: 'g1',
        title: 'Complete Frontend Course',
        desc: 'Finish React and CSS modules',
        priority: 'high',
        status: 'inprogress',
        date: '2026-02-15',
        progress: 60,
        tags: ['Study', 'Work'],
        subtasks: [
          { text: 'Watch videos', done: true },
          { text: 'Build project', done: false },
        ],
      },
      {
        id: 'g2',
        title: 'Gym Workout',
        desc: 'Hit the gym 4 times a week',
        priority: 'medium',
        status: 'todo',
        date: '2026-01-30',
        progress: 20,
        tags: ['Health'],
        subtasks: [{ text: 'Leg day', done: false }],
      },
      {
        id: 'g3',
        title: 'Read Atomic Habits',
        desc: 'Read 10 pages daily',
        priority: 'low',
        status: 'completed',
        date: '2026-01-10',
        progress: 100,
        tags: ['Personal'],
        subtasks: [],
      },
    ];
  }

  function saveGoals() {
    localStorage.setItem('brainex_goals', JSON.stringify(goals));
    renderDashboard();
    renderCurrentView();
    updateTagFiltersUI();
  }

  // --- Dashboard Stats ---
  function renderDashboard() {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'completed' || g.progress === 100).length;
    const progress = goals.filter((g) => g.status === 'inprogress').length;
    const overdue = goals.filter(
      (g) => new Date(g.date) < new Date() && g.status !== 'completed'
    ).length;

    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    setText('statTotal', total);
    setText('statCompleted', completed);
    setText('statProgress', progress);
    setText('statOverdue', overdue);
    setText('statRate', rate + '%');

    // Celebration for 100%
    if (rate === 100 && total > 0) {
      // triggerConfetti(); // Maybe too much on every render?
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // --- View Rendering ---
  function renderCurrentView() {
    // 1. Filter Logic
    let displayGoals = goals.filter((g) => {
      if (filters.priority && g.priority !== filters.priority) return false;
      if (filters.status && g.status !== filters.status) return false;
      if (filters.tag && (!g.tags || !g.tags.includes(filters.tag))) return false;
      return true;
    });

    // 2. Sort Logic
    const sort = document.getElementById('sortSelect').value;
    displayGoals.sort((a, b) => {
      if (sort === 'date') return new Date(a.date) - new Date(b.date);
      if (sort === 'priority') {
        const map = { high: 1, medium: 2, low: 3 };
        return map[a.priority] - map[b.priority];
      }
      if (sort === 'progress') return b.progress - a.progress;
      return new Date(b.id.replace('g', '')) - new Date(a.id.replace('g', '')); // Newest first fallback
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

    container.innerHTML = list.map((g) => createGoalCard(g, false)).join('');
  }

  // BOARD VIEW
  function renderBoard(list) {
    document.getElementById('viewList').style.display = 'none';
    document.getElementById('viewBoard').style.display = 'block';
    document.getElementById('viewCalendar').style.display = 'none';

    const cols = ['todo', 'inprogress', 'completed'];
    cols.forEach((status) => {
      const items = list.filter((g) => g.status === status);
      document.getElementById('board-' + status).innerHTML = items
        .map((g) => createGoalCard(g, true))
        .join('');
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
      subtasksHtml = g.subtasks
        .map(
          (st, i) => `
              <div class="subtask-item">
                  <div class="cb-custom ${st.done ? 'checked' : ''}" onclick="window.toggleSubtask('${g.id}', ${i})">
                      ${st.done ? '<i class="fas fa-check"></i>' : ''}
                  </div>
                  <input class="st-text ${st.done ? 'checked' : ''}" value="${st.text}" onchange="window.updateSubtask('${g.id}', ${i}, this.value)">
                  <button class="btn-icon delete" onclick="window.deleteSubtask('${g.id}', ${i})">×</button>
              </div>
          `
        )
        .join('');
      subtasksHtml += `<button class="add-subtask-btn" onclick="window.addSubtask('${g.id}')">+ Add Subtask</button>`;
    }

    // Progress bar
    const bar = `
          <div class="gc-progress">
              <div class="progress-text"><span>Progress</span><span>${g.progress}%</span></div>
              <div class="progress-bar"><div class="pb-fill" style="width:${g.progress}%"></div></div>
          </div>
      `;

    // Actions
    const actions = `
        <div class="gc-actions">
            <button class="btn-icon" title="Duplicate" onclick="window.duplicateGoal('${g.id}')"><i class="fas fa-copy"></i></button>
            <button class="btn-icon" title="Edit" onclick="window.editGoal('${g.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete" title="Delete" onclick="window.deleteGoal('${g.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;

    return `
        <div class="goal-card priority-${g.priority} ${isCompleted ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
            <div class="gc-header">
                <div class="gc-badges">${pBadge} ${dBadge}</div>
                ${actions}
            </div>
            
            <div class="gc-title-row">
                <input value="${g.title}" onchange="window.updateGoalField('${g.id}', 'title', this.value)" class="gc-title-input">
            </div>
            
            ${!isMini
        ? `
            <div class="gc-desc">
                 <input value="${g.desc || ''}" placeholder="Add description..." onchange="window.updateGoalField('${g.id}', 'desc', this.value)">
            </div>
            ${bar}
            <div class="gc-subtasks">${subtasksHtml}</div>
            <div class="gc-tags">
                ${(g.tags || []).map((t) => `<span class="tag-pill">${t}</span>`).join('')}
            </div>
            `
        : ''
      }
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
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    title.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0-6

    let html = '';
    // Empty cells
    for (let i = 0; i < startDay; i++) html += `<div class="cal-cell empty"></div>`;

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayGoals = list.filter((g) => g.date === dateStr);

      let itemsHtml = dayGoals
        .map((g) => {
          const pClass =
            g.priority === 'high' ? 'p-high' : g.priority === 'medium' ? 'p-med' : 'p-low';
          return `<div class="cal-item ${pClass}" onclick="window.editGoal('${g.id}')" title="${g.title}">${g.title.substring(0, 15)}...</div>`;
        })
        .join('');

      html += `
              <div class="cal-cell ${isToday(d, month, year) ? 'today' : ''}">
                  <div class="cal-num">${d}</div>
                  <div class="cal-items">${itemsHtml}</div>
              </div>
          `;
    }
    grid.innerHTML = html;
  }

  function isToday(d, m, y) {
    const n = new Date();
    return d === n.getDate() && m === n.getMonth() && y === n.getFullYear();
  }
  function formatDate(s) {
    if (!s) return '';
    const d = new Date(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  // --- Actions ---
  window.updateGoalField = (id, field, val) => {
    const g = goals.find((x) => x.id === id);
    if (g) {
      g[field] = val;
      saveGoals();
    }
  };

  window.toggleSubtask = (id, idx) => {
    const g = goals.find((x) => x.id === id);
    if (g && g.subtasks[idx]) {
      g.subtasks[idx].done = !g.subtasks[idx].done;
      // Auto progress calc
      const doneC = g.subtasks.filter((s) => s.done).length;
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

  window.updateSubtask = (id, idx, val) => {
    const g = goals.find((x) => x.id === id);
    if (g && g.subtasks[idx]) {
      g.subtasks[idx].text = val;
      saveGoals();
    }
  };

  window.addSubtask = (id) => {
    const g = goals.find((x) => x.id === id);
    if (g) {
      if (!g.subtasks) g.subtasks = [];
      g.subtasks.push({ text: 'New task', done: false });
      saveGoals();
    }
  };

  window.deleteSubtask = (id, idx) => {
    const g = goals.find((x) => x.id === id);
    if (g && g.subtasks) {
      g.subtasks.splice(idx, 1);
      saveGoals();
    }
  };

  window.deleteGoal = (id) => {
    if (confirm('Delete this goal?')) {
      goals = goals.filter((x) => x.id !== id);
      saveGoals();
    }
  };

  window.duplicateGoal = (id) => {
    const g = goals.find(x => x.id === id);
    if (g) {
      const newGoal = JSON.parse(JSON.stringify(g));
      newGoal.id = 'g' + Date.now(); // New ID
      newGoal.title += ' (Copy)';
      newGoal.status = 'todo'; // Reset status
      newGoal.progress = 0;
      newGoal.subtasks.forEach(st => st.done = false); // Reset subtasks
      goals.unshift(newGoal);
      saveGoals();
      triggerConfetti(); // Little pop for creation
    }
  };

  window.editGoal = (id) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;

    isEditing = true;
    editingId = id;

    // Fill Modal
    document.getElementById('goalTitle').value = g.title;
    document.getElementById('goalDesc').value = g.desc || '';
    document.getElementById('goalPriority').value = g.priority;
    document.getElementById('goalDate').value = g.date;
    document.getElementById('goalTags').value = (g.tags || []).join(', ');

    // Change Button Text
    const btnSave = document.getElementById('saveGoal');
    btnSave.textContent = 'Update Goal';

    // Open Modal
    document.getElementById('goalModal').classList.add('active');
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

  btnAdd.onclick = () => {
    isEditing = false;
    editingId = null;
    document.getElementById('goalForm').reset();
    document.getElementById('saveGoal').textContent = 'Save Goal';

    // Set default date to today
    document.getElementById('goalDate').valueAsDate = new Date();

    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.getElementById('goalForm').reset();
    isEditing = false;
    editingId = null;
  };

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
    const tags = tagStr ? tagStr.split(',').map((s) => s.trim()).filter(s => s) : [];

    if (isEditing && editingId) {
      // UPDATE EXISTING
      const g = goals.find(x => x.id === editingId);
      if (g) {
        g.title = title;
        g.desc = desc;
        g.priority = priority;
        g.date = date;
        g.tags = tags;
      }
    } else {
      // CREATE NEW
      const newGoal = {
        id: 'g' + Date.now(),
        title,
        desc,
        priority,
        date,
        tags,
        progress: 0,
        status: 'todo',
        subtasks: [],
      };
      goals.unshift(newGoal);
      triggerConfetti();
    }

    saveGoals();
    closeModal();
  };

  // --- Event Listeners and Filters UI ---
  function setupEventListeners() {
    // View Toggles
    document.querySelectorAll('.v-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        renderCurrentView();
      });
    });

    // Filter Toggle
    const fToggle = document.getElementById('filterToggle');
    const fPanel = document.getElementById('filterPanel');
    if (fToggle && fPanel) {
      fToggle.addEventListener('click', () => {
        fPanel.style.display = fPanel.style.display === 'none' ? 'grid' : 'none';
      });
    }

    // Filter Pills
    document.querySelectorAll('.fp-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filter;
        const val = btn.dataset.val;

        // Toggle
        if (filters[type] === val) filters[type] = null;
        else filters[type] = val;

        // Visual update
        const siblings = btn.parentElement.querySelectorAll('.fp-btn');
        siblings.forEach((s) => s.classList.remove('active'));
        if (filters[type]) btn.classList.add('active');

        renderCurrentView();
      });
    });

    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        filters = { priority: null, status: null, tag: null };
        document.querySelectorAll('.fp-btn').forEach((b) => b.classList.remove('active'));
        renderCurrentView();
      });
    }

    const sortSel = document.getElementById('sortSelect');
    if (sortSel) sortSel.addEventListener('change', renderCurrentView);

    // Calendar Nav
    const prev = document.getElementById('calPrev');
    const next = document.getElementById('calNext');
    if (prev) prev.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(goals);
    });
    if (next) next.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(goals);
    });
  }

  function populateFilterPills() {
    updateTagFiltersUI();
  }

  function updateTagFiltersUI() {
    const tagContainer = document.getElementById('tagFilters');
    if (!tagContainer) return;

    const allTags = new Set();
    goals.forEach(g => {
      if (g.tags) g.tags.forEach(t => allTags.add(t));
    });

    let html = '';
    allTags.forEach(t => {
      const isActive = filters.tag === t ? 'active' : '';
      html += `<button class="fp-btn ${isActive}" onclick="window.filterByTag('${t}')">${t}</button>`;
    });
    tagContainer.innerHTML = html;
  }

  window.filterByTag = (tag) => {
    if (filters.tag === tag) filters.tag = null;
    else filters.tag = tag;
    renderCurrentView();
    updateTagFiltersUI();
  };

  // EXPORT / IMPORT
  window.exportGoalsToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(goals));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "brainex_goals.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

})();
