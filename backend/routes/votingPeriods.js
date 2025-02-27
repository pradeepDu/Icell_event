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
router.post('/', async (req, res) => {
  try {
    console.log('Starting creation of new voting period...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const { startDate, endDate, name } = req.body;
    console.log('Received voting period data:', { startDate, endDate, name });
   
    if (!endDate) {
      console.log('Missing end date');
      return res.status(400).json({ error: "End date is required" });
    }
   
    // Force UTC handling for consistent time comparison
    const now = new Date();
    const periodEndDate = new Date(endDate);
   
    console.log('Creating voting period:', {
      nowUTC: now.toISOString(),
      endDateUTC: periodEndDate.toISOString(),
      timeDiff: periodEndDate.getTime() - now.getTime()
    });
   
    if (periodEndDate <= now) {
      console.log('Invalid end date: end date must be in the future');
      return res.status(400).json({ 
        error: "End date must be in the future",
        currentTime: now.toISOString(),
        providedEndDate: periodEndDate.toISOString()
      });
    }
   
    // Set all current voting periods to inactive
    console.log('Setting all current voting periods to inactive...');
    const updateResult = await VotingPeriod.updateMany({}, { active: false });
    console.log('Update result:', updateResult);
   
    // Reset all votes by deleting them
    console.log('Deleting all existing votes...');
    const deleteResult = await Vote.deleteMany({});
    console.log('Delete result:', deleteResult);
   
    // Create new voting period
    const newPeriod = new VotingPeriod({
      startDate: startDate ? new Date(startDate) : now,
      endDate: periodEndDate,
      active: true, // Make sure to set this explicitly
      name: name || `Voting Period ${now.toISOString().split('T')[0]}`
    });
   
    console.log('Saving new voting period...');
    await newPeriod.save();
    console.log('New voting period created successfully:', newPeriod._id.toString());
   
    res.status(201).json({
      message: "New voting period created and all votes reset",
      votingPeriod: newPeriod
    });
  } catch (error) {
    console.error('Error creating voting period:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    logError('/voting-period POST', error);
    res.status(500).json({ 
      error: "Failed to create new voting period",
      message: error.message
    });
  }
});

/**
 * @route GET /voting-period/active
 * @desc Get the current active voting period
 */
router.get('/active', async (req, res) => {
  try {
    console.log('Checking for active voting period...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const now = new Date();
    console.log('Current time (UTC):', now.toISOString());
   
    // First check if any active period exists
    const anyActivePeriod = await VotingPeriod.findOne({ active: true });
    console.log('Any active period found:', !!anyActivePeriod);
    
    if (anyActivePeriod) {
      console.log('Active period details:', {
        id: anyActivePeriod._id.toString(),
        name: anyActivePeriod.name,
        startDate: anyActivePeriod.startDate.toISOString(),
        endDate: anyActivePeriod.endDate.toISOString(),
        isEnded: anyActivePeriod.endDate <= now
      });
    }
    
    // Find active period that hasn't ended yet
    const activePeriod = await VotingPeriod.findOne({
      active: true,
      endDate: { $gt: now }
    });
   
    // If no valid active period, check if we need to close an expired one
    if (!activePeriod) {
      console.log('No valid active period found, checking for expired periods...');
      // Close any expired voting periods
      const updateResult = await VotingPeriod.updateMany(
        { active: true, endDate: { $lte: now } },
        { active: false }
      );
      
      console.log('Update expired periods result:', updateResult);
     
      return res.status(404).json({ 
        message: "No active voting period found",
        currentTime: now.toISOString()
      });
    }
    
    console.log('Valid active period found:', activePeriod._id.toString());
    res.status(200).json(activePeriod);
  } catch (error) {
    console.error('Error retrieving active voting period:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    logError('/voting-period/active GET', error);
    res.status(500).json({ 
      error: "Failed to retrieve active voting period",
      message: error.message
    });
  }
});

/**
 * @route GET /voting-period/history
 * @desc Get history of all voting periods
 */
router.get('/history', async (req, res) => {
  try {
    console.log('Retrieving voting period history...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const periods = await VotingPeriod.find().sort({ startDate: -1 });
    console.log(`Retrieved ${periods.length} voting periods`);
    
    res.status(200).json(periods);
  } catch (error) {
    console.error('Error retrieving voting period history:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    logError('/voting-period/history GET', error);
    res.status(500).json({ 
      error: "Failed to retrieve voting period history",
      message: error.message
    });
  }
});

module.exports = router;