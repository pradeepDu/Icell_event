const express = require('express');
const TeamMember = require('../models/TeamMember');
const { connectToDatabase } = require('../config/db');
const { logError } = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /team-members
 * @desc Add a team member
 */
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const { name, post, teamName, isLeader } = req.body;
    
    const newMember = new TeamMember({ name, post, teamName, isLeader });
    await newMember.save();

    res.status(201).json({ message: "Team member added successfully", member: newMember });
  } catch (error) {
    logError('/team-members POST', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /team-members
 * @desc Get all team members
 */
router.get('/', async (req, res) => {
  try {
    await connectToDatabase();
    const members = await TeamMember.find();
    res.status(200).json(members);
  } catch (error) {
    logError('/team-members GET', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /team-members/:id
 * @desc Update a team member (e.g., assign/remove leader)
 */
router.patch('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const { isLeader } = req.body;
    
    if (isLeader) {
      const member = await TeamMember.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      const existingLeader = await TeamMember.findOne({ 
        teamName: member.teamName, 
        isLeader: true,
        _id: { $ne: req.params.id }
      });

      if (existingLeader) {
        return res.status(400).json({ error: "A team can have only one leader" });
      }
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    
    res.status(200).json(updatedMember);
  } catch (error) {
    logError(`/team-members/${req.params.id} PATCH`, error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /team-members/:id
 * @desc Remove a team member
 */
router.delete('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const result = await TeamMember.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: "Team member not found" });
    }
    
    res.status(200).json({ message: "Team member removed successfully" });
  } catch (error) {
    logError(`/team-members/${req.params.id} DELETE`, error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;