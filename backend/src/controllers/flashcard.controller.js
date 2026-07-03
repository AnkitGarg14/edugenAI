const Flashcard = require('../models/Flashcard');
const { generateFlashcards: generateFlashcardsService } = require('../ai/services/flashcardService');

const generateFlashcards = async (req, res, next) => {
  try {
    const { topic, documentIds } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const flashcards = await generateFlashcardsService(req.user._id, topic, documentIds);
    
    res.status(201).json(flashcards);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getFlashcardSets = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getFlashcardSetById = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({ _id: req.params.id, owner: req.user._id });
    if (!flashcardSet) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }
    res.status(200).json(flashcardSet);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const updateFlashcardSet = async (req, res, next) => {
  try {
    const { category, topic } = req.body;
    const flashcardSet = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { category, topic } },
      { new: true }
    );
    if (!flashcardSet) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }
    res.status(200).json(flashcardSet);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const updateCardProgress = async (req, res, next) => {
  try {
    const { isBookmarked, status, nextReviewDate } = req.body;
    const { id, cardId } = req.params;

    const flashcardSet = await Flashcard.findOne({ _id: id, owner: req.user._id });
    if (!flashcardSet) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    const card = flashcardSet.cards.id(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (isBookmarked !== undefined) card.isBookmarked = isBookmarked;
    if (status) card.status = status;
    if (nextReviewDate) card.nextReviewDate = nextReviewDate;

    await flashcardSet.save();
    res.status(200).json(card);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!flashcardSet) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }
    res.status(200).json({ message: 'Flashcard set deleted' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  generateFlashcards,
  getFlashcardSets,
  getFlashcardSetById,
  updateFlashcardSet,
  updateCardProgress,
  deleteFlashcardSet
};
