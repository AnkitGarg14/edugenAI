const documentService = require('../services/document.service');
const ragService = require('../rag/rag.service');

const upload = async (req, res, next) => {
  try {
    console.log('[DocumentController] Received upload request');
    const { title } = req.body;
    console.log(`[DocumentController] Title: ${title}`);
    console.log(`[DocumentController] req.file provided: ${!!req.file}`);
    
    const document = await documentService.uploadDocument(req.file, req.user._id, title);
    console.log(`[DocumentController] Document saved to MongoDB with ID: ${document._id}`);
    
    // Auto-trigger RAG processing in the background (fire and forget)
    ragService.processDocument(document._id, req.user._id).catch(async (err) => {
      console.error(`Background RAG processing failed for doc ${document._id}:`, err);
      // Ensure the document status reflects the failure if rag.service didn't catch it
      try {
        const Document = require('../models/Document');
        await Document.updateOne({ _id: document._id }, { status: 'failed' });
      } catch (updateErr) {
        console.error('Failed to update document status to failed:', updateErr);
      }
    });
    
    res.status(201).json(document);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const documents = await documentService.getDocuments(req.user._id, search);
    res.status(200).json(documents);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const documents = await documentService.getRecentDocuments(req.user._id, 5);
    res.status(200).json(documents);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user._id);
    res.status(200).json(document);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

const deleteDoc = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

const rename = async (req, res, next) => {
  try {
    const { title } = req.body;
    const document = await documentService.renameDocument(req.params.id, req.user._id, title);
    res.status(200).json(document);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

module.exports = {
  upload,
  getAll,
  getRecent,
  getById,
  deleteDoc,
  rename,
};
