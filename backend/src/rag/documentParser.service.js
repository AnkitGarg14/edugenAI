const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { DocxLoader } = require('@langchain/community/document_loaders/fs/docx');
const { Document } = require('@langchain/core/documents');
const crypto = require('crypto');

const downloadFile = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return response.data;
};

const parseDocument = async (fileUrl, format) => {
  let tempFilePath = '';
  try {
    const buffer = await downloadFile(fileUrl);
    
    // Create a unique temporary file
    const tmpDir = os.tmpdir();
    tempFilePath = path.join(tmpDir, `edugen-${crypto.randomUUID()}.${format}`);
    await fs.writeFile(tempFilePath, buffer);

    let docs = [];

    switch (format.toLowerCase()) {
      case 'pdf': {
        const loader = new PDFLoader(tempFilePath, { splitPages: true });
        docs = await loader.load();
        break;
      }
      case 'docx': {
        const loader = new DocxLoader(tempFilePath);
        docs = await loader.load();
        break;
      }
      case 'txt': {
        const textContent = await fs.readFile(tempFilePath, 'utf8');
        docs = [new Document({ pageContent: textContent, metadata: { source: tempFilePath, loc: { pageNumber: 1 } } })];
        break;
      }
      case 'ppt':
      case 'pptx':
        throw new Error('Presentations are not fully supported natively yet.');
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Clean up empty docs
    return docs.filter(doc => doc.pageContent && doc.pageContent.trim().length > 0);
  } catch (error) {
    console.error(`Error parsing document: ${error.message}`);
    throw error;
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(err => console.error('Error removing temp file:', err));
    }
  }
};

module.exports = {
  parseDocument,
};
