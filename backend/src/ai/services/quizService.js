const Quiz = require('../../models/Quiz');
const embeddingService = require('../../rag/embeddings.service');
const { QUIZ_PROMPT } = require('../prompts/quiz.prompt');
const { generateStructuredResponse } = require('../utils/aiUtils');

const generateQuiz = async (userId, config) => {
  const { numQuestions, difficulty, topic, documentIds = [], quizType = 'mixed' } = config;

  // 1. Search Vector DB for context if documents are selected
  let context = '';
  if (documentIds && documentIds.length > 0) {
    const queryVector = await embeddingService.generateEmbeddings(topic);
    const searchResults = await embeddingService.searchPinecone(queryVector, documentIds, userId, 5);

    if (searchResults && searchResults.length > 0) {
      for (const res of searchResults) {
        if (res.score > 0.5) {
          context += `\n\n${res.payload.text}`;
        }
      }
    }
  }

  // 2. Format Prompt
  let prompt = QUIZ_PROMPT
    .replace('{numQuestions}', numQuestions)
    .replace('{numQuestions}', numQuestions) // Second replace for the Instructions section
    .replace('{difficulty}', difficulty)
    .replace('{difficulty}', difficulty)
    .replace('{quizType}', quizType)
    .replace('{topic}', topic)
    .replace('{context}', context);

  // 3. Generate Structured Response
  const validator = (data) => {
    if (!Array.isArray(data)) {
      throw new Error("Quiz generation failed: Output is not an array");
    }
  };

  const parsedData = await generateStructuredResponse(prompt, validator, 'array');

  // Determine source document string if active documents exist
  let sourceDocumentStr = null;
  if (documentIds && documentIds.length > 0) {
    sourceDocumentStr = `${documentIds.length} Document(s)`;
  }

  // 4. Save Quiz
  const quiz = await Quiz.create({
    owner: userId,
    topic,
    difficulty,
    quizType,
    sourceDocument: sourceDocumentStr,
    generatedContent: JSON.stringify(parsedData), // Save raw JSON string for historical reference
    questions: parsedData
  });

  return quiz;
};

module.exports = { generateQuiz };
