const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;

/**
 * Run Lighthouse performance audit
 */
async function runLighthouse(url) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);

    // Write report
    const reportHtml = runnerResult.report;
    await fs.writeFile('lighthouse-report.html', reportHtml);

    await chrome.kill();

    // Extract scores
    const { lhr } = runnerResult;
    const scores = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
    };

    console.log('📊 Lighthouse Scores:');
    console.log(`Performance: ${scores.performance}`);
    console.log(`Accessibility: ${scores.accessibility}`);
    console.log(`Best Practices: ${scores.bestPractices}`);
    console.log(`SEO: ${scores.seo}`);

    // Check if scores meet thresholds
    const passed = Object.values(scores).every(score => score >= 90);

    if (!passed) {
        console.error('❌ Performance audit failed - scores below 90');
        process.exit(1);
    }

    console.log('✅ Performance audit passed');
}

// Run for local server
const url = process.argv[2] || 'http://localhost:3000';
runLighthouse(url);
