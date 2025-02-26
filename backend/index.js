require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TeamMember = require('./models/TeamMember');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
