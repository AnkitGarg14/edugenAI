require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const ragService = require('./src/rag/rag.service');

async function testPipeline() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a document that is stuck in processing or failed
    const doc = await Document.findOne({ status: { $in: ['processing', 'failed', 'pending'] } });
    
    if (!doc) {
      console.log('No unprocessed documents found in DB. Getting any document...');
      const anyDoc = await Document.findOne();
      if (!anyDoc) {
        console.log('No documents in DB at all.');
        process.exit(0);
      }
      console.log('Found doc:', anyDoc);
      await ragService.processDocument(anyDoc._id, anyDoc.owner);
    } else {
      console.log('Found unprocessed doc:', doc);
      await ragService.processDocument(doc._id, doc.owner);
    }
    
  } catch (err) {
    console.error('Test pipeline error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testPipeline();
