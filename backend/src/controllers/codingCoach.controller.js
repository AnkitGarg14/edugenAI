const { analyzeCode } = require('../ai/services/codingCoachService');

const analyze = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Code is required for analysis' });
    }

    const analysis = await analyzeCode(code, language);
    
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  analyze
};
