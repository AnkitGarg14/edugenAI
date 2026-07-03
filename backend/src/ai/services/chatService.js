const Chat = require('../../models/Chat');
const Message = require('../../models/Message');
const embeddingService = require('../../rag/embeddings.service');
const { initializeGemini } = require('../langchain.setup');
const { BASE_TUTOR_PROMPT } = require('../prompts/chat.prompt');
const { getUserLearningProfile } = require('./progress.service');

const askQuestion = async (chatId, userId, question, documentIds = []) => {
  let chat = await Chat.findOne({ _id: chatId, owner: userId });
  
  if (!chat) {
    chat = await Chat.create({ owner: userId, title: question.substring(0, 30) + '...', activeDocuments: documentIds });
  } else if (documentIds.length > 0) {
    chat.activeDocuments = [...new Set([...chat.activeDocuments.map(id => id.toString()), ...documentIds])];
    await chat.save();
  }

  const historyMessages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).lean();
  let historyString = '';
  if (historyMessages.length > 0) {
    historyString = historyMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Tutor'}: ${msg.content}`).join('\n');
  }

  await Message.create({ chatId: chat._id, role: 'user', content: question });

  let searchResults = [];
  if (chat.activeDocuments && chat.activeDocuments.length > 0) {
    try {
      const queryVector = await embeddingService.generateEmbeddings(question);
      searchResults = await embeddingService.searchPinecone(queryVector, chat.activeDocuments, userId, 5);
    } catch (error) {
      console.error(`[ChatService] Failed to retrieve context from Pinecone:`, error.message);
      // Continue without context so chat doesn't crash completely
    }
  }

  let context = '';
  const citations = [];
  if (searchResults && searchResults.length > 0) {
    for (const res of searchResults) {
      if (res.score > 0.5) {
        const payload = res.payload;
        context += `\n\n--- Document Source ---\n${payload.text}`;
        
        let title = 'Source Document';
        if (payload.pageNumber) {
          title = `Page ${payload.pageNumber}`;
        }
        
        citations.push({
          documentId: payload.documentId,
          textSnippet: payload.text.substring(0, 100) + '...',
          documentTitle: title 
        });
      }
    }
  }

  let prompt = BASE_TUTOR_PROMPT
    .replace('{history}', historyString)
    .replace('{context}', context)
    .replace('{question}', question);

  const { model } = initializeGemini();
  const aiResponse = await model.invoke(prompt);

  const aiMessage = await Message.create({
    chatId: chat._id,
    role: 'assistant',
    content: aiResponse.content,
    citations,
  });

  chat.updatedAt = Date.now();
  await chat.save();

  return { message: aiMessage, chatId: chat._id };
};

const getChats = async (userId) => {
  return await Chat.find({ owner: userId }).sort({ updatedAt: -1 });
};

const getMessages = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, owner: userId });
  if (!chat) throw new Error('Chat not found');
  return await Message.find({ chatId }).sort({ createdAt: 1 });
};

module.exports = { askQuestion, getChats, getMessages };
