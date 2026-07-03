const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  processDocument,
  askQuestion,
  getChats,
  getMessages
} = require('../controllers/ai.controller');

router.use(protect);

router.post('/process/:documentId', processDocument);
router.post('/chat', askQuestion);
router.get('/chats', getChats);
router.get('/chats/:chatId/messages', getMessages);

module.exports = router;
