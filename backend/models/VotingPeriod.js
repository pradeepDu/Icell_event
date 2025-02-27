const mongoose = require('mongoose');

const votingPeriodSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  name: {
    type: String,
    required: true,
    default: "Voting Period"
  }
});

const VotingPeriod = mongoose.model('VotingPeriod', votingPeriodSchema);

module.exports = VotingPeriod;
