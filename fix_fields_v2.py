
import os

file_path = r"c:\Users\MMM\BraineX\js\fields.js"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_index = -1
for i, line in enumerate(lines):
    if "function populateFieldsGrid(fields) {" in line:
        start_index = i
        break

if start_index == -1:
    print("Could not find function start.")
    exit(1)

# Find end index by counting braces
brace_count = 0
found_start = False
end_index = -1

# Join lines starting from start_index to count braces properly
# But simplistic line-by-line might fail if braces are on same line.
# Let's start counting from the distinct start line.
# We know the first line has the opening brace `{`.

# More robust: iterate characters from the start of the function definition
content = "".join(lines)
func_start_char = content.find("function populateFieldsGrid(fields) {")

if func_start_char == -1:
    print("Could not find function string.")
    exit(1)

brace_stack = 0
scan_started = False
func_end_char = -1

for i in range(func_start_char, len(content)):
    char = content[i]
    if char == '{':
        brace_stack += 1
        scan_started = True
    elif char == '}':
        brace_stack -= 1
    
    if scan_started and brace_stack == 0:
        func_end_char = i + 1 # Include the closing brace
        break

if func_end_char == -1:
    print("Could not find function body end.")
    exit(1)

print(f"Replacing from char {func_start_char} to {func_end_char}")

# New function content
new_code = """function populateFieldsGrid(fields) {
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
}"""

new_content = content[:func_start_char] + new_code + content[func_end_char:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement successful.")
