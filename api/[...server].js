// Serverless adapter for Express app so Vercel can run the backend as serverless functions
const serverless = require('serverless-http');
const path = require('path');

// Ensure we resolve the server folder from repo root
const app = require(path.join(__dirname, '..', 'server', 'index.js'));

module.exports = serverless(app);
