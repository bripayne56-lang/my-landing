const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Precheck endpoint — serves minimal JS to track stay time
app.get('/precheck', (req, res) => {
  res.type('application/javascript');
  res.send(`
    (function() {
      const start = Date.now();
      const token = 'user-' + Math.random().toString(36).substr(2, 8);

      function sendReport(status, reason) {
        navigator.sendBeacon('/report', JSON.stringify({ token, status, reason }));
      }

      // Detect tab close / navigation away
      window.addEventListener('beforeunload', () => {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) sendReport(204, 'left early');
      });

      // Detect back/forward navigation
      window.addEventListener('popstate', () => {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) sendReport(204, 'back button');
      });

      // After 1 second, send 200 stay report and load index.html
      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (elapsed >= 1000) sendReport(200);

        // Fetch index.html and inject into page without redirect
        fetch('/index.html')
          .then(r => r.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
          });
      }, 1000);
    })();
  `);
});

// Receive beacon reports
app.post('/report', (req, res) => {
  const { token, status, reason } = req.body || {};
  if (!token || !status) return res.sendStatus(400);

  if (status === 204) {
    console.log(`User ${token} bounced (<1s) - ${reason || 'unknown'}`);
  } else if (status === 200) {
    console.log(`User ${token} stayed ≥1s`);
  }
  res.sendStatus(200);
});

// Serve static files (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback 404
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
