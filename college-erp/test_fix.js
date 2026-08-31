const fs = require('fs');

const file = 'index.html';
const content = fs.readFileSync(file, 'utf8');

// The file was saved with UTF8 but originally "read" with default encoding.
// Let's try to convert it back using iconv-lite if necessary, or just Buffer.
try {
    const buffer = Buffer.from(content, 'binary'); // 'binary' is latin1 in node
    const restored = buffer.toString('utf8');

    // Check if restored contains the graduation cap emoji or em-dash
    if (restored.includes('🎓') || restored.includes('—')) {
        console.log('Success with binary->utf8!');
        fs.writeFileSync('index_fixed.html', restored, 'utf8');
    } else {
        console.log('Failed to find emoji/em-dash in restored text.');
        console.log(restored.substring(0, 500));
    }
} catch (e) {
    console.error(e);
}
