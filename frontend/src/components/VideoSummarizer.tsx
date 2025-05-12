import React, { useState } from 'react';
import { Youtube, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VideoSummarizer: React.FC = () => {
  const { videoSummaries, addVideoSummary } = useApp();
  const [videoUrl, setVideoUrl] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const isValidYoutubeUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
  };

  const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSummarize = async () => {
    if (!isValidYoutubeUrl(videoUrl)) {
      setError('Invalid YouTube URL.');
      return;
    }
    setError('');
    setSummarizing(true);
    try {
      const res = await fetch('http://localhost:3030/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to summarize.');
      }
  
      const { summary } = await res.json();
      if (!summary) {
        throw new Error('Summary is missing in the response.');
      }
      addVideoSummary(videoUrl, getYoutubeVideoId(videoUrl)!, summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to summarize.');
    } finally {
      setSummarizing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSummarize();
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Video Summarizer</h2>
      
      <div className="mb-6">
        <div className="flex flex-col">
          <div className="relative flex-1 mb-3">
            <input
              type="text"
              className={`w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 outline-none ${
                error ? 'border-2 border-red-500' : 'focus:ring-2 focus:ring-indigo-600'
              }`}
              placeholder="Paste YouTube video URL..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
            />
            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          
          <button
            className={`px-4 py-3 rounded-lg ${
              videoUrl.trim() && !summarizing
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            } transition-colors duration-200 flex items-center justify-center gap-2`}
            onClick={handleSummarize}
            disabled={!videoUrl.trim() || summarizing}
          >
            {summarizing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating Summary...
              </>
            ) : (
              'Summarize Video'
            )}
          </button>
        </div>
      </div>
      
      {videoSummaries.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xl font-semibold text-white mb-4">Video Summaries</h3>
          
          <div className="space-y-6">
            {videoSummaries.map((summary) => {
              const videoId = getYoutubeVideoId(summary.videoUrl);
              
              return (
                <div key={summary.id} className="bg-gray-800 rounded-lg p-4 animate-fadeIn">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {videoId && (
                      <div className="md:w-1/3">
                        <div className="aspect-video rounded overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={summary.videoTitle || 'YouTube Thumbnail'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if maxresdefault is not available
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="md:w-2/3">
                      <h4 className="text-lg font-semibold text-white">
                        {summary.videoTitle || 'Video Summary'}
                      </h4>
                      
                      <a
                        href={summary.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 text-sm hover:underline mt-1 inline-block"
                      >
                        {summary.videoUrl}
                      </a>
                      
                      <p className="text-gray-500 text-sm mt-2">
                        Summarized on {summary.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="text-indigo-400" size={18} />
                      <h5 className="text-white font-medium">Summary</h5>
                    </div>
                    
                    <div className="text-gray-300 whitespace-pre-wrap markdown">
                      {summary.summary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSummarizer;