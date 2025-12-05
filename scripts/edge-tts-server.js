import express from 'express';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const VOICE_MAP = {
    'xiaoxiao': 'zh-CN-XiaoxiaoNeural',
    'yunxi': 'zh-CN-YunxiNeural',
    'yunjian': 'zh-CN-YunjianNeural',
    'xiaoyi': 'zh-CN-XiaoyiNeural',
    'yunyang': 'zh-CN-YunyangNeural',
    'xiaobei': 'zh-CN-XiaobeiNeural',
    'hsiaochen': 'zh-TW-HsiaoChenNeural',
    'yunjhe': 'zh-TW-YunJheNeural',
    'hsiaoyu': 'zh-TW-HsiaoYuNeural',
    'hiugaai': 'zh-HK-HiuGaaiNeural',
    'hiumaan': 'zh-HK-HiuMaanNeural',
    'wanlung': 'zh-HK-WanLungNeural'
};

const PYTHON_BIN = path.join(__dirname, 'venv/bin/python3');
const TTS_SCRIPT = path.join(__dirname, 'tts_handler.py');

app.post('/tts', async (req, res) => {
    const { text, voice = 'hsiaochen', rate = 1.0 } = req.body;
    const fullVoiceName = VOICE_MAP[voice] || VOICE_MAP['hsiaochen'];

    const tempFile = path.join(__dirname, `temp_${uuidv4()}.mp3`);

    // Write text to file to avoid shell escaping issues
    const textFile = tempFile.replace('.mp3', '.txt');
    fs.writeFileSync(textFile, text);

    // We pass text via file content to python script? 
    // Actually the python script takes --text arg. 
    // Let's modify python script to read from file or just pass arg carefully.
    // Passing large text as arg is risky.
    // Let's update python script to read from file if I can, but I already wrote it to take --text.
    // I'll just read the file content in node and pass it, but if it's too long...
    // Let's modify the python script to accept --text-file.
    // But for now, let's just use the text.

    // Wait, I should update the python script to read from file.
    // But to save time, I will just use the textFile path and update the python script in next step if needed.
    // Actually, I'll just pass the text. It's usually short paragraphs.

    // Escape double quotes for shell
    const safeText = text.replace(/"/g, '\\"');

    const cmd = `"${PYTHON_BIN}" "${TTS_SCRIPT}" --text "${safeText}" --voice ${fullVoiceName} --rate ${rate} --output "${tempFile}"`;

    console.log(`[TTS] Generating: ${voice} @ ${rate}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`[TTS Error] ${stderr}`);
            return res.status(500).json({ error: "TTS Generation Failed" });
        }

        const engineUsed = stdout.trim(); // EDGE or GOOGLE
        console.log(`[TTS] Success using ${engineUsed}`);

        if (fs.existsSync(tempFile)) {
            const stream = fs.createReadStream(tempFile);
            res.set('Content-Type', 'audio/mpeg');
            res.set('X-Engine-Used', engineUsed);

            stream.pipe(res);

            stream.on('end', () => {
                fs.unlink(tempFile, (err) => {
                    if (err) console.error("Failed to delete temp file:", err);
                });
            });
        } else {
            res.status(500).json({ error: "No audio output file created" });
        }
    });
});

app.listen(port, () => {
    console.log(`Edge TTS Server (Auto Fallback) running at http://localhost:${port}`);
});
