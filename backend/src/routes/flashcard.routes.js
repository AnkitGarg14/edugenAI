const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { generateFlashcards, getFlashcardSets, getFlashcardSetById, updateFlashcardSet, updateCardProgress, deleteFlashcardSet } = require('../controllers/flashcard.controller');

router.use(protect);

router.post('/generate', generateFlashcards);
router.get('/', getFlashcardSets);
router.get('/:id', getFlashcardSetById);
router.put('/:id', updateFlashcardSet);
router.put('/:id/cards/:cardId', updateCardProgress);
router.delete('/:id', deleteFlashcardSet);

module.exports = router;
