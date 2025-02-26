require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TeamMember = require('./models/TeamMember');
const Vote = require('./models/Vote');

// Create a new VotingPeriod model schema
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (updated connection without deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


/**
 * @route POST /team-members
 * @desc Add a team member
 */
app.post('/team-members', async (req, res) => {
  try {
    const { name, post, teamName, isLeader } = req.body;
    
    const newMember = new TeamMember({ name, post, teamName, isLeader });
    await newMember.save();

    res.status(201).json({ message: "Team member added successfully", member: newMember });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /team-members
 * @desc Get all team members
 */
app.get('/team-members', async (req, res) => {
  try {
    const members = await TeamMember.find();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /team-members/:id
 * @desc Update a team member (e.g., assign/remove leader)
 */
app.patch('/team-members/:id', async (req, res) => {
  try {
    const { isLeader } = req.body;
    
    // If assigning as leader, check existing leaders in the team
    if (isLeader) {
      const member = await TeamMember.findById(req.params.id);
      const existingLeader = await TeamMember.findOne({ teamName: member.teamName, isLeader: true });

      if (existingLeader && existingLeader._id.toString() !== req.params.id) {
        return res.status(400).json({ error: "A team can have only one leader" });
      }
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /team-members/:id
 * @desc Remove a team member
 */
app.delete('/team-members/:id', async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Team member removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /votes
 * @desc Cast a vote for a team
 */
app.post('/votes', async (req, res) => {
  try {
    const { userId, teamName } = req.body;
    
    if (!userId || !teamName) {
      return res.status(400).json({ error: "UserId and teamName are required" });
    }
    
    // Check if the team exists
    const teamExists = await TeamMember.findOne({ teamName });
    if (!teamExists) {
      return res.status(404).json({ error: "Team not found" });
    }
    
    // Check if there is an active voting period
    const activePeriod = await VotingPeriod.findOne({ active: true });
    if (!activePeriod) {
      return res.status(403).json({ error: "No active voting period is currently available" });
    }
    
    // Check if the voting period has ended
    if (new Date() > activePeriod.endDate) {
      activePeriod.active = false;
      await activePeriod.save();
      return res.status(403).json({ error: "Voting period has ended" });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ userId });
    
    if (existingVote) {
      // Update existing vote
      existingVote.teamName = teamName;
      existingVote.votedAt = Date.now();
      await existingVote.save();
      return res.status(200).json({ message: "Vote updated successfully", vote: existingVote });
    } else {
      // Create new vote
      const newVote = new Vote({ userId, teamName });
      await newVote.save();
      return res.status(201).json({ message: "Vote cast successfully", vote: newVote });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /votes/count
 * @desc Get vote counts for all teams
 */
app.get('/votes/count', async (req, res) => {
  try {
    const voteCounts = await Vote.aggregate([
      { $group: { _id: "$teamName", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Format the response
    const result = voteCounts.map(item => ({
      teamName: item._id,
      votes: item.count
    }));
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /votes/user/:userId
 * @desc Get the vote of a specific user
 */
app.get('/votes/user/:userId', async (req, res) => {
  try {
    const vote = await Vote.findOne({ userId: req.params.userId });
    if (!vote) {
      return res.status(404).json({ message: "User has not voted yet" });
    }
    res.status(200).json(vote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /votes/:userId
 * @desc Remove a user's vote
 */
app.delete('/votes/:userId', async (req, res) => {
  try {
    const result = await Vote.findOneAndDelete({ userId: req.params.userId });
    if (!result) {
      return res.status(404).json({ message: "Vote not found" });
    }
    res.status(200).json({ message: "Vote removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /voting-period
 * @desc Create a new voting period and reset all votes
 */
app.post('/voting-period', async (req, res) => {
  try {
    const { startDate, endDate, name } = req.body;
    
    if (!endDate) {
      return res.status(400).json({ error: "End date is required" });
    }
    
    // Set all current voting periods to inactive
    await VotingPeriod.updateMany({}, { active: false });
    
    // Reset all votes by deleting them
    await Vote.deleteMany({});
    
    // Create new voting period
    const newPeriod = new VotingPeriod({
      startDate: startDate || Date.now(),
      endDate: new Date(endDate),
      name: name || `Voting Period ${new Date().toISOString().split('T')[0]}`
    });
    
    await newPeriod.save();
    
    res.status(201).json({ 
      message: "New voting period created and all votes reset", 
      votingPeriod: newPeriod 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /voting-period/active
 * @desc Get the current active voting period
 */
app.get('/voting-period/active', async (req, res) => {
  try {
    const activePeriod = await VotingPeriod.findOne({ active: true });
    
    // If there is an active period but it has ended, update it
    if (activePeriod && new Date() > activePeriod.endDate) {
      activePeriod.active = false;
      await activePeriod.save();
      return res.status(404).json({ message: "No active voting period found" });
    }
    
    if (!activePeriod) {
      return res.status(404).json({ message: "No active voting period found" });
    }
    
    res.status(200).json(activePeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /voting-period/history
 * @desc Get history of all voting periods
 */
app.get('/voting-period/history', async (req, res) => {
  try {
    const periods = await VotingPeriod.find().sort({ startDate: -1 });
    res.status(200).json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});