
import re

file_path = r"c:\Users\MMM\BraineX\js\fields.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new function content
new_function = r"""function populateFieldsGrid(fields) {
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

# Regex to find the function and its body
# We look for "function populateFieldsGrid(fields) {" and then match until the corresponding closing brace
# Since matching balanced braces with regex is hard, we can assume the structure we observed.
# The function starts at line 764 and ends at line 884 in the original file.
# It ends with `    `).join('');\n}`.
# Let's try to match exactly the start and enough of the end.

pattern = r"function populateFieldsGrid\(fields\) \{[\s\S]*?\}\)\.join\(''\);\s*\}"

# Double check if the simple regex works.  The function ends with:
#     `).join('');
# }

# So pattern:
pattern = r"function populateFieldsGrid\(fields\) \{[\s\S]*?\.join\(''\);\s*\}"

match = re.search(pattern, content)
if match:
    print("Found function match!")
    # Replace
    new_content = content.replace(match.group(0), new_function)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced function.")
else:
    print("Could not find function to replace.")
    # Fallback: Print the area around where we expect it
    start_idx = content.find("function populateFieldsGrid")
    if start_idx != -1:
        print("Found start at index:", start_idx)
        print("Next 200 chars:", content[start_idx:start_idx+200])
