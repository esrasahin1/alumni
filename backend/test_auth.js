const assert = require('assert');
const http = require('http');
const userModel = require('./src/models/userModel');
const { SESSION_COOKIE_NAME, sessionStore } = require('./src/config/session');

const BASE_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const parsedUrl = new URL(BASE_URL);

function request(path, method = 'GET', body = null, {
  contentType = 'application/json',
  accept = 'text/html',
  cookie = ''
} = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: accept
    };
    if (cookie) {
      headers.Cookie = cookie;
    }

    let payload = null;
    if (body !== null && body !== undefined) {
      headers['Content-Type'] = contentType;
      if (contentType === 'application/x-www-form-urlencoded') {
        payload = typeof body === 'string' ? body : new URLSearchParams(body).toString();
      } else {
        payload = typeof body === 'string' ? body : JSON.stringify(body);
      }
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsedBody = data;
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try {
            parsedBody = JSON.parse(data);
          } catch (e) {
            parsedBody = data;
          }
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsedBody, rawBody: data });
      });
    });

    req.on('error', reject);

    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

function extractSessionCookie(setCookieHeaders = []) {
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : (setCookieHeaders ? [setCookieHeaders] : []);
  const match = list.find((header) => header.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;

  const cookiePair = match.split(';')[0];
  const rawValue = cookiePair.slice(`${SESSION_COOKIE_NAME}=`.length);
  const decodedValue = decodeURIComponent(rawValue);
  let sessionId = null;
  if (decodedValue.startsWith('s:')) {
    const dotIdx = decodedValue.indexOf('.', 2);
    sessionId = dotIdx !== -1 ? decodedValue.slice(2, dotIdx) : decodedValue.slice(2);
  }

  return {
    rawHeader: match,
    cookiePair,
    sessionId
  };
}

async function runTests() {
  console.log('🧪 Starting Login & Logout Auth Test Suite...\n');
  console.log(`📡 Connecting to running server at ${BASE_URL} ...`);

  try {
    const health = await request('/api/health', 'GET', null, { accept: 'application/json' });
    if (health.status !== 200) {
      throw new Error(`Unexpected health status: ${health.status}`);
    }
    console.log(`✅ Server reachable at ${BASE_URL}\n`);
  } catch (err) {
    console.error(`\n❌ Could not connect to server at ${BASE_URL}: ${err.message}\n`);
    process.exit(1);
  }

  const createdUserIds = new Set();
  const trackedSessionIds = new Set();

  const trackUserId = (id) => {
    const numId = Number(id);
    if (Number.isInteger(numId) && numId > 0) {
      createdUserIds.add(numId);
    }
  };
  const trackUserByExactEmail = async (email) => {
    try {
      const user = await userModel.getUserByEmail(email);
      if (user && user.id) {
        trackUserId(user.id);
      }
      return user;
    } catch (err) {
      console.error(`⚠️  Failed to look up user (${email}): ${err.message}`);
      return null;
    }
  };
  const trackSessionId = (sid) => {
    if (typeof sid === 'string' && sid.length > 0) {
      trackedSessionIds.add(sid);
    }
  };

  const runId = `${Date.now()}_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  const studentEmail = `auth.student.${runId}@alumni.edu.tr`;
  const alumniEmail = `auth.alumni.${runId}@alumni.edu.tr`;
  const legacyEmail = `auth.legacy.${runId}@alumni.edu.tr`;
  const missingEmail = `auth.missing.${runId}@alumni.edu.tr`;
  const studentPass = 'StudentAuthPass123!';
  const alumniPass = 'AlumniAuthPass123!';

  let testError = null;

  try {
    // 1. GET /login renders HTTP 200 form
    console.log('--- Test 1: GET /login returns HTTP 200 ---');
    const getLoginRes = await request('/login', 'GET');
    assert.strictEqual(getLoginRes.status, 200);
    assert(getLoginRes.rawBody.includes('action="/login"'));
    assert(getLoginRes.rawBody.includes('name="email"'));
    assert(getLoginRes.rawBody.includes('name="password"'));
    assert(getLoginRes.rawBody.includes('/register'));
    console.log('✅ GET /login verified');

    // 2. Register student & alumni (verifying registration still sets no session cookie)
    console.log('\n--- Test 2: Registration still works without auto-login ---');
    const regStudentRes = await request('/register', 'POST', {
      name: 'Auth Test Student',
      email: studentEmail,
      password: studentPass,
      confirm_password: studentPass,
      role: 'student',
      department: 'Computer Engineering',
      graduation_year: '2027'
    }, { contentType: 'application/x-www-form-urlencoded' });
    await trackUserByExactEmail(studentEmail);
    assert.strictEqual(regStudentRes.status, 303);
    assert.strictEqual(regStudentRes.headers.location, '/register?registered=1');
    assert.strictEqual(extractSessionCookie(regStudentRes.headers['set-cookie']), null, 'Register must not create session cookie');

    const regAlumniRes = await request('/register', 'POST', {
      name: 'Auth Test Alumni',
      email: alumniEmail,
      password: alumniPass,
      confirm_password: alumniPass,
      role: 'alumni'
    }, { contentType: 'application/x-www-form-urlencoded' });
    await trackUserByExactEmail(alumniEmail);
    assert.strictEqual(regAlumniRes.status, 303);
    console.log('✅ Registration non-regression verified');

    // 3. Missing login inputs rejected with 400
    console.log('\n--- Test 3: Missing login fields rejected with 400 ---');
    const emptyLoginRes = await request('/login', 'POST', {
      email: '',
      password: ''
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(emptyLoginRes.status, 400);
    assert(emptyLoginRes.rawBody.includes('Email address is required'));
    assert(emptyLoginRes.rawBody.includes('Password is required'));
    assert.strictEqual(extractSessionCookie(emptyLoginRes.headers['set-cookie']), null);
    console.log('✅ Missing login fields rejection verified');

    // 4. Invalid password rejected with 401 generic error
    console.log('\n--- Test 4: Invalid password rejected with 401 ---');
    const wrongPassRes = await request('/login', 'POST', {
      email: `  ${studentEmail.toUpperCase()}  `,
      password: 'WrongPassword999!'
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(wrongPassRes.status, 401);
    assert(wrongPassRes.rawBody.includes('Invalid email or password.'));
    assert(wrongPassRes.rawBody.includes(`value="${studentEmail}"`), 'Normalized email should be preserved');
    assert(!wrongPassRes.rawBody.includes('WrongPassword999!'), 'Password must never be redisplayed');
    assert.strictEqual(extractSessionCookie(wrongPassRes.headers['set-cookie']), null);
    console.log('✅ Invalid password rejection verified');

    // 5. Nonexistent email returns same 401 generic error
    console.log('\n--- Test 5: Nonexistent email returns generic 401 error ---');
    const unknownRes = await request('/login', 'POST', {
      email: missingEmail,
      password: 'SomePassword123!'
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(unknownRes.status, 401);
    assert(unknownRes.rawBody.includes('Invalid email or password.'));
    assert.strictEqual(extractSessionCookie(unknownRes.headers['set-cookie']), null);
    console.log('✅ Nonexistent email handling verified');

    // 6. Legacy user without password_hash cannot log in
    console.log('\n--- Test 6: Legacy user without password_hash rejected with 401 ---');
    const helperLoginRes = await request('/login', 'POST', {
      email: studentEmail,
      password: studentPass
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(helperLoginRes.status, 303);
    const helperCookie = extractSessionCookie(helperLoginRes.headers['set-cookie']);
    assert(helperCookie && helperCookie.cookiePair);
    if (helperCookie.sessionId) trackSessionId(helperCookie.sessionId);

    const legacyUserRecord = await userModel.createUser({
      name: 'Legacy No Password User',
      email: legacyEmail
    });
    assert(legacyUserRecord && legacyUserRecord.id);
    trackUserId(legacyUserRecord.id);

    const legacyLoginRes = await request('/login', 'POST', {
      email: legacyEmail,
      password: 'AnyPassword123!'
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(legacyLoginRes.status, 401);
    assert(legacyLoginRes.rawBody.includes('Invalid email or password.'));
    console.log('✅ Legacy user password_hash=NULL rejection verified');

    // 7. Valid student login creates MySQL-backed session with HttpOnly cookie & minimal payload
    console.log('\n--- Test 7: Valid login creates persistent MySQL session ---');
    const loginStudentRes = await request('/login', 'POST', {
      email: `  ${studentEmail.toUpperCase()}  `,
      password: studentPass
    }, { contentType: 'application/x-www-form-urlencoded' });
    assert.strictEqual(loginStudentRes.status, 303);
    assert.strictEqual(loginStudentRes.headers.location, '/');

    const studentCookie = extractSessionCookie(loginStudentRes.headers['set-cookie']);
    assert(studentCookie && studentCookie.sessionId, 'Session cookie must be set on successful login');
    trackSessionId(studentCookie.sessionId);
    assert(studentCookie.rawHeader.includes('HttpOnly'), 'Session cookie must set HttpOnly');
    assert(studentCookie.rawHeader.includes('SameSite=Lax'), 'Session cookie must set SameSite=Lax');

    const storedSession = await sessionStore.get(studentCookie.sessionId);
    assert(storedSession, 'Session must be persisted in MySQL sessions table');
    const storedStudent = await userModel.getUserByEmail(studentEmail);
    assert.strictEqual(storedSession.userId, storedStudent.id, 'Session must store userId');
    assert.strictEqual(storedSession.password_hash, undefined, 'Session must never store password_hash');

    const authedHomeRes = await request('/', 'GET', null, { cookie: studentCookie.cookiePair });
    assert.strictEqual(authedHomeRes.status, 200);
    assert(authedHomeRes.rawBody.includes('Auth Test Student'), 'Home page should reflect authenticated user');
    assert(authedHomeRes.rawBody.includes('action="/logout"'), 'Home page should show Logout action');
    console.log('✅ Persistent MySQL session and authenticated home view verified');

    // 8. Re-login as alumni regenerates session ID (prevents session fixation)
    console.log('\n--- Test 8: Session ID is regenerated on login ---');
    const loginAlumniRes = await request('/login', 'POST', {
      email: alumniEmail,
      password: alumniPass
    }, { contentType: 'application/x-www-form-urlencoded', cookie: studentCookie.cookiePair });
    assert.strictEqual(loginAlumniRes.status, 303);

    const alumniCookie = extractSessionCookie(loginAlumniRes.headers['set-cookie']);
    assert(alumniCookie && alumniCookie.sessionId, 'New session cookie should be issued');
    trackSessionId(alumniCookie.sessionId);
    assert.notStrictEqual(alumniCookie.sessionId, studentCookie.sessionId, 'Session ID must be regenerated on login');

    const authedAlumniHome = await request('/', 'GET', null, { cookie: alumniCookie.cookiePair });
    assert.strictEqual(authedAlumniHome.status, 200);
    assert(authedAlumniHome.rawBody.includes('Auth Test Alumni'));
    console.log('✅ Session ID regeneration verified');

    // 9. POST /logout destroys MySQL session, clears cookie, and ends authenticated state
    console.log('\n--- Test 9: POST /logout destroys session and clears cookie ---');
    const logoutRes = await request('/logout', 'POST', null, {
      contentType: 'application/x-www-form-urlencoded',
      cookie: alumniCookie.cookiePair
    });
    assert.strictEqual(logoutRes.status, 303);
    assert.strictEqual(logoutRes.headers.location, '/login?loggedOut=1');

    const clearedCookie = extractSessionCookie(logoutRes.headers['set-cookie']);
    assert(clearedCookie, 'Logout must send Set-Cookie header clearing the session cookie');
    assert(
      clearedCookie.rawHeader.includes(`${SESSION_COOKIE_NAME}=;`) || clearedCookie.rawHeader.includes('Expires=Thu, 01 Jan 1970'),
      'Logout cookie header must clear the session cookie'
    );

    const destroyedSession = await sessionStore.get(alumniCookie.sessionId);
    assert.strictEqual(destroyedSession, null, 'Session row must be removed from MySQL on logout');

    const postLogoutHome = await request('/', 'GET', null, { cookie: alumniCookie.cookiePair });
    assert.strictEqual(postLogoutHome.status, 200);
    assert(!postLogoutHome.rawBody.includes('Auth Test Alumni'), 'Logged-out cookie must no longer authenticate user');
    assert(postLogoutHome.rawBody.includes('href="/login"'), 'Logged-out home page should show Login link');
    console.log('✅ Logout session destruction and cookie clearing verified');

    // 10. Protected directory fields & own-vs-other nested jobs scoping
    console.log('\n--- Test 10: Existing API routes and RBAC scoping verified ---');
    const apiUsersRes = await request('/api/users', 'GET', null, { accept: 'application/json', cookie: helperCookie.cookiePair });
    assert.strictEqual(apiUsersRes.status, 200);
    assert(Array.isArray(apiUsersRes.body));
    const apiLegacyUser = apiUsersRes.body.find((u) => u.id === legacyUserRecord.id);
    assert(apiLegacyUser);
    assert.deepStrictEqual(
      Object.keys(apiLegacyUser).sort(),
      ['created_at', 'department', 'graduation_year', 'id', 'name', 'role'],
      'Directory /api/users must return limited safe fields without leaking private email'
    );

    const crossUserJobsRes = await request(`/api/users/${legacyUserRecord.id}/jobs`, 'GET', null, { accept: 'application/json', cookie: helperCookie.cookiePair });
    assert.strictEqual(crossUserJobsRes.status, 403, 'Non-admin user must be blocked from another user jobs');

    const ownJobsRes = await request(`/api/users/${storedStudent.id}/jobs`, 'GET', null, { accept: 'application/json', cookie: helperCookie.cookiePair });
    assert.strictEqual(ownJobsRes.status, 200);
    assert(Array.isArray(ownJobsRes.body));
    console.log('✅ Existing API response structures and RBAC scoping verified');

    console.log('\n🎉 ALL LOGIN, LOGOUT & SESSION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    testError = err;
    throw err;
  } finally {
    const cleanupFailures = [];

    if (trackedSessionIds.size > 0) {
      console.log(`🧹 Cleaning up ${trackedSessionIds.size} temporary test session(s)...`);
      for (const sid of trackedSessionIds) {
        try {
          await sessionStore.destroy(sid);
        } catch (cleanupErr) {
          cleanupFailures.push(`session:${sid}`);
          console.error(`⚠️  Failed to delete test session (${sid}): ${cleanupErr.message}`);
        }
      }
    }

    if (createdUserIds.size > 0) {
      console.log(`🧹 Cleaning up ${createdUserIds.size} temporary test user(s) by exact ID...`);
      for (const id of createdUserIds) {
        try {
          await userModel.deleteUser(id);
        } catch (cleanupErr) {
          cleanupFailures.push(`user:#${id}`);
          console.error(`⚠️  Failed to delete test user #${id}: ${cleanupErr.message}`);
        }
      }
    }

    if (cleanupFailures.length === 0) {
      console.log('✅ Temporary test records cleaned up.');
    } else if (!testError) {
      throw new Error(`Cleanup failed for: ${cleanupFailures.join(', ')}`);
    }
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
