const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  format: {
    type: String, // pdf, docx, txt, ppt
    required: true,
  },
  sizeInBytes: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'embedded', 'failed'],
    default: 'uploaded',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Add index for searching
documentSchema.index({ title: 'text', originalName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
