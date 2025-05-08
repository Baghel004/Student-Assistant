import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

# Load dataset
df = pd.read_csv("ai.csv")
df['Subtopic'] = df['Subtopic'].fillna('')

# TF-IDF Vectorization
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['Subtopic'])

# YouTube API setup
API_KEY = os.getenv("YOUTUBE_API_KEY");  # Replace with your actual key
youtube = build('youtube', 'v3', developerKey=API_KEY)

def search_youtube(query, max_results=1):
    """Search YouTube for a given query and return video title and URL"""
    request = youtube.search().list(
        part="snippet",
        q=query,
        type="video",
        maxResults=max_results
    )
    response = request.execute()

    results = []
    for item in response['items']:
        video_title = item['snippet']['title']
        video_id = item['id']['videoId']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        results.append((video_title, video_url))
    return results

def recommend_by_input(user_input, top_n=5):
    """Take user input, compare with dataset, and recommend similar subtopics with YouTube videos"""
    user_tfidf = vectorizer.transform([user_input])
    sim_scores = cosine_similarity(user_tfidf, tfidf_matrix).flatten()
    top_indices = sim_scores.argsort()[::-1][:top_n]

    print(f"\nYou entered: '{user_input}'")
    print("\nTop Recommended Subtopics with YouTube Videos:\n")

    for i in top_indices:
        topic = df.iloc[i]['Topic']
        subtopic = df.iloc[i]['Subtopic']
        print(f"Subtopic: {subtopic} (Topic: {topic})")
        videos = search_youtube(subtopic)
        for title, url in videos:
            print(f"  ▶ {title}\n     {url}")
        print()

# --- Main execution ---
user_input = input("Enter a topic or subtopic: ")
recommend_by_input(user_input)
