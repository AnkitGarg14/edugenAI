const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { getIndex } = require('../config/pinecone');
const crypto = require('crypto');

class EmbeddingService {
  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    });
    
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async generateEmbeddings(text) {
    return await this.embeddings.embedQuery(text);
  }

  async chunkDocuments(documents) {
    return await this.textSplitter.splitDocuments(documents);
  }

  async storeInPinecone(chunks, documentId, userId) {
    const index = getIndex();
    
    const records = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].pageContent;
      
      // Skip empty chunks
      if (!chunk || chunk.trim() === '') {
        console.warn(`[Embedding Service] Skipping empty chunk at index ${i}`);
        continue;
      }

      const metadata = chunks[i].metadata || {};
      const vector = await this.generateEmbeddings(chunk);
      
      // Verify generateEmbeddings returns a non-empty numeric vector
      if (!vector || !Array.isArray(vector) || vector.length === 0 || typeof vector[0] !== 'number') {
        console.error(`[Embedding Service] Invalid vector generated for chunk ${i}:`, vector);
        continue; // Skip this chunk if the vector is invalid
      }
      
      console.log(`[Embedding Service] Generated embedding for chunk ${i}, length: ${vector.length}`);

      const rawMetadata = {
        documentId: documentId.toString(),
        userId: userId.toString(),
        text: chunk,
        chunkIndex: i,
        pageNumber: metadata.loc?.pageNumber || metadata.pageNumber || null
      };

      // Remove null or undefined fields for Pinecone compatibility
      const cleanMetadata = Object.fromEntries(
        Object.entries(rawMetadata).filter(([_, v]) => v != null)
      );

      records.push({
        id: crypto.randomUUID(),
        values: vector,
        metadata: cleanMetadata
      });
    }

    console.log(`[Embedding Service] Prepared ${records.length} records for Pinecone.`);
    
    if (records.length === 0) {
      throw new Error('PineconeArgumentError: Must pass in at least 1 record to upsert (0 valid records prepared).');
    }

    console.log(`[Embedding Service] First record preview:`, {
      id: records[0].id,
      valuesLength: records[0].values.length,
      metadata: records[0].metadata
    });

    const upsertResponse = await index.upsert({ records });
    console.log(`[Embedding Service] Pinecone upsert response:`, upsertResponse);
  }

  async searchPinecone(queryVector, documentIds, userId, topK = 5) {
    const index = getIndex();
    
    console.log(`[Embedding Service] Query embedding length:`, queryVector?.length);

    const filter = {
      userId: { $eq: userId.toString() }
    };

    if (documentIds && documentIds.length > 0) {
      filter.documentId = { $in: documentIds.map(id => id.toString()) };
    }

    try {
      const queryRequest = {
        vector: queryVector,
        topK,
        filter,
        includeMetadata: true,
      };

      console.log(`[Embedding Service] Exact Pinecone query request:`, JSON.stringify({ ...queryRequest, vector: '[omitted]' }, null, 2));

      const searchResults = await index.query(queryRequest);

      console.log(`[Embedding Service] Pinecone complete response (omitting vectors):`, JSON.stringify({
        ...searchResults,
        matches: searchResults.matches?.map(m => ({ ...m, values: m.values ? '[omitted]' : undefined }))
      }, null, 2));
      console.log(`[Embedding Service] Number of matches:`, searchResults.matches?.length || 0);

      if (searchResults.matches && searchResults.matches.length > 0) {
        searchResults.matches.forEach((match, i) => {
          console.log(`[Embedding Service] Match ${i} score:`, match.score);
          console.log(`[Embedding Service] Match ${i} metadata:`, match.metadata);
        });
      } else {
        console.warn(`[Embedding Service] Zero matches returned with filters. Testing without filters to debug...`);
        const searchResultsNoFilter = await index.query({
          vector: queryVector,
          topK,
          includeMetadata: true,
        });
        console.log(`[Embedding Service] Number of matches WITHOUT filters:`, searchResultsNoFilter.matches?.length || 0);
      }

      return searchResults.matches.map(match => ({
        id: match.id,
        score: match.score,
        payload: match.metadata
      }));
    } catch (err) {
      console.error('Pinecone search error:', err);
      return [];
    }
  }
}

module.exports = new EmbeddingService();
