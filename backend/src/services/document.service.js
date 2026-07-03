const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, format) => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Let Cloudinary auto-detect (prevents 403s on PDFs/DOCX)
        folder: 'edugen_docs',
        format: format
      },
      (error, result) => {
        if (error) {
          console.error("========== CLOUDINARY ERROR ==========");
          console.dir(error, { depth: null });
          console.error("======================================");
          return reject(error);
        }
        console.log(result);
        resolve (result);
      }
    );

    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

const uploadDocument = async (file, userId, title) => {
  console.log('[DocumentService] Starting uploadDocument');
  if (!file) {
    console.error('[DocumentService] Error: No file provided in request');
    throw new Error('No file provided');
  }

  // Extract format from originalname or mimetype
  const originalName = file.originalname;
  console.log(`[DocumentService] Original file name: ${originalName}`);
  const extMatch = originalName.match(/\.([^.]+)$/);
  const format = extMatch ? extMatch[1].toLowerCase() : 'txt';
  console.log(`[DocumentService] Parsed format: ${format}`);

  const validFormats = ['pdf', 'docx', 'txt', 'ppt', 'pptx'];
  if (!validFormats.includes(format)) {
    console.error(`[DocumentService] Invalid format detected: ${format}`);
    throw new Error('Invalid file format. Allowed: PDF, DOCX, TXT, PPT');
  }

  // Upload to Cloudinary
  console.log('[DocumentService] Uploading buffer to Cloudinary...');
  const result = await uploadToCloudinary(file.buffer, format);
  console.log(`[DocumentService] Cloudinary upload successful. URL: ${result.secure_url}`);

  // Save metadata to MongoDB
  console.log('[DocumentService] Saving document metadata to MongoDB...');
  const document = await Document.create({
    title: title || originalName,
    originalName: originalName,
    fileUrl: result.secure_url,
    cloudinaryId: result.public_id,
    format: format,
    sizeInBytes: file.size,
    owner: userId,
  });

  return document;
};

const getDocuments = async (userId, searchQuery = '') => {
  let query = { owner: userId };
  
  if (searchQuery) {
    // Basic regex search on title
    query.title = { $regex: searchQuery, $options: 'i' };
  }

  const documents = await Document.find(query).sort({ createdAt: -1 });
  return documents;
};

const getRecentDocuments = async (userId, limit = 5) => {
  const documents = await Document.find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return documents;
};

const getDocumentById = async (docId, userId) => {
  const document = await Document.findOne({ _id: docId, owner: userId });
  if (!document) {
    throw new Error('Document not found');
  }
  return document;
};

const deleteDocument = async (docId, userId) => {
  const document = await Document.findOne({ _id: docId, owner: userId });
  
  if (!document) {
    throw new Error('Document not found');
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(document.cloudinaryId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Proceed to delete from DB even if Cloudinary fails (or maybe not depending on strictness)
  }

  // Delete from MongoDB
  await document.deleteOne();
  return { message: 'Document removed successfully' };
};

const renameDocument = async (docId, userId, newTitle) => {
  const document = await Document.findOne({ _id: docId, owner: userId });
  
  if (!document) {
    throw new Error('Document not found');
  }

  document.title = newTitle;
  await document.save();
  return document;
};

module.exports = {
  uploadDocument,
  getDocuments,
  getRecentDocuments,
  getDocumentById,
  deleteDocument,
  renameDocument,
};
