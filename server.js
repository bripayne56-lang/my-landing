const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Precheck route
app.get('/precheck', (req, res) => {
  let responded = false;

  // 1-second timer
  const timer = setTimeout(() => {
    if (!responded) {
      // After 1 second, redirect to index.html
      res.redirect('/');
      responded = true;
    }
  }, 1000);

  // Early disconnect detection → 204
  req.on('close', () => {
    if (!responded) {
      clearTimeout(timer);
      try {
        res.sendStatus(204);
      } catch (err) {
        console.error('Error sending 204:', err.message);
      }
      responded = true;
    }
  });

  console.log('Precheck hit for:', req.query.lp || 'no lp');
});

// Fallback 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
