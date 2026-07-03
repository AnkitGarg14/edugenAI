import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardApi } from '../../services/flashcardApi';
import { ArrowLeft, CheckCircle2, Bookmark, BookmarkCheck, RotateCcw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useStudySession } from '../../hooks/useStudySession';

const FlashcardStudyPage = () => {
  useStudySession('Flashcards');
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('all'); // all, revision, bookmarked

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (deck) {
      filterCards(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, mode]);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getFlashcardSetById(id);
      setDeck(data);
    } catch (error) {
      console.error('Failed to fetch deck:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCards = (selectedMode) => {
    setIsFlipped(false);
    setCurrentIndex(0);
    
    if (selectedMode === 'all') {
      setCards(deck.cards);
    } else if (selectedMode === 'revision') {
      // Show cards that are new, learning, or where nextReviewDate has passed
      const now = new Date();
      setCards(deck.cards.filter(c => c.status !== 'mastered' || new Date(c.nextReviewDate) <= now));
    } else if (selectedMode === 'bookmarked') {
      setCards(deck.cards.filter(c => c.isBookmarked));
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150); // wait for flip animation
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  const updateCardStatus = async (status) => {
    const card = cards[currentIndex];
    
    // Spaced repetition logic (simplified)
    let nextReviewDate = new Date();
    if (status === 'mastered') {
      nextReviewDate.setDate(nextReviewDate.getDate() + 3); // review in 3 days
    } else if (status === 'learning') {
      nextReviewDate.setHours(nextReviewDate.getHours() + 4); // review in 4 hours
    }

    try {
      const updatedCard = await flashcardApi.updateCardProgress(deck._id, card._id, { status, nextReviewDate });
      
      // Update local state
      const updatedDeckCards = deck.cards.map(c => c._id === card._id ? updatedCard : c);
      setDeck({ ...deck, cards: updatedDeckCards });
      
      // Move to next card
      handleNext();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const toggleBookmark = async (e) => {
    e.stopPropagation();
    const card = cards[currentIndex];
    try {
      const updatedCard = await flashcardApi.updateCardProgress(deck._id, card._id, { isBookmarked: !card.isBookmarked });
      
      // Update local state
      const updatedDeckCards = deck.cards.map(c => c._id === card._id ? updatedCard : c);
      setDeck({ ...deck, cards: updatedDeckCards });
      
      // If we are in bookmarked mode and we unbookmarked, we should probably remove it from the view
      if (mode === 'bookmarked' && !updatedCard.isBookmarked) {
        setCards(cards.filter(c => c._id !== card._id));
        if (currentIndex >= cards.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      } else {
        setCards(cards.map(c => c._id === card._id ? updatedCard : c));
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading deck...</div>;
  if (!deck) return <div className="p-8 text-center text-rose-500">Deck not found.</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in flex flex-col min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => navigate('/flashcards')}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Decks
          </button>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">{deck.topic}</h1>
        </div>
        
        {/* Mode Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'all' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-slate-500'}`}
          >
            All
          </button>
          <button 
            onClick={() => setMode('revision')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'revision' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Revision
          </button>
          <button 
            onClick={() => setMode('bookmarked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'bookmarked' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Saved
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
          <AlertCircle size={48} className="mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Cards Found</h2>
          <p>There are no cards matching the current mode ({mode}).</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
          
          {/* Progress Bar */}
          <div className="w-full mb-6">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard 3D Container */}
          <div 
            className="w-full h-80 md:h-96 perspective-1000 mb-8 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden glass-panel flex flex-col shadow-xl hover:shadow-2xl transition-shadow border-primary/20 hover:border-primary/50">
                <div className="flex justify-between p-4 pb-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">Front</span>
                  <button onClick={toggleBookmark} className="text-slate-400 hover:text-amber-500 p-1 z-10">
                    {currentCard.isBookmarked ? <BookmarkCheck className="text-amber-500" /> : <Bookmark />}
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-8 text-center text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {currentCard.front}
                </div>
                <div className="p-4 pt-0 text-center text-xs text-slate-400 uppercase tracking-widest font-medium group-hover:text-primary transition-colors">
                  Click to Flip
                </div>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 glass-panel flex flex-col shadow-xl border-emerald-500/30">
                <div className="flex justify-between p-4 pb-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Back</span>
                  <button onClick={toggleBookmark} className="text-slate-400 hover:text-amber-500 p-1 z-10">
                    {currentCard.isBookmarked ? <BookmarkCheck className="text-amber-500" /> : <Bookmark />}
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-8 text-center text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar">
                  {currentCard.back}
                </div>
              </div>

            </div>
          </div>

          {/* Controls */}
          <div className="w-full flex justify-between items-center mb-6">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft size={24} />
            </button>

            {isFlipped ? (
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateCardStatus('learning'); }}
                  className="px-6 py-3 rounded-xl font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={18} /> Needs Review
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); updateCardStatus('mastered'); }}
                  className="px-6 py-3 rounded-xl font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={18} /> Got It!
                </button>
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400">
                Flip card to mark progress
              </div>
            )}

            <button 
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-opacity"
            >
              <ChevronRight size={24} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default FlashcardStudyPage;
