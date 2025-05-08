import sys, json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from googleapiclient.discovery import build
import os

# load your dataset
df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'ai.csv'))
df['Subtopic'] = df['Subtopic'].fillna('')

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['Subtopic'])

youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

def search_youtube(query, max_results=3):
    req = youtube.search().list(q=query, part='snippet', type='video', maxResults=max_results)
    res = req.execute()
    vids = []
    for item in res['items']:
        snip = item['snippet']
        vids.append({
            'title': snip['title'],
            'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            'thumbnail': snip['thumbnails']['default']['url'],
            'description': snip['description']
        })
    return vids

def recommend(topic, top_n=5):
    vec = vectorizer.transform([topic])
    sims = cosine_similarity(vec, tfidf_matrix).flatten()
    idxs = sims.argsort()[::-1][:top_n]
    recs = []
    for i in idxs:
        recs.append({
          'topic': df.iloc[i]['Topic'],
          'subtopic': df.iloc[i]['Subtopic'],
          'videos': search_youtube(df.iloc[i]['Subtopic'])
        })
    return recs

if __name__ == '__main__':
    term = sys.argv[1]
    out = {'recommendations': recommend(term)}
    print(json.dumps(out))
