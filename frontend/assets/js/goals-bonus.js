// Goals Page - Bonus Features (Phase 5)
// Adds: Gamification (XP/Levels), Daily Challenges, Calendar Export, Social Sharing

(function () {
    'use strict';

    // ============================================
    // 1. GAMIFICATION SYSTEM (XP & LEVELS)
    // ============================================

    const XP_CONFIG = {
        GOAL_COMPLETE: 500,
        TASK_COMPLETE: 50,
        STREAK_BONUS: 100,
        DAILY_CHALLENGE: 250
    };

    function getGamificationData() {
        return JSON.parse(localStorage.getItem('edugateway_gamification')) || {
            xp: 0,
            level: 1,
            completedChallenges: [],
            lastChallengeDate: null
        };
    }

    function saveGamificationData(data) {
        localStorage.setItem('edugateway_gamification', JSON.stringify(data));
        updateLevelDisplay();
    }

    function addXP(amount, reason) {
        const data = getGamificationData();
        const oldLevel = data.level;
        data.xp += amount;

        // Level calculation: Level N requires N * 1000 XP
        const newLevel = Math.floor(data.xp / 1000) + 1;

        if (newLevel > oldLevel) {
            data.level = newLevel;
            if (typeof showNotification === 'function') {
                setTimeout(() => {
                    showNotification(`🆙 LEVEL UP! You reached Level ${newLevel}!`, 'achievement');
                    if (typeof confetti !== 'undefined') {
                        confetti({
                            particleCount: 150,
                            spread: 100,
                            colors: ['#FFD700', '#FFA500', '#FFFFFF']
                        });
                    }
                }, 500);
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(`⭐ +${amount} XP: ${reason}`, 'info');
            }
        }

        saveGamificationData(data);
    }

    function hookCompletionFunction() {
        // Hook into existing completion functions
        const originalUpdateProgress = window.updateProgressImmediate;
        if (originalUpdateProgress) {
            window.updateProgressImmediate = function (id, val) {
                const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
                const goal = goals.find(g => g.id === parseInt(id));
                const wasCompleted = goal && goal.progress === 100;

                originalUpdateProgress(id, val);

                // Check if newly completed
                if (parseInt(val) === 100 && !wasCompleted) {
                    addXP(XP_CONFIG.GOAL_COMPLETE, 'Goal Completed');
                }
            };
        }
    }

    function updateLevelDisplay() {
        const data = getGamificationData();
        const nextLevelXp = data.level * 1000;
        const currentLevelBaseXp = (data.level - 1) * 1000;
        const progress = ((data.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100;

        const dashboard = document.getElementById('statsDashboard');
        if (dashboard && !document.getElementById('levelDisplay')) {
            const levelDiv = document.createElement('div');
            levelDiv.id = 'levelDisplay';
            levelDiv.style.cssText = 'margin-bottom: 1.5rem; background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e2e8f0;';
            levelDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div>
            <span style="font-size: 1.25rem; font-weight: 700; color: #667eea;">Level ${data.level}</span>
            <span style="color: #718096; font-size: 0.875rem; margin-left: 0.5rem;">(${data.xp} XP total)</span>
          </div>
          <div style="font-size: 0.875rem; color: #718096;">
            ${Math.floor(nextLevelXp - data.xp)} XP to next level
          </div>
        </div>
        <div style="height: 10px; background: #edf2f7; border-radius: 5px; overflow: hidden;">
          <div id="xpBar" style="height: 100%; width: ${progress}%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.5s ease;"></div>
        </div>
      `;
            dashboard.insertBefore(levelDiv, dashboard.firstChild.nextSibling); // Insert after header
        } else if (document.getElementById('xpBar')) {
            document.getElementById('xpBar').style.width = `${progress}%`;
            const levelText = document.querySelector('#levelDisplay span');
            if (levelText) levelText.textContent = `Level ${data.level}`;
        }
    }

    // ============================================
    // 2. DAILY CHALLENGES
    // ============================================

    const CHALLENGES = [
        "Complete 3 tasks today",
        "Update progress on 2 goals",
        "Create a new goal",
        "Review your priorities",
        "Add tags to 3 goals",
        "Clear 1 overdue item"
    ];

    function initDailyChallenge() {
        const data = getGamificationData();
        const today = new Date().toDateString();

        // New challenge if none for today
        if (data.lastChallengeDate !== today) {
            data.currentChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
            data.lastChallengeDate = today;
            data.challengeCompleted = false;
            saveGamificationData(data);
        }

        const dashboard = document.getElementById('statsDashboard');
        if (dashboard && !document.getElementById('dailyChallenge')) {
            const challengeDiv = document.createElement('div');
            challengeDiv.id = 'dailyChallenge';
            challengeDiv.style.cssText = 'margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(237, 137, 54, 0.1) 0%, rgba(236, 201, 75, 0.1) 100%); border-radius: 8px; border: 1px dashed #ed8936; display: flex; align-items: center; justify-content: space-between;';

            const isCompleted = data.challengeCompleted;

            challengeDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 1.5rem;">🔥</div>
          <div>
            <div style="font-weight: 700; color: #c05621; font-size: 0.875rem; text-transform: uppercase;">Daily Challenge</div>
            <div style="color: #2d3748; font-weight: 600;">${data.currentChallenge}</div>
          </div>
        </div>
        <button id="claimChallengeBtn" class="btn-small" ${isCompleted ? 'disabled' : ''} 
                style="background: ${isCompleted ? '#48bb78' : 'white'}; color: ${isCompleted ? 'white' : '#c05621'}; border: 1px solid ${isCompleted ? '#48bb78' : '#ed8936'}; opacity: ${isCompleted ? '0.8' : '1'};">
          ${isCompleted ? 'Claimed ✓' : 'Claim +250 XP'}
        </button>
      `;

            dashboard.appendChild(challengeDiv);

            document.getElementById('claimChallengeBtn').addEventListener('click', function () {
                if (!this.disabled) {
                    addXP(XP_CONFIG.DAILY_CHALLENGE, 'Daily Challenge');
                    this.textContent = 'Claimed ✓';
                    this.style.background = '#48bb78';
                    this.style.color = 'white';
                    this.style.borderColor = '#48bb78';
                    this.disabled = true;

                    const newData = getGamificationData();
                    newData.challengeCompleted = true;
                    saveGamificationData(newData);
                }
            });
        }
    }

    // ============================================
    // 3. CALENDAR EXPORT (.ics)
    // ============================================

    window.exportToCalendar = function (goalId) {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const goal = goals.find(g => g.id === parseInt(goalId));

        if (!goal || !goal.dueDate) {
            showNotification('❌ Need a due date to export!', 'error');
            return;
        }

        const dueDate = new Date(goal.dueDate);
        const startDate = new Date(dueDate); // Events usually have start/end, we'll use same day

        // Format dates for ICS (YYYYMMDD)
        const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 8);

        const icsContent =
            `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BraineX//Goals//EN
BEGIN:VEVENT
UID:${Date.now()}@brainex.app
DTSTAMP:${formatDate(new Date())}T000000Z
DTSTART;VALUE=DATE:${formatDate(startDate)}
DTEND;VALUE=DATE:${formatDate(new Date(startDate.getTime() + 86400000))}
SUMMARY:🎯 Due: ${goal.title}
DESCRIPTION:Goal Priority: ${goal.priority.toUpperCase()}\\nCategory: ${goal.category}\\nTags: ${goal.tags ? goal.tags.join(', ') : 'None'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${goal.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('📅 Added to Calendar!', 'success');
    };

    // ============================================
    // 4. SHARE GOAL (COPY TO CLIPBOARD)
    // ============================================

    window.shareGoal = function (goalId) {
        const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
        const goal = goals.find(g => g.id === parseInt(goalId));
        if (!goal) return;

        const text = `🎯 My Goal: ${goal.title}\n📅 Due: ${goal.dueDate || 'Someday'}\n📊 Progress: ${goal.progress}%\n\nTracked in BraineX`;

        navigator.clipboard.writeText(text).then(() => {
            showNotification('📋 Goal details copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy', err);
            showNotification('❌ Failed to copy to clipboard', 'error');
        });
    };

    // ============================================
    // 5. ENHANCE CARDS WITH NEW BUTTONS
    // ============================================

    function addBonusButtons() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.goal-card').forEach(card => {
                if (card.querySelector('.share-goal-btn')) return;

                const goalId = card.getAttribute('data-goal-id');
                const actionsDiv = card.querySelector('.goal-actions');

                if (actionsDiv) {
                    // Share Button
                    const shareBtn = document.createElement('button');
                    shareBtn.className = 'btn-action share-goal-btn';
                    shareBtn.innerHTML = '🔗';
                    shareBtn.title = 'Share Goal';
                    shareBtn.onclick = () => window.shareGoal(goalId);
                    actionsDiv.appendChild(shareBtn);

                    // Calendar Button (only if due date exists)
                    const hasDueDate = card.querySelector('.goal-due-date');
                    if (hasDueDate) {
                        const calBtn = document.createElement('button');
                        calBtn.className = 'btn-action calendar-export-btn';
                        calBtn.innerHTML = '📅';
                        calBtn.title = 'Add to Calendar';
                        calBtn.onclick = () => window.exportToCalendar(goalId);
                        actionsDiv.appendChild(calBtn);
                    }
                }
            });
        });

        const container = document.getElementById('goalsContainer');
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }
    }

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        setTimeout(() => {
            updateLevelDisplay();
            initDailyChallenge();
            addBonusButtons();
            hookCompletionFunction();
            console.log('✅ Bonus features loaded: Gamification, Daily Challenges, Calendar, Sharing');
        }, 1500); // Wait for other scripts
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
