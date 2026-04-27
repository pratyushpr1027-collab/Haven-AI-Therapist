import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

// Simple markdown-like renderer for bold, italic, and bullets
const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    // Bullet points
    const isBullet = /^[\s]*[-•*]\s/.test(line);
    const cleanLine = isBullet ? line.replace(/^[\s]*[-•*]\s/, '') : line;

    // Process inline formatting
    const parts: React.ReactNode[] = [];
    let remaining = cleanLine;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic: *text*
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

      const match = boldMatch && italicMatch
        ? (boldMatch.index! <= italicMatch.index! ? boldMatch : italicMatch)
        : boldMatch || italicMatch;

      if (match && match.index !== undefined) {
        if (match.index > 0) {
          parts.push(<span key={partIndex++}>{remaining.substring(0, match.index)}</span>);
        }
        if (match[0].startsWith('**')) {
          parts.push(<strong key={partIndex++} className="font-semibold text-white">{match[1]}</strong>);
        } else {
          parts.push(<em key={partIndex++} className="italic text-teal-200/80">{match[1]}</em>);
        }
        remaining = remaining.substring(match.index + match[0].length);
      } else {
        parts.push(<span key={partIndex++}>{remaining}</span>);
        remaining = '';
      }
    }

    if (isBullet) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-teal-400 mt-1.5 text-[6px]">●</span>
          <span>{parts}</span>
        </div>
      );
    }

    return (
      <React.Fragment key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const msgTime = new Date();
          
          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-[pop-in_0.4s_ease-out_1]`}>
              {!isUser && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-5" style={{ background: 'linear-gradient(135deg, #0D9488, #2DD4BF)' }}>
                  <i className="fas fa-brain text-white text-sm"></i>
                </div>
              )}
              <div className="flex flex-col max-w-lg">
                <div className={`rounded-2xl px-4 py-3 relative ${
                    isUser
                      ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-br-md'
                      : 'glass-card-static text-gray-200 rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{renderFormattedText(msg.text)}</div>
                </div>
                <span className={`text-[10px] text-gray-600 mt-1.5 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                  {isUser ? 'You' : 'Haven'} · just now
                </span>
              </div>
              {isUser && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-5 bg-gradient-to-br from-gray-600 to-gray-700">
                  <i className="fas fa-user text-gray-300 text-sm"></i>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-end gap-3 justify-start animate-[fadeIn_0.3s_ease-out]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-5" style={{ background: 'linear-gradient(135deg, #0D9488, #2DD4BF)' }}>
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            <div className="flex flex-col">
              <div className="glass-card-static rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-gray-500">Haven is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="glass-card-static flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-transparent text-gray-200 p-3 resize-none focus:outline-none placeholder:text-gray-600 text-sm"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '44px', maxHeight: '150px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="glow-button rounded-xl w-10 h-10 flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0 mb-1 ripple"
          >
            <i className="fas fa-paper-plane text-sm relative z-10"></i>
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center">
          <i className="fas fa-shield-alt mr-1"></i>
          Your messages are analyzed in real-time. Press Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;