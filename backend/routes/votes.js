const express = require('express');
const Vote = require('../models/Vote');
const TeamMember = require('../models/TeamMember');
const VotingPeriod = require('../models/VotingPeriod');
const { connectToDatabase } = require('../config/db');
const { logError } = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /votes
 * @desc Cast a vote for a team - Optimized for serverless
 */
router.post('/', async (req, res) => {
  try {
    // Safe handling of request body
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { userId, teamName } = req.body;
    
    // Basic validation with early return
    if (!userId || !teamName) {
      return res.status(400).json({ error: "UserId and teamName are required" });
    }
    
    // Connect to database with safety catch
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(503).json({ 
        error: "Service temporarily unavailable. Database connection failed.",
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Check if the team exists with safe error handling
    let teamExists;
    try {
      teamExists = await TeamMember.findOne({ teamName }).lean().exec();
    } catch (teamError) {
      console.error('Team lookup error:', teamError);
      return res.status(500).json({ error: "Failed to verify team" });
    }
    
    if (!teamExists) {
      return res.status(404).json({ error: "Team not found" });
    }
    
    // Get current time with safe handling
    const now = new Date();
    
    // Check for active voting period with safe error handling
    let activePeriod;
    try {
      activePeriod = await VotingPeriod.findOne({ 
        active: true,
        endDate: { $gt: now }
      }).lean().exec();
    } catch (periodError) {
      console.error('Voting period lookup error:', periodError);
      return res.status(500).json({ error: "Failed to check voting period status" });
    }
    
    if (!activePeriod) {
      // Close any expired voting periods safely
      try {
        await VotingPeriod.updateMany(
          { active: true, endDate: { $lte: now } },
          { active: false }
        );
      } catch (updateError) {
        // Non-blocking error - log but continue
        console.error('Failed to update expired periods:', updateError);
      }
      
      return res.status(403).json({ 
        error: "No active voting period available. Please try again later."
      });
    }
    
    // Process vote with safe error handling
    try {
      // Check if user has already voted
      const existingVote = await Vote.findOne({ userId }).lean().exec();
      
      if (existingVote) {
        // Update existing vote
        await Vote.updateOne(
          { userId },
          { $set: { teamName, votedAt: now } }
        );
        
        return res.status(200).json({ 
          message: "Vote updated successfully",
          teamName
        });
      } else {
        // Create new vote - use create instead of new+save for better performance
        const newVote = await Vote.create({ userId, teamName, votedAt: now });
        
        return res.status(201).json({ 
          message: "Vote cast successfully",
          teamName
        });
      }
    } catch (voteError) {
      console.error('Vote processing error:', voteError);
      return res.status(500).json({ error: "Failed to process vote" });
    }
  } catch (error) {
    // Top-level catch for any unexpected errors
    console.error('Unhandled error in vote processing:', error);
    // Send a generic error response to avoid crashing
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

/**
 * @route GET /votes/count
 * @desc Get vote counts for all teams - Serverless optimized
 */
router.get('/count', async (req, res) => {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
    
    try {
      const voteCounts = await Vote.aggregate([
        { $group: { _id: "$teamName", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const result = voteCounts.map(item => ({
        teamName: item._id,
        votes: item.count
      }));
      
      return res.status(200).json(result);
    } catch (countError) {
      console.error('Vote count error:', countError);
      return res.status(500).json({ error: "Failed to retrieve vote counts" });
    }
  } catch (error) {
    console.error('Unhandled error in vote count:', error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

/**
 * @route GET /votes/user/:userId
 * @desc Get a user's vote - Serverless optimized
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
    
    try {
      const vote = await Vote.findOne({ userId }).lean().exec();
      
      if (!vote) {
        return res.status(404).json({ message: "User has not voted yet" });
      }
      
      return res.status(200).json(vote);
    } catch (lookupError) {
      console.error('Vote lookup error:', lookupError);
      return res.status(500).json({ error: "Failed to retrieve vote" });
    }
  } catch (error) {
    console.error('Unhandled error in user vote lookup:', error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

/**
 * @route DELETE /votes/:userId
 * @desc Remove a user's vote - Serverless optimized
 */
router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
    
    try {
      const result = await Vote.deleteOne({ userId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Vote not found" });
      }
      
      return res.status(200).json({ message: "Vote removed successfully" });
    } catch (deleteError) {
      console.error('Vote deletion error:', deleteError);
      return res.status(500).json({ error: "Failed to remove vote" });
    }
  } catch (error) {
    console.error('Unhandled error in vote deletion:', error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;