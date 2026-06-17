const express = require('express');
const store = require('../store');

const router = express.Router();

// GET /api/users - list all users
router.get('/', (req, res) => {
  res.json(store.getUsers());
});

// GET /api/users/:id - get a single user
router.get('/:id', (req, res) => {
  const user = store.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

// POST /api/users - create a user
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const user = store.createUser(name);
  return res.status(201).json(user);
});

// POST /api/users/:id/submissions - submit an answer to a challenge
router.post('/:id/submissions', (req, res) => {
  const user = store.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { challengeId, answer } = req.body;
  if (!challengeId || !answer) {
    return res.status(400).json({ error: 'challengeId and answer are required' });
  }

  const challenge = store.getChallengeById(Number(challengeId));
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const submission = store.createSubmission(user.id, challenge.id, answer);
  return res.status(201).json(submission);
});

// PATCH /api/users/:userId/submissions/:submissionId - update submission status
router.patch('/:userId/submissions/:submissionId', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'accepted', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }
  const submission = store.updateSubmissionStatus(Number(req.params.submissionId), status);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  return res.json(submission);
});

// GET /api/users/:id/submissions - list submissions for a user
router.get('/:id/submissions', (req, res) => {
  const user = store.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(store.getSubmissionsByUser(Number(req.params.id)));
});

module.exports = router;
