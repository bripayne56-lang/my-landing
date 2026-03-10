const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Precheck middleware — runs for every request
app.use(async (req, res, next) => {
  // 1-second server-side delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Example 204 logic for bots or fast exits
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  if (userAgent.includes('bot')) {
    return res.sendStatus(204); // 204 No Content
  }

  next(); // continue to static file serving
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

