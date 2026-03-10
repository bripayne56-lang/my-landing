const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Load your saved webpage once
const pagePath = path.join(__dirname, 'savedPage.html');
const savedPage = fs.readFileSync(pagePath, 'utf-8');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/precheck')) {
    let responded = false;

    // Start a 1-second timer
    const timer = setTimeout(() => {
      if (!responded) {
        // User stayed 1 second → serve the page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(savedPage);
        responded = true;
      }
    }, 1000);

    // Detect if user closes the connection early
    req.on('close', () => {
      if (!responded) {
        clearTimeout(timer);
        // User left before 1 second → send 204
        res.writeHead(204);
        res.end();
        responded = true;
      }
    });

    return;
  }

  // Default response for other routes
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
