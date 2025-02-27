const express = require('express');
const Vote = require('../models/Vote');
const TeamMember = require('../models/TeamMember');
const VotingPeriod = require('../models/VotingPeriod');
const { connectToDatabase } = require('../config/db');
const { logError } = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /votes
 * @desc Cast a vote for a team
 */
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
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
    const now = new Date();
    const activePeriod = await VotingPeriod.findOne({ 
      active: true,
      endDate: { $gt: now }
    });
    
    if (!activePeriod) {
      // Close any expired voting periods
      await VotingPeriod.updateMany(
        { active: true, endDate: { $lte: now } },
        { active: false }
      );
      return res.status(403).json({ error: "No active voting period is currently available" });
    }
    
    // Check if user has already voted
    const existingVote = await Vote.findOne({ userId });
    
    if (existingVote) {
      // Update existing vote
      existingVote.teamName = teamName;
      existingVote.votedAt = now;
      await existingVote.save();
      return res.status(200).json({ message: "Vote updated successfully", vote: existingVote });
    } else {
      // Create new vote
      const newVote = new Vote({ userId, teamName, votedAt: now });
      await newVote.save();
      return res.status(201).json({ message: "Vote cast successfully", vote: newVote });
    }
  } catch (error) {
    logError('/votes POST', error);
    res.status(500).json({ error: "Failed to process vote. Please try again." });
  }
});

/**
 * @route GET /votes/count
 * @desc Get vote counts for all teams
 */
router.get('/count', async (req, res) => {
  try {
    await connectToDatabase();
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
    logError('/votes/count GET', error);
    res.status(500).json({ error: "Failed to retrieve vote counts" });
  }
});

/**
 * @route GET /votes/user/:userId
 * @desc Get the vote of a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    await connectToDatabase();
    const vote = await Vote.findOne({ userId: req.params.userId });
    if (!vote) {
      return res.status(404).json({ message: "User has not voted yet" });
    }
    res.status(200).json(vote);
  } catch (error) {
    logError(`/votes/user/${req.params.userId} GET`, error);
    res.status(500).json({ error: "Failed to retrieve vote information" });
  }
});

/**
 * @route DELETE /votes/:userId
 * @desc Remove a user's vote
 */
router.delete('/:userId', async (req, res) => {
  try {
    await connectToDatabase();
    const result = await Vote.findOneAndDelete({ userId: req.params.userId });
    if (!result) {
      return res.status(404).json({ message: "Vote not found" });
    }
    res.status(200).json({ message: "Vote removed successfully" });
  } catch (error) {
    logError(`/votes/${req.params.userId} DELETE`, error);
    res.status(500).json({ error: "Failed to remove vote" });
  }
});

module.exports = router;