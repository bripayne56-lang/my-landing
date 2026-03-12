// server.js — 1-second precheck + 204 for early exit + serve index.html + cron ping
const http = require('http');
const fs = require('fs');
const path = require('path');
const { CronJob } = require('cron');
const https = require('https');

const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'public', 'index.html');

// -------------------------
// Cron job to keep server awake (ping /precheck every 14s)
const backendUrl = `http://localhost:${PORT}/precheck`;
const job = new CronJob('*/14 * * * * *', () => { // every 14 seconds
  https.get(backendUrl, (res) => {
    if (res.statusCode === 204) {
      console.log('Server alive (status 204)');
    } else {
      console.error(`Ping returned status code: ${res.statusCode}`);
    }
  }).on('error', (err) => console.error('Ping error:', err.message));
});
job.start();

// -------------------------
// Main server
const server = http.createServer((req, res) => {

  // Only handle /precheck
  if (req.url.startsWith('/precheck')) {
    let finished = false;

    // Detect if client disconnects early
    req.on('close', () => {
      if (!finished) {
        console.log('Client disconnected early — sending 204');
        res.writeHead(204);
        res.end();
        finished = true;
      }
    });

    // Wait 1 second
    setTimeout(() => {
      if (finished) return; // already disconnected

      // Serve the saved webpage
      fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading page');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
        finished = true;

        // Log info for tracking
        const url = new URL(req.url, `http://${req.headers.host}`);
        console.log('Precheck served page for:', url.searchParams.get('lp') || 'no lp',
                    'User-Agent:', req.headers['user-agent']);
      });
    }, 1000);

    return;
  }

  // Default 404 for other paths
  res.writeHead(404);
  res.end('Not Found');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

