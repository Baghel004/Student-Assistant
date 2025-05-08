import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToolType, Message, AnalysisResult, VideoRecommendation, VideoSummary } from '../types';

interface AppContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  messages: Message[];
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  
  // Analyzer
  analysisResults: AnalysisResult[];
  addAnalysisResult: (fileName: string, fileType: string, fileSize: string, analysisData: string) => void;
  
  // Video Recommender
  videoRecommendations: VideoRecommendation[];
  setVideoRecommendations: (recommendations: VideoRecommendation[]) => void;
  
  // Summarizer
  videoSummaries: VideoSummary[];
  addVideoSummary: (videoUrl: string, videoTitle: string, summary: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Analyzer states
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  
  // Video Recommender states
  const [videoRecommendations, setVideoRecommendations] = useState<VideoRecommendation[]>([]);
  
  // Summarizer states
  const [videoSummaries, setVideoSummaries] = useState<VideoSummary[]>([]);

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addAnalysisResult = (fileName: string, fileType: string, fileSize: string, analysisData: string) => {
    const newResult = {
      id: uuidv4(),
      fileName,
      fileType,
      fileSize,
      analysisData,
      timestamp: new Date(),
    };
    setAnalysisResults((prev) => [...prev, newResult]);
  };

  const addVideoSummary = (videoUrl: string, videoTitle: string | undefined, summary: string) => {
    const newSummary = {
      id: uuidv4(),
      videoUrl,
      videoTitle,
      summary,
      timestamp: new Date(),
    };
    setVideoSummaries((prev) => [...prev, newSummary]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTool,
        setActiveTool,
        messages,
        addMessage,
        isTyping,
        setIsTyping,
        analysisResults,
        addAnalysisResult,
        videoRecommendations,
        setVideoRecommendations,
        videoSummaries,
        addVideoSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};