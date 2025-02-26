const mongoose = require('mongoose');

// Define the schema for Team Members
const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  post: { type: String, required: true },
  teamName: { type: String, required: true },
  isLeader: { type: Boolean, default: false }
});

// Ensure only one leader per team
TeamMemberSchema.pre('save', async function (next) {
  if (this.isLeader) {
    const existingLeader = await this.constructor.findOne({ teamName: this.teamName, isLeader: true });
    if (existingLeader) {
      throw new Error("A team can have only one leader.");
    }
  }
  next();
});

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

module.exports = TeamMember;
