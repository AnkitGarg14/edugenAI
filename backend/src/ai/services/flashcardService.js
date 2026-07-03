const Flashcard = require('../../models/Flashcard');
const embeddingService = require('../../rag/embeddings.service');
const { FLASHCARD_PROMPT } = require('../prompts/flashcard.prompt');
const { generateStructuredResponse } = require('../utils/aiUtils');

const generateFlashcards = async (userId, topic, documentIds = []) => {
  let context = '';
  if (documentIds && documentIds.length > 0) {
    const queryVector = await embeddingService.generateEmbeddings(topic);
    const searchResults = await embeddingService.searchPinecone(queryVector, documentIds, userId, 5);
    
    if (searchResults && searchResults.length > 0) {
      for (const res of searchResults) {
        if (res.score > 0.5) context += `\n\n${res.payload.text}`;
      }
    }
  }

  let prompt = FLASHCARD_PROMPT
    .replace('{topic}', topic)
    .replace('{context}', context);

  const validator = (data) => {
    if (!data.category || !Array.isArray(data.cards)) {
      throw new Error("Missing required fields: category, cards array");
    }
  };

  const parsedData = await generateStructuredResponse(prompt, validator, 'object');

  // Determine source document string if active documents exist
  let sourceDocumentStr = null;
  if (documentIds && documentIds.length > 0) {
    sourceDocumentStr = `${documentIds.length} Document(s)`;
  }

  const flashcardSet = await Flashcard.create({
    owner: userId,
    topic,
    category: parsedData.category || 'General',
    sourceDocument: sourceDocumentStr,
    generatedContent: JSON.stringify(parsedData),
    cards: Array.isArray(parsedData.cards) ? parsedData.cards : []
  });

  return flashcardSet;
};

module.exports = { generateFlashcards };
