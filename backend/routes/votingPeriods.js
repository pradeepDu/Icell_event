const express = require('express');
const VotingPeriod = require('../models/VotingPeriod');
const Vote = require('../models/Vote');
const { connectToDatabase } = require('../config/db');
const { logError } = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /voting-period
 * @desc Create a new voting period and reset all votes
 */
// In your /routes/votingPeriods.js file
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const { startDate, endDate, name } = req.body;
    
    if (!endDate) {
      return res.status(400).json({ error: "End date is required" });
    }
    
    // Force UTC handling for consistent time comparison
    const now = new Date();
    const periodEndDate = new Date(endDate);
    
    console.log('Creating voting period:', {
      nowUTC: now.toISOString(),
      endDateUTC: periodEndDate.toISOString()
    });
    
    if (periodEndDate <= now) {
      return res.status(400).json({ error: "End date must be in the future" });
    }
    
    // Set all current voting periods to inactive
    await VotingPeriod.updateMany({}, { active: false });
    
    // Reset all votes by deleting them
    await Vote.deleteMany({});
    
    // Create new voting period
    const newPeriod = new VotingPeriod({
      startDate: startDate ? new Date(startDate) : now,
      endDate: periodEndDate,
      active: true, // Make sure to set this explicitly
      name: name || `Voting Period ${now.toISOString().split('T')[0]}`
    });
    
    await newPeriod.save();
    
    res.status(201).json({ 
      message: "New voting period created and all votes reset", 
      votingPeriod: newPeriod 
    });
  } catch (error) {
    logError('/voting-period POST', error);
    res.status(500).json({ error: "Failed to create new voting period" });
  }
});

/**
 * @route GET /voting-period/active
 * @desc Get the current active voting period
 */
router.get('/active', async (req, res) => {
  try {
    await connectToDatabase();
    const now = new Date();
    
    // Find active period that hasn't ended yet
    const activePeriod = await VotingPeriod.findOne({ 
      active: true,
      endDate: { $gt: now }
    });
    
    // If no valid active period, check if we need to close an expired one
    if (!activePeriod) {
      // Close any expired voting periods
      await VotingPeriod.updateMany(
        { active: true, endDate: { $lte: now } },
        { active: false }
      );
      
      return res.status(404).json({ message: "No active voting period found" });
    }
    
    res.status(200).json(activePeriod);
  } catch (error) {
    logError('/voting-period/active GET', error);
    res.status(500).json({ error: "Failed to retrieve active voting period" });
  }
});

/**
 * @route GET /voting-period/history
 * @desc Get history of all voting periods
 */
router.get('/history', async (req, res) => {
  try {
    await connectToDatabase();
    const periods = await VotingPeriod.find().sort({ startDate: -1 });
    res.status(200).json(periods);
  } catch (error) {
    logError('/voting-period/history GET', error);
    res.status(500).json({ error: "Failed to retrieve voting period history" });
  }
});


module.exports = router;

