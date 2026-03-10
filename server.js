const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  const startTime = Date.now();

  // Flag to track if client disconnected
  let clientDisconnected = false;

  // Listen for client disconnect
  req.on('close', () => {
    clientDisconnected = true;
  });

  // Wait 1 second
  setTimeout(() => {
    if (clientDisconnected) {
      // Client left early → send 204
      // Note: we can’t write to disconnected socket; just log
      console.log('Client bounced under 1 second, 204 triggered');
      return;
    }

    // Client still connected → serve saved webpage
    fs.readFile(FILE_PATH, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }, 1000);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
