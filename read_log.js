const fs = require('fs');
try {
    // Try reading as utf8 first
    let content = fs.readFileSync('cypress_output_3.txt', 'utf8');
    // if content looks like garbage (null bytes), try utf16le
    if (content.includes('\u0000')) {
        content = fs.readFileSync('cypress_output_3.txt', 'utf16le');
    }
    console.log(content);
} catch (e) {
    console.error(e);
}
