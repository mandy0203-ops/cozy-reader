import sys
import asyncio
import argparse
import os
from edge_tts import Communicate
from gtts import gTTS

async def generate_edge(text, voice, rate, output_file):
    # Convert rate float (1.0) to string (+0%)
    rate_pct = int((rate - 1.0) * 100)
    rate_str = f"+{rate_pct}%" if rate_pct >= 0 else f"{rate_pct}%"
    
    communicate = Communicate(text, voice, rate=rate_str)
    await communicate.save(output_file)

def generate_gtts(text, lang, output_file):
    # gTTS doesn't support rate natively in the same way, but it's a fallback
    tts = gTTS(text, lang=lang)
    tts.save(output_file)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice", required=True) # Edge voice name
    parser.add_argument("--rate", type=float, default=1.0)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    # Map Edge voices to gTTS langs for fallback
    gtts_lang = 'zh-TW'
    if 'CN' in args.voice:
        gtts_lang = 'zh-CN'
    elif 'HK' in args.voice:
        gtts_lang = 'zh-TW' # gTTS doesn't have HK specific usually, maybe yue?
    elif 'US' in args.voice or 'EN' in args.voice:
        gtts_lang = 'en'

    try:
        # Try Edge TTS first
        await generate_edge(args.text, args.voice, args.rate, args.output)
        print("EDGE")
    except Exception as e:
        print(f"Edge TTS failed: {e}", file=sys.stderr)
        try:
            # Fallback to gTTS
            generate_gtts(args.text, gtts_lang, args.output)
            print("GOOGLE")
        except Exception as e2:
            print(f"gTTS failed: {e2}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
