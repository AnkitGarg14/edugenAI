import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const CitationBadge = ({ citation, index }) => (
  <Link 
    to={`/documents/${citation.documentId}`}
    className="inline-flex items-center gap-1 px-2 py-0.5 ml-1 bg-accent/20 text-accent rounded hover:bg-accent/30 text-xs font-semibold cursor-pointer transition-colors"
    title={citation.textSnippet}
  >
    [{index + 1}]
  </Link>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
          ${isUser ? 'bg-primary-500 text-white' : 'bg-slate-800 text-accent border border-accent/30'}`}
        >
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-sm font-medium text-slate-300">
              {isUser ? 'You' : 'EduGen AI'}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`px-5 py-4 rounded-2xl ${
            isUser 
              ? 'bg-primary-600 text-white rounded-tr-sm shadow-md shadow-primary-900/20' 
              : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm shadow-md'
          }`}>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed
              prose-p:last:mb-0 prose-p:first:mt-0 
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary-300 prose-code:bg-slate-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            {/* Citations */}
            {!isUser && message.citations && message.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2 font-medium">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((cit, idx) => (
                    <CitationBadge key={idx} citation={cit} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
