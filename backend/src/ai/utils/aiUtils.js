const { initializeGemini } = require('../langchain.setup');

/**
 * Extracts raw JSON from a string that might contain markdown fences or conversational text.
 * @param {string} text - The raw AI output.
 * @param {string} type - 'object' or 'array' to help narrow down the outermost brackets.
 * @returns {string} The cleaned JSON string.
 */
const extractJson = (text, type = 'object') => {
  const startChar = type === 'array' ? '[' : '{';
  const endChar = type === 'array' ? ']' : '}';
  
  const firstMatch = text.indexOf(startChar);
  const lastMatch = text.lastIndexOf(endChar);
  
  if (firstMatch !== -1 && lastMatch !== -1 && lastMatch > firstMatch) {
    return text.substring(firstMatch, lastMatch + 1);
  }
  return text;
};

/**
 * Generates a structured JSON response from Gemini, including automatic retries and validation.
 * @param {string} prompt - The completed prompt to send.
 * @param {Function} validator - A function that throws an Error if the parsed data is invalid.
 * @param {string} expectedType - 'object' or 'array'
 * @param {number} maxTokens - Max output tokens to configure.
 * @returns {Promise<any>} The parsed and validated JSON object/array.
 */
const generateStructuredResponse = async (prompt, validator, expectedType = 'object', maxTokens = 8192) => {
  // Use centralized initializeGemini
  const { model } = initializeGemini(maxTokens);

  let parsedData = null;
  let attempt = 0;
  const maxAttempts = 2;
  let currentPrompt = prompt;

  while (attempt < maxAttempts && !parsedData) {
    attempt++;
    try {
      const aiResponse = await model.invoke(currentPrompt);
      let rawContent = aiResponse.content.trim();
      
      console.log(`\n--- [AI Generation] Attempt ${attempt} ---`);
      console.log(`Raw Output:\n`, rawContent);
      
      const cleanedJson = extractJson(rawContent, expectedType);
      console.log(`Cleaned JSON:\n`, cleanedJson);
      
      parsedData = JSON.parse(cleanedJson);
      
      if (validator) {
        validator(parsedData);
      }
      
      console.log(`Validation Success!`);
      
    } catch (err) {
      console.error(`Parse/Validation Error on Attempt ${attempt}:`, err.message);
      if (attempt >= maxAttempts) {
        throw new Error("Failed to generate a valid structured response from AI after multiple attempts. Reason: " + err.message);
      }
      // Apply stricter prompt for retry
      currentPrompt = `You MUST return ONLY a valid JSON ${expectedType}. Do not include markdown formatting, markdown code fences (like \`\`\`json), or any conversational text. Just the raw JSON.\n\n` + prompt;
    }
  }

  return parsedData;
};

module.exports = {
  extractJson,
  generateStructuredResponse
};
