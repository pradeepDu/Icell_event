require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const errorHandler = require('./middleware/errorhandler');

// Import routes
const teamMembersRoutes = require('./routes/teamMembers');
const votesRoutes = require('./routes/votes');
const votingPeriodsRoutes = require('./routes/votingPeriods');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection on startup
connectToDatabase().catch(err => {
  console.error("Initial database connection failed:", err.message);
  process.exit(1); // Exit on initial connection failure
});
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API is running',
    version: '1.0.0',
    endpoints: [
      '/team-members',
      '/votes',
      '/voting-period'
    ]
  });
});


// Routes
app.use('/team-members', teamMembersRoutes);
app.use('/votes', votesRoutes);
app.use('/voting-period', votingPeriodsRoutes);

// Handle 404 routes
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(errorHandler);

// For Vercel serverless deployment, export the app
module.exports = app;

// Only listen directly when running standalone (not in Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}