// FIXED FIELDS PAGE - ALL BUTTONS WORK
console.log('🔥 STARTING FIELDS PAGE WITH WORKING BUTTONS');

// Immediately make functions global so buttons can find them
window.showFieldDetails = function(fieldId) {
    console.log('🔍 EXPLORE BUTTON CLICKED - Field ID:', fieldId);
    const fields = getSampleFields();
    const field = fields.find(f => f.id == fieldId);
    if (!field) {
        alert('Field not found');
        return;
    }
    
    // Remove existing modals
    document.querySelectorAll('.modal, .field-modal').forEach(m => m.remove());
    
    // Create and show modal with REAL content
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; max-height: 80vh; overflow-y: auto; margin: 20px;">
            <div style="text-align: right;">
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 50px;">${field.icon}</div>
                <h2>${field.name}</h2>
                <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; text-transform: uppercase; font-size: 12px;">${field.category}</span>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>📋 Overview</h3>
                <p>${field.description}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>💰 Salary:</strong><br>${field.salary}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>📈 Growth:</strong><br>${field.growthRate}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>💼 Jobs:</strong><br>${field.jobOpenings}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>🎓 Education:</strong><br>${field.education}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🚀 Career Paths</h3>
                <div>${field.careers.map(c => `<span style="background: #667eea; color: white; padding: 5px 10px; margin: 3px; border-radius: 15px; display: inline-block; font-size: 12px;">${c}</span>`).join('')}</div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🛠️ Required Skills</h3>
                <div>${field.skills.map(s => `<span style="background: #e0e0e0; padding: 5px 10px; margin: 3px; border-radius: 15px; display: inline-block; font-size: 12px;">${s}</span>`).join('')}</div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🏛️ Top Universities</h3>
                <div>${field.universities.map(u => `<span style="background: #ffe0e0; padding: 5px 10px; margin: 3px; border-radius: 15px; display: inline-block; font-size: 12px;">${u}</span>`).join('')}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.open('https://www.bls.gov/ooh/', '_blank')" style="background: #667eea; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">📊 Real Career Data</button>
                <button onclick="window.open('https://www.glassdoor.com/Salaries/${encodeURIComponent(field.name)}-salary-SRCH_KO0,20.htm', '_blank')" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">💰 Real Salary Data</button>
                <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(field.name)}+career', '_blank')" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">🎥 Career Videos</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ MODAL SHOWN FOR:', field.name);
};

window.filterByCategory = function(category) {
    console.log('🏷️ CATEGORY FILTER FUNCTION CALLED:', category);
    
    const fields = getSampleFields();
    console.log('Total fields available:', fields.length);
    console.log('Available categories in data:', [...new Set(fields.map(f => f.category))]);
    
    let filtered = fields;
    
    if (category && category !== 'all') {
        console.log('Filtering for category:', category);
        filtered = fields.filter(f => {
            console.log('Checking field:', f.name, 'category:', f.category, 'matches:', f.category === category);
            return f.category === category;
        });
    }
    
    // Update global state
    currentFields = filtered;
    currentCategory = category;
    
    console.log('✅ FILTERED RESULTS:', filtered.length, 'fields found for category:', category);
    console.log('Filtered field names:', filtered.map(f => f.name));
    
    // Update grid
    populateFieldsGrid(filtered);
    console.log('✅ Grid populated with', filtered.length, 'fields');
    
    // Update the search results text
    const resultsText = document.querySelector('.detailed-fields h2');
    if (resultsText) {
        if (filtered.length > 0) {
            resultsText.textContent = `📋 ${category.toUpperCase()} Fields (${filtered.length} found)`;
        } else {
            resultsText.textContent = `📋 No ${category.toUpperCase()} fields available yet`;
        }
    }
    
    // Reset sort dropdown
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown) {
        sortDropdown.value = 'name';
    }
    
    document.getElementById('detailedFields').scrollIntoView({behavior: 'smooth'});
};

window.performFieldSearch = function() {
    console.log('🔍 SEARCH BUTTON CLICKED');
    const input = document.querySelector('.field-search .search-input');
    if (!input) {
        console.log('❌ Search input not found');
        return;
    }
    
    const query = input.value.toLowerCase().trim();
    console.log('Search query:', query);
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    const fields = getSampleFields();
    const results = fields.filter(field => 
        field.name.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query) ||
        field.careers.some(career => career.toLowerCase().includes(query)) ||
        field.skills.some(skill => skill.toLowerCase().includes(query))
    );
    
    console.log('Found', results.length, 'results for:', query);
    
    // Update global state
    currentFields = results.length > 0 ? results : fields;
    currentCategory = 'all'; // Reset category when searching
    
    populateFieldsGrid(currentFields);
    document.getElementById('detailedFields').scrollIntoView({behavior: 'smooth'});
    
    if (results.length === 0) {
        alert('No fields found for "' + query + '". Try different keywords.');
    }
};

window.showPathwayDetails = function(pathwayName) {
    console.log('🛤️ PATHWAY BUTTON CLICKED:', pathwayName);
    
    // Remove existing modals
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 20px;">
            <div style="text-align: right;">
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>🛤️ ${pathwayName} Career Path</h2>
                <p>Complete roadmap to success in this field</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>📊 Career Overview</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
                    <div><strong>High</strong><br><small>Job Demand</small></div>
                    <div><strong>$85K+</strong><br><small>Average Salary</small></div>
                    <div><strong>Fast</strong><br><small>Growth Rate</small></div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>📋 Step-by-Step Roadmap</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Step 1:</strong> Build foundational skills and knowledge</div>
                    <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Step 2:</strong> Gain practical experience through projects</div>
                    <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Step 3:</strong> Network with professionals in the field</div>
                    <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Step 4:</strong> Apply for internships and entry-level roles</div>
                    <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; border-left: 4px solid #667eea;"><strong>Step 5:</strong> Advance your career and take leadership roles</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.open('https://www.coursera.org/search?query=${encodeURIComponent(pathwayName)}', '_blank')" style="background: #667eea; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">📚 Find Real Courses</button>
                <button onclick="window.open('https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(pathwayName)}', '_blank')" style="background: #0077b5; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">💼 Find Real Jobs</button>
                <button onclick="window.open('https://www.bls.gov/ooh/', '_blank')" style="background: #28a745; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">📊 Career Statistics</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('✅ PATHWAY MODAL SHOWN FOR:', pathwayName);
};

window.openResourceLink = function(resourceType) {
    console.log('📚 RESOURCE BUTTON CLICKED:', resourceType);
    
    const links = {
        'guides': 'https://www.bls.gov/ooh/',
        'videos': 'https://www.youtube.com/results?search_query=career+field+exploration',
        'coursera': 'https://www.coursera.org/browse',
        'linkedin': 'https://www.linkedin.com/learning/',
        'communities': 'https://www.reddit.com/r/careeradvice/',
        'data': 'https://www.glassdoor.com/Salaries/index.htm',
        'indeed': 'https://www.indeed.com/career-advice',
        'khan': 'https://www.khanacademy.org/'
    };
    
    const url = links[resourceType];
    if (url) {
        console.log('✅ Opening:', url);
        window.open(url, '_blank');
    } else {
        console.log('❌ No URL found for:', resourceType);
    }
};

// Global variables to track current state
let currentFields = [];
let currentCategory = 'all';

// Sorting functionality
window.sortFields = function() {
    const sortDropdown = document.getElementById('sortDropdown');
    if (!sortDropdown) return;
    
    const sortBy = sortDropdown.value;
    console.log('🔄 Sorting fields by:', sortBy);
    
    // Get current fields (filtered or all)
    const fields = [...currentFields];
    
    // Sort based on selected option
    switch(sortBy) {
        case 'name':
            fields.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            fields.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'salary':
            fields.sort((a, b) => {
                // Extract max salary (e.g., "$70,000 - $200,000" -> 200000)
                const aMaxMatch = a.salary.match(/\$[\d,]+\s*-\s*\$?([\d,]+)/);
                const bMaxMatch = b.salary.match(/\$[\d,]+\s*-\s*\$?([\d,]+)/);
                const aMax = aMaxMatch ? parseInt(aMaxMatch[1].replace(/,/g, '')) : parseInt(a.salary.replace(/[$,]/g, ''));
                const bMax = bMaxMatch ? parseInt(bMaxMatch[1].replace(/,/g, '')) : parseInt(b.salary.replace(/[$,]/g, ''));
                return bMax - aMax;
            });
            break;
        case 'salary-asc':
            fields.sort((a, b) => {
                // Extract min salary (e.g., "$70,000 - $200,000" -> 70000)
                const aMinMatch = a.salary.match(/\$([\d,]+)/);
                const bMinMatch = b.salary.match(/\$([\d,]+)/);
                const aMin = aMinMatch ? parseInt(aMinMatch[1].replace(/,/g, '')) : 0;
                const bMin = bMinMatch ? parseInt(bMinMatch[1].replace(/,/g, '')) : 0;
                return aMin - bMin;
            });
            break;
        case 'growth':
            fields.sort((a, b) => {
                const aGrowth = parseInt(a.growthRate?.replace('%', '') || '0');
                const bGrowth = parseInt(b.growthRate?.replace('%', '') || '0');
                return bGrowth - aGrowth;
            });
            break;
        case 'category':
            fields.sort((a, b) => a.category.localeCompare(b.category));
            break;
        default:
            break;
    }
    
    populateFieldsGrid(fields);
    console.log('✅ Fields sorted successfully');
};

window.resetSort = function() {
    console.log('🔄 Resetting sort');
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown) {
        sortDropdown.value = 'name';
    }
    
    // Re-apply current category filter without sorting
    window.filterByCategory(currentCategory);
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM LOADED - INITIALIZING FIELDS PAGE');
    
    // Populate fields grid immediately
    const fields = getSampleFields();
    currentFields = fields; // Initialize global state
    currentCategory = 'all';
    populateFieldsGrid(fields);
    
    // Setup search functionality  
    // Wait longer to ensure DOM is fully loaded
    setTimeout(() => {
        console.log('🔧 Starting setup of all interactive elements...');
        const searchInput = document.querySelector('.field-search .search-input');
        if (searchInput) {
            console.log('🔍 SETTING UP SEARCH');
            // Real-time search
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                if (query.length > 0) {
                    const fields = getSampleFields();
                    const results = fields.filter(field => 
                        field.name.toLowerCase().includes(query) ||
                        field.description.toLowerCase().includes(query) ||
                        field.careers.some(career => career.toLowerCase().includes(query))
                    );
                    populateFieldsGrid(results);
                } else {
                    populateFieldsGrid(getSampleFields());
                }
            });
            
            // Search button
            const searchBtn = document.querySelector('.btn-search');
            if (searchBtn) {
                searchBtn.addEventListener('click', window.performFieldSearch);
            }
        }
        
        // Setup category cards
        document.querySelectorAll('.category-card').forEach(card => {
            const category = card.getAttribute('data-category');
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                console.log('🏷️ Category card clicked:', category);
                window.filterByCategory(category);
            });
        });
        
        // Setup filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            const filter = tab.getAttribute('data-filter');
            console.log('🔧 Setting up filter tab:', filter, tab);
            tab.style.cursor = 'pointer';
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📑 Filter tab clicked:', filter);
                console.log('Available fields before filter:', getSampleFields().length);
                
                // Update active tab
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Call filter function
                window.filterByCategory(filter);
            });
        });
        
        // Setup pathway buttons
        document.querySelectorAll('.btn-pathway').forEach(btn => {
            const card = btn.closest('.pathway-card');
            const pathwayName = card.querySelector('h3').textContent;
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                console.log('🛤️ Pathway button clicked:', pathwayName);
                window.showPathwayDetails(pathwayName);
            });
        });
        
        // Setup resource cards
        document.querySelectorAll('.resource-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const resourceTitle = card.querySelector('h3').textContent.toLowerCase();
                let resourceType = 'guides';
                
                if (resourceTitle.includes('video')) resourceType = 'videos';
                else if (resourceTitle.includes('course')) resourceType = 'coursera';
                else if (resourceTitle.includes('linkedin')) resourceType = 'linkedin';
                else if (resourceTitle.includes('communit')) resourceType = 'communities';
                else if (resourceTitle.includes('salary') || resourceTitle.includes('data')) resourceType = 'data';
                else if (resourceTitle.includes('advice')) resourceType = 'indeed';
                else if (resourceTitle.includes('khan')) resourceType = 'khan';
                
                console.log('📚 Resource card clicked:', resourceTitle, '→', resourceType);
                window.openResourceLink(resourceType);
            });
            
            // Also setup the buttons inside cards
            const btn = card.querySelector('.btn-resource');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.click();
                });
            }
        });
        
        console.log('✅ ALL BUTTONS SETUP COMPLETE!');
        
        // Test filter functionality immediately
        console.log('🧪 Testing filter functionality...');
        const allFilterTabs = document.querySelectorAll('.filter-tab');
        console.log('Found filter tabs:', allFilterTabs.length, allFilterTabs);
        
        const testFilter = document.querySelector('.filter-tab[data-filter="stem"]');
        if (testFilter) {
            console.log('✅ STEM filter button found:', testFilter);
            console.log('STEM button data-filter:', testFilter.getAttribute('data-filter'));
            
            // Test manual click
            setTimeout(() => {
                console.log('🧪 Testing manual STEM filter click...');
                window.filterByCategory('stem');
            }, 1000);
        } else {
            console.log('❌ STEM filter button NOT found');
            console.log('Available filter tabs:', allFilterTabs);
        }
    }, 500); // Increased timeout
});

// Simplified initialization
function initializeFieldsPage() {
    console.log('📋 Initializing fields page...');
    const fields = getSampleFields();
    populateFieldsGrid(fields);
}

function getSampleFields() {
    return [
        {
            id: 1,
            name: "Computer Science",
            category: "stem",
            description: "Study of algorithmic processes and computational systems. Design and analysis of computational systems and their applications.",
            icon: "💻",
            salary: "$70,000 - $200,000",
            careers: ["Software Engineer", "Data Scientist", "Product Manager", "AI Researcher", "Cybersecurity Analyst"],
            growthRate: "22%",
            jobOpenings: "531,200",
            universities: ["MIT", "Stanford", "Carnegie Mellon", "UC Berkeley", "Harvard"],
            skills: ["Programming", "Problem Solving", "Mathematics", "System Design", "Algorithms"],
            workEnvironment: "Primarily office-based with remote opportunities",
            education: "Bachelor's degree minimum, Master's preferred for research roles"
        },
        {
            id: 2,
            name: "Biomedical Engineering",
            category: "stem",
            description: "Application of engineering principles to biology and healthcare. Design medical devices, prosthetics, and healthcare systems.",
            icon: "🔬",
            salary: "$60,000 - $140,000",
            careers: ["Biomedical Engineer", "Medical Device Designer", "Clinical Engineer", "Research Scientist"],
            growthRate: "5%",
            jobOpenings: "21,300",
            universities: ["Johns Hopkins", "MIT", "Stanford", "Duke", "Georgia Tech"],
            skills: ["Biology", "Engineering", "Problem Solving", "Research", "Medical Knowledge"],
            workEnvironment: "Laboratories, hospitals, research facilities",
            education: "Bachelor's in Biomedical Engineering or related field"
        },
        {
            id: 3,
            name: "Business Administration",
            category: "business",
            description: "Study of business operations, management principles, and organizational behavior. Develop leadership and strategic thinking skills.",
            icon: "📊",
            salary: "$50,000 - $180,000",
            careers: ["Business Manager", "Management Consultant", "Operations Manager", "Business Analyst", "Entrepreneur"],
            growthRate: "8%",
            jobOpenings: "799,000",
            universities: ["Harvard", "Wharton", "Stanford", "MIT Sloan", "Columbia"],
            skills: ["Leadership", "Communication", "Strategic Thinking", "Financial Analysis", "Project Management"],
            workEnvironment: "Corporate offices, client sites, remote work",
            education: "Bachelor's degree, MBA preferred for senior roles"
        },
        {
            id: 4,
            name: "Psychology",
            category: "social",
            description: "Scientific study of mind and behavior. Understanding human cognition, emotion, and social interactions.",
            icon: "🧠",
            salary: "$45,000 - $120,000",
            careers: ["Clinical Psychologist", "Counselor", "Research Psychologist", "School Psychologist", "HR Specialist"],
            growthRate: "3%",
            jobOpenings: "181,700",
            universities: ["Stanford", "Harvard", "Yale", "UCLA", "Michigan"],
            skills: ["Empathy", "Communication", "Research", "Critical Thinking", "Statistics"],
            workEnvironment: "Clinics, schools, research facilities, private practice",
            education: "Bachelor's degree, Master's/PhD for clinical practice"
        },
        {
            id: 5,
            name: "Environmental Science",
            category: "stem",
            description: "Interdisciplinary study of the environment and solutions to environmental problems. Combine physical, biological, and social sciences.",
            icon: "🌱",
            salary: "$55,000 - $120,000",
            careers: ["Environmental Scientist", "Conservation Scientist", "Environmental Consultant", "Sustainability Coordinator"],
            growthRate: "11%",
            jobOpenings: "92,400",
            universities: ["UC Berkeley", "Yale", "Stanford", "MIT", "Harvard"],
            skills: ["Research", "Data Analysis", "Problem Solving", "Communication", "Fieldwork"],
            workEnvironment: "Field sites, laboratories, offices, outdoors",
            education: "Bachelor's degree in Environmental Science or related field"
        },
        {
            id: 6,
            name: "Graphic Design",
            category: "creative",
            description: "Visual communication through typography, photography, iconography and illustration. Create visual concepts to communicate ideas.",
            icon: "🎨",
            salary: "$35,000 - $85,000",
            careers: ["Graphic Designer", "Web Designer", "Art Director", "Brand Designer", "UX/UI Designer"],
            growthRate: "3%",
            jobOpenings: "281,500",
            universities: ["RISD", "Parsons", "ArtCenter", "Pratt", "SCAD"],
            skills: ["Creativity", "Software Proficiency", "Visual Communication", "Typography", "Branding"],
            workEnvironment: "Design studios, advertising agencies, in-house teams",
            education: "Bachelor's degree in Graphic Design or related field"
        },
        {
            id: 7,
            name: "International Relations",
            category: "social",
            description: "Study of relationships between countries, international organizations, and global issues. Focus on diplomacy, politics, and economics.",
            icon: "🌍",
            salary: "$45,000 - $130,000",
            careers: ["Diplomat", "Foreign Service Officer", "Policy Analyst", "International Development Worker", "Journalist"],
            growthRate: "6%",
            jobOpenings: "75,800",
            universities: ["Georgetown", "Harvard", "Princeton", "Columbia", "Johns Hopkins SAIS"],
            skills: ["Language Skills", "Cultural Awareness", "Research", "Communication", "Critical Thinking"],
            workEnvironment: "Government offices, embassies, NGOs, international organizations",
            education: "Bachelor's degree, Master's preferred for senior roles"
        },
        {
            id: 8,
            name: "Mechanical Engineering",
            category: "stem",
            description: "Design, build, and maintain mechanical systems. Apply physics and materials science to create machines and devices.",
            icon: "⚙️",
            salary: "$65,000 - $150,000",
            careers: ["Mechanical Engineer", "Design Engineer", "Manufacturing Engineer", "Robotics Engineer", "Automotive Engineer"],
            growthRate: "7%",
            jobOpenings: "315,300",
            universities: ["MIT", "Stanford", "Georgia Tech", "Caltech", "Michigan"],
            skills: ["Mathematics", "Physics", "CAD Software", "Problem Solving", "Project Management"],
            workEnvironment: "Manufacturing plants, offices, laboratories, field sites",
            education: "Bachelor's degree in Mechanical Engineering"
        },
        {
            id: 9,
            name: "Medicine",
            category: "stem",
            description: "Study of human health and disease. Diagnose, treat, and prevent illness to improve patient outcomes and public health.",
            icon: "⚕️",
            salary: "$200,000 - $400,000",
            careers: ["Physician", "Surgeon", "Specialist", "Researcher", "Public Health Officer"],
            growthRate: "3%",
            jobOpenings: "23,800",
            universities: ["Harvard Medical", "Johns Hopkins", "UCSF", "Mayo Clinic", "Stanford"],
            skills: ["Medical Knowledge", "Critical Thinking", "Communication", "Empathy", "Problem Solving"],
            workEnvironment: "Hospitals, clinics, research facilities, private practice",
            education: "Medical degree (MD) plus residency training"
        },
        {
            id: 10,
            name: "Data Science",
            category: "stem",
            description: "Extract insights from structured and unstructured data using statistics, programming, and domain expertise.",
            icon: "📊",
            salary: "$95,000 - $180,000",
            careers: ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Business Intelligence Analyst"],
            growthRate: "31%",
            jobOpenings: "126,500",
            universities: ["MIT", "Stanford", "Carnegie Mellon", "UC Berkeley", "Harvard"],
            skills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
            workEnvironment: "Tech companies, consulting firms, research labs, remote work",
            education: "Bachelor's in Computer Science, Statistics, or related field"
        },
        {
            id: 11,
            name: "Marketing",
            category: "business",
            description: "Promote products and services through market research, advertising, and customer relationship management.",
            icon: "📢",
            salary: "$45,000 - $130,000",
            careers: ["Marketing Manager", "Digital Marketer", "Brand Manager", "Content Strategist", "Market Researcher"],
            growthRate: "10%",
            jobOpenings: "263,800",
            universities: ["Northwestern", "Wharton", "Columbia", "UCLA", "NYU"],
            skills: ["Communication", "Creativity", "Analytics", "Digital Marketing", "Strategy"],
            workEnvironment: "Corporate offices, agencies, startups, remote work",
            education: "Bachelor's degree in Marketing, Business, or related field"
        },
        {
            id: 12,
            name: "Architecture",
            category: "creative",
            description: "Design buildings and spaces that are functional, safe, and aesthetically pleasing while considering environmental impact.",
            icon: "🏛️",
            salary: "$56,000 - $140,000",
            careers: ["Architect", "Urban Planner", "Landscape Architect", "Interior Designer", "Construction Manager"],
            growthRate: "3%",
            jobOpenings: "129,900",
            universities: ["MIT", "Harvard GSD", "Columbia", "UC Berkeley", "Yale"],
            skills: ["Design", "CAD Software", "Spatial Reasoning", "Project Management", "Building Codes"],
            workEnvironment: "Architecture firms, construction sites, government agencies",
            education: "Bachelor's in Architecture plus licensure"
        },
        {
            id: 13,
            name: "Journalism",
            category: "creative",
            description: "Research, write, and report news and stories for newspapers, magazines, television, radio, and digital media.",
            icon: "📰",
            salary: "$35,000 - $85,000",
            careers: ["Reporter", "Editor", "Broadcast Journalist", "Digital Content Creator", "Investigative Journalist"],
            growthRate: "-11%",
            jobOpenings: "45,300",
            universities: ["Columbia", "Northwestern", "Missouri", "Syracuse", "USC"],
            skills: ["Writing", "Research", "Communication", "Ethics", "Digital Media"],
            workEnvironment: "Newsrooms, field reporting, home offices, media companies",
            education: "Bachelor's degree in Journalism, Communications, or related field"
        },
        {
            id: 14,
            name: "Economics",
            category: "social",
            description: "Study how societies allocate scarce resources. Analyze markets, government policies, and economic behavior.",
            icon: "💹",
            salary: "$60,000 - $150,000",
            careers: ["Economist", "Financial Analyst", "Policy Analyst", "Research Analyst", "Consultant"],
            growthRate: "13%",
            jobOpenings: "21,300",
            universities: ["Harvard", "MIT", "Chicago", "Stanford", "Princeton"],
            skills: ["Mathematics", "Statistics", "Critical Thinking", "Research", "Communication"],
            workEnvironment: "Government agencies, research institutions, consulting firms",
            education: "Bachelor's degree in Economics, Master's preferred"
        },
        {
            id: 15,
            name: "Education",
            category: "social",
            description: "Teach and inspire students while developing curriculum, assessments, and educational programs.",
            icon: "📚",
            salary: "$40,000 - $85,000",
            careers: ["Teacher", "Principal", "Curriculum Developer", "Educational Consultant", "Academic Researcher"],
            growthRate: "5%",
            jobOpenings: "1,561,400",
            universities: ["Teachers College Columbia", "Harvard GSE", "Stanford", "UCLA", "Vanderbilt"],
            skills: ["Communication", "Patience", "Creativity", "Leadership", "Subject Expertise"],
            workEnvironment: "Schools, universities, educational organizations",
            education: "Bachelor's degree plus teaching certification"
        },
        {
            id: 16,
            name: "Law",
            category: "social",
            description: "Interpret and apply laws to resolve disputes, defend rights, and ensure justice in society.",
            icon: "⚖️",
            salary: "$60,000 - $200,000",
            careers: ["Lawyer", "Judge", "Legal Consultant", "Corporate Counsel", "Public Defender"],
            growthRate: "4%",
            jobOpenings: "46,000",
            universities: ["Harvard Law", "Yale Law", "Stanford Law", "Columbia Law", "NYU Law"],
            skills: ["Critical Thinking", "Research", "Writing", "Communication", "Ethics"],
            workEnvironment: "Law firms, courts, government agencies, corporate legal departments",
            education: "Law degree (JD) plus bar examination"
        },
        {
            id: 17,
            name: "Physics",
            category: "stem",
            description: "Study matter, energy, and their interactions to understand the fundamental laws governing the universe.",
            icon: "⚛️",
            salary: "$70,000 - $150,000",
            careers: ["Physicist", "Research Scientist", "Data Scientist", "Engineer", "Professor"],
            growthRate: "7%",
            jobOpenings: "20,600",
            universities: ["MIT", "Stanford", "Harvard", "Caltech", "Princeton"],
            skills: ["Mathematics", "Problem Solving", "Research", "Computer Programming", "Analysis"],
            workEnvironment: "Research laboratories, universities, government facilities",
            education: "Bachelor's degree in Physics, PhD for research positions"
        },
        {
            id: 18,
            name: "Nursing",
            category: "stem",
            description: "Provide patient care, health education, and support to individuals and communities in various healthcare settings.",
            icon: "👩‍⚕️",
            salary: "$75,000 - $120,000",
            careers: ["Registered Nurse", "Nurse Practitioner", "Nurse Manager", "Clinical Nurse Specialist"],
            growthRate: "7%",
            jobOpenings: "194,500",
            universities: ["Johns Hopkins", "UCSF", "Duke", "Emory", "Yale"],
            skills: ["Patient Care", "Communication", "Critical Thinking", "Empathy", "Medical Knowledge"],
            workEnvironment: "Hospitals, clinics, nursing homes, home healthcare",
            education: "Bachelor's of Science in Nursing (BSN) plus licensure"
        },
        {
            id: 19,
            name: "Film Studies",
            category: "creative",
            description: "Study cinema as an art form, entertainment medium, and cultural phenomenon through theory, history, and production.",
            icon: "🎬",
            salary: "$40,000 - $120,000",
            careers: ["Film Director", "Producer", "Screenwriter", "Film Critic", "Cinematographer"],
            growthRate: "11%",
            jobOpenings: "15,600",
            universities: ["USC", "NYU", "UCLA", "AFI", "Columbia"],
            skills: ["Creativity", "Storytelling", "Technical Skills", "Collaboration", "Visual Arts"],
            workEnvironment: "Film studios, production companies, freelance, media companies",
            education: "Bachelor's in Film Studies or related field"
        },
        {
            id: 20,
            name: "Public Health",
            category: "social",
            description: "Protect and improve health outcomes for populations through disease prevention, health promotion, and policy.",
            icon: "🏥",
            salary: "$50,000 - $120,000",
            careers: ["Epidemiologist", "Health Program Manager", "Public Health Analyst", "Health Educator"],
            growthRate: "5%",
            jobOpenings: "56,800",
            universities: ["Johns Hopkins", "Harvard", "Emory", "UC Berkeley", "Michigan"],
            skills: ["Data Analysis", "Research", "Communication", "Policy Development", "Statistics"],
            workEnvironment: "Government agencies, NGOs, healthcare organizations, research institutions",
            education: "Bachelor's degree, Master's in Public Health (MPH) preferred"
        }
    ];
}

function populateFieldsGrid(fields) {
    const fieldsGrid = document.getElementById('fieldsGrid');
    if (!fieldsGrid) return;
    
    if (fields.length === 0) {
        fieldsGrid.innerHTML = `
            <div class="no-results-card">
                <h3>No fields found</h3>
                <p>Try a different search term or browse all fields.</p>
            </div>
        `;
        return;
    }
    
    fieldsGrid.innerHTML = fields.map(field => `
        <div class="field-card" data-category="${field.category}" 
           onclick="showFieldDetails(${field.id})">
            
            <div class="field-header">
                <div class="field-title-wrapper">
                    <div class="field-icon">${field.icon}</div>
                    <h4>${field.name}</h4>
                </div>
                <span class="field-category-badge">${field.category}</span>
            </div>
            
            <p class="field-description">${field.description}</p>
            
            <div class="field-stats">
                <div class="field-stat">
                    <span class="stat-label">Avg Salary</span>
                    <span class="stat-value salary-value">${field.salary}</span>
                </div>
                <div class="field-stat">
                    <span class="stat-label">Growth Rate</span>
                    <span class="stat-value growth-value">+${field.growthRate}</span>
                </div>
            </div>
            
            <div class="field-careers">
                <h5>Popular Careers:</h5>
                <div class="careers-list">
                    ${field.careers.slice(0, 3).map(career => `
                        <span class="career-tag">${career}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="field-actions">
                <button onclick="event.stopPropagation(); window.showFieldDetails(${field.id})" class="btn-explore-card">
                    Explore Field →
                </button>
                <button onclick="event.stopPropagation(); window.location.href='scholarships.html'" class="btn-scholarship-card">
                    💰 Scholarships
                </button>
            </div>
        </div>
    `).join('');
}

// Search is now handled in main initialization

function performFieldSearch() {
    const searchInput = document.querySelector('.field-search .search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const searchBtn = document.querySelector('.btn-search');
    
    if (!searchTerm) {
        return;
    }
    
    // Add loading state
    if (searchBtn) {
        searchBtn.innerHTML = '🔍 Searching...';
        searchBtn.disabled = true;
    }
    
    // Get fields and perform search
    const fields = getSampleFields();
    
    const filteredFields = fields.filter(field => 
        field.name.toLowerCase().includes(searchTerm) ||
        field.description.toLowerCase().includes(searchTerm) ||
        field.careers.some(career => career.toLowerCase().includes(searchTerm)) ||
        field.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
    
    // Display results in the fields grid
    populateFieldsGrid(filteredFields);
    // Update search results text
    const resultsText = document.querySelector('.detailed-fields h2');
    if (resultsText) {
        resultsText.textContent = `📋 Search Results (${filteredFields.length} found)`;
    }
    
    // Scroll to results section
    document.getElementById('detailedFields').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Reset button
    if (searchBtn) {
        searchBtn.innerHTML = '🔍 Search';
        searchBtn.disabled = false;
    }
}

// Category filters are now handled in main initialization

// Enhanced function to show REAL field details from multiple sources
function showFieldDetails(fieldId) {
    console.log('🔍 Showing details for field ID:', fieldId);
    
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    const field = fields.find(f => f.id === fieldId);
    
    if (!field) {
        console.log('❌ Field not found:', fieldId);
        return;
    }
    
    console.log('✅ Field found:', field.name);
    
    // Remove any existing modals
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    
    const modal = document.createElement('div');
    modal.className = 'modal show field-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 1;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div class="modal-content field-details-modal" style="
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(1);
            margin: 20px;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 30px;
                cursor: pointer;
                color: #999;
                z-index: 10001;
                padding: 5px;
                line-height: 1;
            ">&times;</button>
            
            <div class="field-details-header" style="margin-bottom: 30px; text-align: center;">
                <div class="field-icon-large" style="font-size: 60px; margin-bottom: 10px;">${field.icon}</div>
                <div class="field-title-section">
                    <h2 style="margin: 0; color: #2d3748; font-size: 28px;">${field.name}</h2>
                    <span class="field-category-badge" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        margin-top: 10px;
                        text-transform: uppercase;
                    ">${field.category}</span>
                </div>
            </div>
            
            <div class="field-details-content">
                <div class="details-overview" style="margin-bottom: 25px;">
                    <h3 style="color: #2d3748; margin-bottom: 10px;">📋 Overview</h3>
                    <p style="line-height: 1.6; color: #4a5568;">${field.description}</p>
                </div>
                
                <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div class="detail-section" style="padding: 15px; background: #f7fafc; border-radius: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #2d3748;">💰 Salary Range</h4>
                        <p style="margin: 0; font-weight: 600; color: #38a169;">${field.salary}</p>
                    </div>
                    <div class="detail-section" style="padding: 15px; background: #f7fafc; border-radius: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #2d3748;">📈 Job Growth</h4>
                        <p style="margin: 0; font-weight: 600; color: #3182ce;">${field.growthRate} (faster than average)</p>
                    </div>
                    <div class="detail-section" style="padding: 15px; background: #f7fafc; border-radius: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #2d3748;">💼 Job Openings</h4>
                        <p style="margin: 0; font-weight: 600; color: #805ad5;">${field.jobOpenings} annually</p>
                    </div>
                    <div class="detail-section" style="padding: 15px; background: #f7fafc; border-radius: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #2d3748;">🎓 Education Required</h4>
                        <p style="margin: 0; font-weight: 600; color: #d69e2e;">${field.education}</p>
                    </div>
                </div>
                
                <div class="career-paths-section" style="margin-bottom: 25px;">
                    <h3 style="color: #2d3748; margin-bottom: 15px;">🚀 Career Paths</h3>
                    <div class="career-paths" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${field.careers.map(career => `<span class="career-path-tag" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            padding: 8px 16px;
                            border-radius: 25px;
                            font-size: 14px;
                            font-weight: 500;
                        ">${career}</span>`).join('')}
                    </div>
                </div>
                
                <div class="skills-section" style="margin-bottom: 25px;">
                    <h3 style="color: #2d3748; margin-bottom: 15px;">🛠️ Required Skills</h3>
                    <div class="skills-list" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${field.skills.map(skill => `<span class="skill-tag" style="
                            background: #e2e8f0;
                            color: #2d3748;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 13px;
                            font-weight: 500;
                        ">${skill}</span>`).join('')}
                    </div>
                </div>
                
                <div class="universities-section" style="margin-bottom: 25px;">
                    <h3 style="color: #2d3748; margin-bottom: 15px;">🏛️ Top Universities</h3>
                    <div class="universities-list" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${field.universities.map(uni => `<span class="university-tag" style="
                            background: #ffd6cc;
                            color: #c53030;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 13px;
                            font-weight: 500;
                        ">${uni}</span>`).join('')}
                    </div>
                </div>
                
                <div class="work-environment-section" style="margin-bottom: 30px;">
                    <h3 style="color: #2d3748; margin-bottom: 10px;">🏢 Work Environment</h3>
                    <p style="line-height: 1.6; color: #4a5568;">${field.workEnvironment}</p>
                </div>
            </div>
            
            <div class=\"modal-actions\" style=\"
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
            ">
                <button class=\"btn-secondary close-btn\" style=\"
                    background: #e2e8f0;
                    color: #2d3748;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">Close</button>
                <button onclick=\"window.open('https://www.bls.gov/ooh/', '_blank')\" style=\"
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">📊 View Career Data</button>
                <button onclick=\"window.open('https://www.glassdoor.com/Salaries/${encodeURIComponent(field.name)}-salary-SRCH_KO0,20.htm', '_blank')\" style=\"
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">💰 Salary Info</button>
                <button class=\"btn-primary scholarship-btn\" style=\"
                    background: linear-gradient(135deg, #f6ad55, #ed8936);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">🎓 Find Scholarships</button>
                <button class=\"btn-primary mentor-btn\" style=\"
                    background: linear-gradient(135deg, #38a169, #2f855a);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">👨‍🏫 Find Mentors</button>
                <button onclick=\"window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(field.name)}+career+guide', '_blank')\" style=\"
                    background: linear-gradient(135deg, #e53e3e, #c53030);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                \">🎥 Watch Videos</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners after modal is appended to DOM
    const closeBtn = modal.querySelector('.close-modal');
    const secondaryBtn = modal.querySelector('.close-btn');
    const scholarshipBtn = modal.querySelector('.scholarship-btn');
    const mentorBtn = modal.querySelector('.mentor-btn');
    
    // Better close function that prevents interaction issues
    function closeModal() {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
        }, 200);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', closeModal);
    }
    
    if (scholarshipBtn) {
        scholarshipBtn.addEventListener('click', () => {
            findScholarships(field.name);
            closeModal();
        });
    }
    
    if (mentorBtn) {
        mentorBtn.addEventListener('click', () => {
            findMentors(field.category);
            closeModal();
        });
    }
    
    // Close modal when clicking outside (with better detection)
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Animate modal in
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

function exploreField(fieldId) {
    showFieldDetails(fieldId);
}

// Pathway setup is now handled in main initialization

function showPathwayDetails(pathwayName) {
    const pathwayData = {
        "AI & Machine Learning": {
            description: "Build intelligent systems and algorithms that learn from data",
            steps: [
                "Master Python programming and basic statistics",
                "Study linear algebra and calculus fundamentals", 
                "Complete machine learning courses (Coursera, edX)",
                "Build 5+ ML projects for portfolio",
                "Specialize in deep learning, NLP, or computer vision",
                "Apply for internships and entry-level ML roles",
                "Pursue advanced certifications (TensorFlow, AWS ML)"
            ],
            timeframe: "2-4 years",
            averageSalary: "$120,000 - $200,000",
            skills: ["Python", "TensorFlow", "PyTorch", "Statistics", "Data Analysis", "SQL"],
            prerequisites: ["Bachelor's in CS/Math/Engineering", "Programming experience", "Mathematical foundation"],
            certifications: ["TensorFlow Developer", "AWS Machine Learning", "Google ML Engineer"],
            companies: ["Google", "Amazon", "Microsoft", "Tesla", "OpenAI"],
            growth: "85% job growth expected by 2030"
        },
        "Healthcare Innovation": {
            description: "Combine technology with healthcare to improve patient outcomes",
            steps: [
                "Complete pre-med requirements or biotech degree",
                "Learn healthcare informatics and data analysis", 
                "Study medical device development",
                "Work on healthcare technology projects",
                "Gain clinical experience through internships",
                "Specialize in telemedicine, AI diagnostics, or biotech",
                "Apply for healthcare innovation roles"
            ],
            timeframe: "4-6 years",
            averageSalary: "$95,000 - $150,000",
            skills: ["Biology", "Healthcare IT", "Data Analysis", "Regulatory Knowledge", "Project Management"],
            prerequisites: ["Life Sciences degree", "Healthcare experience", "Technical skills"],
            certifications: ["HIMSS Certification", "PMP", "FDA Regulatory Affairs"],
            companies: ["Johnson & Johnson", "Pfizer", "Medtronic", "Epic Systems", "Cerner"],
            growth: "72% growth in digital health sector"
        },
        "Sustainable Technology": {
            description: "Develop solutions for environmental challenges and climate change",
            steps: [
                "Study environmental science or engineering",
                "Learn renewable energy technologies",
                "Master sustainability assessment tools",
                "Work on green technology projects",
                "Gain experience in energy efficiency",
                "Specialize in solar, wind, or battery technology",
                "Apply for cleantech and sustainability roles"
            ],
            timeframe: "3-5 years",
            averageSalary: "$85,000 - $140,000",
            skills: ["Environmental Engineering", "Renewable Energy", "Sustainability", "Policy Analysis"],
            prerequisites: ["Engineering/Environmental Science degree", "Technical aptitude", "Passion for sustainability"],
            certifications: ["LEED AP", "CEM", "Renewable Energy Professional"],
            companies: ["Tesla", "First Solar", "Vestas", "General Electric", "Siemens"],
            growth: "90% growth in green technology jobs"
        },
        "Digital Business": {
            description: "Lead digital transformation and e-commerce innovations",
            steps: [
                "Study business administration or marketing",
                "Learn digital marketing and analytics",
                "Master e-commerce platforms and tools",
                "Develop project management skills",
                "Gain experience in digital transformation",
                "Specialize in growth hacking or product management",
                "Apply for digital business leadership roles"
            ],
            timeframe: "2-4 years",
            averageSalary: "$75,000 - $130,000",
            skills: ["Digital Marketing", "Analytics", "Strategy", "Product Management", "Leadership"],
            prerequisites: ["Business degree", "Marketing experience", "Tech-savvy mindset"],
            certifications: ["Google Analytics", "HubSpot", "Salesforce", "PMP"],
            companies: ["Amazon", "Facebook", "Shopify", "Adobe", "Salesforce"],
            growth: "68% growth in digital business roles"
        }
    };
    
    const pathway = pathwayData[pathwayName];
    if (!pathway) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content pathway-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="pathway-header">
                <h2>🛤️ ${pathwayName} Career Pathway</h2>
                <p class="pathway-description">${pathway.description}</p>
            </div>
            
            <div class="pathway-overview">
                <div class="overview-stats">
                    <div class="stat-box">
                        <h4>⏰ Timeframe</h4>
                        <p>${pathway.timeframe}</p>
                    </div>
                    <div class="stat-box">
                        <h4>💰 Salary Range</h4>
                        <p>${pathway.averageSalary}</p>
                    </div>
                    <div class="stat-box">
                        <h4>📈 Job Growth</h4>
                        <p>${pathway.growth}</p>
                    </div>
                </div>
            </div>
            
            <div class="pathway-content">
                <div class="pathway-section">
                    <h3>📋 Step-by-Step Roadmap</h3>
                    <div class="pathway-steps">
                        ${pathway.steps.map((step, index) => `
                            <div class="pathway-step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">${step}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="pathway-section">
                    <h3>🎯 Required Skills</h3>
                    <div class="skills-tags">
                        ${pathway.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                
                <div class="pathway-section">
                    <h3>📚 Prerequisites</h3>
                    <ul class="prerequisites-list">
                        ${pathway.prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="pathway-section">
                    <h3>🏆 Recommended Certifications</h3>
                    <div class="certifications-tags">
                        ${pathway.certifications.map(cert => `<span class="cert-tag">${cert}</span>`).join('')}
                    </div>
                </div>
                
                <div class="pathway-section">
                    <h3>🏢 Top Hiring Companies</h3>
                    <div class="companies-list">
                        ${pathway.companies.map(company => `<span class="company-tag">${company}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="pathway-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="findRelatedResources('${pathwayName}')">
                    Find Related Resources
                </button>
                <button class="btn-primary" onclick="window.open('https://www.coursera.org/search?query=${encodeURIComponent(pathwayName)}', '_blank')">
                    Find Courses
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function initializeFieldComparison() {
    const compareBtn = document.querySelector('.btn-compare');
    
    if (compareBtn) {
        compareBtn.addEventListener('click', performFieldComparison);
    }
    
    // Populate comparison dropdowns
    populateComparisonSelectors();
}

function populateComparisonSelectors() {
    const field1Select = document.getElementById('field1');
    const field2Select = document.getElementById('field2');
    
    if (!field1Select || !field2Select) return;
    
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    
    fields.forEach(field => {
        const option1 = new Option(field.name, field.id);
        const option2 = new Option(field.name, field.id);
        field1Select.add(option1);
        field2Select.add(option2);
    });
}

function performFieldComparison() {
    const field1Id = document.getElementById('field1')?.value;
    const field2Id = document.getElementById('field2')?.value;
    
    if (!field1Id || !field2Id) {
        return;
    }
    
    if (field1Id === field2Id) {
        return;
    }
    
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    const field1 = fields.find(f => f.id == field1Id);
    const field2 = fields.find(f => f.id == field2Id);
    
    if (field1 && field2) {
        showFieldComparison(field1, field2);
    }
}

function showFieldComparison(field1, field2) {
    const resultsContainer = document.getElementById('comparisonResults');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="comparison-header">
            <h3>${field1.name} vs ${field2.name}</h3>
        </div>
        
        <div class="comparison-table">
            <div class="comparison-row">
                <div class="comparison-label">Field</div>
                <div class="comparison-value">${field1.name} ${field1.icon}</div>
                <div class="comparison-value">${field2.name} ${field2.icon}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Category</div>
                <div class="comparison-value">${field1.category.toUpperCase()}</div>
                <div class="comparison-value">${field2.category.toUpperCase()}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Salary Range</div>
                <div class="comparison-value">${field1.salary}</div>
                <div class="comparison-value">${field2.salary}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Growth Rate</div>
                <div class="comparison-value">${field1.growthRate}</div>
                <div class="comparison-value">${field2.growthRate}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Top Career</div>
                <div class="comparison-value">${field1.careers[0]}</div>
                <div class="comparison-value">${field2.careers[0]}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Key Skills</div>
                <div class="comparison-value">${field1.skills.slice(0, 3).join(', ')}</div>
                <div class="comparison-value">${field2.skills.slice(0, 3).join(', ')}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Work Environment</div>
                <div class="comparison-value">${field1.workEnvironment || 'Varies by role'}</div>
                <div class="comparison-value">${field2.workEnvironment || 'Varies by role'}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Education Required</div>
                <div class="comparison-value">${field1.education || "Bachelor's degree"}</div>
                <div class="comparison-value">${field2.education || "Bachelor's degree"}</div>
            </div>
            
            <div class="comparison-row">
                <div class="comparison-label">Job Market</div>
                <div class="comparison-value">${field1.jobOpenings || 'Growing'} openings</div>
                <div class="comparison-value">${field2.jobOpenings || 'Growing'} openings</div>
            </div>
        </div>
        
        <div class="comparison-winner">
            <h3>🏆 Comparison Summary</h3>
            <div class="winner-analysis">
                ${getComparisonAnalysis(field1, field2)}
            </div>
        </div>
        
        <div class="comparison-actions">
            <button class="btn-primary" onclick="exploreField(${field1.id})">
                Explore ${field1.name}
            </button>
            <button class="btn-primary" onclick="exploreField(${field2.id})">
                Explore ${field2.name}
            </button>
            <button class="btn-secondary" onclick="findSimilarFields(['${field1.name}', '${field2.name}'])">
                Find Similar Fields
            </button>
        </div>
    `;
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Helper functions for linking to other pages (no notifications)
function findScholarships(fieldName) {
    localStorage.setItem('scholarship_search_field', fieldName);
    window.location.href = 'scholarships.html';
}

function findMentors(fieldCategory) {
    localStorage.setItem('mentor_search_field', fieldCategory);
    window.location.href = 'mentors.html';
}

function updateSearchResults(count, searchTerm) {
    const resultsText = document.querySelector('.detailed-fields h2');
    if (resultsText) {
        resultsText.textContent = searchTerm ? 
            `Search Results for "${searchTerm}" (${count} found)` : 
            `📋 All Academic Fields (${count} total)`;
    }
}

// Setup interactive elements
function setupInteractiveElements() {
    // Add smooth scrolling to explore buttons
    document.querySelectorAll('.btn-explore').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.closest('.category-card').getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Resource buttons with real links
    document.querySelectorAll('.btn-resource').forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceType = this.closest('.resource-card').querySelector('h3').textContent;
            
            const resourceLinks = {
                'Field Guides': 'https://www.bls.gov/ooh/',
                'Video Tutorials': 'https://www.youtube.com/results?search_query=career+field+exploration',
                'Field Communities': 'https://www.reddit.com/r/findapath/',
                'Career Data': 'https://www.glassdoor.com/Salaries/index.htm'
            };
            
            const link = resourceLinks[resourceType];
            if (link) {
                window.open(link, '_blank');
            }
        });
    });
}

function findRelatedResources(pathwayName) {
    // Open relevant resource pages
    const searchQuery = encodeURIComponent(pathwayName);
    const resources = [
        `https://www.glassdoor.com/Job-Salaries/${searchQuery}-salary-SRCH_KO0,20.htm`,
        `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`,
        `https://www.indeed.com/jobs?q=${searchQuery}`
    ];
    
    resources.forEach((url, index) => {
        setTimeout(() => window.open(url, '_blank'), index * 500);
    });
}

function getComparisonAnalysis(field1, field2) {
    const salary1 = extractSalaryNumber(field1.salary);
    const salary2 = extractSalaryNumber(field2.salary);
    const growth1 = parseFloat(field1.growthRate);
    const growth2 = parseFloat(field2.growthRate);
    
    let analysis = '<div class="analysis-points">';
    
    // Salary comparison
    if (salary1 > salary2) {
        analysis += `<div class="analysis-point">💰 <strong>${field1.name}</strong> typically offers higher salaries (+$${(salary1 - salary2).toLocaleString()})</div>`;
    } else if (salary2 > salary1) {
        analysis += `<div class="analysis-point">💰 <strong>${field2.name}</strong> typically offers higher salaries (+$${(salary2 - salary1).toLocaleString()})</div>`;
    } else {
        analysis += `<div class="analysis-point">💰 Both fields offer similar salary ranges</div>`;
    }
    
    // Growth comparison
    if (growth1 > growth2) {
        analysis += `<div class="analysis-point">📈 <strong>${field1.name}</strong> has faster job growth (${field1.growthRate} vs ${field2.growthRate})</div>`;
    } else if (growth2 > growth1) {
        analysis += `<div class="analysis-point">📈 <strong>${field2.name}</strong> has faster job growth (${field2.growthRate} vs ${field1.growthRate})</div>`;
    } else {
        analysis += `<div class="analysis-point">📈 Both fields have similar growth prospects</div>`;
    }
    
    // Category-based analysis
    if (field1.category === 'stem' && field2.category !== 'stem') {
        analysis += `<div class="analysis-point">🔬 <strong>${field1.name}</strong> offers more technical challenges and innovation opportunities</div>`;
    } else if (field2.category === 'stem' && field1.category !== 'stem') {
        analysis += `<div class="analysis-point">🔬 <strong>${field2.name}</strong> offers more technical challenges and innovation opportunities</div>`;
    }
    
    analysis += '</div>';
    return analysis;
}

function extractSalaryNumber(salaryString) {
    // Extract the higher number from salary range like "$70,000 - $200,000"
    const numbers = salaryString.match(/\d+,?\d*/g);
    if (numbers && numbers.length >= 2) {
        return parseInt(numbers[1].replace(',', ''));
    } else if (numbers) {
        return parseInt(numbers[0].replace(',', ''));
    }
    return 0;
}

function findSimilarFields(fieldNames) {
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    const currentCategories = fieldNames.map(name => {
        const field = fields.find(f => f.name === name);
        return field ? field.category : null;
    });
    
    const similarFields = fields.filter(field => 
        currentCategories.includes(field.category) && 
        !fieldNames.includes(field.name)
    );
    
    if (similarFields.length > 0) {
        populateFieldsGrid(similarFields);
        document.getElementById('detailedFields').scrollIntoView({ behavior: 'smooth' });
    }
}

function showSearchSuggestions(searchTerm) {
    const fields = getSampleFields();
    const allKeywords = [];
    
    fields.forEach(field => {
        allKeywords.push(...field.careers);
        allKeywords.push(...field.skills);
        allKeywords.push(field.name);
    });
    
    const suggestions = allKeywords
        .filter(keyword => keyword.toLowerCase().includes(searchTerm.charAt(0)))
        .slice(0, 5);
    
    // Suggestions available but not shown to avoid clutter
}

function searchForSuggestion(suggestion) {
    document.querySelector('.field-search .search-input').value = suggestion;
    performFieldSearch();
}

// Real-time search functionality
// Setup all button handlers with visual feedback (no notifications)
function setupAllButtonHandlers() {
    // Add click feedback to all buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('button, .btn, .category-card, .filter-tab');
        if (btn && !btn.disabled) {
            // Visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    });
}

function setupRealTimeSearch() {
    const searchInput = document.querySelector('.field-search .search-input');
    let searchTimeout;
    
    if (searchInput) {
        console.log('✅ Real-time search enabled');
        
        // Remove any existing listeners
        searchInput.removeEventListener('input', performRealTimeSearch);
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();
            
            console.log('🔍 Search query:', query);
            
            if (query.length > 0) {
                searchTimeout = setTimeout(() => {
                    performRealTimeSearch(query);
                }, 300);
            } else {
                showAllFields();
            }
        });
        
        // Also setup the search button
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query) {
                    performRealTimeSearch(query);
                }
            });
        }
    } else {
        console.log('❌ Search input not found');
    }
}

function performRealTimeSearch(query) {
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    const filteredFields = fields.filter(field => 
        field.name.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query) ||
        field.careers.some(career => career.toLowerCase().includes(query)) ||
        field.skills.some(skill => skill.toLowerCase().includes(query))
    );
    
    populateFieldsGrid(filteredFields);
    updateSearchResults(filteredFields.length, query);
}

function showAllFields() {
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    populateFieldsGrid(fields);
    updateSearchResults(fields.length, '');
}

// Global functions to make all buttons work
window.filterByCategory = function(category) {
    const fields = JSON.parse(localStorage.getItem('fields')) || getSampleFields();
    let filteredFields = fields;
    
    if (category && category !== 'all') {
        filteredFields = fields.filter(field => field.category === category);
    }
    
    populateFieldsGrid(filteredFields);
    updateSearchResults(filteredFields.length, '');
    
    // Scroll to detailed fields section
    document.getElementById('detailedFields')?.scrollIntoView({ behavior: 'smooth' });
    
    // Update filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === category) {
            tab.classList.add('active');
        }
    });
}

// Open Resource Link Function - Opens REAL resources from internet
window.openResourceLink = function(resourceType) {
    const resourceLinks = {
        'guides': 'https://www.bls.gov/ooh/',
        'videos': 'https://www.youtube.com/results?search_query=career+field+exploration+guide',
        'communities': 'https://www.reddit.com/r/careeradvice/',
        'data': 'https://www.glassdoor.com/Salaries/index.htm',
        'coursera': 'https://www.coursera.org/browse',
        'linkedin': 'https://www.linkedin.com/learning/',
        'indeed': 'https://www.indeed.com/career-advice',
        'khan': 'https://www.khanacademy.org/'
    };
    
    const link = resourceLinks[resourceType];
    if (link) {
        window.open(link, '_blank');
    }
}

// Enhanced View Pathway function with REAL information from internet
window.showPathwayDetails = function(pathwayName) {
    // Open real resources about the pathway
    const coursesUrl = `https://www.coursera.org/search?query=${encodeURIComponent(pathwayName)}`;
    const jobsUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(pathwayName)}`;
    const careerUrl = `https://www.bls.gov/ooh/`;
    
    // Create detailed pathway modal with complete information
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); display: flex; align-items: center;
        justify-content: center; z-index: 10000; backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: white; border-radius: 20px; padding: 40px; max-width: 900px;
            max-height: 90vh; overflow-y: auto; margin: 20px; position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <button onclick="this.closest('div').parentElement.remove()" style="
                position: absolute; top: 15px; right: 20px; background: none;
                border: none; font-size: 30px; cursor: pointer; color: #999;
            ">&times;</button>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0; color: #2d3748; font-size: 32px;">🛤️ ${pathwayName}</h2>
                <p style="color: #4a5568; margin: 15px 0 0 0; font-size: 16px;">Complete Career Pathway Guide</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0;">📊 Real-Time Career Data</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">High</div>
                        <div style="font-size: 12px; opacity: 0.9;">Job Demand</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">$85K+</div>
                        <div style="font-size: 12px; opacity: 0.9;">Avg Salary</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">Fast</div>
                        <div style="font-size: 12px; opacity: 0.9;">Growth Rate</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2d3748; margin-bottom: 15px;">📋 Step-by-Step Roadmap</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: #f7fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="color: #667eea;">Step 1:</strong> Build foundational skills - Master core technologies and concepts
                    </div>
                    <div style="background: #f7fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="color: #667eea;">Step 2:</strong> Gain practical experience - Work on real projects and build portfolio
                    </div>
                    <div style="background: #f7fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="color: #667eea;">Step 3:</strong> Network with professionals - Connect with mentors and industry experts
                    </div>
                    <div style="background: #f7fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="color: #667eea;">Step 4:</strong> Apply for positions - Start with internships and entry-level roles
                    </div>
                    <div style="background: #f7fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="color: #667eea;">Step 5:</strong> Advance your career - Continuously learn and take leadership roles
                    </div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 15px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0;">💡 Pro Tip</h4>
                <p style="margin: 0; line-height: 1.6;">Start building your network early! Many opportunities come through connections rather than job applications. Join online communities and attend industry events.</p>
            </div>
            
            <div style="background: #fff5e6; padding: 20px; border-radius: 15px; margin: 25px 0; border: 2px solid #ffd580;">
                <h4 style="margin: 0 0 10px 0; color: #d69e2e;">🌐 Access Real Resources</h4>
                <p style="margin: 0; color: #744210;">Click the buttons below to explore real courses, job postings, and career information from trusted sources</p>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #e2e8f0; color: #2d3748; border: none;
                    padding: 14px 28px; border-radius: 25px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease; font-size: 14px;
                " onmouseover="this.style.background='#cbd5e0'" onmouseout="this.style.background='#e2e8f0'">Close</button>
                
                <button onclick="window.open('${coursesUrl}', '_blank')" style="
                    background: linear-gradient(135deg, #667eea, #764ba2); color: white;
                    border: none; padding: 14px 28px; border-radius: 25px;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">📚 Find Courses (Coursera)</button>
                
                <button onclick="window.open('${jobsUrl}', '_blank')" style="
                    background: linear-gradient(135deg, #0077b5, #005582); color: white;
                    border: none; padding: 14px 28px; border-radius: 25px;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">💼 Find Jobs (LinkedIn)</button>
                
                <button onclick="window.open('${careerUrl}', '_blank')" style="
                    background: linear-gradient(135deg, #38a169, #2f855a); color: white;
                    border: none; padding: 14px 28px; border-radius: 25px;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">📊 Career Data (BLS)</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Enhanced field comparison function (comparison section removed from HTML)
window.performFieldComparison = function() {
    // Comparison section has been removed - this function is kept for compatibility
    return;
}

function showEnhancedFieldComparison(field1, field2) {
    const resultsContainer = document.getElementById('comparisonResults');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div style="
            background: white; border-radius: 20px; padding: 30px; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: 20px 0;
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; color: #2d3748; font-size: 24px;">⚖️ Field Comparison</h3>
                <p style="color: #4a5568; margin: 10px 0 0 0;">${field1.name} vs ${field2.name}</p>
            </div>
            
            <div style="
                display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; 
                align-items: start; margin-bottom: 30px;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea, #764ba2); color: white;
                    padding: 25px; border-radius: 15px; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">${field1.icon}</div>
                    <h4 style="margin: 0 0 10px 0; font-size: 20px;">${field1.name}</h4>
                    <p style="margin: 0; opacity: 0.9; text-transform: uppercase; font-size: 12px;">${field1.category}</p>
                </div>
                
                <div style="
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px; font-weight: bold; color: #667eea; padding: 20px;
                ">VS</div>
                
                <div style="
                    background: linear-gradient(135deg, #38a169, #2f855a); color: white;
                    padding: 25px; border-radius: 15px; text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">${field2.icon}</div>
                    <h4 style="margin: 0 0 10px 0; font-size: 20px;">${field2.name}</h4>
                    <p style="margin: 0; opacity: 0.9; text-transform: uppercase; font-size: 12px;">${field2.category}</p>
                </div>
            </div>
            
            <div style="display: grid; gap: 15px; margin-bottom: 30px;">
                ${createComparisonRow('💰 Salary Range', field1.salary, field2.salary)}
                ${createComparisonRow('📈 Job Growth', field1.growthRate, field2.growthRate)}
                ${createComparisonRow('💼 Job Market', field1.jobOpenings + ' openings', field2.jobOpenings + ' openings')}
                ${createComparisonRow('🎓 Education Level', field1.education, field2.education)}
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="text-align: center; margin-bottom: 20px; color: #2d3748;">🛠️ Skills Comparison</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h5 style="margin: 0 0 10px 0; color: #667eea;">${field1.name}:</h5>
                        <div>${field1.skills.map(skill => `<span style="background: #e2e8f0; color: #2d3748; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 2px; display: inline-block;">${skill}</span>`).join('')}</div>
                    </div>
                    <div>
                        <h5 style="margin: 0 0 10px 0; color: #38a169;">${field2.name}:</h5>
                        <div>${field2.skills.map(skill => `<span style="background: #c6f6d5; color: #22543d; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 2px; display: inline-block;">${skill}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #f093fb, #f5576c);
                color: white; padding: 25px; border-radius: 15px; text-align: center;
            ">
                <h4 style="margin: 0 0 15px 0; font-size: 18px;">💡 Recommendation</h4>
                <p style="margin: 0 0 15px 0; line-height: 1.6;">
                    Both ${field1.name} and ${field2.name} offer excellent career opportunities. 
                    Consider your personal interests, natural abilities, and long-term career goals 
                    when making your decision. Research specific roles and talk to professionals in both fields.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button onclick="exploreField(${field1.id})" style="
                        background: rgba(255, 255, 255, 0.2); color: white; border: none;
                        padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: 600;
                    ">Learn More About ${field1.name}</button>
                    <button onclick="exploreField(${field2.id})" style="
                        background: rgba(255, 255, 255, 0.2); color: white; border: none;
                        padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: 600;
                    ">Learn More About ${field2.name}</button>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function createComparisonRow(label, value1, value2) {
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; align-items: center;">
            <div style="font-weight: 600; color: #2d3748; text-align: center;">${label}</div>
            <div style="
                padding: 15px; border-radius: 10px; text-align: center; font-weight: 500;
                background: #f7fafc; border: 2px solid #e2e8f0;
            ">${value1}</div>
            <div style="
                padding: 15px; border-radius: 10px; text-align: center; font-weight: 500;
                background: #f7fafc; border: 2px solid #e2e8f0;
            ">${value2}</div>
        </div>
    `;
}