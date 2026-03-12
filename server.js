if (req.url.startsWith('/precheck')) {
  let finished = false;

  // Detect client abort (disconnect)
  req.on('aborted', () => {
    if (!finished) {
      console.log('Client disconnected early — sending 204');
      res.writeHead(204);
      res.end();
      finished = true;
    }
  });

  // Wait 1 second
  const timer = setTimeout(() => {
    if (finished) return;

    // Serve the page
    fs.readFile(FILE_PATH, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
      finished = true;
    });
  }, 1000);
  return;
}
