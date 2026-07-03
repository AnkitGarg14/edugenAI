require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const embeddingService = require('./src/rag/embeddings.service');

async function testRetrieval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the doc we embedded previously
    const doc = await Document.findOne({ status: 'embedded' });
    if (!doc) {
      console.log('No embedded document found.');
      process.exit(0);
    }
    
    console.log('Found embedded doc:', doc._id, 'Title:', doc.title);
    
    const question = "What is encapsulation?";
    console.log('Question:', question);

    const queryVector = await embeddingService.generateEmbeddings(question);
    console.log('Query Vector Length:', queryVector.length);

    console.log('Searching Pinecone...');
    
    const index = require('./src/config/pinecone').getIndex();
    
    const filter = {
      userId: { $eq: doc.owner.toString() },
      documentId: { $in: [doc._id.toString()] }
    };
    
    console.log('Filter:', filter);
    
    const results = await index.query({
      vector: queryVector,
      topK: 5,
      filter,
      includeMetadata: true
    });
    
    console.log(`Got ${results.matches?.length} matches.`);
    if (results.matches && results.matches.length > 0) {
      results.matches.forEach((m, i) => {
        console.log(`Match ${i} Score:`, m.score);
        console.log(`Match ${i} Metadata keys:`, Object.keys(m.metadata || {}));
      });
    } else {
      console.log('No matches with filter. Trying without filter...');
      const resultsNoFilter = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true
      });
      console.log(`Got ${resultsNoFilter.matches?.length} matches without filter.`);
      if (resultsNoFilter.matches && resultsNoFilter.matches.length > 0) {
        resultsNoFilter.matches.forEach((m, i) => {
          console.log(`Match ${i} Score:`, m.score);
          console.log(`Match ${i} Metadata:`, m.metadata);
        });
      }
    }
    
  } catch (err) {
    console.error('Test retrieval error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testRetrieval();
