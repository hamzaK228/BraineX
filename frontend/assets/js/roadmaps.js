// Roadmaps Page Functionality
document.addEventListener('DOMContentLoaded', function () {
    // 1. Roadmap Data (Sample)
    const roadmaps = [
        {
            title: "Software Engineering Career",
            category: "career",
            icon: "💻",
            description: "From basics to senior engineer in the tech industry",
            duration: "12-24 months",
            milestones: "20 milestones",
            followers: "15.4k"
        },
        {
            title: "Study Abroad Excellence",
            category: "academic",
            icon: "🌎",
            description: "Step-by-step guide to securing master's abroad",
            duration: "12 months",
            milestones: "12 milestones",
            followers: "8.2k"
        },
        {
            title: "Data Science Specialization",
            category: "skills",
            icon: "📊",
            description: "Master Python, Math and Machine Learning",
            duration: "9-15 months",
            milestones: "18 milestones",
            followers: "11.1k"
        },
        {
            title: "Research Publication Pro",
            category: "research",
            icon: "📝",
            description: "How to write and publish in top tier journals",
            duration: "6-12 months",
            milestones: "10 milestones",
            followers: "5.7k"
        },
        {
            title: "E-commerce Startup Guide",
            category: "business",
            icon: "🚀",
            description: "Launch your first online business from scratch",
            duration: "3-6 months",
            milestones: "15 milestones",
            followers: "9.3k"
        }
    ];

    // 2. Initialize Filtering
    const filterTabs = document.querySelectorAll('.category-tab');
    const roadmapsList = document.getElementById('roadmapsList');

    if (filterTabs && roadmapsList) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
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

        const filtered = roadmaps.filter(r => filter === 'all' || r.category === filter);

        roadmapsList.innerHTML = filtered.map(r => `
            <div class="roadmap-card" style="opacity: 0; transform: translateY(20px);">
                <div class="roadmap-icon">${r.icon}</div>
                <h3>${r.title}</h3>
                <p>${r.description}</p>
                <div class="roadmap-details">
                    <div class="detail"><span>⏱️</span> ${r.duration}</div>
                    <div class="detail"><span>📊</span> ${r.milestones}</div>
                    <div class="detail"><span>👥</span> ${r.followers} followers</div>
                </div>
                <button class="btn-roadmap">View Roadmap</button>
            </div>
        `).join('');

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
                alert('Please select a goal first!');
                return;
            }

            // Scroll to list and filter
            const categoryMap = {
                'undergraduate': 'academic',
                'graduate': 'academic',
                'career': 'career',
                'research': 'research',
                'startup': 'business'
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
    steps.forEach(step => {
        step.addEventListener('click', () => {
            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
        });
    });
});
