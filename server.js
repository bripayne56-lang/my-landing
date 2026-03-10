const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Precheck middleware — runs for every request
app.use(async (req, res, next) => {
  let responded = false;

  // Start a 1-second timer
  const timer = setTimeout(() => {
    if (!responded) {
      // User stayed 1 second → continue to serve static files
      responded = true;
      next();
    }
  }, 1000);

  // Detect early disconnects
  req.on('close', () => {
    if (!responded) {
      clearTimeout(timer);
      try {
        res.sendStatus(204); // User left early → 204 No Content
      } catch (err) {
        console.error('Error sending 204:', err.message);
      }
      responded = true;
    }
  });
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
