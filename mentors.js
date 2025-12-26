// Mentors Page Full Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Event delegation for mentor card actions
    delegate(document, 'click', '.mentor-card .btn-mentor-primary', function(e){
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = parseInt(card?.dataset.mentorId);
        if (!id) return;
        setLoadingState(this, true, 'Opening...');
        setTimeout(()=>{ viewMentorProfile(id); setLoadingState(this, false); }, 300);
    });
    delegate(document, 'click', '.mentor-card .btn-mentor-secondary', function(e){
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = parseInt(card?.dataset.mentorId);
        if (!id) return;
        setLoadingState(this, true, 'Requesting...');
        setTimeout(()=>{ bookSession(id); setLoadingState(this, false); }, 300);
    });
    delegate(document, 'click', '.mentor-card .btn-mentor-message', function(e){
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = parseInt(card?.dataset.mentorId);
        if (!id) return;
        setLoadingState(this, true, 'Messaging...');
        setTimeout(()=>{ sendMessage(id); setLoadingState(this, false); }, 200);
    });
    initializeMentorsPage();
    loadMentorsData();
    setupMentorFilters();
    setupMentorSearch();
    setupEnhancedMentorFeatures();
});

function initializeMentorsPage() {
    // Load mentors from admin or sample data
    let mentors = JSON.parse(localStorage.getItem('mentors')) || [];
    
    if (mentors.length === 0) {
        mentors = getSampleMentors();
        localStorage.setItem('mentors', JSON.stringify(mentors));
    }
    
    displayMentors(mentors);
    updateMentorStats(mentors);
}

function getSampleMentors() {
    return [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            title: "AI Research Director",
            company: "Google DeepMind",
            field: "technology",
            experience: "senior",
            bio: "Leading AI researcher with 15+ years experience in machine learning and neural networks. Former Stanford professor, published 50+ research papers. Specializes in helping students with PhD applications and research career paths.",
            expertise: ["Machine Learning", "PhD Applications", "Research Methods", "Career Development", "Technical Writing"],
            rate: 150,
            rating: 4.9,
            mentees: 234,
            sessions: 890,
            languages: ["English", "Mandarin"],
            availability: "Weekdays 9AM-6PM PST",
            education: "PhD Computer Science - Stanford University",
            achievements: ["Google AI Distinguished Researcher", "Stanford Excellence in Teaching Award", "Nature Publication Author"],
            status: "verified",
            avatar: "SJ",
            responseTime: "2 hours",
            specializations: ["AI Research", "Academic Career", "PhD Guidance", "Research Publications"]
        },
        {
            id: 2,
            name: "Michael Chen",
            title: "Investment Banking VP",
            company: "Goldman Sachs",
            field: "business",
            experience: "senior",
            bio: "Investment banking professional with 12 years on Wall Street. MBA from Wharton. Expert in finance careers, MBA applications, and breaking into investment banking. Helped 100+ students secure top finance roles.",
            expertise: ["Investment Banking", "MBA Applications", "Finance Careers", "Interview Prep", "Networking"],
            rate: 120,
            rating: 4.8,
            mentees: 189,
            sessions: 567,
            languages: ["English", "Cantonese"],
            availability: "Evenings 6PM-10PM EST",
            education: "MBA Finance - Wharton School",
            achievements: ["Goldman Sachs VP Promotion", "Top MBA Program Admits", "Wall Street Excellence Award"],
            status: "verified",
            avatar: "MC",
            responseTime: "4 hours",
            specializations: ["Investment Banking", "MBA Prep", "Finance Career", "Wall Street"]
        },
        {
            id: 3,
            name: "Dr. Aisha Patel",
            title: "Medical Researcher",
            company: "Johns Hopkins",
            field: "medicine",
            experience: "senior",
            bio: "MD/PhD from Harvard Medical School. Leading researcher in oncology with focus on precision medicine. Guides pre-med students through medical school applications and healthcare career planning.",
            expertise: ["Medical School Prep", "Healthcare Careers", "Research", "MCAT Preparation", "Clinical Experience"],
            rate: 140,
            rating: 5.0,
            mentees: 156,
            sessions: 445,
            languages: ["English", "Hindi", "Gujarati"],
            availability: "Weekends 10AM-4PM EST",
            education: "MD/PhD - Harvard Medical School",
            achievements: ["NIH Research Grant Recipient", "Johns Hopkins Excellence Award", "Medical Journal Publications"],
            status: "verified",
            avatar: "AP",
            responseTime: "3 hours",
            specializations: ["Pre-Med Guidance", "Medical Research", "Healthcare Career", "MCAT Prep"]
        },
        {
            id: 4,
            name: "Robert Kim",
            title: "Startup Founder",
            company: "TechCorp (Acquired by Meta)",
            field: "business",
            experience: "senior",
            bio: "Serial entrepreneur with 2 successful exits totaling $50M+. Former Y Combinator mentor. Expert in startup strategy, fundraising, and building tech companies from idea to acquisition.",
            expertise: ["Entrepreneurship", "Startup Strategy", "Fundraising", "Product Development", "Leadership"],
            rate: 180,
            rating: 4.9,
            mentees: 98,
            sessions: 321,
            languages: ["English", "Korean"],
            availability: "Flexible scheduling",
            education: "BS Computer Science - MIT",
            achievements: ["Two Successful Exits", "Y Combinator Mentor", "Forbes 30 Under 30"],
            status: "verified",
            avatar: "RK",
            responseTime: "1 hour",
            specializations: ["Startup Founding", "Entrepreneurship", "Tech Industry", "Fundraising"]
        },
        {
            id: 5,
            name: "Prof. Emily Rodriguez",
            title: "Engineering Professor",
            company: "MIT",
            field: "engineering",
            experience: "senior",
            bio: "Professor of Mechanical Engineering at MIT. Expert in robotics and automation. 20+ years in academia and industry. Helps students with engineering careers and graduate school applications.",
            expertise: ["Engineering Careers", "Graduate School", "Robotics", "Academic Research", "Industry Transition"],
            rate: 130,
            rating: 4.8,
            mentees: 203,
            sessions: 612,
            languages: ["English", "Spanish"],
            availability: "Weekdays 2PM-6PM EST",
            education: "PhD Mechanical Engineering - MIT",
            achievements: ["MIT Teaching Excellence", "IEEE Fellow", "Robotics Innovation Award"],
            status: "verified",
            avatar: "ER",
            responseTime: "6 hours",
            specializations: ["Engineering Career", "Graduate School", "Robotics Research", "Academia"]
        }
    ];
}

function displayMentors(mentors) {
    const mentorsGrid = document.getElementById('mentorsGrid');
    if (!mentorsGrid) return;
    
    mentorsGrid.innerHTML = mentors.map(mentor => createMentorCard(mentor)).join('');
}

function createMentorCard(mentor) {
    return `
        <div class=\"mentor-card enhanced\" data-mentor-id=\"${mentor.id}\" data-field=\"${mentor.field}\" data-experience=\"${mentor.experience}\">
            <div class="mentor-badge ${mentor.status}">${getMentorBadgeText(mentor)}</div>
            
            <div class="mentor-header">
                <div class="mentor-avatar">
                    <div class="avatar-circle">${mentor.avatar}</div>
                    <div class="status-indicator ${mentor.status}"></div>
                </div>
                <div class="mentor-rating">
                    <span class="rating-number">${mentor.rating}</span>
                    <div class="stars">
                        ${'â˜…'.repeat(Math.floor(mentor.rating))}${'â˜†'.repeat(5-Math.floor(mentor.rating))}
                    </div>
                    <span class="reviews-count">(${mentor.mentees} mentees)</span>
                </div>
            </div>
            
            <div class="mentor-info">
                <h3 class="mentor-name">${mentor.name}</h3>
                <p class="mentor-title">${mentor.title}</p>
                <p class="mentor-company">ðŸ¢ ${mentor.company}</p>
                
                <div class="mentor-stats">
                    <div class="stat">
                        <span class="stat-icon">ðŸ‘¥</span>
                        <span>${mentor.mentees} mentees</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">ðŸ’¬</span>
                        <span>${mentor.sessions} sessions</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">âš¡</span>
                        <span>${mentor.responseTime} response</span>
                    </div>
                </div>
                
                <p class="mentor-bio">${mentor.bio.substring(0, 120)}...</p>
                
                <div class="mentor-specializations">
                    ${mentor.specializations.slice(0, 3).map(spec => 
                        `<span class="specialization-tag">${spec}</span>`
                    ).join('')}
                </div>
                
                <div class="mentor-pricing">
                    <span class="price">$${mentor.rate}/hour</span>
                    <span class="availability">${mentor.availability.split(' ').slice(0, 2).join(' ')}</span>
                </div>
            </div>
            
            <div class="mentor-actions">
                <button class="btn-mentor-primary" onclick="viewMentorProfile(${mentor.id})">
                    View Profile
                </button>
                <button class="btn-mentor-secondary" onclick="bookSession(${mentor.id})">
                    Book Session
                </button>
                <button class="btn-mentor-message" onclick="sendMessage(${mentor.id})">
                    ðŸ’¬
                </button>
            </div>
        </div>
    `;
}

function getMentorBadgeText(mentor) {
    if (mentor.rating >= 4.9) return "ðŸ† Top Rated";
    if (mentor.mentees > 200) return "ðŸŒŸ Popular";
    if (mentor.responseTime === "1 hour") return "âš¡ Fast Response";
    return "âœ“ Verified";
}

function setupMentorFilters() {
    // Field filters
    const fieldFilter = document.getElementById('fieldFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    if (fieldFilter) {
        fieldFilter.addEventListener('change', applyFilters);
    }
    if (experienceFilter) {
        experienceFilter.addEventListener('change', applyFilters);
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    
    // Search button
    const searchBtn = document.querySelector('.btn-search-mentors');
    if (searchBtn) {
        searchBtn.addEventListener('click', performMentorSearch);
    }
}

function applyFilters() {
    const fieldValue = document.getElementById('fieldFilter')?.value || '';
    const experienceValue = document.getElementById('experienceFilter')?.value || '';
    const locationValue = document.getElementById('locationFilter')?.value || '';
    
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    
    const filtered = mentors.filter(mentor => {
        let matches = true;
        
        if (fieldValue && mentor.field !== fieldValue) matches = false;
        if (experienceValue && mentor.experience !== experienceValue) matches = false;
        // Location filter would need location data in mentor objects
        
        return matches;
    });
    
    displayMentors(filtered);
    updateSearchResults(filtered.length);
}

function performMentorSearch() {
    applyFilters();
    MentoraX.showNotification('Search completed! Found matching mentors.', 'success');
}

function setupMentorSearch() {
    const searchInput = document.querySelector('.mentor-search input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 2) {
                searchMentors(searchTerm);
            } else if (searchTerm.length === 0) {
                loadMentorsData();
            }
        });
    }
}

function searchMentors(searchTerm) {
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    
    const filtered = mentors.filter(mentor => 
        mentor.name.toLowerCase().includes(searchTerm) ||
        mentor.title.toLowerCase().includes(searchTerm) ||
        mentor.company.toLowerCase().includes(searchTerm) ||
        mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm)) ||
        mentor.specializations.some(spec => spec.toLowerCase().includes(searchTerm))
    );
    
    displayMentors(filtered);
}

function viewMentorProfile(mentorId) {
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    const mentor = mentors.find(m => m.id === mentorId);
    
    if (!mentor) return;
    
    showMentorProfileModal(mentor);
}

// Enhanced mentor functionality
function setupEnhancedMentorFeatures() {
    setupMentorBooking();
    setupMentorProfiles();
    updateAllMentorButtons();
}

function setupMentorBooking() {
    window.bookMentorSession = function(mentorId) {
        const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
        const mentor = mentors.find(m => m.id === mentorId);
        
        if (!mentor) {
            MentoraX.showNotification('Mentor not found', 'error');
            return;
        }
        
        const user = MentoraX.getCurrentUser();
        if (!user) {
            MentoraX.showNotification('Please login to book a session', 'error');
            MentoraX.openModal('loginModal');
            return;
        }
        
        showBookingModal(mentor);
    };
}

function showBookingModal(mentor) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = \`
        <div class="modal-content" style="
            background: white; border-radius: 20px; padding: 40px; max-width: 600px;
            max-height: 90vh; overflow-y: auto; margin: 20px; position: relative;
        ">
            <button class="close-modal" style="
                position: absolute; top: 15px; right: 20px; background: none;
                border: none; font-size: 30px; cursor: pointer; color: #999;
            ">&times;</button>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0; color: #2d3748;">Book Session with \${mentor.name}</h2>
                <p style="color: #4a5568; margin: 10px 0 0 0;">\${mentor.title}</p>
                <div style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white; padding: 8px 16px; border-radius: 20px;
                    display: inline-block; margin-top: 10px; font-weight: 600;
                ">\${mentor.price || '$100/hour'}</div>
            </div>
            
            <form id="bookingForm" style="display: flex; flex-direction: column; gap: 20px;">
                <select name="sessionType" required style="
                    width: 100%; padding: 12px; border: 2px solid #e2e8f0;
                    border-radius: 10px; font-size: 16px; box-sizing: border-box;
                ">
                    <option value="">Select session type</option>
                    <option value="career-guidance">Career Guidance (60 min)</option>
                    <option value="technical-review">Technical Review (45 min)</option>
                    <option value="interview-prep">Interview Preparation (60 min)</option>
                    <option value="portfolio-review">Portfolio/Resume Review (30 min)</option>
                </select>
                
                <input type="date" name="preferredDate" required min="\${new Date().toISOString().split('T')[0]}" style="
                    width: 100%; padding: 12px; border: 2px solid #e2e8f0;
                    border-radius: 10px; font-size: 16px; box-sizing: border-box;
                ">
                
                <textarea name="sessionGoals" required rows="4" placeholder="What would you like to achieve in this session?" style="
                    width: 100%; padding: 12px; border: 2px solid #e2e8f0;
                    border-radius: 10px; font-size: 16px; resize: vertical; box-sizing: border-box;
                "></textarea>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button type="button" class="btn-cancel" style="
                        background: #e2e8f0; color: #2d3748; border: none;
                        padding: 12px 24px; border-radius: 25px; font-weight: 600; cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        background: linear-gradient(135deg, #667eea, #764ba2); color: white;
                        border: none; padding: 12px 24px; border-radius: 25px;
                        font-weight: 600; cursor: pointer;
                    ">ðŸ“… Book Session</button>
                </div>
            </form>
        </div>
    \`;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    
    modal.querySelector('#bookingForm').addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true, 'Requesting...');
        e.preventDefault();
        modal.remove();
       setLoadingState(document.querySelector('#bookingForm button[type="submit"]'), false);
       MentoraX.showNotification('ðŸŽ‰ Session request sent! The mentor will contact you within 24 hours.', 'success');
    });
}

function setupMentorProfiles() {
    window.viewMentorProfile = function(mentorId) {
        const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
        const mentor = mentors.find(m => m.id === mentorId);
        
        if (mentor) {
            showMentorProfileModal(mentor);
        }
    };
    
    window.showMentorDetails = function(mentorId) {
        viewMentorProfile(mentorId);
    };
}

function updateAllMentorButtons() {
    // Update all existing mentor cards to have functional buttons
    setTimeout(() => {
        document.querySelectorAll('.mentor-card').forEach(card => {
            if (!card.querySelector('.mentor-actions')) {
                const mentorId = card.getAttribute('data-mentor-id') || Math.floor(Math.random() * 100);
                const actionsHTML = \`
                    <div class="mentor-actions" style="
                        padding: 15px; border-top: 1px solid #e2e8f0;
                        display: flex; gap: 10px; justify-content: center;
                    ">
                        <button onclick="bookMentorSession(\${mentorId})" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white; border: none; padding: 8px 16px;
                            border-radius: 20px; font-size: 14px; font-weight: 600;
                            cursor: pointer; transition: all 0.3s ease;
                        ">Book Session</button>
                        <button onclick="viewMentorProfile(\${mentorId})" style="
                            background: #e2e8f0; color: #2d3748; border: none;
                            padding: 8px 16px; border-radius: 20px; font-size: 14px;
                            font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                        ">View Profile</button>
                    </div>
                \`;
                card.insertAdjacentHTML('beforeend', actionsHTML);
            }
        });
    }, 500);
}

function showMentorProfileModal(mentor) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content mentor-profile-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-large">${mentor.avatar}</div>
                    <div class="verification-badge">âœ“ Verified</div>
                </div>
                <div class="profile-info">
                    <h2>${mentor.name}</h2>
                    <h3>${mentor.title}</h3>
                    <p class="company">ðŸ¢ ${mentor.company}</p>
                    <div class="profile-rating">
                        <span class="rating">${mentor.rating} â˜…â˜…â˜…â˜…â˜…</span>
                        <span class="mentees">${mentor.mentees} mentees â€¢ ${mentor.sessions} sessions</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-content">
                <div class="profile-section">
                    <h4>ðŸ‘¨â€ðŸ« About</h4>
                    <p>${mentor.bio}</p>
                </div>
                
                <div class="profile-section">
                    <h4>ðŸŽ“ Education</h4>
                    <p>${mentor.education}</p>
                </div>
                
                <div class="profile-section">
                    <h4>ðŸ† Achievements</h4>
                    <ul>
                        ${mentor.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="profile-section">
                    <h4>ðŸŽ¯ Areas of Expertise</h4>
                    <div class="expertise-tags">
                        ${mentor.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('')}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>ðŸŒŸ Specializations</h4>
                    <div class="specializations-list">
                        ${mentor.specializations.map(spec => `<span class="spec-tag">${spec}</span>`).join('')}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>ðŸ’¬ Languages</h4>
                    <p>${mentor.languages.join(', ')}</p>
                </div>
                
                <div class="profile-section">
                    <h4>â° Availability</h4>
                    <p>${mentor.availability}</p>
                    <p><strong>Response Time:</strong> ${mentor.responseTime}</p>
                </div>
                
                <div class="pricing-section">
                    <div class="price-card">
                        <h4>ðŸ’° Mentorship Rates</h4>
                        <div class="price-options">
                            <div class="price-option">
                                <span class="duration">30 min session</span>
                                <span class="price">$${Math.round(mentor.rate / 2)}</span>
                            </div>
                            <div class="price-option">
                                <span class="duration">1 hour session</span>
                                <span class="price">$${mentor.rate}</span>
                            </div>
                            <div class="price-option">
                                <span class="duration">Monthly package</span>
                                <span class="price">$${mentor.rate * 4} (4 sessions)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-message" onclick="sendMessage(${mentor.id}); this.closest('.modal').remove();">
                    Send Message
                </button>
                <button class="btn-primary" onclick="bookSession(${mentor.id}); this.closest('.modal').remove();">
                    Book Session
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function bookSession(mentorId) {
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    const mentor = mentors.find(m => m.id === mentorId);
    
    if (!mentor) return;
    
    showBookingModal(mentor);
}

function showBookingModal(mentor) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content booking-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="booking-header">
                <h2>ðŸ“… Book a Session</h2>
                <div class="mentor-summary">
                    <div class="mentor-avatar-small">${mentor.avatar}</div>
                    <div>
                        <h3>${mentor.name}</h3>
                        <p>${mentor.title} at ${mentor.company}</p>
                    </div>
                </div>
            </div>
            
            <form class="booking-form" onsubmit="submitBooking(event, ${mentor.id})">
                <div class="form-group">
                    <label>Session Type</label>
                    <select name="sessionType" required>
                        <option value="">Select session type</option>
                        <option value="consultation">General Consultation - $${Math.round(mentor.rate / 2)} (30 min)</option>
                        <option value="standard">Standard Session - $${mentor.rate} (1 hour)</option>
                        <option value="intensive">Intensive Session - $${mentor.rate * 1.5} (90 min)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Preferred Date</label>
                    <input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group">
                    <label>Preferred Time</label>
                    <select name="time" required>
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Session Focus</label>
                    <select name="focus" required>
                        <option value="">Select main focus</option>
                        ${mentor.specializations.map(spec => `<option value="${spec}">${spec}</option>`).join('')}
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>What would you like to discuss?</label>
                    <textarea name="message" rows="4" placeholder="Please describe what you'd like to focus on during our session..." required></textarea>
                </div>
                
                <div class="form-group">
                    <label>Your Background</label>
                    <select name="background" required>
                        <option value="">Select your level</option>
                        <option value="high-school">High School Student</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate Student</option>
                        <option value="professional">Working Professional</option>
                        <option value="career-change">Career Changer</option>
                    </select>
                </div>
                
                <div class="booking-summary">
                    <h4>Session Summary</h4>
                    <div class="summary-item">
                        <span>Mentor:</span>
                        <span>${mentor.name}</span>
                    </div>
                    <div class="summary-item">
                        <span>Rate:</span>
                        <span>$${mentor.rate}/hour</span>
                    </div>
                    <div class="summary-item">
                        <span>Response Time:</span>
                        <span>${mentor.responseTime}</span>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Request Session</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function submitBooking(event, mentorId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookingData = {
        mentorId: mentorId,
        sessionType: formData.get('sessionType'),
        date: formData.get('date'),
        time: formData.get('time'),
        focus: formData.get('focus'),
        message: formData.get('message'),
        background: formData.get('background'),
        status: 'pending',
        bookedAt: new Date().toISOString()
    };
    
    // Save booking
    let bookings = JSON.parse(localStorage.getItem('mentor_bookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('mentor_bookings', JSON.stringify(bookings));
    
    // Close modal and show success
    event.target.closest('.modal').remove();
    MentoraX.showNotification('Session request sent! The mentor will respond within their typical response time.', 'success');
}

function sendMessage(mentorId) {
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    const mentor = mentors.find(m => m.id === mentorId);
    
    if (!mentor) return;
    
    const message = prompt(`Send a message to ${mentor.name}:`);
    if (message && message.trim()) {
        // Save message
        let messages = JSON.parse(localStorage.getItem('mentor_messages')) || [];
        messages.push({
            mentorId: mentorId,
            message: message,
            sentAt: new Date().toISOString(),
            status: 'sent'
        });
        localStorage.setItem('mentor_messages', JSON.stringify(messages));
        
        MentoraX.showNotification(`Message sent to ${mentor.name}!`, 'success');
    }
}

function loadMentorsData() {
    const mentors = JSON.parse(localStorage.getItem('mentors')) || getSampleMentors();
    displayMentors(mentors);
    updateMentorStats(mentors);
}

function updateMentorStats(mentors) {
    // Update stats in hero section if they exist
    const totalMentors = document.querySelector('.mentor-stats .stat:first-child .stat-number');
    const totalMentees = document.querySelector('.mentor-stats .stat:nth-child(2) .stat-number');
    const avgRating = document.querySelector('.mentor-stats .stat:nth-child(3) .stat-number');
    const companies = document.querySelector('.mentor-stats .stat:last-child .stat-number');
    
    if (totalMentors) totalMentors.textContent = `${mentors.length}+`;
    if (totalMentees) {
        const totalMenteesCount = mentors.reduce((sum, mentor) => sum + mentor.mentees, 0);
        totalMentees.textContent = `${Math.round(totalMenteesCount/1000)}K+`;
    }
    if (avgRating) {
        const avgRatingValue = mentors.reduce((sum, mentor) => sum + mentor.rating, 0) / mentors.length;
        avgRating.textContent = `${avgRatingValue.toFixed(1)}â­`;
    }
    if (companies) {
        const uniqueCompanies = [...new Set(mentors.map(m => m.company))].length;
        companies.textContent = `${uniqueCompanies}+`;
    }
}

function updateSearchResults(count) {
    const resultsText = document.querySelector('.directory-header h2');
    if (resultsText) {
        resultsText.textContent = `Mentor Directory (${count} mentors found)`;
    }
}
