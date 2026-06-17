const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../index');
const store = require('../store');

let server;
let baseUrl;

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(baseUrl + path, opts);
  const json = await res.json();
  return { status: res.status, body: json };
}

describe('Sistema de Retos API', () => {
  before(
    () =>
      new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, () => {
          baseUrl = `http://localhost:${server.address().port}`;
          resolve();
        });
      }),
  );

  after(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => store._reset());

  // --- Health ---
  test('GET /api/health returns ok', async () => {
    const { status, body } = await req('GET', '/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  // --- Challenges ---
  describe('Challenges', () => {
    test('GET /api/challenges returns empty array initially', async () => {
      const { status, body } = await req('GET', '/api/challenges');
      assert.equal(status, 200);
      assert.deepEqual(body, []);
    });

    test('POST /api/challenges creates a challenge', async () => {
      const { status, body } = await req('POST', '/api/challenges', {
        title: 'Reto 1',
        description: 'Descripción del reto 1',
        difficulty: 'easy',
      });
      assert.equal(status, 201);
      assert.equal(body.id, 1);
      assert.equal(body.title, 'Reto 1');
      assert.equal(body.difficulty, 'easy');
    });

    test('POST /api/challenges defaults difficulty to medium', async () => {
      const { status, body } = await req('POST', '/api/challenges', {
        title: 'Reto sin dificultad',
        description: 'desc',
      });
      assert.equal(status, 201);
      assert.equal(body.difficulty, 'medium');
    });

    test('POST /api/challenges returns 400 when title missing', async () => {
      const { status, body } = await req('POST', '/api/challenges', { description: 'desc' });
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test('POST /api/challenges returns 400 for invalid difficulty', async () => {
      const { status, body } = await req('POST', '/api/challenges', {
        title: 'Bad',
        description: 'desc',
        difficulty: 'insane',
      });
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test('GET /api/challenges/:id returns 404 for unknown id', async () => {
      const { status } = await req('GET', '/api/challenges/999');
      assert.equal(status, 404);
    });

    test('GET /api/challenges/:id returns the challenge', async () => {
      await req('POST', '/api/challenges', { title: 'R', description: 'D', difficulty: 'hard' });
      const { status, body } = await req('GET', '/api/challenges/1');
      assert.equal(status, 200);
      assert.equal(body.difficulty, 'hard');
    });
  });

  // --- Users ---
  describe('Users', () => {
    test('GET /api/users returns empty array initially', async () => {
      const { status, body } = await req('GET', '/api/users');
      assert.equal(status, 200);
      assert.deepEqual(body, []);
    });

    test('POST /api/users creates a user', async () => {
      const { status, body } = await req('POST', '/api/users', { name: 'Ana' });
      assert.equal(status, 201);
      assert.equal(body.id, 1);
      assert.equal(body.name, 'Ana');
    });

    test('POST /api/users returns 400 when name missing', async () => {
      const { status, body } = await req('POST', '/api/users', {});
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test('GET /api/users/:id returns 404 for unknown id', async () => {
      const { status } = await req('GET', '/api/users/999');
      assert.equal(status, 404);
    });
  });

  // --- Submissions ---
  describe('Submissions', () => {
    async function setup() {
      const { body: user } = await req('POST', '/api/users', { name: 'Juan' });
      const { body: challenge } = await req('POST', '/api/challenges', {
        title: 'R1', description: 'D1', difficulty: 'easy',
      });
      return { user, challenge };
    }

    test('POST /api/users/:id/submissions creates a submission', async () => {
      const { user, challenge } = await setup();
      const { status, body } = await req('POST', `/api/users/${user.id}/submissions`, {
        challengeId: challenge.id,
        answer: 'Mi respuesta',
      });
      assert.equal(status, 201);
      assert.equal(body.userId, user.id);
      assert.equal(body.challengeId, challenge.id);
      assert.equal(body.status, 'pending');
    });

    test('POST /api/users/:id/submissions returns 404 for unknown user', async () => {
      const { challenge } = await setup();
      const { status } = await req('POST', '/api/users/999/submissions', {
        challengeId: challenge.id,
        answer: 'x',
      });
      assert.equal(status, 404);
    });

    test('POST /api/users/:id/submissions returns 404 for unknown challenge', async () => {
      const { user } = await setup();
      const { status } = await req('POST', `/api/users/${user.id}/submissions`, {
        challengeId: 999,
        answer: 'x',
      });
      assert.equal(status, 404);
    });

    test('PATCH submission status updates correctly', async () => {
      const { user, challenge } = await setup();
      const { body: sub } = await req('POST', `/api/users/${user.id}/submissions`, {
        challengeId: challenge.id,
        answer: 'resp',
      });
      const { status, body } = await req(
        'PATCH',
        `/api/users/${user.id}/submissions/${sub.id}`,
        { status: 'accepted' },
      );
      assert.equal(status, 200);
      assert.equal(body.status, 'accepted');
    });

    test('GET /api/users/:id/submissions lists user submissions', async () => {
      const { user, challenge } = await setup();
      await req('POST', `/api/users/${user.id}/submissions`, {
        challengeId: challenge.id,
        answer: 'resp',
      });
      const { status, body } = await req('GET', `/api/users/${user.id}/submissions`);
      assert.equal(status, 200);
      assert.equal(body.length, 1);
    });

    test('GET /api/challenges/:id/submissions lists challenge submissions', async () => {
      const { user, challenge } = await setup();
      await req('POST', `/api/users/${user.id}/submissions`, {
        challengeId: challenge.id,
        answer: 'resp',
      });
      const { status, body } = await req('GET', `/api/challenges/${challenge.id}/submissions`);
      assert.equal(status, 200);
      assert.equal(body.length, 1);
    });
  });
});
