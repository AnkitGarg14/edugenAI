import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Explain Simpler', icon: <Sparkles size={14} /> },
];

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message, null);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAction = (actionLabel) => {
    if (disabled) return;
    
    onSend(message || `Please provide a ${actionLabel.toLowerCase()} for the current topic.`, actionLabel);
    setMessage('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-6 pt-2 relative">
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action.label)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium 
                     bg-white dark:bg-dark-surface border border-gray-200 dark:border-slate-700 
                     text-slate-600 dark:text-slate-300 hover:border-primary dark:hover:border-primary 
                     hover:text-primary dark:hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="glass-panel overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask your AI Tutor anything..."
            className="w-full max-h-[200px] min-h-[56px] py-4 pl-4 pr-12 bg-transparent text-light-text dark:text-dark-text placeholder-slate-400 focus:outline-none resize-none custom-scrollbar"
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-colors shadow-sm flex items-center justify-center"
          >
            <Send size={18} className={message.trim() && !disabled ? 'ml-0.5' : ''} />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            AI Tutor can make mistakes. Consider verifying important information.
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
