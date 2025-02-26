const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Removed the unique constraint on userId
const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;
