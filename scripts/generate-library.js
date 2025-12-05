import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EPub from 'epub';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const booksDir = path.join(__dirname, '../public/books');
const coversDir = path.join(__dirname, '../public/covers');
const outputFile = path.join(__dirname, '../src/data/books.json');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, '../src/data'))) {
    fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });
}
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
}

async function processBook(file, index) {
    return new Promise((resolve) => {
        const filePath = path.join(booksDir, file);
        const epub = new EPub(filePath);

        epub.on('end', () => {
            // Try to get cover
            let coverPath = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"; // Default

            if (epub.metadata.cover) {
                epub.getImage(epub.metadata.cover, (error, imgData, mimeType) => {
                    if (!error && imgData) {
                        const extension = mimeType.split('/')[1] || 'jpg';
                        const coverFilename = `cover_${index}.${extension}`;
                        const localCoverPath = path.join(coversDir, coverFilename);
                        fs.writeFileSync(localCoverPath, imgData);
                        coverPath = `/covers/${coverFilename}`;
                    }

                    resolve({
                        id: index + 1,
                        title: epub.metadata.title || file.replace(/\.(epub|pdf)$/, ''),
                        author: epub.metadata.creator || "Unknown Author",
                        cover: coverPath,
                        path: `/books/${file}`,
                        type: 'epub'
                    });
                });
            } else {
                resolve({
                    id: index + 1,
                    title: epub.metadata.title || file.replace(/\.(epub|pdf)$/, ''),
                    author: epub.metadata.creator || "Unknown Author",
                    cover: coverPath,
                    path: `/books/${file}`,
                    type: 'epub'
                });
            }
        });

        epub.on('error', (err) => {
            console.error(`Failed to parse ${file}:`, err);
            resolve(null);
        });

        epub.parse();
    });
}

async function generate() {
    try {
        const files = fs.readdirSync(booksDir).filter(file => file.endsWith('.epub'));
        console.log(`Found ${files.length} books...`);

        const books = [];
        for (let i = 0; i < files.length; i++) {
            const book = await processBook(files[i], i);
            if (book) books.push(book);
            console.log(`Processed ${i + 1}/${files.length}: ${files[i]}`);
        }

        fs.writeFileSync(outputFile, JSON.stringify(books, null, 2));
        console.log(`Successfully generated library with ${books.length} books.`);
    } catch (err) {
        console.error("Error scanning books directory:", err);
    }
}

generate();
