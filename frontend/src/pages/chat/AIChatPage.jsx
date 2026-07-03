import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, fetchMessages, sendMessage, setCurrentChat, createNewChat } from '../../redux/slices/chatSlice';
import { fetchDocuments } from '../../redux/slices/documentSlice';
import MessageBubble from '../../components/chat/MessageBubble';
import { Send, Plus, MessageSquare, FileText, Bot, Loader2, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';

const AIChatPage = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const { chats, messages, currentChatId, messageLoading } = useSelector((state) => state.chat);
  const { documents } = useSelector((state) => state.documents);
  
  // Only show embedded docs for RAG selection
  const embeddedDocs = documents.filter(doc => doc.status === 'embedded');
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    dispatch(fetchChats());
    dispatch(fetchDocuments());
  }, [dispatch]);

  useEffect(() => {
    if (currentChatId) {
      dispatch(fetchMessages(currentChatId));
    }
  }, [dispatch, currentChatId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messageLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || messageLoading) return;
    
    const question = input.trim();
    setInput('');
    
    // We optimistically dispatch the user message in a real app to show it immediately.
    // Here we just rely on the API returning both or just the AI for simplicity,
    // actually, let's use the thunk payload to update the UI later, but for now we dispatch standard.
    
    dispatch(sendMessage({
      chatId: currentChatId,
      question,
      documentIds: selectedDocs
    }));
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 max-w-[1600px] mx-auto pb-4">
      
      {/* Sidebar: Chat History */}
      <div className="w-80 glass-panel flex flex-col overflow-hidden shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-700/50">
          <Button 
            className="w-full flex items-center justify-center gap-2 bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20"
            onClick={() => dispatch(createNewChat())}
          >
            <Plus size={18} /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Chats</h3>
          {chats.map(chat => (
            <button
              key={chat._id}
              onClick={() => dispatch(setCurrentChat(chat._id))}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all
                ${currentChatId === chat._id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <MessageSquare size={16} className={currentChatId === chat._id ? 'text-primary-400' : ''} />
              <span className="truncate text-sm font-medium">{chat.title}</span>
            </button>
          ))}
          {chats.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No chat history</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        
        {/* Header / Document Selector */}
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                EduGen AI Tutor <Sparkles className="text-accent" size={14} />
              </h2>
              <p className="text-xs text-slate-400">Ask questions about your uploaded documents</p>
            </div>
          </div>
          
          <div className="relative group">
            <Button variant="secondary" className="text-sm flex items-center gap-2 border-slate-600">
              <FileText size={16} /> 
              {selectedDocs.length > 0 ? `${selectedDocs.length} Docs Selected` : 'Select Documents'}
            </Button>
            {/* Dropdown for documents */}
            <div className="absolute right-0 top-full mt-2 w-72 glass-panel p-2 hidden group-hover:block z-50">
              <p className="text-xs text-slate-400 px-2 py-1 mb-1 font-medium uppercase tracking-wider">Available Context</p>
              {embeddedDocs.length > 0 ? (
                embeddedDocs.map(doc => (
                  <label key={doc._id} className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.includes(doc._id)}
                      onChange={() => toggleDocSelection(doc._id)}
                      className="rounded border-slate-600 text-primary-500 focus:ring-primary-500 bg-slate-900"
                    />
                    <span className="text-sm text-slate-200 truncate">{doc.title}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-500 p-2">No processed documents available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary-500/10 text-primary-400 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">How can I help you learn today?</h3>
              <p className="text-slate-400 mb-8">
                Select your documents from the top right, and ask me anything about them. I'll search through your materials and provide exact citations!
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              
              {messageLoading && (
                <div className="flex items-center gap-3 text-slate-400 mb-6 max-w-4xl mx-auto w-full">
                   <div className="w-10 h-10 bg-slate-800 text-accent border border-accent/30 rounded-full flex items-center justify-center shrink-0">
                     <Bot size={20} />
                   </div>
                   <div className="flex gap-1.5 px-5 py-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                     <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                     <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedDocs.length > 0 ? "Ask a question about selected documents..." : "Ask me anything..."}
              disabled={messageLoading}
              className="w-full bg-slate-800 border border-slate-600 rounded-2xl pl-6 pr-16 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || messageLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
            >
              {messageLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-[10px] text-slate-500">AI can make mistakes. Consider verifying important information.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIChatPage;
