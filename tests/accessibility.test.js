const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');

/**
 * Accessibility testing with axe-core
 */
async function runAccessibilityTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const pages = [
        'http://localhost:3000',
        'http://localhost:3000/scholarships',
        'http://localhost:3000/fields',
        'http://localhost:3000/mentors',
    ];

    let totalViolations = 0;

    for (const url of pages) {
        console.log(`\n Testing: ${url}`);
        await page.goto(url);

        const results = await new AxePuppeteer(page).analyze();

        if (results.violations.length > 0) {
            console.log(`❌ Found ${results.violations.length} violations:`);
            results.violations.forEach((violation) => {
                console.log(`\n- ${violation.id}: ${violation.description}`);
                console.log(`  Impact: ${violation.impact}`);
                console.log(`  Affected elements: ${violation.nodes.length}`);
            });
            totalViolations += results.violations.length;
        } else {
            console.log('✅ No violations found');
        }
    }

    await browser.close();

    console.log(`\n📊 Total violations across all pages: ${totalViolations}`);

    if (totalViolations > 0) {
        console.error('❌ Accessibility tests failed');
        process.exit(1);
    }

    console.log('✅ All accessibility tests passed');
}

runAccessibilityTests();
