const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Conversation',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activeDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
