import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageBubble from './MessageBubble';

const ChatInterface: React.FC = () => {
  const { messages, addMessage, isTyping, setIsTyping } = useApp();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    addMessage(input, 'user');
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch('https://student-assistant-nine.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const { reply } = await res.json();
      addMessage(reply, 'assistant');
    } catch (err) {
      console.error(err);
      addMessage('Error fetching response.', 'assistant');
    } finally {
      setIsTyping(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <textarea
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 outline-none resize-none"
            placeholder="Type a message..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`p-2 rounded-full ${
              input.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            } transition-colors duration-200`}
            onClick={handleSendMessage}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;