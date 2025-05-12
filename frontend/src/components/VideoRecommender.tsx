import React, { useState } from 'react';
import { Search, Video, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';


const VideoRecommender: React.FC = () => {
  const { videoRecommendations, setVideoRecommendations } = useApp();
  const [topic, setTopic] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('https://student-assistant-nine.vercel.app/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const { recommendations } = await res.json();
      console.log(recommendations)
      setVideoRecommendations(recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold text-white mb-6"></h2>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter a topic you want to learn about..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button
            className={`px-4 py-3 rounded-lg ${topic.trim() && !searching
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              } transition-colors duration-200 flex items-center gap-2`}
            onClick={handleSearch}
            disabled={!topic.trim() || searching}
          >
            {searching ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {videoRecommendations.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xl font-semibold text-white mb-4">Recommended Videos on "{topic}"</h3>
        

          <div className="grid grid-cols-1 gap-4">
            {videoRecommendations.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden animate-fadeIn">
                
                <div className="flex flex-col md:flex-row">
                  {video.thumbnail && (
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 md:w-2/3">
                    <h4 className="text-lg font-semibold text-white mb-2">{video.title}</h4>

                    {video.description && (
                      <p className="text-gray-300 mb-4 line-clamp-2">{video.description}</p>
                    )}

                    <a
                      href={video.videos[0]['url']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <Video size={16} />
                      <button
                        onClick={() =>
                          window.open(video.videos[0]['url'], "_blank", "noopener,noreferrer")
                        }
                      >
                         {video.videos[0]['url']}
                      </button>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRecommender;