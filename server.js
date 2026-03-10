const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Minimal precheck endpoint (invisible JS)
app.get('/precheck', (req, res) => {
  res.type('application/javascript');
  res.send(`
    (function() {
      const start = Date.now();
      const token = 'user-' + Math.random().toString(36).substr(2, 8);

      function sendReport(status, reason) {
        navigator.sendBeacon('/report', JSON.stringify({ token, status, reason }));
      }

      // Detect leaving the page early (tab close or navigation)
      window.addEventListener('beforeunload', () => {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) sendReport(204, 'left early');
      });

      // Detect back/forward navigation
      window.addEventListener('popstate', () => {
        const elapsed = Date.now() - start;
        if (elapsed < 1000) sendReport(204, 'back button');
      });

      // Timer for minimum 1-second stay
      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (elapsed >= 1000) sendReport(200);
      }, 1000);
    })();
  `);
});

// Receive beacon reports
app.post('/report', (req, res) => {
  const { token, status, reason } = req.body || {};
  if (!token || !status) return res.sendStatus(400);

  if (status === 204) {
    console.log(`User ${token} bounced (<1s) - ${reason || 'unknown reason'}`);
  } else if (status === 200) {
    console.log(`User ${token} stayed >=1s`);
  }

  res.sendStatus(200);
});

// 404 fallback
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
