const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const indexPath = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/precheck')) {

    let disconnected = false;

    // Detect early disconnect
    req.on('close', () => {
      disconnected = true;
    });

    // 1-second delay
    setTimeout(() => {
      if (disconnected) {
        res.writeHead(204);
        res.end();
        return;
      }

      // Serve large HTML file via stream
      const stream = fs.createReadStream(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      stream.pipe(res);

    }, 1000);

    return;
  }

  // Default for other paths
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
