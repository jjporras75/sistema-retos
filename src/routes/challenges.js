const express = require('express');
const store = require('../store');

const router = express.Router();

// GET /api/challenges - list all challenges
router.get('/', (req, res) => {
  res.json(store.getChallenges());
});

// GET /api/challenges/:id - get a single challenge
router.get('/:id', (req, res) => {
  const challenge = store.getChallengeById(Number(req.params.id));
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  return res.json(challenge);
});

// POST /api/challenges - create a challenge
router.post('/', (req, res) => {
  const { title, description, difficulty } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: `difficulty must be one of: ${validDifficulties.join(', ')}` });
  }
  const challenge = store.createChallenge(title, description, difficulty);
  return res.status(201).json(challenge);
});

// GET /api/challenges/:id/submissions - list submissions for a challenge
router.get('/:id/submissions', (req, res) => {
  const challenge = store.getChallengeById(Number(req.params.id));
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  return res.json(store.getSubmissionsByChallenge(Number(req.params.id)));
});

module.exports = router;
