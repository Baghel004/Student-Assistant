from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
from urllib.parse import urlparse, parse_qs

# Load the Hugging Face summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn", framework="pt")


def extract_video_id(youtube_url):
    parsed_url = urlparse(youtube_url)
    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path[1:]
    if "youtube.com" in parsed_url.netloc:
        query_params = parse_qs(parsed_url.query)
        return query_params.get("v", [None])[0]
    return None

def extract_transcript(youtube_video_url):
    try:
        video_id = extract_video_id(youtube_video_url)
        if not video_id:
            raise ValueError("Could not extract video ID from URL.")
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([entry["text"] for entry in transcript])
        return text
    except Exception as e:
        raise RuntimeError(f"Transcript error: {str(e)}")

def split_text(text, max_length=1000):
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        if sum(len(w) + 1 for w in current_chunk) + len(word) + 1 > max_length:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
        current_chunk.append(word)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def generate_summary(transcript_text, max_len=500):
    try:
        chunks = split_text(transcript_text)
        summaries = []
        for chunk in chunks:
            summary = summarizer(chunk, max_length=max_len, min_length=50, do_sample=False)
            summaries.append(summary[0]["summary_text"])
        return "\n\n".join(summaries)
    except Exception as e:
        raise RuntimeError(f"Hugging Face error: {str(e)}")
