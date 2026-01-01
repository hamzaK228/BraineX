
css_path = r"c:\Users\MMM\BraineX\css\fields.css"
css_content = r"""

/* New styles for Refactored Fields Grid */

/* --- Sort Controls --- */
.sort-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.sort-label {
    color: #2d3748;
    font-weight: 600;
    font-size: 14px;
}

.sort-select {
    padding: 8px 15px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #2d3748;
    font-size: 14px;
    cursor: pointer;
    min-width: 150px;
}

.btn-reset {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

/* Dark Mode Sort Controls */
html[data-theme='dark'] .sort-controls {
    background: #1e293b !important;
}

html[data-theme='dark'] .sort-label {
    color: #e2e8f0 !important;
}

html[data-theme='dark'] .sort-select {
    background: #0f1425 !important;
    color: #e2e8f0 !important;
    border-color: #2a2f45 !important;
}

/* --- Field Cards (New Structure) --- */
.field-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.field-title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.field-icon {
    font-size: 32px;
}

.field-category-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
}

.field-description {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Stats */
.field-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
    background: #f7fafc;
    padding: 15px;
    border-radius: 10px;
}

.field-stat {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
}

.stat-value {
    font-weight: bold;
    font-size: 14px;
}

.salary-value { color: #3182ce; }
.growth-value { color: #38a169; }

/* Careers */
.field-careers h5 {
    margin: 0 0 8px 0;
    color: #2d3748;
    font-size: 13px;
    font-weight: 600;
}

.careers-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.career-tag {
    background: #e2e8f0;
    color: #2d3748;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
}

/* Buttons */
.field-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn-explore-card {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
}

.btn-scholarship-card {
    background: #38a169;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

/* --- Dark Mode Overrides for New Elements --- */

html[data-theme='dark'] .field-description {
    color: #cbd5e1 !important;
}

html[data-theme='dark'] .field-stats {
    background: #0f172a !important;
}

html[data-theme='dark'] .stat-label {
    color: #94a3b8 !important;
}

html[data-theme='dark'] .salary-value { color: #63b3ed !important; }
html[data-theme='dark'] .growth-value { color: #68d391 !important; }

html[data-theme='dark'] .field-careers h5 {
    color: #e2e8f0 !important;
}

html[data-theme='dark'] .career-tag {
    background: #312e81 !important; /* Dark blue background */
    color: #e0e7ff !important; /* Light text */
}

html[data-theme='dark'] .no-results-card {
    background: #1e293b !important;
    color: #e2e8f0 !important;
}

html[data-theme='dark'] .no-results-card h3 {
    color: #f1f5f9 !important;
}

html[data-theme='dark'] .no-results-card p {
    color: #cbd5e1 !important;
}

/* Ensure All Fields button visibility */
html[data-theme='dark'] .filter-tab.active {
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
    color: white !important;
    border-color: #667eea !important;
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(css_content)
    
print("CSS appended successfully.")
