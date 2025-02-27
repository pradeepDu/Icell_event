const { logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const route = `${req.method} ${req.originalUrl}`;
  logError(route, err);
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Server Error',
    path: req.originalUrl
  });
};

module.exports = errorHandler;
