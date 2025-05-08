import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.role === 'assistant';
  
  return (
    <div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fadeIn`}
      style={{ animationDuration: '0.3s' }}
    >
      <div className="flex items-start gap-3 max-w-[80%]">
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">AI</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI 
              ? 'bg-gray-800 text-white' 
              : 'bg-indigo-600 text-white'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-1 ${isAI ? 'text-gray-400' : 'text-indigo-200'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {!isAI && (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">You</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;