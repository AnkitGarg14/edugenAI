const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  documentTitle: String,
  textSnippet: String,
});

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  citations: [citationSchema],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
