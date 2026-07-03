const { CODING_COACH_PROMPT } = require('../prompts/codingCoach.prompt');
const { generateStructuredResponse } = require('../utils/aiUtils');

const analyzeCode = async (code, language) => {
  let prompt = CODING_COACH_PROMPT
    .replace('{language}', language || 'Unknown')
    .replace('{code}', code);

  const validator = (data) => {
    if (!data.summary || !data.explanation) {
      throw new Error("Missing required fields: summary, explanation");
    }
  };

  return await generateStructuredResponse(prompt, validator, 'object');
};

module.exports = { analyzeCode };
