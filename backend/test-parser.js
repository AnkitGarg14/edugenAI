require('dotenv').config();
const { parseDocument } = require('./src/rag/documentParser.service');
const embeddingService = require('./src/rag/embeddings.service');

async function test() {
  try {
    const fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    console.log('Testing parseDocument with dummy PDF...');
    const docs = await parseDocument(fileUrl, 'pdf');
    console.log('Parsed docs:', docs);
    console.log('Number of docs:', docs.length);

    console.log('Testing chunkDocuments...');
    const chunks = await embeddingService.chunkDocuments(docs);
    console.log('Chunks:', chunks);
    console.log('Number of chunks:', chunks.length);

    console.log('Testing generateEmbeddings...');
    const vector = await embeddingService.generateEmbeddings(chunks[0].pageContent);
    console.log('Vector length:', vector.length);
    console.log('First 5 elements:', vector.slice(0, 5));
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
