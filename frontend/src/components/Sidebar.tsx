import React from 'react';
import { MessageCircle, FileText, Video, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToolType } from '../types';
import LoginButton from './Login'

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
      onClick={onClick}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { activeTool, setActiveTool } = useApp();

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
  };

  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Student Assistant</h1>
      </div>
      <div className="flex-1 py-4 px-2 space-y-2">
        <SidebarItem
          icon={<MessageCircle className="w-full h-full" />}
          label="Chat"
          active={activeTool === 'chat'}
          onClick={() => handleToolChange('chat')}
        />
        <SidebarItem
          icon={<FileText className="w-full h-full" />}
          label="File Analyzer"
          active={activeTool === 'analyzer'}
          onClick={() => handleToolChange('analyzer')}
        />
        <SidebarItem
          icon={<Video className="w-full h-full" />}
          label="Video Recommender"
          active={activeTool === 'video-recommender'}
          onClick={() => handleToolChange('video-recommender')}
        />
        <SidebarItem
          icon={<Youtube className="w-full h-full" />}
          label="Video Summarizer"
          active={activeTool === 'summarizer'}
          onClick={() => handleToolChange('summarizer')}
        />
        

      </div>
      
      <div className="p-4 border-t border-gray-800">

<div className="flex items-center gap-4">
  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
    <span className="text-white font-medium">L</span>
  </div>
  <div className="text-m text-white"><LoginButton
      /></div>
</div>
</div>

      <div className="p-4 border-t border-gray-800">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-medium">AI</span>
          </div>
          <div className="text-sm text-white">Student Assistant</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;