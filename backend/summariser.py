import sys
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def extract_transcript(video_id):
    transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
    transcript = " ".join([i["text"] for i in transcript_text])
    return transcript

def generate_summary(transcript_text):
    prompt = (
        "This is a YouTube video summarizer. It will take the transcript text and summarize "
        "the entire video, providing the important points in 500 words."
    )
    model = genai.GenerativeModel("models/gemini-1.5-pro")
    response = model.generate_content(prompt + transcript_text)
    return response.text

if __name__ == "__main__":
    url = sys.argv[1]
    video_id = url.split("=")[1]
    transcript = extract_transcript(video_id)
    summary = generate_summary(transcript)
    print(json.dumps({"summary": summary}))
