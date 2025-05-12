#!/usr/bin/env python3
import sys
import json
from videoSummariser import extract_transcript, generate_summary

def main(video_url: str):
    try:
        transcript = extract_transcript(video_url)
        summary = generate_summary(transcript)
        print(json.dumps({'summary': summary}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No video URL provided'}, ensure_ascii=False))
        sys.exit(1)
    main(sys.argv[1])
