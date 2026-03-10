const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Safely load index.html relative to server.js
let savedPage = '<h1>Page not found</h1>'; // fallback
const pagePath = path.join(__dirname, 'index.html');

if (fs.existsSync(pagePath)) {
  savedPage = fs.readFileSync(pagePath, 'utf-8');
} else {
  console.warn('Warning: index.html not found, using fallback HTML');
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/precheck')) {
    let responded = false;

    // 1-second timer
    const timer = setTimeout(() => {
      if (!responded && !res.writableEnded) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(savedPage);
        responded = true;
      }
    }, 1000);

    // Detect early disconnects
    req.on('close', () => {
      if (!responded && !res.writableEnded) {
        clearTimeout(timer);
        try {
          res.writeHead(204);
          res.end();
        } catch (err) {
          console.error('Error ending response:', err.message);
        }
        responded = true;
      }
    });

    // Optional: log query parameters and User-Agent
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url, `http://${host}`);
    console.log('Precheck hit for:', url.searchParams.get('lp') || 'no lp', 'User-Agent:', req.headers['user-agent']);

    return;
  }

  // Default response for other routes
  if (!res.writableEnded) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
