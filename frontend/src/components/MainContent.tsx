import React from 'react';
import { useApp } from '../context/AppContext';
import ChatInterface from './ChatInterface';
import FileAnalyzer from './FileAnalyzer';
import VideoRecommender from './VideoRecommender';
import VideoSummarizer from './VideoSummarizer';

const MainContent: React.FC = () => {
  const { activeTool } = useApp();

  const renderContent = () => {
    switch (activeTool) {
      case 'chat':
        return <ChatInterface />;
      case 'analyzer':
        return <FileAnalyzer />;
      case 'video-recommender':
        return <VideoRecommender />;
      case 'summarizer':
        return <VideoSummarizer />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-gray-900">
      {renderContent()}
    </div>
  );
};

export default MainContent;