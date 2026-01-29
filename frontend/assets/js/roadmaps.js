/**
 * Roadmaps Page Logic
 * Handles interactive timeline, progress tracking, and detailed views.
 */

(function () {
  'use strict';

  // State
  let allRoadmaps = [];
  let currentRoadmap = null;
  let userProgress = {}; // { roadmapId: { nodeId: true, ... } }

  // Elements
  const viewOverview = document.getElementById('roadmapsOverview');
  const viewDetail = document.getElementById('roadmapDetail');

  const el = {
    grid: document.getElementById('roadmapsGrid'),
    navPills: document.querySelectorAll('.cat-pill'),

    // Detail
    timeline: document.getElementById('timelineContainer'),
    title: document.getElementById('detailTitle'),
    desc: document.getElementById('detailDesc'),
    duration: document.getElementById('dDuration'),
    dTopics: document.getElementById('dTopics'),
    milestones: document.getElementById('milestoneList'),
    chart: document.getElementById('overallProgressChart'),
    resetBtn: document.getElementById('resetProgressBtn'),

    // Chart inner
    chartCircle: document.querySelector('.circular-chart .circle'),
    chartText: document.querySelector('.circular-chart .percentage')
  };

  // --- Initialization ---
  function init() {
    loadProgress();
    allRoadmaps = getMockRoadmaps();

    renderGrid('all');
    setupListeners();

    // Check hash for direct link
    const hash = window.location.hash;
    if (hash && hash.startsWith('#roadmap-')) {
      const id = hash.replace('#roadmap-', '');
      openRoadmap(id);
    }
  }

  // --- Mock Data ---
  function getMockRoadmaps() {
    return [
      {
        id: 'frontend',
        title: 'Frontend Developer',
        desc: 'Step-by-step guide to becoming a modern frontend developer in 2026.',
        category: 'career',
        icon: 'fas fa-laptop-code',
        duration: '6 Months',
        stats: { students: '12k', rating: 4.8 },
        phases: [
          {
            title: 'Foundation',
            color: 'var(--phase-foundation)',
            nodes: [
              { id: 'html', title: 'HTML & Semantic Web', desc: 'Learn the structure of the web.', resources: [{ title: 'MDN HTML', url: '#' }] },
              { id: 'css', title: 'CSS Basics & Flexbox', desc: 'Styling and layout fundamentals.', resources: [{ title: 'CSS Tricks', url: '#' }] },
              { id: 'js', title: 'JavaScript Syntax', desc: 'Variables, loops, and functions.', resources: [{ title: 'JS Info', url: '#' }] }
            ]
          },
          {
            title: 'Intermediate',
            color: 'var(--phase-intermediate)',
            nodes: [
              { id: 'react', title: 'React Fundamentals', desc: 'Components, Props, and State.', resources: [{ title: 'React Docs', url: '#' }] },
              { id: 'git', title: 'Version Control (Git)', desc: 'Managing code history.', resources: [{ title: 'Git Guide', url: '#' }] }
            ]
          },
          {
            title: 'Advanced',
            color: 'var(--phase-advanced)',
            nodes: [
              { id: 'perf', title: 'Web Performance', desc: 'Optimization techniques.', resources: [] },
              { id: 'security', title: 'Web Security', desc: 'OWASP Top 10.', resources: [] }
            ]
          }
        ]
      },
      {
        id: 'datascience',
        title: 'Data Scientist',
        desc: 'From Python basics to Machine Learning mastery.',
        category: 'career',
        icon: 'fas fa-database',
        duration: '9 Months',
        stats: { students: '8k', rating: 4.7 },
        phases: [
          {
            title: 'Setup',
            color: 'var(--phase-foundation)',
            nodes: [
              { id: 'py', title: 'Python Basics', desc: 'Syntax and data structures.', resources: [] },
              { id: 'math', title: 'Math for ML', desc: 'Linear Algebra and Calculus.', resources: [] }
            ]
          },
          {
            title: 'Analysis',
            color: 'var(--phase-intermediate)',
            nodes: [
              { id: 'pandas', title: 'Pandas & NumPy', desc: 'Data manipulation.', resources: [] },
              { id: 'viz', title: 'Data Visualization', desc: 'Matplotlib and Seaborn.', resources: [] }
            ]
          }
        ]
      },
      {
        id: 'studyabroad',
        title: 'Study Abroad Guide',
        desc: 'The complete process for applying to international universities.',
        category: 'academic',
        icon: 'fas fa-plane-departure',
        duration: '12 Months',
        stats: { students: '5k', rating: 4.9 },
        phases: [
          {
            title: 'Planning',
            color: 'var(--phase-expert)',
            nodes: [
              { id: 'research', title: 'Research Universities', desc: 'Find the right fit.', resources: [] },
              { id: 'exams', title: 'Standardized Tests', desc: 'GRE, TOEFL, IELTS.', resources: [] }
            ]
          },
          {
            title: 'Applications',
            color: 'var(--phase-expert)',
            nodes: [
              { id: 'sop', title: 'Drafting SOP', desc: 'Statement of Purpose.', resources: [] },
              { id: 'lor', title: 'Letters of Rec', desc: 'Getting recommendations.', resources: [] }
            ]
          }
        ]
      },
      {
        id: 'react-adv',
        title: 'Advanced React Patterns',
        desc: 'Master hooks, context, and performance.',
        category: 'skills',
        icon: 'fab fa-react',
        duration: '2 Months',
        stats: { students: '3k', rating: 4.8 },
        phases: [
          {
            title: 'Hooks',
            color: 'var(--phase-advanced)',
            nodes: [
              { id: 'custom-hooks', title: 'Custom Hooks', desc: 'Reusing logic.', resources: [] },
              { id: 'useeffect', title: 'useEffect Deep Dive', desc: 'Dependency arrays.', resources: [] }
            ]
          }
        ]
      }
    ];
  }

  // --- Overview View ---
  function renderGrid(filter) {
    const filtered = filter === 'all'
      ? allRoadmaps
      : allRoadmaps.filter(r => r.category === filter);

    el.grid.innerHTML = filtered.map(r => {
      // Calc Progress if available
      const total = r.phases.reduce((acc, p) => acc + p.nodes.length, 0);
      const done = userProgress[r.id] ? Object.keys(userProgress[r.id]).length : 0;
      const percent = Math.round((done / total) * 100);

      return `
            <div class="r-card" onclick="window.openRoadmap('${r.id}')">
                <div class="r-icon"><i class="${r.icon}"></i></div>
                <h3>${r.title}</h3>
                <p>${r.desc}</p>
                ${done > 0 ? `
                   <div class="r-progress"><div class="rp-fill" style="width:${percent}%; background:var(--node-completed);"></div></div>
                   <div class="r-label">${percent}% Complete</div>
                ` : `
                   <div class="r-stats">
                       <span><i class="far fa-clock"></i> ${r.duration}</span>
                       <span><i class="fas fa-users"></i> ${r.stats.students}</span>
                   </div>
                `}
            </div>
          `;
    }).join('');
  }

  // --- Detail View ---
  window.openRoadmap = (id) => {
    const roadmap = allRoadmaps.find(r => r.id === id);
    if (!roadmap) return;
    currentRoadmap = roadmap;

    // Swap Views
    viewOverview.style.display = 'none';
    viewDetail.style.display = 'block';
    window.scrollTo(0, 0);

    // Hydrate Header
    el.title.textContent = roadmap.title;
    el.desc.textContent = roadmap.desc;
    el.duration.textContent = roadmap.duration;
    el.dTopics.textContent = roadmap.phases.reduce((acc, p) => acc + p.nodes.length, 0);

    renderTimeline();
    updateDetailStats();
  };

  window.closeRoadmap = () => {
    viewDetail.style.display = 'none';
    viewOverview.style.display = 'block';
    currentRoadmap = null;
    window.location.hash = '';
    renderGrid('all'); // Refresh progress bars
  };

  function renderTimeline() {
    if (!currentRoadmap) return;

    const rId = currentRoadmap.id;
    const progress = userProgress[rId] || {};

    let html = '';

    currentRoadmap.phases.forEach((phase, pIdx) => {
      html += `
             <div class="phase-block">
                 <div class="phase-title" style="color: ${phase.color}">${phase.title}</div>
          `;

      phase.nodes.forEach((node, nIdx) => {
        const isDone = progress[node.id];
        const isCurrent = !isDone && (nIdx === 0 || progress[phase.nodes[nIdx - 1]?.id] || (pIdx > 0 && isPhaseComplete(pIdx - 1)));
        const isLocked = !isDone && !isCurrent;

        const statusClass = isDone ? 'completed' : (isCurrent ? 'current' : 'locked');

        html += `
                <div class="node-item ${statusClass}" id="node-${node.id}">
                    <div class="node-circle">
                         ${isDone ? '<i class="fas fa-check"></i>' : (nIdx + 1)}
                    </div>
                    <div class="node-card" onclick="window.toggleNode('${node.id}')">
                        <div class="node-header">
                            <h4>${node.title}</h4>
                            <span class="node-status">${isDone ? 'Done' : (isLocked ? 'Locked' : 'Current')}</span>
                        </div>
                        <div class="node-details">
                             <p>${node.desc}</p>
                             ${node.resources.map(res => `<a href="${res.url}" class="resource-link"><i class="fas fa-external-link-alt"></i> ${res.title}</a>`).join('')}
                             ${!isDone ? `<button class="btn-complete" onclick="event.stopPropagation(); window.markComplete('${node.id}')">Mark Complete</button>` : ''}
                        </div>
                    </div>
                </div>
              `;
      });

      html += `</div>`;
    });

    el.timeline.innerHTML = html;
  }

  window.toggleNode = (nodeId) => {
    const elNode = document.getElementById(`node-${nodeId}`);
    if (elNode) elNode.classList.toggle('expanded');
  };

  window.markComplete = (nodeId) => {
    if (!currentRoadmap) return;
    if (!userProgress[currentRoadmap.id]) userProgress[currentRoadmap.id] = {};

    userProgress[currentRoadmap.id][nodeId] = true;
    saveProgress();

    // Re-render
    renderTimeline();
    updateDetailStats();
  };

  function saveProgress() {
    localStorage.setItem('brainex_roadmaps_progress', JSON.stringify(userProgress));
  }

  function loadProgress() {
    const saved = localStorage.getItem('brainex_roadmaps_progress');
    if (saved) {
      try { userProgress = JSON.parse(saved); } catch (e) { }
    }
  }

  function updateDetailStats() {
    if (!currentRoadmap) return;
    const rId = currentRoadmap.id;
    const total = currentRoadmap.phases.reduce((acc, p) => acc + p.nodes.length, 0);
    const done = userProgress[rId] ? Object.keys(userProgress[rId]).length : 0;
    const percent = Math.round((done / total) * 100);

    // Chart
    const circumference = 100; // dasharray 0 100
    el.chartCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
    el.chartText.textContent = `${percent}%`;

    // Milestones Sidebar
    el.milestones.innerHTML = currentRoadmap.phases.map(p => {
      const pTotal = p.nodes.length;
      const pDone = p.nodes.filter(n => userProgress[rId]?.[n.id]).length;
      const isPhaseDone = pTotal === pDone;
      return `<li class="${isPhaseDone ? 'done' : ''}">
                    <i class="${isPhaseDone ? 'fas fa-check-circle' : 'far fa-circle'}"></i> 
                    ${p.title} (${pDone}/${pTotal})
                 </li>`;
    }).join('');
  }

  function isPhaseComplete(pIdx) {
    // Check if all nodes in phase pIdx are done
    if (!currentRoadmap) return false;
    const phase = currentRoadmap.phases[pIdx];
    return phase.nodes.every(n => userProgress[currentRoadmap.id]?.[n.id]);
  }

  // --- Listeners ---
  function setupListeners() {
    // Category Pills
    el.navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.navPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderGrid(pill.dataset.cat);
      });
    });

    // Reset
    el.resetBtn.addEventListener('click', () => {
      if (confirm('Reset progress for this roadmap?')) {
        if (currentRoadmap) {
          delete userProgress[currentRoadmap.id];
          saveProgress();
          renderTimeline();
          updateDetailStats();
        }
      }
    });
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
