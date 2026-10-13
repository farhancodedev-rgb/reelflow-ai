import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
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

test('generation endpoint rate-limits requests after the configured limit', async () => {
  for (let i = 1; i <= 20; i++) {
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

    assert.equal(
      response.status,
      400,
      `Request ${i} should reach input validation before the rate limit`
    );
  }

  const limitedResponse = await fetch(
    `${baseUrl}/api/captions/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'x',
        platform: 'instagram',
        language: 'en',
        tone: 'friendly',
        length: 'short'
      })
    }
  );

  assert.equal(limitedResponse.status, 429);
  assert.equal(
    (await limitedResponse.json()).code,
    'RATE_LIMITED'
  );
});
