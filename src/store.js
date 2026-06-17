/**
 * In-memory data store for the sistema-retos proof of concept.
 * All data resets when the server restarts.
 */

let _nextUserId = 1;
let _nextChallengeId = 1;
let _nextSubmissionId = 1;

const users = [];
const challenges = [];
const submissions = [];

module.exports = {
  // --- Users ---
  getUsers: () => users,
  getUserById: (id) => users.find((u) => u.id === id),
  createUser(name) {
    const user = { id: _nextUserId++, name, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
  },

  // --- Challenges ---
  getChallenges: () => challenges,
  getChallengeById: (id) => challenges.find((c) => c.id === id),
  createChallenge(title, description, difficulty) {
    const challenge = {
      id: _nextChallengeId++,
      title,
      description,
      difficulty: difficulty || 'medium',
      createdAt: new Date().toISOString(),
    };
    challenges.push(challenge);
    return challenge;
  },

  // --- Submissions ---
  getSubmissions: () => submissions,
  getSubmissionsByChallenge: (challengeId) =>
    submissions.filter((s) => s.challengeId === challengeId),
  getSubmissionsByUser: (userId) =>
    submissions.filter((s) => s.userId === userId),
  createSubmission(userId, challengeId, answer) {
    const submission = {
      id: _nextSubmissionId++,
      userId,
      challengeId,
      answer,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    submissions.push(submission);
    return submission;
  },
  updateSubmissionStatus(id, status) {
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return null;
    submission.status = status;
    return submission;
  },

  // Reset helper (used in tests)
  _reset() {
    users.length = 0;
    challenges.length = 0;
    submissions.length = 0;
    _nextUserId = 1;
    _nextChallengeId = 1;
    _nextSubmissionId = 1;
  },
};
