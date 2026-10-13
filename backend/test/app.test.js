import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  // Prevent tests from using any real AI key or making provider calls.
  process.env.OPENAI_API_KEY = '';

  server = createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
});

test('health endpoint returns 200 and security headers', async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(
    response.headers.get('referrer-policy'),
    'strict-origin-when-cross-origin'
  );
  assert.equal(response.headers.get('x-powered-by'), null);

  const body = await response.json();
  assert.equal(body.success, true);
});

test('unknown API route returns 404', async () => {
  const response = await fetch(`${baseUrl}/api/not-a-real-route`);
  assert.equal(response.status, 404);
});

test('malformed JSON returns 400 with a stable error code', async () => {
  const response = await fetch(`${baseUrl}/api/captions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"topic":'
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'INVALID_JSON');
});

test('oversized JSON returns 413', async () => {
  const response = await fetch(`${baseUrl}/api/captions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'x'.repeat(1_100_000) })
  });

  assert.equal(response.status, 413);
  assert.equal((await response.json()).code, 'REQUEST_TOO_LARGE');
});

test('disallowed origin is rejected', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://not-allowed.example' }
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, 'CORS_ORIGIN_DENIED');
});

test('invalid caption input is rejected before AI configuration check', async () => {
  const response = await fetch(`${baseUrl}/api/captions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'x',
      platform: 'instagram',
      language: 'en',
      tone: 'friendly',
      length: 'short'
    })
  });

  assert.equal(response.status, 400);
});

test('valid caption request returns AI_NOT_CONFIGURED without a key', async () => {
  const response = await fetch(`${baseUrl}/api/captions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'A short animated story',
      platform: 'instagram',
      language: 'en',
      tone: 'friendly',
      length: 'short'
    })
  });

  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'AI_NOT_CONFIGURED');
});

test('invalid video script options are rejected', async () => {
  const response = await fetch(`${baseUrl}/api/video-script/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'A short animated story',
      platform: 'invalid-platform',
      duration: '30',
      language: 'en',
      tone: 'funny'
    })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'INVALID_OPTIONS');
});

test('valid video script request returns AI_NOT_CONFIGURED without a key', async () => {
  const response = await fetch(`${baseUrl}/api/video-script/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'A short animated story',
      platform: 'instagram',
      duration: '30',
      language: 'en',
      tone: 'funny'
    })
  });

  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'AI_NOT_CONFIGURED');
});
