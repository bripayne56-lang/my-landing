const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const indexPath = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {

  if (req.url.startsWith('/precheck')) {

    let closed = false;

    // Detect if client disconnects early
    req.on('close', () => {
      closed = true;
    });

    setTimeout(() => {

      if (closed) {
        res.writeHead(204);
        res.end();
        console.log('Client left early → 204');
        return;
      }

      fs.readFile(indexPath, (err, data) => {

        if (err) {
          res.writeHead(500);
          res.end('Error loading page');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);

        const url = new URL(req.url, `http://${req.headers.host}`);
        console.log(
          'Served page for:',
          url.searchParams.get('lp') || 'no lp',
          'User-Agent:',
          req.headers['user-agent']
        );

      });

    }, 1000);

    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
