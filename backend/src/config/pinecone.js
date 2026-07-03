const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;

const getPineconeClient = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log('Pinecone Client Initialized');
  }
  return pineconeClient;
};

const getIndex = () => {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX;
  const indexHostUrl = process.env.PINECONE_HOST;
  
  if (indexHostUrl) {
    return client.index(indexName, indexHostUrl);
  }
  return client.index(indexName);
};

module.exports = {
  getPineconeClient,
  getIndex
};
