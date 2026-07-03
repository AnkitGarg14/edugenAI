require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require('@pinecone-database/pinecone');
const crypto = require('crypto');

async function testPipeline() {
  console.log("=== Phase 1: Gemini & Embeddings Verification ===");
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API Key found!");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let testVector = null;
  try {
    console.log("1. Initializing Gemini Embedding Model (gemini-embedding-001)...");
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    
    console.log("2. Generating test embedding...");
    const result = await model.embedContent("This is a test document for Pinecone storage.");
    testVector = result.embedding.values;
    console.log(`Success! Vector length: ${testVector.length}`);
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    process.exit(1);
  }

  console.log("\n=== Phase 2: Pinecone Integration ===");
  try {
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX;
    const pineconeHost = process.env.PINECONE_HOST;

    if (!pineconeApiKey || !pineconeIndexName) {
      console.error("Missing Pinecone credentials in .env");
      process.exit(1);
    }

    console.log(`1. Connecting to Pinecone...`);
    const pineconeClient = new Pinecone({
      apiKey: pineconeApiKey,
    });

    const index = pineconeHost ? pineconeClient.index(pineconeIndexName, pineconeHost) : pineconeClient.index(pineconeIndexName);
    
    console.log("2. Inserting test vector...");
    const pointId = crypto.randomUUID();
    await index.upsert({
      records: [{
        id: pointId,
        values: testVector,
        metadata: {
          text: "This is a test document for Pinecone storage.",
          documentId: "test-doc-123",
          userId: "test-user-456"
        }
      }]
    });
    console.log("Vector inserted successfully.");

    // wait a moment for pinecone to ingest
    console.log("Waiting 3 seconds for index to update...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("3. Performing vector search...");
    const searchResults = await index.query({
      vector: testVector,
      topK: 1,
      includeMetadata: true
    });

    console.log("Search Results:", searchResults.matches.length > 0 ? "Found match!" : "No match found.");
    if (searchResults.matches.length > 0) {
      console.log(`Score: ${searchResults.matches[0].score}, Metadata:`, searchResults.matches[0].metadata);
    }

    console.log("4. Cleaning up test vector...");
    await index.deleteOne(pointId);
    console.log("Cleanup complete.");

  } catch (error) {
    console.error("Pinecone Integration Error:", error);
    process.exit(1);
  }

  console.log("\nAll pipeline tests completed successfully.");
  process.exit(0);
}

testPipeline();
