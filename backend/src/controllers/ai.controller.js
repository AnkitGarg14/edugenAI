const chatService = require('../ai/services/chatService');
const ragService = require('../rag/rag.service');

const processDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    res.status(202).json({ message: 'Document processing started in background' });
    
    ragService.processDocument(documentId, req.user._id).catch(err => {
      console.error('Background processing failed:', err);
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const askQuestion = async (req, res, next) => {
  try {
    const { chatId, question, documentIds } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const result = await chatService.askQuestion(chatId, req.user._id, question, documentIds);
    res.status(200).json(result);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getChats = async (req, res, next) => {
  try {
    const chats = await chatService.getChats(req.user._id);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.params.chatId, req.user._id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  processDocument,
  askQuestion,
  getChats,
  getMessages,
};
