#!/usr/bin/env python3
import sys
import json
import pandas as pd
import requests
import io
import logging
from analyser import analyze_student  # Ensure this function is implemented correctly

# Log to stdout instead of stderr to avoid backend treating logs as errors
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

def main():

    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No URL provided'}))
        sys.exit(1)

    url = sys.argv[1]

    try:
        # Download CSV
        response = requests.get(url)
        response.raise_for_status()

        # Parse CSV
        df = pd.read_csv(io.StringIO(response.text))

        # Analyze data
        weak_topics = analyze_student(df)

        # Output result to stdout
        print(json.dumps({'weak_topics': weak_topics}))

    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
