import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EPub from 'epub';
import { convert } from 'html-to-text';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const booksDir = path.join(__dirname, '../public/books');
const coversDir = path.join(__dirname, '../public/covers');
const contentDir = path.join(__dirname, '../public/content'); // Store extracted text here
const outputFile = path.join(__dirname, '../src/data/books.json');

// Ensure directories exist
[path.join(__dirname, '../src/data'), coversDir, contentDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function cleanText(text) {
    if (!text) return "";
    // Remove common metadata junk and noise
    return text
        .replace(/Copyright ©.*/gi, "")
        .replace(/All rights reserved.*/gi, "")
        .replace(/ISBN\s*[:\-]?\s*[0-9\-]+/gi, "")
        .replace(/http\S+/g, "")
        .replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
        .trim();
}

async function processBook(file, index) {
    return new Promise((resolve) => {
        const filePath = path.join(booksDir, file);
        const epub = new EPub(filePath);

        epub.on('end', async () => {
            // 1. Extract Cover
            let coverPath = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400";
            if (epub.metadata.cover) {
                epub.getImage(epub.metadata.cover, (error, imgData, mimeType) => {
                    if (!error && imgData) {
                        const extension = mimeType.split('/')[1] || 'jpg';
                        const coverFilename = `cover_${index}.${extension}`;
                        fs.writeFileSync(path.join(coversDir, coverFilename), imgData);
                        coverPath = `/covers/${coverFilename}`;
                    }
                });
            }

            // 2. Extract Text Content
            const chapters = [];
            const flow = epub.flow; // The "spine" of the book

            // We need to process chapters sequentially
            const processChapters = async () => {
                for (const chapter of flow) {
                    await new Promise((resolveChapter) => {
                        epub.getChapter(chapter.id, (err, text) => {
                            if (!err && text) {
                                // Convert HTML to plain text
                                const plainText = convert(text, {
                                    wordwrap: false,
                                    selectors: [
                                        { selector: 'img', format: 'skip' },
                                        { selector: 'a', options: { ignoreHref: true } }
                                    ]
                                });

                                const cleaned = cleanText(plainText);
                                if (cleaned.length > 50) { // Filter out empty or tiny chapters
                                    chapters.push({
                                        id: chapter.id,
                                        title: chapter.title || `Chapter ${chapters.length + 1}`,
                                        text: cleaned
                                    });
                                }
                            }
                            resolveChapter();
                        });
                    });
                }
            };

            await processChapters();

            // Save content to JSON
            const contentFile = `book_${index + 1}.json`;
            fs.writeFileSync(
                path.join(contentDir, contentFile),
                JSON.stringify(chapters, null, 2)
            );

            resolve({
                id: index + 1,
                title: epub.metadata.title || file.replace(/\.(epub|pdf)$/, ''),
                author: epub.metadata.creator || "Unknown Author",
                cover: coverPath,
                path: `/books/${file}`,
                contentPath: `/content/${contentFile}`,
                type: 'epub'
            });
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
            console.log(`Processing ${i + 1}/${files.length}: ${files[i]}...`);
            const book = await processBook(files[i], i);
            if (book) books.push(book);
        }

        fs.writeFileSync(outputFile, JSON.stringify(books, null, 2));
        console.log(`Successfully generated library with ${books.length} books.`);
    } catch (err) {
        console.error("Error scanning books directory:", err);
    }
}

generate();
