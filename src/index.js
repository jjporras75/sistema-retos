const express = require('express');
const path = require('path');

const challengesRouter = require('./routes/challenges');
const usersRouter = require('./routes/users');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/challenges', challengesRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sistema de Retos running on http://localhost:${PORT}`);
  });
}

module.exports = app;
