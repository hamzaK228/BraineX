// Goals Page Enhancement - Confetti Integration
// This file patches updateProgressImmediate with confetti celebration

(function () {
    'use strict';

    // Wait for the page to load and original function to be defined
    window.addEventListener('DOMContentLoaded', function () {
        // Store the original function
        const originalUpdateProgressImmediate = window.updateProgressImmediate;

        if (!originalUpdateProgressImmediate) {
            console.warn('updateProgressImmediate not found, confetti enhancement skipped');
            return;
        }

        // Enhanced version with confetti
        window.updateProgressImmediate = function (id, val) {
            const goals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
            const goal = goals.find((g) => g.id === parseInt(id));

            if (!goal) return;

            const wasCompleted = goal.progress === 100;
            const oldProgress = goal.progress;

            // Call original function
            originalUpdateProgressImmediate(id, val);

            // Get updated goal
            const updatedGoals = JSON.parse(localStorage.getItem('edugateway_goals')) || [];
            const updatedGoal = updatedGoals.find((g) => g.id === parseInt(id));
            const isNowCompleted = updatedGoal && updatedGoal.progress === 100;

            const card = document.querySelector(`.goal-card[data-goal-id="${id}"]`);

            // 🎉 CONFETTI CELEBRATION ON COMPLETION!
            if (isNowCompleted && !wasCompleted && card) {
                card.classList.add('goal-completed-glow');
                setTimeout(() => card.classList.remove('goal-completed-glow'), 2000);

                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#667eea', '#764ba2', '#48bb78', '#f6ad55']
                    });
                    setTimeout(() => {
                        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
                        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
                    }, 250);
                }

                if (typeof showNotification === 'function') {
                    showNotification(`🎉 Amazing! "${updatedGoal.title}" completed!`, 'success');

                    const completedCount = updatedGoals.filter(g => g.status === 'completed').length;
                    if ([1, 5, 10, 25, 50].includes(completedCount)) {
                        setTimeout(() => {
                            const badges = {
                                1: 'First Steps',
                                5: 'Getting Started',
                                10: 'Goal Master',
                                25: 'Super Achiever',
                                50: 'Legend'
                            };
                            showNotification(`🏆 Achievement: ${badges[completedCount]} (${completedCount} goals)!`, 'achievement');
                        }, 1000);
                    }
                }
            }

            // Progress milestones (25%, 50%, 75%)
            if (!isNowCompleted && !wasCompleted && card && updatedGoal) {
                const milestones = [25, 50, 75];
                milestones.forEach(m => {
                    if (oldProgress < m && val >= m && typeof showNotification === 'function') {
                        showNotification(`🎯 ${m}% complete on "${updatedGoal.title}"!`, 'info');
                    }
                });
            }

            // Trigger autosave
            if (typeof autosaveData === 'function') {
                autosaveData();
            }
        };

        console.log('✅ Goals page confetti enhancement loaded!');
    });
})();
