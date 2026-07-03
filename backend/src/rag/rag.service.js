const Document = require('../models/Document');
const { parseDocument } = require('./documentParser.service');
const embeddingService = require('./embeddings.service');

const processDocument = async (documentId, userId) => {
  const document = await Document.findOne({ _id: documentId, owner: userId });
  
  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status === 'embedded') {
    return { message: 'Document is already processed' };
  }

  try {
    document.status = 'processing';
    await document.save();

    // 2. Extract LangChain Documents (preserving metadata)
    console.log(`[RAG Service] Parsing document ${documentId}...`);
    const docs = await parseDocument(document.fileUrl, document.format);
    
    console.log(`[RAG Service] Parsed ${docs?.length || 0} LangChain documents.`);
    if (!docs || docs.length === 0) {
      throw new Error('No text could be extracted from document');
    }

    // 3. Split Documents into smaller chunks (retains metadata)
    console.log(`[RAG Service] Chunking documents...`);
    const chunks = await embeddingService.chunkDocuments(docs);
    console.log(`[RAG Service] Generated ${chunks?.length || 0} chunks.`);

    if (!chunks || chunks.length === 0) {
      throw new Error('No chunks generated from document text');
    }

    // Validate chunks are LangChain Document objects and have pageContent
    for (let i = 0; i < chunks.length; i++) {
      if (!chunks[i].pageContent || chunks[i].pageContent.trim() === '') {
        console.warn(`[RAG Service] Warning: Chunk ${i} has empty pageContent`);
      }
    }

    // 4. Generate Embeddings & Store in Pinecone with Metadata
    console.log(`[RAG Service] Storing chunks in Pinecone...`);
    await embeddingService.storeInPinecone(chunks, document._id, userId);

    // 5. Update Status
    document.status = 'embedded';
    await document.save();

    return { message: 'Document processed and embedded successfully' };
  } catch (error) {
    console.error(`RAG Processing Error [Doc: ${documentId}]:`, error);
    document.status = 'failed';
    await document.save();
    throw error;
  }
};

module.exports = {
  processDocument,
};
