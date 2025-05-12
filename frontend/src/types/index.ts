export type ToolType = 'chat' | 'analyzer' | 'video-recommender' | 'summarizer';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  analysisData: string;
  timestamp: Date;
}

export interface VideoRecommendation {
  id: string;
  title: string;
  videos: any;
  thumbnail?: string;
  description?: string;
}

export interface VideoSummary {
  id: string;
  videoUrl: string;
  videoTitle?: string;
  summary: string;
  timestamp: Date;
}