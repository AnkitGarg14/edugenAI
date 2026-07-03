import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flashcardApi } from '../../services/flashcardApi';
import { Layers, Search, Folder, Trash2, PlayCircle, Plus, X, Loader2 } from 'lucide-react';

const FlashcardListPage = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getFlashcardSets();
      setDecks(data);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this flashcard deck?')) {
      try {
        await flashcardApi.deleteFlashcardSet(id);
        setDecks(decks.filter(d => d._id !== id));
      } catch (error) {
        console.error('Failed to delete deck:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    try {
      setGenerating(true);
      const newDeck = await flashcardApi.generateFlashcards({ topic });
      setDecks([newDeck, ...decks]);
      setShowModal(false);
      setTopic('');
      navigate(`/flashcards/${newDeck._id}`);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const categories = ['All', ...new Set(decks.map(d => d.category))];
  
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || deck.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading flashcards...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
            <Layers className="text-primary" size={32} />
            Flashcard Decks
          </h1>
          <p className="text-slate-500 mt-2">Review your flashcards and master your topics.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Deck
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search decks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredDecks.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <Layers className="text-slate-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Decks Found</h2>
          <p className="text-slate-500 mb-6">Generate your first flashcard deck to start studying.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Generate First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => {
            const masteredCount = deck.cards.filter(c => c.status === 'mastered').length;
            const progress = deck.cards.length > 0 ? (masteredCount / deck.cards.length) * 100 : 0;
            
            return (
              <Link key={deck._id} to={`/flashcards/${deck._id}`} className="block group">
                <div className="glass-panel h-full p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center gap-1">
                      <Folder size={12} /> {deck.category}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, deck._id)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2">
                    {deck.topic}
                  </h3>
                  
                  {deck.sourceDocument && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                      Source: {deck.sourceDocument}
                    </p>
                  )}
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                      <span>{masteredCount} / {deck.cards.length} Mastered</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm font-medium text-primary">
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Study Now
                      </span>
                      <PlayCircle size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-primary" />
                Generate Flashcard Deck
              </h2>
              <button onClick={() => !generating && setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., Javascript Concepts, Cellular Biology..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  disabled={generating}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => setShowModal(false)}
                disabled={generating}
                className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating...</>
                ) : (
                  <><Layers size={18} /> Generate</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;
