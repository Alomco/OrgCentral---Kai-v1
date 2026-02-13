/*
One-off API verification script for HR Time Tracking.
- Uses fetch() + in-memory cookie jar.
- Avoids printing PII/cookies.

Run:
  node .\\tmp\\verify-hr-time-tracking-api.mjs --base http://localhost:3000
*/

import process from 'node:process';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const base = valueOfFlag(args, '--base') ?? process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const rateLimitAttemptsRaw = valueOfFlag(args, '--rateLimitAttempts');
const rateLimitDelayMsRaw = valueOfFlag(args, '--rateLimitDelayMs');
const rateLimitAttempts = rateLimitAttemptsRaw ? Number(rateLimitAttemptsRaw) : 120;
const rateLimitDelayMs = rateLimitDelayMsRaw ? Number(rateLimitDelayMsRaw) : 0;

const persona = {
  email: 'org.alpha.hr.manager.ready@agents.orgcentral.test',
  password: 'TestPass!234567',
  orgSlug: 'orgcentral-alpha',
  residency: 'UK_ONLY',
  classification: 'OFFICIAL',
};

function valueOfFlag(argv, name) {
  const idx = argv.indexOf(name);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}

function shortId(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  return hash.slice(0, 10);
}

class CookieJar {
  /** @type {Map<string, string>} */
  #cookies = new Map();

  addFromResponse(res) {
    // Node fetch supports headers.getSetCookie().
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    for (const setCookie of setCookies) {
      if (typeof setCookie !== 'string') continue;
      const [pair] = setCookie.split(';');
      if (!pair) continue;
      const eq = pair.indexOf('=');
      if (eq === -1) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name) this.#cookies.set(name, value);
    }
  }

  headerValue() {
    const pairs = [];
    for (const [k, v] of this.#cookies.entries()) {
      pairs.push(`${k}=${v}`);
    }
    return pairs.join('; ');
  }

  debugSummary() {
    return {
      cookieCount: this.#cookies.size,
      cookieNames: Array.from(this.#cookies.keys()).sort(),
    };
  }
}

async function jsonOrText(res) {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return { _parseError: 'invalid_json' };
    }
  }
  return { _text: await res.text().catch(() => '') };
}

function shapeSummary(body) {
  if (!body || typeof body !== 'object') return { type: typeof body };
  const keys = Object.keys(body);

  if ('error' in body && body.error && typeof body.error === 'object') {
    const err = body.error;
    return {
      topLevelKeys: keys.sort(),
      errorKeys: Object.keys(err).sort(),
      errorCode: typeof err.code === 'string' ? err.code : null,
    };
  }

  return { topLevelKeys: keys.sort() };
}

async function request(jar, path, init = {}) {
  const url = new URL(path, base).toString();
  const headers = new Headers(init.headers ?? {});

  const cookieHeader = jar ? jar.headerValue() : '';
  if (jar && cookieHeader) headers.set('cookie', cookieHeader);

  // Ensure JSON body sent correctly.
  let body = init.body;
  if (body && typeof body === 'object' && !(body instanceof ArrayBuffer) && !(body instanceof Uint8Array) && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !(typeof body === 'string')) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: init.method ?? 'GET',
    headers,
    body,
    redirect: 'manual',
  });

  if (jar) jar.addFromResponse(res);
  const parsed = await jsonOrText(res);
  return { res, body: parsed };
}

function logCheck(title, result) {
  const { status, ok } = result.res;
  console.log(`\n== ${title} ==`);
  console.log(`status=${status} ok=${ok}`);
  console.log('shape=', JSON.stringify(shapeSummary(result.body)));
}

function assertIsArray(value) {
  return Array.isArray(value);
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Base URL:', base);

  // 1) Unauthenticated checks
  {
    const unauth = await request(null, '/api/hr/time-tracking');
    logCheck('GET /api/hr/time-tracking (unauth)', unauth);

    const unauthPostWithOrigin = await request(null, '/api/hr/time-tracking', {
      method: 'POST',
      headers: { origin: base },
      body: { userId: crypto.randomUUID(), clockIn: new Date().toISOString() },
    });
    logCheck('POST /api/hr/time-tracking (unauth, Origin correct)', unauthPostWithOrigin);

    const unauthPostNoOrigin = await request(null, '/api/hr/time-tracking', {
      method: 'POST',
      body: { userId: crypto.randomUUID(), clockIn: new Date().toISOString() },
    });
    logCheck('POST /api/hr/time-tracking (unauth, Origin missing)', unauthPostNoOrigin);
  }

  // 2) Login + post-login
  const jar = new CookieJar();

  const login = await request(jar, '/api/auth/login', {
    method: 'POST',
    headers: { origin: base },
    body: {
      email: persona.email,
      password: persona.password,
      orgSlug: persona.orgSlug,
      residency: persona.residency,
      classification: persona.classification,
      rememberMe: true,
    },
  });
  logCheck('POST /api/auth/login', login);
  console.log('cookieJar=', jar.debugSummary());

  const postLogin = await request(jar, `/api/auth/post-login?org=${encodeURIComponent(persona.orgSlug)}&next=${encodeURIComponent('/dashboard')}`, {
    method: 'GET',
    headers: { origin: base },
  });
  logCheck('GET /api/auth/post-login', postLogin);

  // 3) Debug security (development-only) to grab userId/orgId
  const debug = await request(jar, '/api/debug/security', {
    method: 'GET',
    headers: { origin: base },
  });
  logCheck('GET /api/debug/security', debug);

  const debugBody = debug.body;
  const sessionUserId = debugBody?.session?.user?.id;
  const authorizationOrgId = debugBody?.authorization?.orgId;

  console.log('session.user.id(hash)=', shortId(sessionUserId));
  console.log('authorization.orgId(hash)=', shortId(authorizationOrgId));

  expect(typeof sessionUserId === 'string' && sessionUserId.length > 10, 'Expected debug security session.user.id');

  // 4) Authenticated list
  const list = await request(jar, '/api/hr/time-tracking', {
    method: 'GET',
    headers: { origin: base },
  });
  logCheck('GET /api/hr/time-tracking (auth)', list);
  expect(list.res.status === 200, 'Expected 200 from list time entries');
  expect(list.body && assertIsArray(list.body.entries), 'Expected response to have entries: array');

  // 5) CSRF/origin guard behavior on create: missing/wrong vs correct
  const createMissingOrigin = await request(jar, '/api/hr/time-tracking', {
    method: 'POST',
    body: { userId: sessionUserId, clockIn: new Date().toISOString() },
  });
  logCheck('POST /api/hr/time-tracking (auth, Origin missing)', createMissingOrigin);

  const createWrongOrigin = await request(jar, '/api/hr/time-tracking', {
    method: 'POST',
    headers: { origin: 'https://evil.example' },
    body: { userId: sessionUserId, clockIn: new Date().toISOString() },
  });
  logCheck('POST /api/hr/time-tracking (auth, Origin wrong)', createWrongOrigin);

  const create = await request(jar, '/api/hr/time-tracking', {
    method: 'POST',
    headers: { origin: base },
    body: { userId: sessionUserId, clockIn: new Date().toISOString(), tasks: [] },
  });
  logCheck('POST /api/hr/time-tracking (auth, Origin correct)', create);
  expect(create.res.status === 201, 'Expected 201 from create time entry');

  const entryId = create.body?.entry?.id;
  console.log('created.entry.id(hash)=', shortId(entryId));
  expect(typeof entryId === 'string' && entryId.length > 10, 'Expected created entry id');

  // 6) GET entry
  const getEntry = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(entryId)}`, {
    method: 'GET',
    headers: { origin: base },
  });
  logCheck('GET /api/hr/time-tracking/{entryId} (auth)', getEntry);
  expect(getEntry.res.status === 200, 'Expected 200 from get time entry');

  const missingGet = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(crypto.randomUUID())}`, {
    method: 'GET',
    headers: { origin: base },
  });
  logCheck('GET /api/hr/time-tracking/{entryId} (auth, missing id)', missingGet);
  expect(missingGet.res.status === 200, 'Expected 200 from get missing time entry');
  expect(missingGet.body && 'entry' in missingGet.body, 'Expected get missing entry to include entry key');

  // 7) PATCH entry (CSRF missing vs correct)
  const patchMissingOrigin = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(entryId)}`, {
    method: 'PATCH',
    body: { notes: 'api-verify' },
  });
  logCheck('PATCH /api/hr/time-tracking/{entryId} (auth, Origin missing)', patchMissingOrigin);

  const patch = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(entryId)}`, {
    method: 'PATCH',
    headers: { origin: base },
    body: { notes: 'api-verify' },
  });
  logCheck('PATCH /api/hr/time-tracking/{entryId} (auth, Origin correct)', patch);
  expect(patch.res.status === 200, 'Expected 200 from patch time entry');

  const missingPatch = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(crypto.randomUUID())}`, {
    method: 'PATCH',
    headers: { origin: base },
    body: { notes: 'api-verify-missing' },
  });
  logCheck('PATCH /api/hr/time-tracking/{entryId} (auth, missing id)', missingPatch);

  // 8) Approve endpoint: validate CSRF guard + structured 404 (use random entryId so we don’t need a second user)
  const randomEntryId = crypto.randomUUID();
  const approveMissingOrigin = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(randomEntryId)}/approve`, {
    method: 'POST',
    body: { status: 'APPROVED' },
  });
  logCheck('POST /api/hr/time-tracking/{entryId}/approve (auth, Origin missing)', approveMissingOrigin);

  const approve = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(randomEntryId)}/approve`, {
    method: 'POST',
    headers: { origin: base },
    body: { status: 'APPROVED' },
  });
  logCheck('POST /api/hr/time-tracking/{entryId}/approve (auth, Origin correct)', approve);

  // 9) Rate limit: hammer updates until 429 (minimize DB growth)
  console.log(`\n== Rate limit test: repeated PATCH update (attempts=${rateLimitAttempts}, delayMs=${rateLimitDelayMs}) ==`);
  let rateLimited = null;
  for (let i = 0; i < rateLimitAttempts; i += 1) {
    const attempt = await request(jar, `/api/hr/time-tracking/${encodeURIComponent(entryId)}`, {
      method: 'PATCH',
      headers: { origin: base },
      body: { notes: `rate-limit-probe-${i}` },
    });
    const status = attempt.res.status;
    if (status === 429) {
      rateLimited = attempt;
      console.log(`Triggered 429 at attempt #${i + 1}`);
      break;
    }

    if (rateLimitDelayMs > 0) {
      await sleep(rateLimitDelayMs);
    }
  }

  if (rateLimited) {
    console.log('429 shape=', JSON.stringify(shapeSummary(rateLimited.body)));
    console.log('Retry-After=', rateLimited.res.headers.get('retry-after'));
    console.log('X-RateLimit-Limit=', rateLimited.res.headers.get('x-ratelimit-limit'));
    console.log('X-RateLimit-Remaining=', rateLimited.res.headers.get('x-ratelimit-remaining'));
    console.log('X-RateLimit-Reset=', rateLimited.res.headers.get('x-ratelimit-reset'));
  } else {
    console.log(`Did not trigger 429 within ${rateLimitAttempts} attempts (config may be higher, or window reset).`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nScript failed:', err?.message ?? err);
  process.exitCode = 1;
});
