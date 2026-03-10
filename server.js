const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  const startTime = Date.now();

  // Wait 1 second before deciding response
  setTimeout(() => {
    const elapsed = Date.now() - startTime;

    if (elapsed < 1000) {
      // User bounced under 1 second
      res.writeHead(204);
      res.end();
    } else {
      // Normal user — serve the page
      fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading page');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    }
  }, 1000);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


