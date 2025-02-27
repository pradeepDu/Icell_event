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
    console.log('Starting vote processing...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const { userId, teamName } = req.body;
    console.log('Vote request received:', { userId, teamName });
    
    // Enhanced validation
    if (!userId || !teamName) {
      console.log('Missing required fields:', { userId, teamName });
      return res.status(400).json({ error: "UserId and teamName are required" });
    }
    
    // Type validation
    if (typeof userId !== 'string' || typeof teamName !== 'string') {
      console.log('Invalid data types:', { 
        userIdType: typeof userId, 
        teamNameType: typeof teamName 
      });
      return res.status(400).json({ error: "UserId and teamName must be strings" });
    }
    
    // Check if the team exists
    console.log('Checking if team exists:', teamName);
    const teamExists = await TeamMember.findOne({ teamName });
    if (!teamExists) {
      console.log('Team not found:', teamName);
      return res.status(404).json({ error: "Team not found" });
    }
    console.log('Team exists:', teamExists.teamName);
    
    // Check if there is an active voting period
    const now = new Date();
    console.log('Current time (UTC):', now.toISOString());
    
    // First check if any active period exists at all
    console.log('Checking for any active voting period...');
    const anyActivePeriod = await VotingPeriod.findOne({ active: true });
    console.log('Any active period found:', !!anyActivePeriod);
    
    if (!anyActivePeriod) {
      console.log('No active voting period found at all');
      return res.status(403).json({ error: "No active voting period is available. Please try again later." });
    }
    
    // Then check with the end date
    console.log('Checking for valid active voting period...');
    const activePeriod = await VotingPeriod.findOne({ 
      active: true,
      endDate: { $gt: now }
    });
    
    console.log('Active period check:', {
      currentTimeUTC: now.toISOString(),
      foundActivePeriod: !!activePeriod,
      activePeriodInfo: activePeriod ? {
        id: activePeriod._id.toString(),
        name: activePeriod.name,
        startDate: activePeriod.startDate.toISOString(),
        endDate: activePeriod.endDate.toISOString(),
        active: activePeriod.active
      } : 'None'
    });
    
    if (!activePeriod) {
      // Close any expired voting periods
      console.log('No valid active period found, updating expired periods...');
      const updateResult = await VotingPeriod.updateMany(
        { active: true, endDate: { $lte: now } },
        { active: false }
      );
      
      console.log('Updated expired periods:', updateResult);
      
      return res.status(403).json({ 
        error: "The voting period has ended. Please wait for the next voting period to open.",
        currentTime: now.toISOString()
      });
    }
    
    // Check if user has already voted
    console.log('Checking if user has already voted:', userId);
    const existingVote = await Vote.findOne({ userId });
    console.log('Existing vote found:', !!existingVote);
    
    if (existingVote) {
      // Update existing vote
      console.log('Updating existing vote from', existingVote.teamName, 'to', teamName);
      existingVote.teamName = teamName;
      existingVote.votedAt = now;
      await existingVote.save();
      console.log('Vote updated successfully');
      return res.status(200).json({ message: "Vote updated successfully", vote: existingVote });
    } else {
      // Create new vote
      console.log('Creating new vote for team:', teamName);
      const newVote = new Vote({ userId, teamName, votedAt: now });
      await newVote.save();
      console.log('Vote created successfully:', newVote._id.toString());
      return res.status(201).json({ message: "Vote cast successfully", vote: newVote });
    }
  } catch (error) {
    console.error('Vote processing error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    logError('/votes POST', error);
    res.status(500).json({ 
      error: "Failed to process vote. Please try again.",
      message: error.message
    });
  }
});

/**
 * @route GET /votes/count
 * @desc Get vote counts for all teams
 */
router.get('/count', async (req, res) => {
  try {
    console.log('Retrieving vote counts...');
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
    
    console.log('Vote counts retrieved successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving vote counts:', error);
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
    console.log('Retrieving vote for user:', req.params.userId);
    await connectToDatabase();
    const vote = await Vote.findOne({ userId: req.params.userId });
    if (!vote) {
      console.log('No vote found for user:', req.params.userId);
      return res.status(404).json({ message: "User has not voted yet" });
    }
    console.log('Vote found:', vote);
    res.status(200).json(vote);
  } catch (error) {
    console.error('Error retrieving user vote:', error);
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
    console.log('Deleting vote for user:', req.params.userId);
    await connectToDatabase();
    const result = await Vote.findOneAndDelete({ userId: req.params.userId });
    if (!result) {
      console.log('No vote found to delete for user:', req.params.userId);
      return res.status(404).json({ message: "Vote not found" });
    }
    console.log('Vote deleted successfully');
    res.status(200).json({ message: "Vote removed successfully" });
  } catch (error) {
    console.error('Error deleting vote:', error);
    logError(`/votes/${req.params.userId} DELETE`, error);
    res.status(500).json({ error: "Failed to remove vote" });
  }
});

module.exports = router;