const fs = require('fs');
const path = require('path');

const books = ['book_1.json', 'book_2.json', 'book_3.json'];

books.forEach(file => {
    const filePath = path.join('public/content', file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`\nAnalyzing ${file}:`);
    let emptyChapters = 0;
    let totalChapters = data.length;

    data.forEach((ch, idx) => {
        const paragraphs = ch.text ? ch.text.split('\n').filter(p => p.trim().length > 0) : [];
        if (paragraphs.length === 0) {
            console.log(`  Chapter ${idx} (${ch.title}) is EMPTY.`);
            emptyChapters++;
        }
    });

    console.log(`  Total: ${totalChapters}, Empty: ${emptyChapters}`);
});
