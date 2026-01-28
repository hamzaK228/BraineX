// Roadmaps Page Functionality
document.addEventListener('DOMContentLoaded', function () {
  // 1. Roadmap Data (Sample)
  const roadmaps = [
    {
      title: 'Software Engineering Career',
      category: 'career',
      icon: '💻',
      description: 'From basics to senior engineer in the tech industry',
      duration: '12-24 months',
      milestones: '20 milestones',
      followers: '15.4k',
    },
    {
      title: 'Study Abroad Excellence',
      category: 'academic',
      icon: '🌎',
      description: "Step-by-step guide to securing master's abroad",
      duration: '12 months',
      milestones: '12 milestones',
      followers: '8.2k',
    },
    {
      title: 'Data Science Specialization',
      category: 'skills',
      icon: '📊',
      description: 'Master Python, Math and Machine Learning',
      duration: '9-15 months',
      milestones: '18 milestones',
      followers: '11.1k',
    },
    {
      title: 'Research Publication Pro',
      category: 'research',
      icon: '📝',
      description: 'How to write and publish in top tier journals',
      duration: '6-12 months',
      milestones: '10 milestones',
      followers: '5.7k',
    },
    {
      title: 'E-commerce Startup Guide',
      category: 'business',
      icon: '🚀',
      description: 'Launch your first online business from scratch',
      duration: '3-6 months',
      milestones: '15 milestones',
      followers: '9.3k',
    },
  ];

  // 2. Initialize Filtering
  const filterTabs = document.querySelectorAll('.category-tab');
  const roadmapsList = document.getElementById('roadmapsList');

  if (filterTabs && roadmapsList) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Update active tab
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-category');
        renderRoadmaps(category);
      });
    });

    // Initial render
    renderRoadmaps('all');
  }

  function renderRoadmaps(filter) {
    if (!roadmapsList) return;

    const filtered = roadmaps.filter((r) => filter === 'all' || r.category === filter);

    roadmapsList.innerHTML = filtered
      .map(
        (r) => `
            <div class="roadmap-card" style="opacity: 0; transform: translateY(20px);">
                <div class="roadmap-icon">${r.icon}</div>
                <h3>${r.title}</h3>
                <p>${r.description}</p>
                <div class="roadmap-details">
                    <div class="detail"><span>⏱️</span> ${r.duration}</div>
                    <div class="detail"><span>📊</span> ${r.milestones}</div>
                    <div class="detail"><span>👥</span> ${r.followers} followers</div>
                </div>
                <a href="#" class="btn-roadmap" style="text-decoration: none; text-align: center; display: inline-block;">View Roadmap</a>
            </div>
        `
      )
      .join('');

    // Animate entrance
    const cards = roadmapsList.querySelectorAll('.roadmap-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // 3. Roadmap Finder
  const findBtn = document.querySelector('.btn-find-roadmap');
  const goalSelect = document.getElementById('goalSelect');

  if (findBtn && goalSelect) {
    findBtn.addEventListener('click', () => {
      const goal = goalSelect.value;
      if (!goal) {
        if (window.BraineX && window.BraineX.showNotification) {
          BraineX.showNotification('Please select a goal first!', 'info');
        } else {
          alert('Please select a goal first!');
        }
        return;
      }

      // Scroll to list and filter
      const categoryMap = {
        undergraduate: 'academic',
        graduate: 'academic',
        career: 'career',
        research: 'research',
        startup: 'business',
      };

      const targetCategory = categoryMap[goal] || 'all';
      const targetTab = document.querySelector(`.category-tab[data-category="${targetCategory}"]`);

      if (targetTab) {
        targetTab.click();
        roadmapsList.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // 4. Interactive Steps Animation
  const steps = document.querySelectorAll('.timeline-step');
  steps.forEach((step) => {
    step.addEventListener('click', () => {
      steps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // 5. Roadmap Details Modal Logic
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-roadmap')) {
      e.preventDefault();
      const card = e.target.closest('.roadmap-card');
      const title = card.querySelector('h3').textContent;
      openRoadmapModal(title);
    }
  });

  // Modal Close Logic
  const modal = document.getElementById('roadmapModal');
  if (modal) {
    modal
      .querySelector('.close-modal')
      .addEventListener('click', () => (modal.style.display = 'none'));
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function openRoadmapModal(title) {
    const modal = document.getElementById('roadmapModal');
    const content = document.getElementById('roadmapModalContent');
    if (!modal || !content) return;

    // Find data
    const roadmap = roadmaps.find((r) => r.title === title) || {
      title: title,
      description: 'A comprehensive guide to achieving your goals in ' + title,
      duration: 'Flexible',
      milestones: 'Multiple Phases',
      icon: '🎯',
    };

    // Get or initialize roadmap progress
    const roadmapId = title.toLowerCase().replace(/\s+/g, '-');
    const savedProgress = JSON.parse(localStorage.getItem(`roadmap_${roadmapId}`) || 'null');

    const phases = [
      {
        id: 1,
        title: 'Phase 1: Foundations',
        description: 'Build the essential knowledge and skills required for this path.',
        duration: '1-3 Months',
        tasks: [
          'Research and understand the field requirements',
          'Create a structured learning plan',
          'Gather necessary resources and tools',
          'Set up your development environment',
          'Complete introductory courses or tutorials'
        ]
      },
      {
        id: 2,
        title: 'Phase 2: Advanced Concepts',
        description: 'Deep dive into specialized topics and practical applications.',
        duration: '3-6 Months',
        tasks: [
          'Master core technical concepts',
          'Build practical projects',
          'Contribute to open source or collaborate',
          'Network with professionals in the field',
          'Attend workshops or conferences'
        ]
      },
      {
        id: 3,
        title: 'Phase 3: Mastery & Launch',
        description: 'Finalize your portfolio, complete capstone projects, and achieve your goal.',
        duration: '6+ Months',
        tasks: [
          'Complete capstone or major project',
          'Build comprehensive portfolio',
          'Prepare application materials',
          'Apply to opportunities',
          'Achieve your final goal'
        ]
      }
    ];

    // Initialize progress if not exists
    let progress = savedProgress || {
      currentPhase: 0,
      phases: phases.map(p => ({
        id: p.id,
        tasks: p.tasks.map(() => false)
      }))
    };

    // Check if already tracking
    const myRoadmaps = JSON.parse(localStorage.getItem('my_roadmaps') || '[]');
    const isTracking = myRoadmaps.some((r) => r.title === roadmap.title);

    function renderPhase(phaseIndex) {
      const phase = phases[phaseIndex];
      const phaseProgress = progress.phases[phaseIndex];
      const completedTasks = phaseProgress.tasks.filter(t => t).length;
      const totalTasks = phase.tasks.length;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return `
        <div class="phase-container" data-phase="${phaseIndex}">
          <div class="phase" style="background: #f8fafc; padding: 2rem; border-radius: 12px; border-left: 4px solid ${phaseIndex === 0 ? '#667eea' : phaseIndex === 1 ? '#764ba2' : '#48bb78'};">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div>
                <h3>${phase.title}</h3>
                <p style="margin: 0.5rem 0; color: #64748b;">${phase.description}</p>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">⏱️ ${phase.duration}</div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div style="margin: 1.5rem 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.9rem;">Progress</span>
                <span style="font-weight: 600; font-size: 0.9rem; color: ${progressPercent === 100 ? '#48bb78' : '#667eea'};">${progressPercent}%</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: ${progressPercent}%; height: 100%; background: ${progressPercent === 100 ? '#48bb78' : '#667eea'}; transition: width 0.3s ease;"></div>
              </div>
            </div>

            <!-- Task Checklist -->
            <div class="task-checklist" style="margin-top: 1.5rem;">
              <h4 style="margin-bottom: 1rem; font-size: 1rem;">Tasks:</h4>
              ${phase.tasks.map((task, taskIndex) => `
                <label style="display: flex; align-items: center; padding: 0.75rem; background: white; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease; border: 1px solid ${phaseProgress.tasks[taskIndex] ? '#48bb78' : '#e2e8f0'};" 
                       onmouseover="this.style.background='#f8fafc'" 
                       onmouseout="this.style.background='white'">
                  <input type="checkbox" 
                         class="task-checkbox" 
                         data-phase="${phaseIndex}" 
                         data-task="${taskIndex}"
                         ${phaseProgress.tasks[taskIndex] ? 'checked' : ''}
                         style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer; accent-color: #667eea;">
                  <span style="flex: 1; ${phaseProgress.tasks[taskIndex] ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${task}</span>
                </label>
              `).join('')}
            </div>

            <!-- Phase Actions -->
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="btn-mark-phase-complete" data-phase="${phaseIndex}" style="padding: 0.75rem 1.5rem; background: ${progressPercent === 100 ? '#48bb78' : '#667eea'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                ${progressPercent === 100 ? '✓ Phase Complete' : 'Mark All as Complete'}
              </button>
              ${phaseIndex < phases.length - 1 ? `
                <button class="btn-next-phase" data-phase="${phaseIndex}" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600;">
                  Next Phase →
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="roadmap-header" style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">${roadmap.icon || '🎓'}</div>
        <h2>${roadmap.title}</h2>
        <p>${roadmap.description}</p>
      </div>

      <!-- Overall Progress -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">Overall Progress</div>
            <div style="font-size: 2rem; font-weight: 700;">${calculateOverallProgress(progress)}%</div>
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button id="downloadPdfBtn" style="padding: 0.75rem 1.5rem; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Phase Navigation -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <button id="prevPhaseBtn" style="padding: 0.75rem 1.5rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600; ${progress.currentPhase === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
          ← Previous
        </button>
        <div style="font-weight: 600; color: #64748b;">
          Phase ${progress.currentPhase + 1} of ${phases.length}
        </div>
        <button id="nextPhaseBtn" style="padding: 0.75rem 1.5rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; font-weight: 600; ${progress.currentPhase === phases.length - 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
          Next →
        </button>
      </div>

      <!-- Phase Content -->
      <div id="phaseContent">
        ${renderPhase(progress.currentPhase)}
      </div>

      <!-- Start Tracking Button -->
      <div class="roadmap-actions" style="margin-top: 2rem; text-align: center; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
        <button class="btn-primary js-start-roadmap" data-title="${roadmap.title}" ${isTracking ? 'disabled style="background: #48bb78; cursor: default;"' : ''}>
          ${isTracking ? '✓ Currently Tracking' : 'Start Tracking Now'}
        </button>
      </div>
    `;

    // Add event listeners
    setupPhaseNavigation();
    setupTaskCheckboxes();
    setupPhaseCompletion();
    setupPdfDownload(roadmap, phases, progress);

    // Start tracking button
    const startBtn = content.querySelector('.js-start-roadmap');
    if (startBtn && !isTracking) {
      startBtn.addEventListener('click', function () {
        startTrackingRoadmap(roadmap);
        this.textContent = '✓ Currently Tracking';
        this.disabled = true;
        this.style.background = '#48bb78';
        this.style.cursor = 'default';
      });
    }

    modal.style.display = 'block';

    // Helper functions
    function calculateOverallProgress(prog) {
      let totalTasks = 0;
      let completedTasks = 0;
      prog.phases.forEach(phase => {
        totalTasks += phase.tasks.length;
        completedTasks += phase.tasks.filter(t => t).length;
      });
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }

    function setupPhaseNavigation() {
      document.getElementById('prevPhaseBtn')?.addEventListener('click', () => {
        if (progress.currentPhase > 0) {
          progress.currentPhase--;
          saveProgress();
          document.getElementById('phaseContent').innerHTML = renderPhase(progress.currentPhase);
          updateNavigationButtons();
          setupTaskCheckboxes();
          setupPhaseCompletion();
        }
      });

      document.getElementById('nextPhaseBtn')?.addEventListener('click', () => {
        if (progress.currentPhase < phases.length - 1) {
          progress.currentPhase++;
          saveProgress();
          document.getElementById('phaseContent').innerHTML = renderPhase(progress.currentPhase);
          updateNavigationButtons();
          setupTaskCheckboxes();
          setupPhaseCompletion();
        }
      });

      // Handle "Next Phase" button within phase
      document.querySelectorAll('.btn-next-phase').forEach(btn => {
        btn.addEventListener('click', () => {
          const phaseIndex = parseInt(btn.dataset.phase);
          if (phaseIndex < phases.length - 1) {
            progress.currentPhase = phaseIndex + 1;
            saveProgress();
            document.getElementById('phaseContent').innerHTML = renderPhase(progress.currentPhase);
            updateNavigationButtons();
            setupTaskCheckboxes();
            setupPhaseCompletion();
          }
        });
      });
    }

    function updateNavigationButtons() {
      const prevBtn = document.getElementById('prevPhaseBtn');
      const nextBtn = document.getElementById('nextPhaseBtn');
      const phaseIndicator = document.querySelector('[style*="Phase"]');

      if (prevBtn) {
        prevBtn.disabled = progress.currentPhase === 0;
        prevBtn.style.opacity = progress.currentPhase === 0 ? '0.5' : '1';
        prevBtn.style.cursor = progress.currentPhase === 0 ? 'not-allowed' : 'pointer';
      }

      if (nextBtn) {
        nextBtn.disabled = progress.currentPhase === phases.length - 1;
        nextBtn.style.opacity = progress.currentPhase === phases.length - 1 ? '0.5' : '1';
        nextBtn.style.cursor = progress.currentPhase === phases.length - 1 ? 'not-allowed' : 'pointer';
      }

      if (phaseIndicator) {
        phaseIndicator.textContent = `Phase ${progress.currentPhase + 1} of ${phases.length}`;
      }
    }

    function setupTaskCheckboxes() {
      document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const phaseIndex = parseInt(e.target.dataset.phase);
          const taskIndex = parseInt(e.target.dataset.task);

          progress.phases[phaseIndex].tasks[taskIndex] = e.target.checked;
          saveProgress();

          // Update progress display
          document.getElementById('phaseContent').innerHTML = renderPhase(progress.currentPhase);
          updateOverallProgress();
          setupTaskCheckboxes();
          setupPhaseCompletion();
        });
      });
    }

    function setupPhaseCompletion() {
      document.querySelectorAll('.btn-mark-phase-complete').forEach(btn => {
        btn.addEventListener('click', () => {
          const phaseIndex = parseInt(btn.dataset.phase);
          const allCompleted = progress.phases[phaseIndex].tasks.every(t => t);

          // Toggle all tasks
          progress.phases[phaseIndex].tasks = progress.phases[phaseIndex].tasks.map(() => !allCompleted);
          saveProgress();

          // Re-render
          document.getElementById('phaseContent').innerHTML = renderPhase(progress.currentPhase);
          updateOverallProgress();
          setupTaskCheckboxes();
          setupPhaseCompletion();

          if (!allCompleted && window.BraineX?.showNotification) {
            BraineX.showNotification(`${phases[phaseIndex].title} marked as complete!`, 'success');
          }
        });
      });
    }

    function updateOverallProgress() {
      const overallPercent = calculateOverallProgress(progress);
      const progressDisplay = content.querySelector('[style*="Overall Progress"]')?.nextElementSibling;
      if (progressDisplay) {
        progressDisplay.textContent = `${overallPercent}%`;
      }
    }

    function saveProgress() {
      localStorage.setItem(`roadmap_${roadmapId}`, JSON.stringify(progress));
    }

    function setupPdfDownload(roadmap, phases, progress) {
      document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
        generatePdfContent(roadmap, phases, progress);
      });
    }

    function generatePdfContent(roadmap, phases, progress) {
      // Simple text-based PDF generation (browser print)
      const printWindow = window.open('', '_blank');
      const overallProgress = calculateOverallProgress(progress);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${roadmap.title} - Roadmap</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #667eea; text-align: center; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
            .icon { font-size: 3rem; }
            .progress { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .phase { margin: 30px 0; padding: 20px; border-left: 4px solid #667eea; background: #f8fafc; }
            .phase h2 { color: #667eea; margin-top: 0; }
            .task { padding: 8px 0; display: flex; align-items: center; }
            .task-checked { text-decoration: line-through; color: #94a3b8; }
            .checkbox { width: 16px; height: 16px; margin-right: 10px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <div class="icon">${roadmap.icon || '🎓'}</div>
            <h1>${roadmap.title}</h1>
            <p>${roadmap.description}</p>
          </div>
          
          <div class="progress">
            <h3>Overall Progress: ${overallProgress}%</h3>
            <div style="width: 100%; height: 20px; background: #e2e8f0; border-radius: 4px;">
              <div style="width: ${overallProgress}%; height: 100%; background: #667eea; border-radius: 4px;"></div>
            </div>
          </div>

          ${phases.map((phase, phaseIndex) => {
        const phaseProgress = progress.phases[phaseIndex];
        const completed = phaseProgress.tasks.filter(t => t).length;
        const total = phaseProgress.tasks.length;

        return `
              <div class="phase">
                <h2>${phase.title}</h2>
                <p>${phase.description}</p>
                <p><strong>Duration:</strong> ${phase.duration}</p>
                <p><strong>Progress:</strong> ${completed}/${total} tasks completed</p>
                <div style="margin-top: 15px;">
                  ${phase.tasks.map((task, taskIndex) => `
                    <div class="task ${phaseProgress.tasks[taskIndex] ? 'task-checked' : ''}">
                      <input type="checkbox" class="checkbox" ${phaseProgress.tasks[taskIndex] ? 'checked' : ''} disabled>
                      <span>${task}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
      }).join('')}
          
          <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 0.9rem;">
            <p>Generated from BraineX on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();

      if (window.BraineX?.showNotification) {
        BraineX.showNotification('Opening PDF preview...', 'success');
      }
    }
  }

  // Function to save roadmap to localStorage
  function startTrackingRoadmap(roadmap) {
    const myRoadmaps = JSON.parse(localStorage.getItem('my_roadmaps') || '[]');

    // Check if already exists
    if (myRoadmaps.some((r) => r.title === roadmap.title)) {
      if (window.BraineX && window.BraineX.showNotification) {
        BraineX.showNotification('You are already tracking this roadmap!', 'info');
      }
      return;
    }

    // Add to list
    myRoadmaps.push({
      title: roadmap.title,
      icon: roadmap.icon,
      description: roadmap.description,
      startedAt: new Date().toISOString(),
      progress: 0,
    });

    localStorage.setItem('my_roadmaps', JSON.stringify(myRoadmaps));

    if (window.BraineX && window.BraineX.showNotification) {
      BraineX.showNotification(
        `Started tracking "${roadmap.title}"! Check My Goals for progress.`,
        'success'
      );
    } else {
      alert(`Started tracking "${roadmap.title}"!`);
    }
  }
});
