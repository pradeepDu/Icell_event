const logError = (route, error) => {
    console.error(`Error in ${route}:`, error.message, error.stack);
  };
  
  module.exports = { logError };