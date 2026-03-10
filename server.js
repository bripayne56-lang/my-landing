const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve precheck page — minimal HTML + JS
app.get('/precheck', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Precheck</title></head>
    <body><h1>Loading...</h1>
    <script>
      const start = Date.now();
      const token = 'user-' + Math.random().toString(36).substr(2,8);

      // Send beacon on leave
      window.addEventListener('beforeunload', () => {
        const elapsed = Date.now() - start;
        navigator.sendBeacon('/report', JSON.stringify({ token, elapsed }));
      });

      // After 1s, send beacon and inject index.html
      setTimeout(() => {
        const elapsed = Date.now() - start;
        navigator.sendBeacon('/report', JSON.stringify({ token, elapsed }));

        // Fetch index.html and inject
        fetch('/index.html')
          .then(r => r.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
          });
      }, 1000);
    </script>
    </body>
    </html>
  `);
});

// Receive beacon reports
app.post('/report', (req, res) => {
  const { token, elapsed } = req.body || {};
  if (!token || elapsed == null) return res.sendStatus(400);

  if (elapsed < 1000) {
    console.log(`User ${token} bounced (<1s)`); // optional: analytics
    return res.sendStatus(204);
  } else {
    console.log(`User ${token} stayed ${elapsed} ms`);
    return res.sendStatus(200);
  }
});

// Serve index.html and other static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback 404
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
