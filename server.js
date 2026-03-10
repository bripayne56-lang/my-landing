const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Only handle /precheck
  if (req.url.startsWith('/precheck')) {
    // 1-second timer
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Respond 204 No Content
    res.writeHead(204);
    res.end();

    // Optional: log query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
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
