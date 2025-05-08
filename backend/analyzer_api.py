#!/usr/bin/env python3
import sys
import json
import io
import contextlib
import pandas as pd
from analyser import analyze_student

def main(file_path: str):
    try:
        # capture any stray prints
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            df = pd.read_csv(file_path)
            weak_topics = analyze_student(df)
        print(json.dumps({'weak_topics': weak_topics}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
    main(sys.argv[1])
