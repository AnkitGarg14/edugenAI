import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, Check, FileText } from 'lucide-react';
import 'katex/dist/katex.min.css';



const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full py-6 px-4 md:px-8 transition-colors ${isUser ? 'bg-transparent' : 'bg-slate-50 dark:bg-dark-surface/30'}`}>
      <div className="flex w-full max-w-4xl mx-auto gap-4 md:gap-6">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' 
            : 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-light-text dark:text-dark-text">
              {isUser ? 'You' : 'EduGen Tutor'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-800 prose-pre:p-0 prose-p:leading-relaxed prose-a:text-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  
                  return !inline && match ? (
                    <div className="rounded-lg overflow-hidden my-4 border border-slate-700/50">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs text-slate-400 border-b border-slate-700/50">
                        <span>{match[1]}</span>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className={`${className} bg-slate-200 dark:bg-slate-800 text-primary dark:text-primary-light px-1.5 py-0.5 rounded text-sm`}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {message.citations.map((cite, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:border-primary cursor-pointer transition-colors">
                  <FileText size={12} className="text-primary" />
                  <span className="truncate max-w-[150px]">{cite.documentTitle}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Action Bar */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-200 dark:border-slate-700/50">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-light-text dark:text-slate-400 dark:hover:text-dark-text transition-colors"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
