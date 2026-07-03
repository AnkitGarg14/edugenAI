require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Chat = require('./src/models/Chat');
const { generateStudyPlan } = require('./src/ai/services/studyPlannerService');
const { generateQuiz } = require('./src/ai/services/quizService');
const { generateFlashcards } = require('./src/ai/services/flashcardService');
const { askQuestion } = require('./src/ai/services/chatService');
const { analyzeCode } = require('./src/ai/services/codingCoachService');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    let user = await User.findOne({ email: 'testai@example.com' });
    if (!user) {
      user = await User.create({ name: 'Test AI', email: 'testai@example.com', password: 'password123' });
    }

    let chat = await Chat.findOne({ owner: user._id });
    if (!chat) {
      chat = await Chat.create({ owner: user._id, title: 'Test Chat' });
    }

    console.log("\n=== Testing AI Tutor ===");
    const chatRes = await askQuestion(chat._id, user._id, "What is photosynthesis in one sentence?");
    console.log("AI Tutor Reply:", chatRes.message.content);
    await sleep(5000);

    console.log("\n=== Testing Study Planner ===");
    const studyPlan = await generateStudyPlan(user._id, { subjects: "Math", availableHours: 5 });
    console.log("Study Plan Title:", studyPlan.title);
    console.log("Study Plan Tasks:", studyPlan.dailyTasks.length);
    await sleep(5000);

    console.log("\n=== Testing Quiz Generator ===");
    const quiz = await generateQuiz(chat._id, user._id, { topic: "Science", numQuestions: 2, difficulty: "easy" });
    console.log("Quiz Output:", quiz.message.content);
    await sleep(5000);

    console.log("\n=== Testing Flashcards ===");
    const flashcards = await generateFlashcards(chat._id, user._id, "JavaScript Basics");
    console.log("Flashcards Output:", flashcards.message.content);
    await sleep(5000);

    console.log("\n=== Testing Coding Coach ===");
    const codeAnalysis = await analyzeCode("function add(a, b) { return a + b }", "javascript");
    console.log("Code Summary:", codeAnalysis.summary);

    console.log("\n=== All Tests Passed! ===");
  } catch (err) {
    console.error("Test Failed:", err);
  } finally {
    mongoose.disconnect();
  }
}

testAI();
