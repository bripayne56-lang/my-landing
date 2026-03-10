const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Load your saved page once
const pagePath = path.join(__dirname, 'index.html');
const savedPage = fs.readFileSync(pagePath, 'utf-8');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/precheck')) {
    let responded = false;

    // 1-second timer
    const timer = setTimeout(() => {
      if (!responded && !res.writableEnded) {
        // User stayed 1 second → serve HTML
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(savedPage);
        responded = true;
      }
    }, 1000);

    // Detect if user disconnects before 1 second
    req.on('close', () => {
      if (!responded && !res.writableEnded) {
        clearTimeout(timer);
        try {
          res.writeHead(204); // User left early → 204
          res.end();
        } catch (err) {
          console.error('Error ending response:', err.message);
        }
        responded = true;
      }
    });

    // Optional: log query parameters
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url, `http://${host}`);
    console.log('Precheck hit for:', url.searchParams.get('lp') || 'no lp', 'User-Agent:', req.headers['user-agent']);

    return;
  }

  // Default for other paths
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
