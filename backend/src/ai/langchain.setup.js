const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { MemorySaver } = require('@langchain/langgraph');

const initializeGemini = (maxTokens = 2048) => {
  try {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      maxOutputTokens: maxTokens,
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    });
    
    // Memory for LangGraph
    const memory = new MemorySaver();
    
    return { model, memory };
  } catch (error) {
    console.error('Error initializing LangChain/Gemini:', error);
    throw error;
  }
};

module.exports = { initializeGemini };
