import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKeysPath = path.join(__dirname, '../../../01-系統/configs/apis/API-Keys.md');
const envPath = path.join(__dirname, '../.env');

try {
    if (fs.existsSync(apiKeysPath)) {
        const content = fs.readFileSync(apiKeysPath, 'utf-8');
        const lines = content.split('\n');

        let openaiKey = '';
        let elevenKeys = [];

        for (const line of lines) {
            const trimmed = line.trim();
            // Parse OpenAI
            if (trimmed.startsWith('OPENAI_API_KEY')) {
                const parts = trimmed.split('=');
                if (parts.length >= 2) openaiKey = parts.slice(1).join('=').trim();
            }
            // Parse ElevenLabs - Collect ALL keys
            if (trimmed.startsWith('ELEVENLABS_API_KEY')) {
                const parts = trimmed.split('=');
                if (parts.length >= 2) {
                    const key = parts.slice(1).join('=').trim();
                    if (key) elevenKeys.push(key);
                }
            }
        }

        let envContent = '';

        if (openaiKey && openaiKey.startsWith('sk-')) {
            envContent += `VITE_OPENAI_API_KEY=${openaiKey}\n`;
        }

        // Use the LAST key (often the newest added) or rotate them?
        // Let's try the LAST one first, as user might have pasted new ones at the bottom.
        // Or better, let's export ALL of them as a JSON string so the App can try them.

        if (elevenKeys.length > 0) {
            // Strategy: Export the LAST key as the primary one for now.
            // And also export the full list.
            const bestKey = elevenKeys[elevenKeys.length - 1];
            envContent += `VITE_ELEVENLABS_API_KEY=${bestKey}\n`;
            envContent += `VITE_ELEVENLABS_KEY_LIST=${JSON.stringify(elevenKeys)}\n`;
            console.log(`Synced ${elevenKeys.length} ElevenLabs Keys. Using: ${bestKey.substring(0, 5)}...`);
        }

        fs.writeFileSync(envPath, envContent);

    } else {
        console.log('API-Keys.md not found');
    }
} catch (err) {
    console.error('Error syncing API keys:', err);
}
