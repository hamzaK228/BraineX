/**
 * USER DASHBOARD ENGINE
 * Manages saved items and application tracking.
 */
class DashboardEngine {
  constructor() {
    this.init();
  }

  init() {
    this.renderUniversities();
    this.renderPrograms();
    this.updateStats();
  }

  getSavedUniversities() {
    // Simulating data from localStorage or "database"
    // In a real app, this would be an API call
    // For demo, we default to empty or mock
    return JSON.parse(localStorage.getItem('saved_universities') || '[]');
  }

  getSavedPrograms() {
    return JSON.parse(localStorage.getItem('saved_programs') || '[]');
  }

  renderUniversities() {
    const container = document.getElementById('savedUnis');
    if (!container) return;

    // Mock data for demonstration if empty
    const saved = [
      { id: 'mit', name: 'MIT', location: 'Cambridge, MA' },
      { id: 'stanford', name: 'Stanford', location: 'Stanford, CA' },
    ];

    container.innerHTML = saved
      .map(
        (u) => `
            <div class="dash-card">
                <div class="dash-card-header">
                    <h4>${u.name}</h4>
                    <span class="badge badge-primary">High Match</span>
                </div>
                <p>${u.location}</p>
                <div class="dash-actions">
                    <a href="universities/detail.html?id=${u.id}" class="btn btn-sm btn-outline">View</a>
                    <button class="btn btn-sm btn-text text-danger">Remove</button>
                </div>
            </div>
        `
      )
      .join('');
  }

  renderPrograms() {
    const container = document.getElementById('savedProgs');
    if (!container) return;

    const saved = [
      { name: 'RSI', deadline: 'Jan 15', status: 'In Progress' },
      { name: 'TASP', deadline: 'Jan 04', status: 'Submitted' },
    ];

    container.innerHTML = saved
      .map(
        (p) => `
            <div class="dash-card">
                <div class="dash-card-header">
                    <h4>${p.name}</h4>
                    <span class="badge ${p.status === 'Submitted' ? 'badge-success' : 'badge-warning'}">${p.status}</span>
                </div>
                <p>Deadline: ${p.deadline}</p>
                <div class="progres-bar-mini">
                    <div class="fill" style="width: ${p.status === 'Submitted' ? '100%' : '40%'}"></div>
                </div>
            </div>
        `
      )
      .join('');
  }

  updateStats() {
    document.getElementById('stat-applications').textContent = '2';
    document.getElementById('stat-saved').textContent = '4';
    document.getElementById('stat-days').textContent = '14';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DashboardEngine();
});
