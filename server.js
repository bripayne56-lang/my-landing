const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load index.html once
const indexPath = path.join(__dirname, 'public', 'index.html');
let savedPage = '<h1>Page not found</h1>';
if (fs.existsSync(indexPath)) {
  savedPage = fs.readFileSync(indexPath, 'utf-8');
} else {
  console.warn('Warning: index.html not found');
}

// Precheck middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/precheck')) return next();

  let responded = false;

  // 1-second timer to serve the page
  const timer = setTimeout(() => {
    if (!responded && !res.writableEnded) {
      res.status(200).type('html').send(savedPage);
      responded = true;
    }
  }, 1000);

  // Early disconnect detection → 204
  req.on('close', () => {
    if (!responded && !res.writableEnded) {
      clearTimeout(timer);
      try {
        res.sendStatus(204);
      } catch (err) {
        console.error('Error sending 204:', err.message);
      }
      responded = true;
    }
  });

  // Optional logging
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url, `http://${host}`);
  console.log('Precheck hit for:', url.searchParams.get('lp') || 'no lp', 'User-Agent:', req.headers['user-agent']);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
