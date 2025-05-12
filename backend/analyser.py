import pandas as pd
from collections import defaultdict

def analyze_student(df):
    topic_stats = defaultdict(lambda: {"total": 0, "correct": 0, "time": 0})

    for _, row in df.iterrows():
        topic = row['Topic']
        correct = int(row['Correct'])
        time_taken = float(row['Time_Taken'])

        topic_stats[topic]['total'] += 1
        topic_stats[topic]['correct'] += correct
        topic_stats[topic]['time'] += time_taken

    weak_topics = []
    for topic, stats in topic_stats.items():
        accuracy = stats['correct'] / stats['total']
        avg_time = stats['time'] / stats['total']
        # REMOVE print() statements here
        if accuracy < 0.6 and avg_time > 80:
            weak_topics.append(topic)

    return weak_topics
