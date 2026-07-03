import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { MessageSquare, Plus, Menu, X, Loader2, BrainCircuit } from 'lucide-react';
import { useStudySession } from '../hooks/useStudySession';

const TutorChat = () => {
  useStudySession('Chat');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef(null);


  // Parse chat ID from URL or location state if needed
  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const data = await aiService.getChats();
      setChats(data);
      if (data.length > 0 && !currentChatId) {
        setCurrentChatId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const data = await aiService.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text, action, config = null) => {
    if (!text.trim()) return;

    const tempId = Date.now().toString();
    const newUserMessage = {
      _id: tempId,
      role: 'user',
      content: action === 'Quiz' && config 
        ? `Generate a ${config.difficulty} ${config.quizType} quiz with ${config.numQuestions} questions about: ${text}`
        : text,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const result = await aiService.askQuestion(currentChatId, text, [], action, config);
      
      setMessages(prev => [...prev, result.message]);
      
      if (!currentChatId || currentChatId !== result.chatId) {
        setCurrentChatId(result.chatId);
        fetchChats(); // Refresh sidebar
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev, 
        { _id: 'error', role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0 pt-16' : '-translate-x-full pt-16'} md:relative md:translate-x-0 md:pt-0 z-50 w-64 bg-light-surface dark:bg-dark-surface border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 flex flex-col h-full`}>
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={startNewChat}
            className="flex-1 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          <button className="md:hidden ml-2 p-2 text-slate-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
          {chats.map(chat => (
            <button
              key={chat._id}
              onClick={() => {
                setCurrentChatId(chat._id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                currentChatId === chat._id 
                  ? 'bg-primary/10 text-primary dark:text-primary-light font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare size={16} />
              <span className="truncate">{chat.title || 'New Conversation'}</span>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="text-center px-4 py-8 text-sm text-slate-500">
              No previous chats found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center px-4 h-14 border-b border-gray-200 dark:border-slate-800 bg-light-surface dark:bg-dark-surface z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
            <Menu size={24} />
          </button>
          <span className="ml-2 font-medium">Tutor Chat</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-light-bg dark:bg-dark-bg">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                <BrainCircuit size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">How can I help you learn today?</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Ask a question, request a concept explanation, or try one of the quick actions below to get started.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((msg, index) => (
                <ChatMessage  key={msg._id || `${msg.role}-${index}`} message={msg} />
              ))}
              {loading && (
                <div className="flex w-full py-6 px-4 md:px-8 bg-slate-50 dark:bg-dark-surface/30">
                  <div className="flex w-full max-w-4xl mx-auto gap-4 md:gap-6 items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                      <Loader2 size={20} className="text-white animate-spin" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg pb-2 pt-6">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default TutorChat;
